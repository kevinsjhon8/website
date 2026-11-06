#!/usr/bin/env node
/* scripts/site-e2e.mjs —— 官网（dist/）部署后的回归测试
 *
 * 为什么需要它：扩展仓库的 `tools/validate.mjs` **完全不覆盖官网**（findPages()
 * 只走 entrypoints/），所以站点是零自动化检查的。而 `_headers` 里的 CSP 是唯一
 * 一处"写错了也不会红"的部署配置——`style-src 'self'` 会静默丢掉页面里的
 * 内联 `style=""`，本地打开看不出任何差别（没有头），本地假服务器也只能验
 * 你自己注入的那份头，验不了平台有没有采纳 `_headers`。
 *
 * 所以这里打的是**真实线上地址**：
 *   A. 本地静态服务器喂 dist/（**不注入任何 CSP**）—— 基准
 *   B. 线上 Pages 部署（平台真实下发的 CSP）—— 被测
 * 两轮 computed style 必须逐字节相同、文档高度相同，且 B 轮零违规事件。
 *
 * ── 基准为什么改成"本地服务器"而不是 file:// ──────────────────────
 * 站点改成 React + Vite 之后是预渲染的目录索引：dist/pricing/index.html 里
 * 引用的是 `/styles.css`（**根绝对**路径，见 index.html）。用 file:// 打开时
 * 这些会解析成 `file:///styles.css`，也就是文件系统根——基准那一轮根本没有
 * 样式，于是每一页都被判成"差异"。
 * 本地服务器让根绝对路径照常解析，同时它不下发任何 CSP，基准的含义没变。
 *
 * ── 金丝雀是这份脚本的立身之本 ────────────────────────────────────
 * 它插一个内联 style 和一段内联 <script>，要求：margin 塌成 0、内联脚本
 * **不**执行、至少两条违规。没有它，"全绿"也可能只是"根本没有 CSP"。
 *
 * 中间有过一段 `script-src 'self'`：那时站点是 React + Vite 的 hydrate 形态，
 * 每页都带一个 `<script type="module" src="/assets/index-<hash>.js">`。
 * 2026-10-28 起那个 bundle 被 `scripts/prerender.mjs` 的
 * stripClientScript() 从产物里剥掉、dist/assets/ 一并删除（它只做 hydrate，
 * 零交互站点上一个像素都不改），于是 CSP 回到 `script-src 'none'`，
 * 而"脚本"相关断言的**方向整个倒了过来**：
 *   1. 每页的 module 脚本数必须**为 0**（旧版这里要求恰好 1 个）；
 *   2. dist/ 里不许有任何 .js——Pages 发的是 dist/ 的镜像；
 *   3. 正常加载**零**违规事件。
 * 再叠上金丝雀（内联脚本不许跑）。
 *
 * 注意 'self' 与 'none' 现在**由 CSP 本身分不开**了：两种都会拦住内联脚本，
 * 而"同源脚本能不能加载"在没有脚本时无从体现。那件事改由第 1、2 条来管，
 * 写回 'unsafe-inline' 仍然会让金丝雀红。这个"分辨力从 CSP 挪到产物"的
 * 变化是有意的，不是漏了断言。
 *
 * 用法：
 *   node scripts/site-e2e.mjs [chrome可执行文件路径] [线上地址]
 * 默认 chrome 路径 ~/.local/bin/chrome-for-testing，默认地址
 * https://page-screenshot-pro.pages.dev。
 *
 * 前提：先 `npm run build`。脚本读的是 dist/，不是源码。
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdtempSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, '..', 'dist');
const CHROME = process.argv[2] || join(process.env.HOME || '', '.local/bin/chrome-for-testing');
const BASE = (process.argv[3] || 'https://page-screenshot-pro.pages.dev').replace(/\/+$/, '');
const PORT = Number(process.env.PSP_E2E_PORT || 9341);
const LOCAL_PORT = Number(process.env.PSP_E2E_LOCAL_PORT || 9342);

/* 路由清单。与 src/i18n/paths.ts 一致——那边改了这边要跟着改，
 * tests/paths.test.ts 只钉住了 prerender.mjs 与本文件，但钉不到这份脚本的
 * 运行结果（它要真浏览器，跑不进单测）。少一条的后果是那条路由**没人检查**，
 * 而脚本照样全绿，所以下面还有一条"线上路由数量"的断言兜底。 */
const LOCALES = [
  { id: 'en', segment: '', htmlLang: 'en' },
  { id: 'zh-Hans', segment: 'zh-cn', htmlLang: 'zh-Hans' },
  { id: 'zh-Hant', segment: 'zh-tw', htmlLang: 'zh-Hant' },
  { id: 'ja', segment: 'ja', htmlLang: 'ja' },
  { id: 'ko', segment: 'ko', htmlLang: 'ko' },
  { id: 'es', segment: 'es', htmlLang: 'es' },
  { id: 'fr', segment: 'fr', htmlLang: 'fr' },
  { id: 'de', segment: 'de', htmlLang: 'de' },
];
const PAGES = ['', 'pricing', 'faq', 'support', 'privacy', 'terms'];

