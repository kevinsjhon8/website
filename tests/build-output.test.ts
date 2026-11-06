import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES, PAGES, pathFor } from '../src/i18n/paths';
import * as esbuild from 'esbuild';

/* 产物里不许有可执行脚本。
 *
 * 站点是「用 React 写页面、构建期跑一次」，不是「浏览器里跑一个 React 应用」：
 * `scripts/prerender.mjs` 的 stripClientScript() 把 Vite 注入的
 * `<script type="module" src="/assets/index-<hash>.js">` 剥掉，dist/assets/ 一并
 * 删除，`_headers` 的 CSP 写的是 `script-src 'none'`。
 *
 * 为什么这需要一条单测：这三件事任何一件漏掉，**构建都不会失败**。
 *   - 只删 HTML 里的引用、漏删 dist/assets/：647 KB 照样随部署发上去，而
 *     一个没有任何人引用的目录，谁也不会注意到；
 *   - stripClientScript() 的正则落空：函数里那个 throw 会拦住，但把整个调用
 *     删掉（一次误"清理"）就什么都不拦了，184 KB 静默回到产物里。
 * 页面看起来一模一样，tests/ 的其他用例也全绿——它们测的都是
 * entry-server 的纯函数，不读 dist/。唯一的外部证据在 scripts/site-e2e.mjs
 * （打线上地址），但那个要真浏览器，跑不进 CI。
 *
 * 所以这里直接读 dist/。数字断言（49 份 HTML、0 个 .js、没有 assets/）比
 * "某个函数被调用了"更有分辨力：它验的是结果，不是实现。 */

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

// 没构建过就跳过，而不是假绿：npm run check 里 build 在 test 之前，
// 单独跑 vitest 时 dist 可能不存在（与 sitemap.test.ts 同一条规矩）。
const built = existsSync(join(DIST, 'index.html'));

describe.skipIf(!built)('产物里零可执行脚本', () => {
  it('dist/ 里没有任何 .js 文件', () => {
    const js = readdirSync(DIST, { recursive: true })
      .map(String)
      .filter((f) => f.endsWith('.js'));
    expect(js, `这些 .js 还留在产物里：${JSON.stringify(js)}`).toEqual([]);
  });

  it('dist/assets/ 已经删掉', () => {
    /* 单独一条，不并入上一条：assets/ 里将来可能放别的带指纹的资源
     * （字体、图片），那时"有没有 .js"是对的判据而复用它会误红。而
     * 现在这个目录整个不该存在——留着它就是 647 KB 白占部署体积。 */
    expect(existsSync(join(DIST, 'assets')), 'dist/assets/ 还在').toBe(false);
  });

  it('49 份 HTML 一份都没带 module 脚本', () => {
    const withScript: string[] = [];
    for (const l of LOCALES) {
      for (const p of PAGES) {
        // pathFor 给的是站内地址（'/pricing/'），join 会把它拼到 DIST 下面；
        // 根路径 '/' 也不例外（join(DIST, '/', x) 仍是 DIST/x）。
        const file = join(DIST, pathFor(l.id, p), 'index.html');
        const html = readFileSync(file, 'utf8');
        if (/<script\b[^>]*\btype="module"/.test(html)) withScript.push(pathFor(l.id, p));
      }
    }
    const nf = readFileSync(join(DIST, '404.html'), 'utf8');
    if (/<script\b[^>]*\btype="module"/.test(nf)) withScript.push('404.html');

    expect(withScript, `这些页面仍带 module 脚本：${JSON.stringify(withScript)}`).toEqual([]);
    // 份数写死没有意义（加一门语言就变），但"一份都没落下"要有分母：
    // 上面那个循环如果真的读了文件，0 条命中才说明问题不存在。
    expect(LOCALES.length * PAGES.length + 1).toBe(49);
  });

  it('dist/ 里**所有** .html 都没有 module 脚本（含 public/ 带进来的静态页）', () => {
    /* 上一条按 LOCALES × PAGES 逐个点名，分母是 49——于是 `public/` 里
     * 随构建拷进来的静态 HTML（`google03df…html` 这样的验证文件）**从来没被
     * 扫过**。它们现在是零脚本的，但那是巧合而不是保证：谁往 public/ 放一个
     * 带脚本的页面，上一条照样绿。
     *
     * 这一条按目录遍历，判据是"产物里一个 module 脚本都不许有"，与文件名无关。
     * 它和上一条不重复：上一条能指名道姓说"是哪个路由"，这一条负责"有没有
     * 漏掉的路由"。 */
    const offenders = readdirSync(DIST, { recursive: true })
      .map(String)
      .filter((f) => f.endsWith('.html'))
      .filter((f) => /<script\b[^>]*\btype="module"/.test(readFileSync(join(DIST, f), 'utf8')));
    expect(offenders, `这些 HTML 仍带 module 脚本：${JSON.stringify(offenders)}`).toEqual([]);
    // 分母：遍历真的读到了东西（否则 filter 之后空数组什么都证明不了）。
    expect(readdirSync(DIST, { recursive: true }).filter((f) => String(f).endsWith('.html')).length)
      .toBeGreaterThanOrEqual(50);
  });

  it('JSON-LD 还在——剥离只针对 module，不碰数据块', () => {
    /* stripClientScript 的正则带 type="module"，所以结构化数据不该受影响。
     * 这条防的是"把正则放宽成 <script.*?>.*?</script>"那种改法：它会把
     * ld+json 一起剥掉，页面照样渲染，富媒体结果静默消失。 */
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    expect(html).toContain('<script type="application/ld+json">');
  });
});

