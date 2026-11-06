import { readFile, writeFile, mkdir, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transformSync } from 'esbuild';

/* 预渲染：把 Vite 打出来的空壳 HTML 变成每个路由一份真实 HTML。
 *
 * 为什么不是纯 SPA：canonical / hreflang / JSON-LD / og:* 都是**每个地址不同**
 * 的，SPA 只能靠 JS 在浏览器里改 <head>——爬虫（和关了 JS 的人）看到的是同一份
 * 空壳。预渲染之后每个 URL 都是一个独立文件，这也正是 Cloudflare Pages 直接
 * 当静态资源发得出去的前提。
 *
 * 输入：dist/（客户端构建，含 index.html 空壳 + assets）与 dist-ssr/（SSR bundle）
 * 输出：dist/<page>/index.html、dist/<segment>/<page>/index.html（每门语言一套）、
 *       dist/404.html
 *
 * 空壳里两个占位符必须都在，缺一个就直接抛错：少了 <!--app-head--> 会让每个
 * 页面的 title/canonical 静默变成空壳里那份（所有页面共用一个标题），少了
 * <!--app-html--> 则是空白页——两种都不会让构建失败，只会让线上悄悄错掉。
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DIST = join(ROOT, 'dist');
const SSR = join(ROOT, 'dist-ssr');

const HEAD_MARK = '<!--app-head-->';
const HTML_MARK = '<!--app-html-->';

/* ── 剥离客户端入口 ────────────────────────────────────────────────
 *
 * 站点是「用 React 写页面、构建期跑一次」，不是「浏览器里跑一个 React
 * 应用」。Vite 的客户端构建会往空壳里塞一个
 * `<script type="module" crossorigin src="/assets/index-<hash>.js">`，
 * 那个 bundle 62 万字节（18.4 万 gzip）——而它唯一做的事是
 * `hydrateRoot()`：把**已经正确的 DOM** 重新对一遍，一个像素都不改。
 *
 * 实测全量 grep `src/` 的 useState / useEffect / onClick / onChange /
 * onSubmit / addEventListener：零命中。所以这 184 KB 买的是零。
 *
 * 预渲染出来的 HTML 本身就是完整页面（FAQ 是原生 <details>，导航是普通
 * <a>），脚本被禁掉时一直是这样——这一点 src/main.tsx 的注释早就写了。
 * 这里只是让产物同意那句话。
 *
 * 三个必须：
 *
 * 1. **匹配不到就抛错，不能静默跳过。** Vite 改一次注入格式（换引号、加
 *    crossorigin 位置、改成自闭合）这个正则就会落空，而落空的后果是
 *    184 KB 悄悄回到产物里、页面看起来一模一样、单测全绿。宁可构建失败。
 * 2. **剥离要在注入 head 之前做。** 每页 head 里有
 *    `<script type="application/ld+json">`，那是数据块不是可执行脚本；
 *    先剥再注入，结构化数据就不会经过这个正则。
 * 3. **`dist/assets/` 要一起删。** 不删的话 HTML 不引用它，但 Pages 仍会
 *    把 647 KB 发上去——白占部署体积，而且留下一个"看起来还在用"的目录。
 *
 * 想加回交互怎么办：去掉 `stripClientScript(rawShell)` 这一处调用（`const shell = rawShell`），
 * 以及 main() 末尾删 `dist/assets/` 的那一行 rm，再把 public/_headers 的
 * script-src 改回 'self'。源码结构（App.tsx / 六个页面 / ui.tsx）一个字都没
 * 动过，所以这是三行代码的回退，不是一次重构。三处必须一起改：只回退这里、
 * 不改 _headers，脚本会被 'none' 拦住（页面照样可用，但白白下载 184 KB）；
 * 只改 _headers、不回退这里，则是虚报能力。site-e2e.mjs 同时钉住这三件事。 */
const CLIENT_SCRIPT = /<script\b[^>]*\btype="module"[^>]*><\/script>\s*/;