const ROUTES = [];
for (const l of LOCALES) {
  for (const p of PAGES) ROUTES.push({ locale: l.id, htmlLang: l.htmlLang, page: p, path: pathOf(l.segment, p) });
}

function pathOf(segment, page) {
  if (!segment) return page ? `/${page}/` : '/';
  return page ? `/${segment}/${page}/` : `/${segment}/`;
}

if (!existsSync(join(DIST, 'index.html'))) {
  console.error(`❌ ${DIST}/index.html 不存在。先跑 npm run build。`);
  process.exit(1);
}

/* ── 本地静态服务器（基准那一轮用） ──────────────────────────────
 * 刻意**不**注入任何 CSP，也不读 _headers：基准的含义就是"没有策略时页面长
 * 什么样"。目录索引与 308 的形状照 Cloudflare Pages 来，否则基准和线上测的
 * 就不是同一个地址。 */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  /* 首页三张插图是 WebP（docs/seo.md §8.1）。线上 Cloudflare 会正确发
   * image/webp，这张表只服务基准轮那个本地服务器——但缺了它就会落到
   * application/octet-stream，而 checkFigures() 的 naturalWidth > 0 有可能
   * 因此红掉，看起来像"WebP 转换把图弄坏了"。一行改动，没理由不加。 */
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const local = createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);

  // Pages 对目录索引会 308 到带尾斜杠的地址。这里照做，好让两轮测的是同一个 URL。
  if (url !== '/' && !url.endsWith('/') && !extname(url)) {
    res.writeHead(308, { Location: `${url}/` });
    res.end();
    return;
  }

  let file = join(DIST, normalize(url).replace(/^(\.\.[/\\])+/, ''));
  if (url.endsWith('/')) file = join(file, 'index.html');
  // 目录里没有 index.html 就是 404 页（与 Pages 一致）。
  if (!existsSync(file) || !statSync(file).isFile()) file = join(DIST, '404.html');

  if (!existsSync(file)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('not found');
    return;
  }
  res.writeHead(file === join(DIST, '404.html') ? 404 : 200, {
    'Content-Type': MIME[extname(file)] || 'application/octet-stream',
  });
  createReadStream(file).pipe(res);
});

await new Promise((r) => local.listen(LOCAL_PORT, '127.0.0.1', r));
const LOCAL = `http://127.0.0.1:${LOCAL_PORT}`;

/* ── 浏览器 ─────────────────────────────────────────────────────── */
const profile = mkdtempSync(join(tmpdir(), 'site-e2e-'));

/* stderr 必须收着，不能 `stdio: 'ignore'`。
 * 原先忽略 stderr，Chrome 起不来时唯一的信息就是下面那句
 * 「CDP 没起来：检查 chrome 路径与 --remote-debugging-port 是否可用」——
 * 而它把三种完全不同的原因（沙箱不可用、缺共享库、profile 被锁）说成同一句，
 * 还都指向「路径或端口不对」这两个通常是对的猜测。2026-10-29 实测：这台机器上
 * Chrome 以 `FATAL:...zygote_host_impl_linux.cc:130] No usable sandbox!` 退出，
 * 路径和端口都没问题，用户拿到的却是「检查 chrome 路径」。
 *
 * 新版 Chrome 还会把 `DevTools listening on ws://127.0.0.1:<port>/…` 打在 stderr
 * 上——那是"端口真的开了"最直接的证据，所以 wsUrl() 失败时会把它一起打出来。 */
let chromeErr = '';

/* 等 CDP 的预算：60 秒，和 settings-e2e / ocr-e2e 一样，不是 15 秒。
 *
 * 2026-10-30 实测（本机全部历史 profile）：
 *   psp-settings-e2e-*  285 个，284 个带 Default/Preferences
 *   site-e2e-*           42 个， 33 个带 Default/Preferences
 * 两份脚本的等待长度是它们最直接的结构差别（60×500ms vs 60×250ms），而
 * settings-e2e 还要额外 `--load-extension`，启动**更慢**却几乎从不失手。
 *
 * 失败那次（site-e2e-x6sTc8）的 profile 目录是完整的：Chrome 起来了、建了
 * Default/、写了 History / Trust Tokens / Local Storage / Shared Dictionary，
 * 也就是它健康地跑完启动，然后在 15 秒到点时被 SIGKILL，所以既没有
 * Preferences 也没有 DevToolsActivePort。本机内存只有 ~1.0 Gi 空闲、3.4 Gi
 * swap 已用，Chrome 冷启动比 15 秒慢是常态——而 10-26 那批成功是靠重跑
 * （16:14–16:22 连跑 7 次）换来的，不是 15 秒够用。 */
const CDP_WAIT_MS = 60_000;
const POLL_MS = 250;

/* `--headless=new` 而不是裸 `--headless`，只是与另外两份脚本对齐，**不是**
 * 本轮的修复：156 的二进制里只有 headless_mode_util.cc / headless_mode_init.cc，
 * 没有 `headless=old` 字面量，旧实现已经不在，两种写法落到同一处。改成显式
 * 写法是为了让三份脚本不再各写一套，免得下一个人以为它们测的环境不同。 */
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  '--no-first-run', '--no-default-browser-check',
  `--user-data-dir=${profile}`, `--remote-debugging-port=${PORT}`,
  '--window-size=1280,3000', 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
