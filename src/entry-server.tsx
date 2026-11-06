import { renderToString } from 'react-dom/server';
import App, { dictFor } from './App';
import { LOCALES, resolvePath, type Page } from './i18n/paths';
import { headHtml } from './seo/head';

/* SSR 入口。由 scripts/prerender.mjs 在 Node 里 import，为每个路由渲染一次。
 *
 * 只导出函数，不自己写文件、不读环境变量：这样它也能被单测直接调用
 * （tests/render.test.ts 用它检查每个路由都渲染出非空 HTML 且 head 齐全），
 * 而「写到哪个路径」这类文件系统的事情全部留在 prerender.mjs。
 *
 * sitemapXml / robotsTxt / llmsTxt 也挂在这里转出，不是因为它们属于 SSR，而是因为
 * prerender.mjs 是**纯 JS**、只认这个编译好的 bundle：让它在同一处拿齐
 * 「49 个 HTML + 三个爬虫文件」，比给 TS 再配一条编译路径便宜得多。
 * 它们的真源在 seo/sitemap.ts 与 seo/llms.ts，单测直接测那几份，这里只是转手。 */
export { sitemapXml, robotsTxt } from './seo/sitemap';
export { llmsTxt } from './seo/llms';
/* lastmod 的几个纯函数也转出去，理由同上：prerender.mjs 只认这个编译好的
 * bundle。它们算的是"这一页渲染结果变了没有"，真源在 seo/lastmod.ts。 */
export {
  contentHash,
  parseLastmod,
  mergeLastmod,
  serializeLastmod,
  dateMap,
  restampedPaths,
} from './seo/lastmod';

export interface Rendered {
  /** 页面正文的 HTML，塞进 index.html 的 <!--app-html-->。 */
  html: string;
  /** 该路由 <head> 里要追加的标签，塞进 <!--app-head-->。 */
  head: string;
  /** <html lang> 要用的值。 */
  lang: string;
}

export function render(rawPath: string): Rendered {
  const { locale, page } = resolvePath(rawPath);
  return renderRoute(locale, page);
}

export function renderRoute(locale: Parameters<typeof dictFor>[0], page: Page | 'notFound'): Rendered {
  const dict = dictFor(locale);
  const html = renderToString(<App dict={dict} locale={locale} page={page} />);
  return {
    html,
    head: headHtml(dict, locale, page),
    /* 从 LOCALES 里取，不写 `locale === 'zh-Hant' ? 'zh-Hant' : 'en'`。
     * 那个三元表达式在加第三门语言时**静默**降级：新语言会拿到 'en'，
     * 页面上看不出任何异常，只是浏览器按英文挑断词和字体。而 LOCALES 里
     * 的 htmlLang 本来就是真源（head.ts 的 hreflang 也读它），再抄一份
     * 只会多一个可以不同步的地方。 */
    lang: LOCALES.find((l) => l.id === locale)!.htmlLang,
  };
}