describe.skipIf(!built)('产物里的样式表是压缩过的', () => {
  /* 压缩发生在 scripts/prerender.mjs 的 minifyStylesheet()，改的是
   * **dist/styles.css**；`public/styles.css`（源码）不动，因为
   * tests/feedback-url.test.ts 与 tests/render.test.ts 都要读它做文本断言。
   *
   * 这个分工意味着**没有任何单测看得见压缩有没有生效**——那两个文件读的是
   * public/ 那份，压不压都是同一份带注释的源码。删掉 minifyStylesheet()
   * 那一行调用，页面照样正常、npm run check 全绿、只多传 9 KB。所以这里读 dist/。
   *
   * 判据是三条而不是一条"变小了"：
   *   - 变小只说明**发生了**改动，把整段规则吞掉同样会变小；
   *   - 注释为 0 说明压的确实是注释与空白，而不是内容；
   *   - 两个符号还在，分别钉住自定义属性表与无障碍分支（暗色下拉框与
   *     prefers-reduced-motion 是唯二会因此静默变样的地方）。 */
  const DIST_CSS = join(DIST, 'styles.css');
  const SRC_CSS = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'styles.css');

  it('dist/styles.css 比 public/styles.css 小，且文件名没变', () => {
    const dist = readFileSync(DIST_CSS);
    const src = readFileSync(SRC_CSS);
    expect(dist.length, 'dist/styles.css 和源码一样大——压缩没跑？').toBeLessThan(src.length);
    /* 文件名必须保持 `/styles.css`：`_headers` 给它的缓存策略是
     * `max-age=3600, must-revalidate`（不带指纹，所以**不能** immutable），
     * 改名会让那条规则落空，而规则落空的症状是"缓存策略悄悄退回默认"，
     * 页面上看不出来。 */
    expect(readFileSync(join(DIST, 'index.html'), 'utf8')).toContain('href="/styles.css"');
  });

  it('注释被剥掉，但内容还在', () => {
    const css = readFileSync(DIST_CSS, 'utf8');
    // 源码里 39 段注释，产物里一段都不该有（`legalComments: 'none'` 的默认行为）。
    expect(css.match(/\/\*/g), 'dist/styles.css 里还有 CSS 注释').toBeNull();

    /* 剩下这条钉的是"没有把内容一起压掉"。**第一版写成 toContain('--popover-bg')，
     * 变异实测是绿的**：把产物里的 `--popover-bg` 改成 `--popover-bgX`，子串仍在，
     * 断言照过——而 `var(--popover-bg)` 已经全部失效，暗色下拉框会变回白底。
     *
     * 第二版改成"比对自定义属性名集合"，改名能抓到，但**整条普通规则被吞掉时仍然是绿的**
     * （变异实测：删掉 `.card-sm h2{…}` 那条，7 条用例全过）——因为 `margin`、
     * `font-size` 在别处也用到，属性名集合一个不少。集合比对的粒度就是不够。
     *
     * 第三版直接**逐字节比对**：把源码用同一个 esbuild 压一遍，产物必须与它完全相同。
     * 这一条同时覆盖"改了个字符"和"少了一整条规则"，没有粒度问题。实测相等。
     *
     * 升级 esbuild 之后这条红**不是缺陷**，是让你重看一遍压缩结果：
     * 换个版本压出来的字节本来就可能不同，但"不同"必须有人确认过。 */
    const { transformSync } = esbuild;
    const expected = transformSync(readFileSync(SRC_CSS, 'utf8'), {
      loader: 'css',
      minify: true,
    }).code;
    expect(css, 'dist/styles.css 不等于"源码压缩一遍"的结果——压缩丢了东西，或版本变了').toBe(
      expected,
    );

    /* 上面那条已经蕴含这两条，留着是因为失败信息更直接：
     * 逐字节比对红了只会说"不一样"，而这两条会指出是哪个东西没了。 */
    expect(css, '自定义属性表里没有 --popover-bg').toContain('--popover-bg');
    expect(css, 'prefers-reduced-motion 的规则块没了').toMatch(
      /@media[^{]*prefers-reduced-motion[^{]*\{/,
    );
  });
});