chrome.stderr.setEncoding('utf8');
chrome.stderr.on('data', (s) => {
  chromeErr = (chromeErr + s).slice(-4000); // 只留尾部，FATAL 总在最后
});
/* 早退也是信息：Chrome 崩了就别把整段预算等满。 */
let chromeExit = null;
chrome.on('exit', (code, signal) => { chromeExit = { code, signal }; });
/* 路径写错是 ENOENT，走的是 'error' 而不是 'exit'。不接住它就是一个
 * 未处理的 'error' 事件，Node 会直接抛出去——那条栈对用户毫无用处。 */
let spawnErr = null;
chrome.on('error', (e) => { spawnErr = e; });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* 浏览器与本地服务器必须在**任何**退出路径上关掉，包括未捕获异常。
 * 这份脚本是顶层 await 写的，没有一处 try/finally 能罩住全部断言，所以清理挂在
 * process 的 exit 事件上而不是末尾那行 —— 末尾那行只在全绿时才走得到。实测：
 * 一次 cssRules 抛 SecurityError 就留下 9 个 headless Chrome 进程，每个都占着
 * 端口和几百 MB，下一次运行再起一个端口就撞车。 */
let cleaned = false;
const cleanup = () => {
  if (cleaned) return;
  cleaned = true;
  try { chrome.kill('SIGKILL'); } catch { /* 已经退了 */ }
  try { local.close(); } catch { /* 已经关了 */ }
};
process.on('exit', cleanup);
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { cleanup(); process.exit(130); });
}
process.on('uncaughtException', (e) => {
  console.error('❌ 未捕获异常:', e?.stack || e);
  cleanup();
  process.exit(1);
});
process.on('unhandledRejection', (e) => {
  console.error('❌ 未处理的 Promise 拒绝:', e?.stack || e);
  cleanup();
  process.exit(1);
});

async function wsUrl() {
  const deadline = Date.now() + CDP_WAIT_MS;
  while (Date.now() < deadline) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    /* Chrome 已经退了就立刻报，别把整段预算等满——等待期间什么都读不到。 */
    if (chromeExit || spawnErr) break;
    await sleep(POLL_MS);
  }
  if (spawnErr) {
    throw new Error(
      `起不来 Chrome：${spawnErr.code === 'ENOENT'
        ? `路径不存在（chrome=${CHROME}）`
        : `${spawnErr.code || ''} ${spawnErr.message}`}`,
    );
  }

  /* 「Chrome 没起来」和「Chrome 起来了但端口没开」是两种不同的故障，原先只有
   * 一句「（Chrome 没有任何输出）」，两种都往那上面套。profile 目录是**最硬的
   * 证据**：Chrome 一旦跑起来就会在里面建 Default/ 并写一堆 sqlite；目录是空的
   * 说明它连启动都没走到（缺库、沙箱），目录有内容而没 Preferences 说明它跑到
   * 一半被杀了（时间不够 / 内存不够）。
   *
   * 注意 **不能**把「有 Preferences」读成「干净退出」：成功那次的 profile 也是
   * 被 cleanup() SIGKILL 的，照样有 Preferences。它只说明 Chrome 走过了写偏好
   * 的那一步。这一行是给下一个看到报错的人定位用的，不参与任何判定。 */
  let started = 'unknown';
  try {
    const dflt = join(profile, 'Default');
    if (!existsSync(dflt)) started = 'no（profile 里连 Default/ 都没有，Chrome 没进到启动流程）';
    else if (!existsSync(join(dflt, 'Preferences')))
      started = 'yes，但没写 Preferences（启动半途被打断，多半是等太短或内存不足）';
    else started = 'yes，且已写过 Preferences（走到了落盘偏好那一步）';
  } catch { /* 读不了就不写这一行 */ }

  const tail = chromeErr.trim().split('\n').slice(-6).join('\n');
  /* Chrome 会自己打 `DevTools listening on ws://…`。没等到端口却**有**这一行，
   * 说明端口开过又关了（profile 冲突）；没有这一行才是"压根没开到"。 */
  const listened = /DevTools listening on (ws:\/\/\S+)/.exec(chromeErr)?.[1];
  throw new Error(
    `CDP 没起来（chrome=${CHROME}, port=${PORT}, 等了 ${CDP_WAIT_MS / 1000}s` +
    (chromeExit ? `, 进程已退出 code=${chromeExit.code} signal=${chromeExit.signal}` : ', 进程还活着') +
    '）\n' +
    `Chrome 是否启动过：${started}\n` +
    (listened ? `它确实报过 DevTools 地址：${listened}（端口开了又关，查 profile 冲突）\n` : '') +
    (tail ? `Chrome 最后几行输出：\n${tail}` : '（Chrome 没有任何输出）'),
  );
}

