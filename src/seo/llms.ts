import { LOCALES, PAGES, pathFor, type Page } from '../i18n/paths';
import { SITE_ORIGIN, SUPPORT_EMAIL, SOFTWARE_VERSION, CHROME_STORE_URL } from '../content/site';
import { FREE_AMOUNT, PRICE_AMOUNT } from '../content/prices';
import { FREE_DAILY_CAPTURES } from '../content/limits';
import en from '../i18n/en';
import { nodeText } from './node-text';

/* `/llms.txt`：给大模型看的站点索引。
 *
 * 它解决的是一个很具体的问题：本站零脚本、零交互，正文全在预渲染好的 HTML
 * 里，而 HTML 里同时有导航、页脚、对比表、八门语言的语言切换器。抓取方要
 * 自己从这些噪声里认出"这站是干什么的、有哪几页、每页讲什么"。
 * llms.txt（llmstxt.org 的约定）就是用一段 markdown 把这件事直接说清楚：
 * 一个标题、一段摘要、几组链接。
 *
 * 四条设计约束：
 *
 * 1. **只生成一份，用默认语言（英文）。** llms.txt 没有 hreflang 之类的
 *    多语言机制，文件名固定是 `/llms.txt`。八份各说各话反而会让抓取方
 *    把同一份内容当成八份。其余语言以链接形式列出，各自指向真正的页面。
 * 2. **所有绝对地址从 SITE_ORIGIN 派生**，与 sitemap.ts 同源。写死域名的
 *    第二份副本，换域名时漏改的后果是索引把抓取方指向旧站，而站点本身
 *    完全正常。
 * 3. **摘要与链接说明取自字典，不另写一套文案。** 另写一套的话，改站点
 *    文案时这里会长期描述一个已经变了的产品，而没有任何检查会红——
 *    这与 meta.description 抄一份是同一个教训。
 * 4. **数字取常量，不写字面量。** 免费额度与价格都是会变的（改额度要同步
 *    CHANGELOG），写进这份给模型看的索引里就等于多了一个真源。tests/llms.test.ts
 *    逐条比对，改额度忘了这里会红。
 *
 * 与 sitemap.xml 的分工：sitemap 是给搜索引擎的机器索引（每个 URL 一条，
 * 带全量 hreflang），llms.txt 是给模型的**可读**索引（每页一句话）。两者
 * 都由 prerender.mjs 写进 dist/。
 */

/** markdown 链接文字里的方括号会提前结束链接，反斜杠要先转义。 */
function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/[[\]]/g, '\\$&');
}

/** 页面在 llms.txt 里的一句话说明。
 *
 * 取 meta.description 而不是 ogDescription：后者是被截短给社交卡片用的，
 * 这里没有长度限制，给的信息越多越好。
 *
 * 标题：子页取 nav/footer 里的那两三个字（meta.title 是给搜索结果的整句，
 * 塞进列表会又长又不齐）；首页取 meta.title 里破折号**之后**那半句——
 * 文件第一行已经是品牌名，这里再写一遍 "Page Screenshot Pro" 是纯噪声。
 * 剥不掉就退回 "Home"，而不是把整句连品牌一起塞进来。 */
function pageLine(page: Page, origin: string): string {
  const title =
    page === ''
      ? en.meta[''].title.replace(/^Page Screenshot Pro\s*[—–-]\s*/, '').trim() || 'Home'
      : pageTitle(page);
  return `- [${esc(title)}](${origin}${pathFor('en', page)}): ${en.meta[page].description}`;
}

/** 子页在 llms.txt 里的短标题。取 nav 里的那四个字，不取 meta.title——
 *  后者是给搜索结果的一整句，塞进列表会又长又不齐。 */
function pageTitle(page: Exclude<Page, ''>): string {
  switch (page) {
    case 'pricing':
      return en.nav.pricing;
    case 'faq':
      return en.nav.faq;
    case 'support':
      return en.nav.support;
    case 'privacy':
      return en.footer.privacy;
    case 'terms':
      return en.footer.terms;
  }
}

export function llmsTxt(origin: string = SITE_ORIGIN): string {
  const lines: string[] = [
    '# Page Screenshot Pro',
    '',
    // 摘要用 blockquote：llmstxt.org 的约定里这一段是"给模型的电梯陈述"。
    `> ${en.meta[''].description}`,
    '',
    nodeText(en.home.lead),
    '',
    '## Facts',
    '',
    `- Version: ${SOFTWARE_VERSION} — Chrome extension, Manifest V3`,
    '- Platform: Chrome 116+, Windows / macOS / Linux',
    `- Free tier: ${FREE_AMOUNT}, ${FREE_DAILY_CAPTURES} captures a day; the whole annotation editor is included`,
    `- Pro: element capture, PDF export, PDF merge, OCR and MCP access — ${PRICE_AMOUNT.monthly}/month, ${PRICE_AMOUNT.yearly}/year, or ${PRICE_AMOUNT.lifetime} once`,
    '- Screenshots, annotations and OCR run entirely in the browser; no image is uploaded',
    `- Support: ${SUPPORT_EMAIL}`,
    /* 商店地址写成**纯文本**，不是 markdown 链接。
     *
     * `llms.test.ts` 的「所有链接都是绝对地址，且主机只有一个」会把每一个
     * `](…)` 的 host 收进集合，要求它恰好等于本站域名。写成
     * `[Chrome Web Store](https://chromewebstore.google.com/…)` 会让集合多出
     * 第二个 host 而红——但那条断言的用意是「站内链接都由 pathFor 派生」，
     * 不是「不许提到站外地址」。纯文本两种意图都满足，也不用放宽断言。 */
    `- Status: listed on the Chrome Web Store — ${CHROME_STORE_URL}`,
    '',
    '## Pages',
    '',
    ...PAGES.map((page) => pageLine(page, origin)),
    '',
    '## Languages',
    '',
    // 只列语言首页：六页 × 八语言 = 48 行会把这份文件撑成 sitemap 的
    // markdown 版本，而八门语言的页面结构完全相同，多列 40 行没有新信息。
    ...LOCALES.map(
      (l) => `- [${esc(l.name)}](${origin}${pathFor(l.id, '')}): the site in ${esc(l.name)}`,
    ),
    '',
    '## Other',
    '',
    `- [Sitemap](${origin}/sitemap.xml): every URL, with hreflang for all eight languages`,
    `- [robots.txt](${origin}/robots.txt)`,
    '',
  ];

  return lines.join('\n');
}
