import { LOCALES, DEFAULT_LOCALE, PAGES, pathFor, type Locale, type Page } from '../i18n/paths';
import { SITE_ORIGIN } from '../content/site';

/* 给爬虫看的两个文件：sitemap.xml 与 robots.txt。
 *
 * 为什么是**生成**的而不是 public/ 里的两个静态文件：两个文件里都有
 * 绝对地址，而绝对地址的真源只有一处（content/site.ts 的 SITE_ORIGIN，
 * canonical / hreflang / og:url 全部由它派生）。写成静态文件就有第二份域名，
 * 换域名时漏改一处，sitemap 会把爬虫指到已经不存在的旧站——而站点本身完全
 * 正常，没有任何检查会红。
 *
 * 这两个函数是纯的，所以 tests/sitemap.test.ts 直接调用，不需要跑构建。
 * 真正写文件的是 scripts/prerender.mjs（它已经在写 49 个 HTML 了）。
 */

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function abs(origin: string, locale: Locale, page: Page): string {
  return `${origin}${pathFor(locale, page)}`;
}

/** 某页面在每门语言下的地址，外加 x-default。与 head.ts 的 hreflang 同源。 */
function alternates(origin: string, page: Page): string {
  const lines = LOCALES.map(
    (l) => `    <xhtml:link rel="alternate" hreflang="${l.htmlLang}" href="${esc(abs(origin, l.id, page))}"/>`,
  );
  lines.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(abs(origin, DEFAULT_LOCALE, page))}"/>`,
  );
  return lines.join('\n');
}

/**
 * 全部 6 页 × 8 语言 = 48 条 <url>。
 *
 * 每条 <url> 都带全 9 条 alternate（8 门语言 + x-default），而不只是"自己的
 * 那一门"：这是 sitemaps.org 对多语言站点的要求，Google 靠它把同一页的八个
 * 语言版本认成一组，而不是八个内容雷同的页面。
 *
 * **`<lastmod>` 是内容变了才写的，不是每次构建都写。** 这条曾经是本文件里
 * 一条"刻意不写 lastmod"的决定，2026-10-31 改成写——改的是**来源**，不是
 * 结论：日期由 `seo/lastmod.ts` 按渲染结果的哈希推导，只在那一页的 HTML/head
 * 真的变了时才前进。构建时间仍然不许进这个字段，理由和当初一样：它的语义是
 * "这个地址的内容变了"，而构建时间每次部署都变，写进去等于每次都声明全站
 * 48 页同时更新——那是假信号，Google 明确说过会因此开始忽略 lastmod。
 *
 * `dates` 是显式参数而不是在这里算，因为这个函数必须是纯的：
 * `tests/sitemap.test.ts` 拿它和 `dist/sitemap.xml` 逐字节比对，而 dist 里
 * 的日期来自清单文件。两边传同一份 map，纯函数才仍然是可验证的。
 * 某页没有日期（清单缺条目、首次构建）就不写这一行——缺一行是真的，编一行不是。
 *
 * 404 页不在里面：它带 noindex，也不该被索引。
 */
export function sitemapXml(
  origin: string = SITE_ORIGIN,
  dates: Readonly<Record<string, string>> = {},
): string {
  const urls: string[] = [];
  for (const locale of LOCALES) {
    for (const page of PAGES) {
      const path = pathFor(locale.id, page);
      const date = dates[path];
      urls.push(
        [
          '  <url>',
          `    <loc>${esc(abs(origin, locale.id, page))}</loc>`,
          ...(date ? [`    <lastmod>${esc(date)}</lastmod>`] : []),
          alternates(origin, page),
          '  </url>',
        ].join('\n'),
      );
    }
  }
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

/**
 * robots.txt。
 *
 * 为什么必须自己发一份：Cloudflare 在没有任何 robots.txt 时会**自动**回一份
 * 带 "content signals" 前言的默认文件（实测线上就是 24 行注释、零条指令）。
 * 它既没有 Disallow 也没有 Sitemap 行——也就是说，在补上这份文件之前，
 * 站点根本没有声明过 sitemap 的位置，GSC/Bing 只能靠人工提交。
 *
 * 这里没有 Disallow：站点全是公开的营销页，没有 /api（那是另一个域名上的
 * Worker）。挡掉任何路径都只会让某个页面莫名不被索引。
 *
 * 刻意**不写** `Crawl-delay`：Google 早已不支持它，Bing 支持但会拖慢收录，
 * 而这个站只有 48 个静态页。
 */
export function robotsTxt(origin: string = SITE_ORIGIN): string {
  return [
    '# 由 scripts/prerender.mjs 生成，不要手改——域名来自 src/content/site.ts。',
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');
}