const url = await wsUrl();
const ws = new WebSocket(url);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
  }
};
function send(method, params = {}) {
  const mid = ++id;
  return new Promise((resolve, reject) => {
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval 失败');
  return r.result.value;
}

await send('Page.enable');
await send('Runtime.enable');

/* 在页面脚本之前装钩子收集 CSP 违规。注意：这个探针自身是 CDP 注入的，
   不受页面 CSP 约束——否则金丝雀也没法插进去。 */
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `window.__viol = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      window.__viol.push({
        directive: e.effectiveDirective || e.violatedDirective,
        blocked: (e.blockedURI || '').slice(0, 120),
        sample: (e.sample || '').slice(0, 120),
      });
    });`,
});

/* 比对的计算样式：每页挑几个原本靠内联样式撑着的元素。
   元素不存在时返回 {missing:true}——两轮都 missing 会判"相等"，所以
   这个探针**发现不了**"类名根本没写进 HTML"，改类名时要回组件核对。 */
const PROBE = `(() => {
  const pick = (sel, props) => {
    const el = document.querySelector(sel);
    if (!el) return { sel, missing: true };
    const cs = getComputedStyle(el);
    const out = { sel };
    for (const p of props) out[p] = cs.getPropertyValue(p);
    return out;
  };
  const P = ['margin-top', 'margin-bottom', 'max-width', 'text-align', 'color', 'font-size', 'padding-left'];
  return {
    h1: pick('.page-head h1', P),
    meta: pick('.page-head .meta', P),
    prose: pick('.prose', P),
    proseH2: pick('.prose > h2', P),
    section: pick('main > section.section', P),
    card: pick('.card', P),
    cardNarrow: pick('.card-narrow', P),
    cardCenter: pick('.card-center', P),
    cardMid: pick('.card-mid', P),
    cardP2: pick('.card p + p', P),
    cardUl: pick('.card ul', P),
    sectionTight: pick('section.section-tight', P),
    sectionTighter: pick('section.section-tighter', P),
    sectionFlush: pick('section.section-flush', P),
    nav: pick('.nav-links', ['gap', 'font-size']),
    footer: pick('.footer', ['margin-top', 'padding-top']),
    body: pick('body', ['background-color', 'color', 'font-family']),
  };
})()`;

/* 等一个**已知终值**，不是"和初始不同"。
 * 固定 sleep 会随机失败：网络慢一点时 computed style 还停在浏览器默认值
 * （body 的 font-family 报 Times New Roman、背景透明），于是本地那一轮
 * 反而成了"有样式"的一方，整页被判成差异——一次真实失败，不是理论风险。
 * 终值取 body 的 font-family：styles.css 的 :root --font 一定会覆盖它，
 * 而它又只在样式表真正生效后才会变。 */
const READY = `(() => {
  if (document.readyState !== 'complete') return false;
  const fam = getComputedStyle(document.body).fontFamily || '';
  return /Segoe UI|Helvetica|system-ui|-apple-system/i.test(fam);
})()`;

async function waitReady() {
  for (let i = 0; i < 80; i++) {
    try {
      if (await evaluate(READY)) return true;
    } catch {}
    await sleep(100);
  }
  return false;
}

async function load(target) {
  await send('Page.navigate', { url: target });
  if (!await waitReady()) {
    console.log(`   ⚠️  ${target} 的样式表在 8 秒内没有生效`);
  }
  const styles = await evaluate(PROBE);
  const viol = await evaluate('window.__viol || []');
  const height = await evaluate('document.documentElement.scrollHeight');
  const html = await evaluate(`(() => ({
    lang: document.documentElement.lang,
    canonical: (document.querySelector('link[rel=canonical]') || {}).href || '',
    hreflang: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => l.hreflang),
    moduleSrcs: [...document.querySelectorAll('script[type=module][src]')].map((s) => s.getAttribute('src')),
    robots: (document.querySelector('meta[name=robots]') || {}).content || '',
  }))()`);
  return { styles, viol, height, html };
}

let bad = 0;
const fail = (msg) => { bad++; console.log(`❌ ${msg}`); };

/* ── 栅格形状：不许留"孤儿卡" ────────────────────────────────────
 * 2026-10-26 用户报的版式问题就是这一条：四个相同的元素本该 2×2，实际排成
 * 3 个一排、第二排只剩 1 个。根因是 `repeat(auto-fit, minmax(265px,1fr))`
 * 的列数由内容宽度算出来——1080px 内容宽下 4×265 + 3×20 = 1120 > 1080，
 * 于是自动落到 3 列。`auto-fit` 这种"列数是算出来的"写法，每改一次 --maxw
 * 或换一种语言都可能变，而 CSS 改错**不会让任何单测变红**（tests/ 里
 * 一条样式断言都没有，扩展仓库的 tools/validate.mjs 也根本不覆盖官网）。
 *
 * 所以这里量真浏览器的渲染结果，判据是几何而不是类名：
 *   - 最后一排只有 1 个元素 → 孤儿卡（除非它横跨整行，那是断点处有意为之）
 *   - 4 个元素排成 3 列 → 用户报的那个形状本身
 * 两轮宽度各量一次：1280（--maxw 生效的桌面版式）与 800（三列已收成两列）。
 * 560 不量——那里所有栅格都是单列，判据不适用（cols === 1 直接跳过）。
 *
 * 量的是**本地基准**（dist/），所以部署前就能跑，不需要先上线。 */
