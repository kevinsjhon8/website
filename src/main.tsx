import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import App, { dictFor } from './App';
import { resolvePath } from './i18n/paths';

/* 客户端入口——**但它不在产物里**。
 *
 * 2026-10-28 之前它是 hydrate 入口：每个路由的 HTML 已经由 prerender.mjs 生成
 * 好了，Vite 往每页塞一个 <script type="module">，浏览器里把 React 接上去。
 * 实测全量 grep src/ 的 useState / useEffect / onClick / onChange / onSubmit /
 * addEventListener：零命中——那个 647 KB（18.4 万 gzip）的 bundle 唯一做的事
 * 是把**已经正确的 DOM** 重新对一遍，一个像素都不改。
 *
 * 所以 scripts/prerender.mjs 的 stripClientScript() 现在把它从产物里剥掉，
 * dist/assets/ 也一并删除，CSP 回到 script-src 'none'。这个文件留着，是因为
 * 它是"加回交互"的落点：想在页面里放一个需要状态的组件时，去掉
 * prerender.mjs 里那一处调用与 dist/assets 的 rm、把 _headers 的 script-src
 * 改回 'self'，这里原样就能跑——三处都要改，理由写在 prerender.mjs 顶上。
 *
 * 保留下来的形状仍然是对的，即使不发布：路由与语言都从 location.pathname
 * 重新解析，不依赖预渲染时注入的 props——两边用的是同一个 resolvePath，
 * 接出来的树才会一致。
 */

const { locale, page } = resolvePath(window.location.pathname);

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <App dict={dictFor(locale)} locale={locale} page={page} />
  </StrictMode>,
);