function stripClientScript(shell) {
  if (!CLIENT_SCRIPT.test(shell)) {
    throw new Error(
      'dist/index.html 里找不到 <script type="module">，无法剥离客户端入口。' +
        '多半是 index.html 的入口脚本或 Vite 的注入格式变了——' +
        '先确认，再改这个正则；直接放过会让 184 KB 的 bundle 静默回到产物里。',
    );
  }
  return shell.replace(CLIENT_SCRIPT, '');
}

/* ── 压缩样式表 ────────────────────────────────────────────────────
 *
 * `public/styles.css` 是 25 KB 的源码，其中 39 段是**注释**——顶部那段
 * 就讲了二十行"为什么不写内联 style"。这些注释对读源码的人有用，对
 * 访问者只是字节：每页都要下载一次，而且它在首屏渲染路径上。
 *
 * 为什么必须在 dist/ 上压、不能在 public/ 里压：
 *
 * 1. `_headers` 给 `/styles.css` 的缓存策略是 `max-age=3600, must-revalidate`
 *    ——**故意不是 immutable**，因为文件名不带内容指纹。所以这个地址必须
 *    保持叫 `/styles.css`，不能挪进 `/assets/` 也不能改名。
 * 2. `tests/feedback-url.test.ts` 与 `tests/render.test.ts` 读的是
 *    `public/styles.css`（源码）做文本断言，压不压都读得到。也就是说
 *    **单测看不见这个文件在 dist 里长什么样**——这条压缩只在产物上生效，
 *    两边的口径因此不会打架。
 *
 * 实测（esbuild 0.28.2，2026-10-31）：25157 → 16456 字节，gzip 10198 →
 * 4347。选择器语义不变（`::before` 被写成等价的 `:before`，20 个自定义
 * 属性一个不少，四个 @media 与 prefers-reduced-motion 全在）。
 *
 * 压不动就抛错，不静默跳过：真出问题时页面会**丢掉全部样式**（HTML 里
 * 引用的还是 /styles.css），而那看起来像"部署坏了"，不像"压缩坏了"。 */
const MIN_CSS = join(DIST, 'styles.css');

async function minifyStylesheet() {
  const before = await stat(MIN_CSS);
  const src = await readFile(MIN_CSS, 'utf8');
  const { code, warnings } = transformSync(src, { loader: 'css', minify: true });
  if (warnings.length) {
    // 警告不致命（esbuild 对 CSS 的警告基本是"不认识的语法"），但要看得见。
    for (const w of warnings) console.warn(`压缩 styles.css 时的警告：${w.text}`);
  }
  if (!code.includes('--popover-bg') || !code.includes('prefers-reduced-motion')) {
    /* 两条**内容**探针，不是长度探针。长度变小也可能是压坏了：把一段
     * 规则整个吞掉同样会让文件变小。这两个符号分别代表自定义属性表与
     * 无障碍分支——它们没了，页面在暗色下拉框和"减少动效"两处会静默
     * 变样，而没有任何测试会红（单测读的是 public/ 那份）。 */
    throw new Error('压缩后的 styles.css 丢了 --popover-bg 或 prefers-reduced-motion，拒绝写入');
  }
  await writeFile(MIN_CSS, code, 'utf8');
  console.log(`压缩 styles.css：${before.size} → ${Buffer.byteLength(code)} 字节`);
}

/** 与 src/i18n/paths.ts 保持一致。这里重复一份是有意的：这个脚本在 Node 里
 *  为此多一条构建依赖。tests/paths.test.ts 会比对两边，改了这边忘了那边会红。
 *
 *  只列 id 与 segment：`<html lang>` 由 entry-server.tsx 从 paths.ts 的
 *  LOCALES 取（那里才是真源，head.ts 的 hreflang 也读它）。这里曾经还有一个
 *  `lang:` 字段，**从头到尾没有被读过**——本文件用的是 renderRoute 的返回值。
 *  一个写了没人读的字段比没有更糟：改它不会改变任何输出，却让人以为改了。 */
const PAGES = ['', 'pricing', 'faq', 'support', 'privacy', 'terms'];
const LOCALES = [
  { id: 'en', segment: '' },
  { id: 'zh-Hans', segment: 'zh-cn' },
  { id: 'zh-Hant', segment: 'zh-tw' },
  { id: 'ja', segment: 'ja' },
  { id: 'ko', segment: 'ko' },
  { id: 'es', segment: 'es' },
  { id: 'fr', segment: 'fr' },
  { id: 'de', segment: 'de' },
];