const GRID_PROBE = `(() => {
  const shape = (g) => {
    const kids = [...g.children];
    if (!kids.length) return null;
    const rects = kids.map((k) => k.getBoundingClientRect());
    const tops = rects.map((r) => Math.round(r.top));
    const uniq = [...new Set(tops)];
    const perRow = uniq.map((t) => tops.filter((x) => x === t).length);
    const cols = getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length;
    const gridW = g.getBoundingClientRect().width;
    const lastW = rects[rects.length - 1].width;
    return { n: kids.length, cols, rows: perRow.length, perRow, lastFull: lastW >= gridW - 2 };
  };
  const out = {};
  for (const sel of ['.plans', '.grid-2', '.grid-3', '.steps']) {
    out[sel] = [...document.querySelectorAll(sel)].map(shape);
  }
  return out;
})()`;

async function checkGrids() {
  const before = bad;
  for (const width of [1280, 800]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width, height: 1000, deviceScaleFactor: 1, mobile: false,
    });
    for (const p of ['/', '/pricing/', '/support/', '/zh-cn/', '/de/']) {
      await send('Page.navigate', { url: `${LOCAL}${p}` });
      if (!await waitReady()) {
        fail(`${width}px ${p} 的样式表没生效，栅格量不了`);
        continue;
      }
      const g = await evaluate(GRID_PROBE);
      for (const [sel, list] of Object.entries(g)) {
        list.forEach((s, i) => {
          if (!s) return;
          const where = `${width}px ${p} ${sel}[${i}]`;
          if (s.n === 4 && s.cols === 3) {
            fail(`${where} 四个元素排成 3 列（应 2×2）`);
          }
          if (s.cols > 1 && s.n >= 3 && s.perRow[s.perRow.length - 1] === 1 && !s.lastFull) {
            fail(`${where} 排成 ${s.perRow.join('+')}，最后一排只剩 1 个`);
          }
        });
      }
    }
  }
  await send('Emulation.clearDeviceMetricsOverride');
  /* 这一行只在真的一条都没红时打 ✅。上一版无条件打 ✅，于是上面十二条
   * 「排成 3 列」下面紧跟一句「无孤儿卡」——自相矛盾的输出比没有输出更坏，
   * 读的人只会相信最后那句。 */
  const n = bad - before;
  console.log(`${n === 0 ? '✅' : '❌'} 栅格形状         1280px / 800px ` +
    (n === 0 ? '下无孤儿卡' : `下有 ${n} 条不达标`));
}

await checkGrids();

/* ── 插图：加载成功、有替代文本、不撑破版心 ────────────────────────
 * 首页三张插图（public/images/*.webp，由 scripts/gen-site-images.mjs
 * 从手写 SVG 生成）有四条会**静默**失败的路径，
 * 每一条在本地 `npm run dev` 里都看不出来：
 *
 *   1. 路径写错 → <img> 渲染成 0×0 的空框，页面上什么都不显示，但 HTML 里
 *      那个 <img> 标签好好地在着。`naturalWidth === 0` 是唯一可靠的判据。
 *   2. 忘了 width/height → 图片下载完之前高度是 0，下载完页面整体跳一下；
 *      而 site-e2e 逐字节比对文档高度，加载时机不同就会报"高度变了"，
 *      那条红说的却是"部署过期"。
 *   3. alt 为空 → 图里**一个字母都没有**（八种语言没法烘焙进位图），
 *      所以 alt 空掉等于这张图对屏幕阅读器和搜索引擎完全不存在。
 *   4. 图片撑破 .wrap → 出现横向滚动条。
 *
 * 全部量本地基准，所以部署前就能跑。 */
const FIGURE_PROBE = `(() => {
  const imgs = [...document.querySelectorAll('.figure img')];
  return {
    count: imgs.length,
    items: imgs.map((img) => {
      const r = img.getBoundingClientRect();
      const fig = img.closest('.figure');
      return {
        src: img.getAttribute('src') || '',
        natural: img.naturalWidth,
        complete: img.complete,
        alt: (img.getAttribute('alt') || '').trim().length,
        hasDims: Boolean(img.getAttribute('width')) && Boolean(img.getAttribute('height')),
        w: Math.round(r.width),
        figW: Math.round(fig.getBoundingClientRect().width),
        cap: (fig.querySelector('figcaption')?.textContent || '').trim().length,
      };
    }),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
})()`;

