import type { Dict } from '../i18n/dict';
import type { QaItem } from '../content/types';
import { LOCALES, DEFAULT_LOCALE, pathFor, alternatePath, type Locale, type Page } from '../i18n/paths';
import {
  OG_IMAGE,
  OG_IMAGE_SIZE,
  PUBLISHER_LOGO,
  PUBLISHER_LOGO_SIZE,
  SITE_ORIGIN,
  SOFTWARE_VERSION,
  CHROME_STORE_URL,
} from '../content/site';
import { FREE_AMOUNT, PRICE_AMOUNT } from '../content/prices';
import { nodeText } from './node-text';

/* 每个路由的 <head>，拼成一段 HTML 字符串。
 *
 * 为什么是字符串而不是一组 React 元素：预渲染那边要把它塞进 index.html 的
 * `<!--app-head-->` 占位符，字符串最直接；而 React 19 对 <title>/<meta> 的
 * 提升行为是给流式渲染用的，靠它把标签搬到 head 里，等于把「head 里有什么」
 * 交给一个版本相关的细节。字符串则是可以单测的纯函数——tests/meta.test.ts
 * 直接读它，不需要跑一遍构建。
 *
 * 所有绝对地址都从 SITE_ORIGIN 派生。换域名只改 content/site.ts 一处。
 */

/* og:locale 用的是 Open Graph 的 `language_TERRITORY` 拼法，与 hreflang 的
 * BCP 47 不是一回事：hreflang 要 `zh-Hant`（字形必须写出来），og:locale 要
 * `zh_TW`。两者都由 LOCALES 里的 id/htmlLang 派生不出来，所以这张表必须
 * 手写；`Record<Locale, string>` 保证加一门语言时这里漏写是编译错误。 */
const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  'zh-Hans': 'zh_CN',
  'zh-Hant': 'zh_TW',
  ja: 'ja_JP',
  ko: 'ko_KR',
  es: 'es_ES',
  fr: 'fr_FR',
  de: 'de_DE',
};

const OG_TYPE = 'website';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** JSON-LD 内联进 <script> 时必须把 `<` 转义，否则正文里出现 `</script>`
 *  就能提前结束脚本块——结构化数据的字符串来自字典，而字典里有 <code> 标签。 */