function pathFor(segment, page) {
  if (!segment) return page ? `/${page}/` : '/';
  return page ? `/${segment}/${page}/` : `/${segment}/`;
}

function outFile(segment, page) {
  return join(DIST, segment, page, 'index.html');
}

async function main() {
  const rawShell = await readFile(join(DIST, 'index.html'), 'utf8');
  for (const mark of [HEAD_MARK, HTML_MARK]) {
    if (!rawShell.includes(mark)) {
      throw new Error(`dist/index.html 里没有 ${mark}，预渲染无法注入（检查 index.html 是否被改动）`);
    }
  }
  // 见 CLIENT_SCRIPT 那里的说明：注入 head 之前先剥掉客户端入口。
  const shell = stripClientScript(rawShell);

  const { renderRoute, sitemapXml, robotsTxt, llmsTxt, contentHash, parseLastmod, mergeLastmod, serializeLastmod, dateMap, restampedPaths } = await import(
    pathToFileURL(join(SSR, 'entry-server.js')).href
  );

  const written = [];
  /** 本次构建每一页的渲染指纹，键是站内路径。用于推导 sitemap 的 <lastmod>。 */
  const hashes = {};

  for (const locale of LOCALES) {
    for (const page of PAGES) {
      const { html, head, lang } = renderRoute(locale.id, page);
      if (!html.trim()) throw new Error(`${locale.id}/${page || '(home)'} 渲染出了空正文`);
      if (!head.includes('<title>')) throw new Error(`${locale.id}/${page || '(home)'} 的 head 里没有 title`);

      hashes[pathFor(locale.segment, page)] = contentHash(html, head);

      // <html lang> 决定浏览器的断词、字体选择与朗读语言。繁中必须写
      // zh-Hant、简中必须写 zh-Hans：写成 zh 或 zh-CN 会让浏览器挑简体字形，
      // 繁体字被替换成形近字。lang 由 entry-server.tsx 从 paths.ts 取。
      const out = shell
        .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
        .replace(HEAD_MARK, head)
        .replace(HTML_MARK, html);

      const file = outFile(locale.segment, page);
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, out, 'utf8');
      written.push(pathFor(locale.segment, page));
    }
  }

  // 404 用默认语言渲染，页面里的链接是根绝对路径（见 pages/NotFound.tsx），
  // 所以它在任意深度的坏地址下都能正确加载样式与首页链接。
  const nf = renderRoute('en', 'notFound');
  const nfOut = shell
    .replace(/<html lang="[^"]*"/, `<html lang="${nf.lang}"`)
    .replace(HEAD_MARK, nf.head)
    .replace(HTML_MARK, nf.html);
  await writeFile(join(DIST, '404.html'), nfOut, 'utf8');
  written.push('/404.html');

  /* 两个给爬虫的文件。写在这里而不是放 public/，是因为它们的内容里有
   * 绝对地址，而绝对地址的真源只有 content/site.ts 一处——放静态文件就等于
   * 抄了一份域名，换域名时漏改的后果是 sitemap 把爬虫指向旧站，而站点本身
   * 完全正常，没有任何检查会红。
   *
   * 顺序有讲究：sitemap 先写。robots.txt 里那一行 Sitemap: 指向的地址必须
   * 真的存在，而这两个文件是同一次构建产出的——先写哪个不影响结果，但
   * 万一 sitemap 生成抛错，我不想留下一份"声明了 sitemap 却没有 sitemap"
   * 的 robots.txt 在 dist 里。 */
  /* `<lastmod>` 的真源是仓库根的 `lastmod.json`（跟着 git 走）。
   *
   * 为什么不是构建时间：那会让每次部署都声明全站 48 页同时更新，是假信号，
   * 爬虫会因此开始忽略这个字段。为什么不是 git mtime：每页都 import 到
   * 10-31 那次提交里的共享模块，取最大值会把 48 条压成同一天（实测）。所以
   * 判据是**渲染结果的哈希**——只有这一页发出去的 HTML/head 真的变了，日期
   * 才前进。完整理由在 src/seo/lastmod.ts 的文件头。
   *
   * 清单读不到（首次建立、或被手改坏）时 mergeLastmod 给出全 null，也就是
   * 本次 sitemap 与之前逐字节相同；等下一次内容真的变了才会出现日期。 */
  const LASTMOD_FILE = join(ROOT, 'lastmod.json');
  const prevLastmod = parseLastmod(await readFile(LASTMOD_FILE, 'utf8').catch(() => null));
  const today = new Date().toISOString().slice(0, 10);
  const lastmod = mergeLastmod(prevLastmod, hashes, today);
  const restamped = restampedPaths(prevLastmod, lastmod);

  // 第一个参数留 undefined 用默认域名：SITE_ORIGIN 的真源在 src/content/site.ts，
  // 这个脚本是纯 JS，不为了一个常量再绕一层导出（第二个参数才是本次要传的）。
  await writeFile(join(DIST, 'sitemap.xml'), sitemapXml(undefined, dateMap(lastmod)), 'utf8');
  written.push('/sitemap.xml');

  // 清单本身也写回仓库：dist/ 被 gitignore，CI 每次都是干净的，清单若不进库
  // 就会每次"发现"48 页全变。写回时内容不变则不落盘，保持工作树干净。
  const lastmodText = serializeLastmod(lastmod);
  if (lastmodText !== (await readFile(LASTMOD_FILE, 'utf8').catch(() => null))) {
    await writeFile(LASTMOD_FILE, lastmodText, 'utf8');
  }
  /* 变更清单交给 scripts/indexnow.mjs 读：它负责把「这一轮哪些页真的变了」
   * 推给 IndexNow。写成 JSON 而不是让推送脚本自己比对 sitemap，是因为判断
   * "内容变没变"需要渲染结果的哈希，而那个只有构建期有。
   *
   * 放仓库根而不是 dist/：它是构建的**中间产物**，dist 会被整个上传，而这个
   * 文件对访问者没有意义（还会白暴露一份页面清单）。 */
  await writeFile(join(ROOT, '.lastmod-changed.json'), `${JSON.stringify(restamped, null, 2)}\n`, 'utf8');

  console.log(
    restamped.length
      ? `lastmod：${restamped.length} 页内容有变化，日期更新为 ${today}`
      : 'lastmod：全部页面内容未变，日期沿用清单',
  );

  await writeFile(join(DIST, 'robots.txt'), robotsTxt(), 'utf8');
  written.push('/robots.txt');

  /* llms.txt：给大模型看的站点索引（llmstxt.org 的约定）。真源在 seo/llms.ts。
   *
   * 它与 sitemap.xml 是两种读者：sitemap 每条 URL 一行、带全量 hreflang，是给
   * 搜索引擎的机器索引；llms.txt 每页一句话，是给模型的可读索引。两份都不放
   * public/，理由同上——内容里有绝对地址，而真源只有 content/site.ts。 */
  await writeFile(join(DIST, 'llms.txt'), llmsTxt(), 'utf8');
  written.push('/llms.txt');

  // 空壳本身已经被首页覆盖掉了；dist-ssr 只是构建中间产物，别一起发上去。
  await rm(SSR, { recursive: true, force: true });

  /* 客户端 bundle 已经没有 HTML 引用了，但留在 dist 里 Pages 照样会发上去。
   * 删掉才是真的省下那 647 KB——只有 HTML 里那段 replace 生效、这里漏删的话，
   * 部署体积不变，而任何人都不会注意到一个没人引用的目录。 */
  await rm(join(DIST, 'assets'), { recursive: true, force: true });

  /* 样式表压缩放在最后：它改的是 dist/ 里的产物，必须在 Vite 把 public/
   * 拷完之后跑。放在 rm(assets) 之后是为了让"删了不该有的东西"先发生——
   * 两条命令互不依赖，但日志顺序读起来是「先清理、再瘦身」。 */
  await minifyStylesheet();

  console.log(`预渲染完成，共 ${written.length} 个文件：`);
  for (const p of written) console.log(`  ${p}`);
}

main().catch((err) => {
  console.error('预渲染失败：', err);
  process.exit(1);
});