async function checkFigures() {
  const before = bad;
  let total = 0;
  for (const width of [1280, 800, 390]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width, height: 1000, deviceScaleFactor: 1, mobile: false,
    });
    for (const p of ['/', '/zh-cn/', '/de/']) {
      await send('Page.navigate', { url: `${LOCAL}${p}` });
      if (!await waitReady()) {
        fail(`${width}px ${p} 的样式表没生效，插图量不了`);
        continue;
      }
      // 触发懒加载，再等图片真的解码完。
      //
      // 这里连着踩了两个坑，都是「就绪信号」这一类，和 settings-e2e 里
      // 「等 badge 变成非初始值」同源：
      //
      //   1. loading="lazy" 的图片进入视口前根本不发请求，而 Chrome 此时
      //      img.complete 已经是 true（规范里 complete 只表示"当前请求没有
      //      未完成的部分"，对尚未发起的懒加载请求同样成立）。所以"等
      //      complete"立刻通过，naturalWidth 停在 0，断言就把"还没开始加载"
      //      误报成"路径写错"。终值只能是 naturalWidth > 0。
      //   2. styles.css 有 `html { scroll-behavior: smooth }`，于是
      //      window.scrollTo(0, y) 是**动画**而不是跳转：循环每 60ms 重设一次
      //      目标，平滑动画永远追不上，页面实际停在原处，只有首屏附近那张图
      //      进了视口。必须显式 behavior: 'instant' —— 平滑滚动是给用户点的
      //      锚点用的，测量代码要的是瞬时定位。
      await evaluate(`(async () => {
        const step = Math.round(window.innerHeight * 0.8);
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      })()`);
      for (let i = 0; i < 60; i++) {
        if (await evaluate(`[...document.querySelectorAll('.figure img')].every((i) => i.naturalWidth > 0)`)) break;
        await sleep(100);
      }
      const g = await evaluate(FIGURE_PROBE);
      if (width === 1280 && p === '/') total = g.count;
      if (g.count === 0) {
        fail(`${width}px ${p} 一张插图都没有（首页应有三张）`);
        continue;
      }
      for (const it of g.items) {
        const where = `${width}px ${p} ${it.src}`;
        if (!it.complete || it.natural === 0) fail(`${where} 没加载出来（naturalWidth=0，路径或文件缺失）`);
        if (it.alt === 0) fail(`${where} alt 为空（图里没有文字，alt 空掉这张图就不存在了）`);
        if (it.cap === 0) fail(`${where} 没有图注`);
        if (!it.hasDims) fail(`${where} 缺 width/height 属性（加载时会跳版，且线上高度比对会误报）`);
        if (it.figW > 0 && it.w > it.figW + 1) fail(`${where} 图片宽 ${it.w} 撑出图框 ${it.figW}`);
      }
      if (g.overflow > 0) fail(`${width}px ${p} 有 ${g.overflow}px 横向溢出`);
    }
  }
  await send('Emulation.clearDeviceMetricsOverride');
  const n = bad - before;
  console.log(`${n === 0 ? '✅' : '❌'} 插图             三张/页 加载+alt+宽高 ` +
    (n === 0 ? `（首页 ${total} 张，1280/800/390px 下都不溢出）` : `下有 ${n} 条不达标`));
}

await checkFigures();

/* ── 先确认线上跑的就是这份构建 ──────────────────────────────────
 * 没有这一步，一个过期的部署会打印出四十多条「样式差异 / lang 不对 /
 * canonical 不对」，而每一条都在说同一件事：线上还是上一版。那种输出会把
 * 真正的缺陷埋在噪音里，读的人第一反应是"站点坏了"，而不是"忘了部署"。
 *
 * 判据是两条，各自对应一个**旧站不可能满足**的事实：
 *   - /zh-tw/ 返回 200（八语言版本；更早的静态站只有一种语言）
 *   - 首页的 module 脚本数**与本地 dist/index.html 一致**
 *
 * 第二条曾经写死成"必须有一个 /assets/*.js"（React 构建的产物）。2026-10-28
 * 剥离 bundle 之后那个判据会永远为假——不是部署过期，是判据过期，而且它
 * 会说反：一个"剥离没生效"的真缺陷会被报成"部署过期"。
 * 所以改成拿**本地产物**当期望值：本地也没有脚本时（今天），线上有脚本
 * 就说明线上更旧；将来若恢复客户端入口，本地有而线上没有同样判过期；而
 * 剥离逻辑本身坏掉时本地也带脚本、两边一致，这一关放行，改由下面那条
 * 「零客户端脚本」断言说出真正的原因。
 *
 * 两条都不成立就停下，用退出码 2 区别于"断言失败"的 1。
 *
 * 这不是让过期部署变绿——它仍然是红的。区别只在于它说的是哪一件事。
 * 这正是本仓库记下的那条规矩：部署过期就说部署过期，绝不去改断言或本地
 * 文件来"修"它。 */
{
  const localShell = readFileSync(join(DIST, 'index.html'), 'utf8');
  /* 正则要和上面 PROBE 的选择器读的是**同一种东西**：`script[type=module][src]`。
   * 少一个 `src=` 条件就会让本地数和线上数在两边的定义上分叉——而分叉的后果
   * 就是这条门禁永远判"部署过期"，把真正的差异挡在门外。 */
  const localScripts = (localShell.match(/<script\b[^>]*\btype="module"[^>]*\bsrc=[^>]*>/g) || []).length;
  const home = await load(`${BASE}/`);
  const zh = await fetch(`${BASE}/zh-tw/`);
  const fresh = home.html.moduleSrcs.length === localScripts && zh.status === 200;
  if (!fresh) {
    console.log(`❌ 线上部署不是这份构建：module 脚本 线上=${JSON.stringify(home.html.moduleSrcs)}` +
      ` 本地=${localScripts} 个  /zh-tw/ 状态=${zh.status}`);
    console.log('   这不是站点缺陷，是部署过期。先 npm run deploy，再重跑本脚本。');
    console.log('   （断言一条都没跑：对着旧站比样式只会得到四十条同一件事的红。）');
    ws.close();
    cleanup();
    process.exit(2);
  }
  console.log(`✅ 部署新鲜度         module 脚本 ${home.html.moduleSrcs.length} 个` +
    `（本地同）  /zh-tw/ 200`);
}