function jsonLd(data: unknown): string {
  const body = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${body}</script>`;
}

export function absoluteUrl(locale: Locale, page: Page | 'notFound'): string {
  return `${SITE_ORIGIN}${page === 'notFound' ? '/' : pathFor(locale, page)}`;
}

/** 每页的 meta。notFound 用 notFoundMeta。 */
export function metaFor(dict: Dict, page: Page | 'notFound') {
  return page === 'notFound' ? dict.notFoundMeta : dict.meta[page];
}

function alternates(page: Page | 'notFound'): string {
  const lines = LOCALES.map(
    (l) => `<link rel="alternate" hreflang="${l.htmlLang}" href="${esc(absoluteUrl(l.id, page))}">`,
  );
  // x-default 指向默认语言那份。Google 用它决定「没有匹配语言时给谁看」。
  lines.push(
    `<link rel="alternate" hreflang="x-default" href="${esc(absoluteUrl(DEFAULT_LOCALE, page))}">`,
  );
  return lines.join('\n');
}

function softwareApplication(dict: Dict, locale: Locale): unknown {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Page Screenshot Pro',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Screen Capture',
    operatingSystem: 'Chrome 116+, Windows, macOS, Linux',
    softwareVersion: SOFTWARE_VERSION,
    /* url 必须指向**本语言**的首页，不是英文那份。
     *
     * 之前八份首页都写 `absoluteUrl('en', '')`，于是八个地址各自声明
     * 「我的规范地址是英文首页」——同一份结构化数据在 zh-tw 页面上说自己在
     * en，与同页 canonical 自相矛盾。Google 对这种不一致的处理是忽略该字段
     * 或把八页认成同一实体，两种都不是我们想要的。
     *
     * 同时补 inLanguage：SoftwareApplication 没有 hreflang 这种机制，语言只能
     * 靠这一条字段说明；缺了它，八份内容相同的描述在机器眼里是同一份。 */
    url: absoluteUrl(locale, ''),
    inLanguage: LOCALES.find((l) => l.id === locale)!.htmlLang,
    description: dict.meta[''].description,
    /* sameAs 指向 Chrome 应用商店的详情页——2026-10-31 上架后才填。
     *
     * 它回答的是「这个 SoftwareApplication 到底是哪个实体」：站上只有品牌名
     * 和一段描述，而商店详情页是 Google 自己索引的权威记录，两边用 sameAs
     * 连起来，搜索结果里才会把本站与那条列表当作同一个东西。
     *
     * `tests/meta.test.ts` 断言它是**绝对地址且主机是 chrome.google.com 或
     * chromewebstore.google.com**——不能只断言"存在"：一个指向本站首页的
     * sameAs 在类型上完全合法、在任何"有没有这个字段"的检查里也都是绿的，
     * 但它声明的是「我和我自己是同一个实体」，等于什么都没说。 */
    sameAs: [CHROME_STORE_URL],
    // 刻意**没有** aggregateRating：评分得来自真实评价。扩展刚上架，还没有
    // 任何一份评分数据，编一个会直接显示在搜索结果里，那是伪造记录。
    publisher: {
      '@type': 'Organization',
      name: 'Page Screenshot Pro',
      url: `${SITE_ORIGIN}/`,
      logo: {
        '@type': 'ImageObject',
        url: PUBLISHER_LOGO,
        width: PUBLISHER_LOGO_SIZE.width,
        height: PUBLISHER_LOGO_SIZE.height,
      },
      email: 'support@screenshotpro.agentsblockchains.com',
    },
    /* 每条 offer 都带 url + availability，2026-10-31 上架后补齐。
     *
     * 四条都指向商店详情页，不是各指各的：Pro 的三档不在商店里结算（商店只
     * 分发扩展，收款由 Waffo 处理），所以四条 offer 唯一一个「可以拿到这件
     * 东西的地方」都是同一个详情页。给 Pro 那三条编一个本站结账地址反而是
     * 假的自助购买路径——站点零脚本，没有任何按钮能发起结账。
     *
     * `availability: InStock` 是同一件事的另一半：没有它，Google 只知道
     * "有这个报价"，不知道现在买不买得到，于是不会把它当成当前可用的商品。
     * 上架前写 InStock 是假声明，上架后不写则白丢一次机会——这条字段的存在
     * 意义就在于它跟着 reality 走，而不是跟着代码走。 */
    offers: [
      { '@type': 'Offer', name: 'Free', price: FREE_AMOUNT.replace('$', ''), priceCurrency: 'USD', url: CHROME_STORE_URL, availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Pro Monthly', price: PRICE_AMOUNT.monthly.replace('$', ''), priceCurrency: 'USD', url: CHROME_STORE_URL, availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Pro Yearly', price: PRICE_AMOUNT.yearly.replace('$', ''), priceCurrency: 'USD', url: CHROME_STORE_URL, availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Pro Lifetime', price: PRICE_AMOUNT.lifetime.replace('$', ''), priceCurrency: 'USD', url: CHROME_STORE_URL, availability: 'https://schema.org/InStock' },
    ],
    featureList: dict.home.features.map((f) => f.title),
  };
}

function webSite(): unknown {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Page Screenshot Pro',
    url: `${SITE_ORIGIN}/`,
    inLanguage: LOCALES.map((l) => l.htmlLang),
  };
}

/* FAQPage：把页面上**真实渲染**的问答搬进结构化数据。
 *
 * 参数是 QaItem[]，不是 Dict：首页与 FAQ 页各自有一份问答数组，两处都从
 * 自己的字典字段来。早先它只接受 Dict 并固定读 dict.faq.groups，于是首页
 * 渲染着五条真问答、却一条 FAQPage 都不发——那五条里有三条（本地文件、
 * 无限滚动、界面语言）在 /faq/ 上没有，等于对爬虫隐瞒了最常被搜的问题。
 *
 * 「渲染了什么就声明什么」是这里唯一的原则：多声明一条页面上没有的问答属于
 * 垃圾结构化数据，Google 会当作不一致处理。tests/meta.test.ts 因此断言
 * Question 数**等于**该页渲染的 <details> 数，而不是「大于 0」。 */
function faqPage(items: QaItem[]): unknown {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: nodeText(item.a) },
    })),
  };
}

/* 面包屑：首页 › 当前页。
 *
 * 只做两级，因为站点的真实结构就是两级——六个页面全在根下，没有更深一层。
 * 编一个「首页 › 产品 › 定价」的三级路径是伪造信息：Google 会把结构化数据
 * 和实际 URL 结构对不上当成不一致，宁可只给真实的两级。
 *
 * 第二级的名字取那个页面自己的 <h1>（读者在页面上真看到的那几个字），
 * 不是 meta.title——后者是给搜索结果的整句「Pricing — Page Screenshot Pro」，
 * 塞进面包屑会又长又不自然，而且每个语言都得跟着改一遍。
 * nav 里只有四个链接（没有 privacy/terms），所以不能拿 nav 当索引。
 *
 * 首页自己**不发** BreadcrumbList：一条只有"首页"的面包屑没有任何信息量，
 * 而 Google 对单层面包屑也不展示。
 *
 * 这是 SEO_STRATEGY.md「进阶优化 2」那条。它能让搜索结果把长 URL 换成
 * 「Page Screenshot Pro › 定价」，是本轮唯一一条能直接改搜索外观的改动。
 */
function pageHeading(dict: Dict, page: Exclude<Page, ''>): string {
  switch (page) {
    case 'pricing':
      return dict.pricing.h1;
    case 'faq':
      return dict.faq.h1;
    case 'support':
      return dict.support.h1;
    case 'privacy':
      return dict.privacy.h1;
    case 'terms':
      return dict.terms.h1;
  }
}

function breadcrumb(dict: Dict, locale: Locale, page: Exclude<Page, ''>): unknown {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Page Screenshot Pro',
        item: absoluteUrl(locale, ''),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: pageHeading(dict, page),
        item: absoluteUrl(locale, page),
      },
    ],
  };
}

/** 一段 HTML 放进 `<head>`。page 为 'notFound' 时额外加 noindex。 */
export function headHtml(dict: Dict, locale: Locale, page: Page | 'notFound'): string {
  const meta = metaFor(dict, page);
  const canonical = absoluteUrl(locale, page);
  const ogDesc = meta.ogDescription ?? meta.description;

  const parts = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    page === 'notFound' ? '<meta name="robots" content="noindex">' : '',
    /* Google 不写这一条时按 `standard` 处理——搜索结果里只给默认小图。
     * 这是本站唯一一处「爬虫看得见、人看不见」的收益，一行换全站 48 页。
     * 404 不给：它已经有 noindex，再叠一条预览声明是无意义且自相矛盾的。 */
    page === 'notFound' ? '' : '<meta name="robots" content="max-image-preview:large">',
    `<link rel="canonical" href="${esc(canonical)}">`,
    page === 'notFound' ? '' : alternates(page),
    `<meta property="og:type" content="${OG_TYPE}">`,
    `<meta property="og:site_name" content="Page Screenshot Pro">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(ogDesc)}">`,
    `<meta property="og:url" content="${esc(canonical)}">`,
    `<meta property="og:image" content="${esc(OG_IMAGE)}">`,
    `<meta property="og:image:type" content="image/png">`,
    `<meta property="og:image:width" content="${OG_IMAGE_SIZE.width}">`,
    `<meta property="og:image:height" content="${OG_IMAGE_SIZE.height}">`,
    /* og:image:alt 是给读屏器和「图片没加载出来」时用的那句描述，八门语言
     * 各写一份没有意义——卡片图上只有品牌名和一句英文标语，本来就是同一张
     * 图。这里用站点 tagline（已是本语言），比"Page Screenshot Pro"更说明
     * 图片里有什么，又不用为八种语言各编一句图注。 */
    `<meta property="og:image:alt" content="${esc(dict.footer.tagline)}">`,
    `<meta property="og:locale" content="${OG_LOCALE[locale]}">`,
    ...LOCALES.filter((l) => l.id !== locale).map(
      (l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l.id]}">`,
    ),
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(meta.title)}">`,
    `<meta name="twitter:description" content="${esc(ogDesc)}">`,
    `<meta name="twitter:image" content="${esc(OG_IMAGE)}">`,
    /* twitter:image:alt 与 og:image:alt 是同一个值。
     *
     * 它是给读屏器和「图片没加载出来」时用的那句描述。少了它，卡片在 X 上
     * 仍然显示图片，只是图片没有替代文本——页面上完全看不出差别，而用读屏器
     * 的人拿到的是一张没有说明的图。两处共用 dict.footer.tagline，不各写一份
     * 是因为它们描述的是同一张图。 */
    `<meta name="twitter:image:alt" content="${esc(dict.footer.tagline)}">`,
  ];

  if (page === '') {
    /* 首页发三块：SoftwareApplication、WebSite、FAQPage。
     *
     * FAQPage 是 2026-10-31 补上的：首页渲染五条问答（见 Home.tsx 的 #faq
     * 区块），此前只发前两块，于是「本地 HTML 文件能用吗」「无限滚动页面
     * 会怎样」「界面支持哪些语言」这三个只在首页出现、恰恰是最常被搜的问题
     * 完全不在结构化数据里。 */
    parts.push(jsonLd(softwareApplication(dict, locale)), jsonLd(webSite()), jsonLd(faqPage(dict.home.faq)));
  } else if (page === 'faq') {
    parts.push(jsonLd(faqPage(dict.faq.groups.flatMap((g) => g.items))));
  }

  // 子页面各发一条面包屑。与上面的 FAQPage 不冲突：一个页面可以有多个
  // JSON-LD 块，Google 按 @type 各取所需。
  if (page !== '' && page !== 'notFound') {
    parts.push(jsonLd(breadcrumb(dict, locale, page)));
  }

  return parts.filter(Boolean).join('\n');
}

/** 语言切换器要用的：当前页面在每门语言下的地址。 */
export function languageLinks(locale: Locale, page: Page | 'notFound') {
  return LOCALES.map((l) => ({
    id: l.id,
    label: l.switchLabel,
    href: alternatePath(page, l.id),
    current: l.id === locale,
  }));
}