/* ── 逐路由：本地基准 vs 线上 ─────────────────────────────────── */
for (const r of ROUTES) {
  const base = await load(`${LOCAL}${r.path}`);
  const live = await load(`${BASE}${r.path}`);

  const diffs = [];
  for (const key of Object.keys(base.styles)) {
    const a = base.styles[key];
    const b = live.styles[key];
    if (JSON.stringify(a) !== JSON.stringify(b)) diffs.push({ key, local: a, live: b });
  }
  const hDiff = base.height !== live.height;
  const label = `${r.locale}${r.path}`;

  // 线上这一轮：零违规 + 样式一致 + 高度一致。
  const ok = diffs.length === 0 && live.viol.length === 0 && !hDiff;
  if (!ok) bad++;
  console.log(`${ok ? '✅' : '❌'} ${label.padEnd(16)} ` +
    `高度 ${base.height}/${live.height}${hDiff ? ' ← 变了' : ''}  ` +
    `违规 ${live.viol.length}  样式差异 ${diffs.length}`);
  if (live.viol.length) console.log('   违规：' + JSON.stringify(live.viol, null, 2));
  if (diffs.length) console.log('   差异：' + JSON.stringify(diffs, null, 2));

  // <html lang>：繁中必须写 zh-Hant，写 zh/zh-CN 会让浏览器挑简体字形。
  if (live.html.lang !== r.htmlLang) {
    fail(`${label} 的 <html lang> 是 ${JSON.stringify(live.html.lang)}，应为 ${r.htmlLang}`);
  }

  // canonical 指向自己，且带尾斜杠（Pages 把 /pricing 308 到 /pricing/）。
  if (!live.html.canonical.endsWith(r.path)) {
    fail(`${label} 的 canonical 是 ${JSON.stringify(live.html.canonical)}，应以 ${r.path} 结尾`);
  }

  // 每条路由都该列出全部语言 + x-default。
  const want = [...LOCALES.map((l) => l.htmlLang), 'x-default'].sort();
  if (JSON.stringify(live.html.hreflang.slice().sort()) !== JSON.stringify(want)) {
    fail(`${label} 的 hreflang 是 ${JSON.stringify(live.html.hreflang)}，应为 ${JSON.stringify(want)}`);
  }

  // 内容页不许 noindex。
  if (live.html.robots.includes('noindex')) fail(`${label} 不该有 noindex`);
}

/* ── 零客户端脚本：'none' 那一半的分辨力 ────────────────────────
 * 站点是「用 React 写页面、构建期跑一次」，产物里**一个可执行脚本都没有**：
 * prerender.mjs 的 stripClientScript() 把 Vite 注入的 module 脚本剥掉，
 * dist/assets/ 整个删除。CSP 因此是 `script-src 'none'`。
 *
 * 这条断言是那件事唯一的外部证据，要同时看三处，少一处就会漏：
 *   1. 线上首页的 module 脚本数为 0 —— 剥离没生效时这里立刻红；
 *   2. **本地 49 份 HTML 全都没有** type="module" —— 只看首页会漏掉
 *      "首页剥了、其他页没剥"这种半截状态（stripClientScript 只有一份，
 *      所以它更可能是全对或全错，但断言不该建立在"它一定同进同退"上）；
 *   3. dist/ 里没有 .js —— 光删 HTML 里的引用、漏删 dist/assets/ 的话，
 *      647 KB 照样随部署发上去，谁都不会注意到一个没人引用的目录。
 *
 * 这三条**不能**用"CSP 里写的是 'none'"来替代：响应头是平台按 _headers
 * 下发的，断言它的字面值等于断言源文件，验不到产物。内联脚本不许执行仍由
 * 下面的金丝雀负责，两者合起来才排除了 'unsafe-inline'。 */
{
  const n0 = bad;
  const home = await load(`${BASE}/`);
  if (home.html.moduleSrcs.length !== 0) {
    fail(`线上首页仍有 ${home.html.moduleSrcs.length} 个 module 脚本 ` +
      `${JSON.stringify(home.html.moduleSrcs)}——prerender.mjs 的 stripClientScript() ` +
      '没生效，184 KB 的 hydrate bundle 又回来了');
  }
  const localJs = readdirSync(DIST, { recursive: true }).map(String).filter((f) => f.endsWith('.js'));
  if (localJs.length) {
    fail(`dist/ 里还有 ${localJs.length} 个 .js：${JSON.stringify(localJs.slice(0, 5))}` +
      '——dist/assets/ 没被删掉，bundle 还在随部署上传');
  }
  const withScript = [];
  // 49 份内容页 + 404。404 不在 ROUTES 里（它不是内容页，样式也不参与比对），
  // 但它同样由同一个 shell 生成，所以同样可能带着脚本。
  // 内容页是目录索引，所以要拼 index.html；404 是单文件。
  const localPages = [...ROUTES.map((r) => join(DIST, r.path, 'index.html')), join(DIST, '404.html')];
  for (const file of localPages) {
    if (/<script\b[^>]*\btype="module"/.test(readFileSync(file, 'utf8'))) {
      withScript.push(file.replace(DIST, ''));
    }
  }
  if (withScript.length) {
    fail(`${withScript.length} 份本地 HTML 仍带 module 脚本：` +
      JSON.stringify(withScript.slice(0, 5)));
  }
  if (bad === n0) {
    console.log(`✅ 零客户端脚本     线上 module 脚本 0 个   本地 ${ROUTES.length + 1} 份 HTML 都无` +
      `   dist 内 .js ${localJs.length} 个`);
  }
}

/* ── 金丝雀：证明 CSP 真的送到了，且没有放行内联 ───────────────── */
await send('Page.navigate', { url: `${BASE}/` });
await sleep(800);
await evaluate('window.__viol = [];');
const probe = await evaluate(`(() => {
  const d = document.createElement('div');
  d.id = 'csp-canary';
  d.setAttribute('style', 'margin-top: 123px');
  document.body.appendChild(d);
  const s = document.createElement('script');
  s.textContent = 'window.__scriptRan = true';
  document.body.appendChild(s);
  return new Promise((r) => setTimeout(() => r({
    marginTop: getComputedStyle(document.getElementById('csp-canary')).marginTop,
    scriptRan: !!window.__scriptRan,
    viol: window.__viol.map((v) => v.directive),
  }), 150));
})()`);
const canaryOk = probe.marginTop === '0px' && probe.scriptRan === false && probe.viol.length >= 2;
console.log(`${canaryOk ? '✅' : '❌'} 金丝雀  内联 margin=${probe.marginTop}（应 0px）` +
  `  script 执行=${probe.scriptRan}（应 false）  违规指令=${JSON.stringify(probe.viol)}`);
if (!canaryOk) bad++;

/* ── 404：未知路径必须是**真 404** ──────────────────────────────
 * Pages 在没有 404.html 时把未知路径回落成首页并返回 200（soft 404）：
 * 搜索引擎把一堆不存在的 URL 当成重复首页，用户地址打错了也看不出来。
 * 这条断言验的是"平台有没有采纳 404.html"，而"文件在不在 dist 里"验不到这个。
 *
 * 深路径那一条是另一件事：404 页会在**任意深度**的 URL 上被渲染，所以它里面
 * 的 href/src 必须写成根绝对路径。写成相对的 styles.css 在 /foo/bar 下会解析成
 * /foo/styles.css → 404，用户拿到一个没有样式的裸 HTML。这里直接量渲染结果。
 */
for (const p of ['/nope', '/foo/bar', '/_headers', '/zh-tw/nope']) {
  const r = await fetch(`${BASE}${p}`);
  const text = await r.text();
  const ok = r.status === 404 && /Page not found/.test(text);
  if (!ok) bad++;
  console.log(`${ok ? '✅' : '❌'} 404     ${p.padEnd(12)} 状态 ${r.status}（应 404）` +
    `  是 404 页=${/Page not found/.test(text)}`);
}
{
  await send('Page.navigate', { url: `${BASE}/foo/bar` });
  if (!await waitReady()) console.log('   ⚠️  /foo/bar 的样式表在 8 秒内没有生效');
  // cssRules 必须逐个 try：跨路径解析失败的样式表读 cssRules 会抛 SecurityError，
  // 而这个异常会从 evaluate 里冒出来把整个脚本打断 —— 用户看到的是一行裸 Error、
  // 上面所有页的结果一条都没打印。读不到本身就是"样式没生效"的最强证据，
  // 应该记下来当断言的一部分。
  const deep = await evaluate(`(() => {
    const fam = getComputedStyle(document.body).fontFamily || '';
    const sheets = [...document.styleSheets].map((s) => {
      try { return { href: s.href, n: s.cssRules.length, err: null }; }
      catch (e) { return { href: s.href, n: 0, err: String(e && e.name) }; }
    });
    return {
      title: document.title,
      styled: /Segoe UI|Helvetica|system-ui|-apple-system/i.test(fam),
      css: sheets.filter((s) => s.href && s.n > 0).length,
      unreadable: sheets.filter((s) => s.err).map((s) => s.href),
    };
  })()`);
  const ok = deep.styled && deep.css > 0 && deep.unreadable.length === 0;
  if (!ok) bad++;
  console.log(`${ok ? '✅' : '❌'} 404 深路径  /foo/bar 样式生效=${deep.styled}` +
    `  可用样式表=${deep.css}（应 >0）  标题=${JSON.stringify(deep.title)}`);
  if (deep.unreadable.length) console.log('   读不到规则的样式表：' + JSON.stringify(deep.unreadable, null, 2));
}

console.log(bad === 0 ? '\n全部通过' : `\n${bad} 项未通过`);
ws.close();
cleanup();
process.exit(bad === 0 ? 0 : 1);
