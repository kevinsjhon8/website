import type { ReactNode } from 'react';
import type { CompareRow, LinkTarget, PlanItem, QaItem, Step } from '../content/types';
import type { Page } from './paths';

/* 站点文案的类型契约。
 *
 * 八份字典都标注成这个接口，于是「某一份漏了一句」是编译错误，不是页面上
 * 的一块空白。这个仓库里 i18n 的旧伤正是后者：键缺失时 t() 回退成键名，
 * 谁也没发现。接口只管得住**键**，数不了数组长度——少一条问答在页面上就是
 * 少一行，编译不报错，所以 tests/dict.test.ts 还会递归比对八份的形状。
 *
 * 需要行内 <strong>/<code>/<a> 的字段类型是 ReactNode，其余是 string。
 * 链接一律存 LinkTarget（页面 id 或 '#anchor'），成品 URL 由 href() 在渲染时
 * 按当前语言拼——字典里写死 `/zh-tw/pricing/` 的话，切到英文后链接会把人留在中文。
 */

export interface PageMeta {
  /** <title>，也是 og:title / twitter:title。 */
  title: string;
  /** <meta name="description">。 */
  description: string;
  /** og:description / twitter:description；缺省回落到 description。 */
  ogDescription?: string;
}

export interface NavCopy {
  features: string;
  pricing: string;
  faq: string;
  support: string;
  cta: string;
  /** 语言切换器的 aria-label。 */
  langLabel: string;
  /** <nav> 的 aria-label。
   *
   * 读屏器的地标列表里，页面上有多个 <nav> 时（本站只有一个）无名地标会
   * 被念成"导航"，用户不知道是哪个。这一条让地标列表能读出「主导航」。 */
  ariaLabel: string;
}

export interface FooterCopy {
  tagline: string;
  colProduct: string;
  colSupport: string;
  colLegal: string;
  help: string;
  privacy: string;
  terms: string;
  copyright: string;
  stayLocal: string;
  /** <footer> 的 aria-label，理由同 NavCopy.ariaLabel。 */
  ariaLabel: string;
}

export interface HomeCopy {
  eyebrowStrong: string;
  eyebrowRest: string;
  heroTitleLead: string;
  heroTitleAccent: string;
  lead: ReactNode;
  ctaPrimary: string;
  ctaGhost: string;
  trust: string[];
  shotUrl: string;
  shotSticky: string;
  shotSeam: string;

  /** 首页三张插图的替代文本与图注。
   *
   * 图本身**不含任何文字**（见 scripts/gen-site-images.mjs 的说明：八种语言
   * 没法烘焙进一张 PNG），所以 alt 不是"图片的说明"而是图片的**全部**内容——
   * 屏幕阅读器和搜索引擎只能看到它。图注则给看得见图的人补一句它在讲什么。
   *
   * 两者都必须逐语言翻译：alt 漏翻会渲染成英文，页面其余部分是中文。 */
  figures: {
    stitch: { alt: string; caption: string };
    editor: { alt: string; caption: string };
    local: { alt: string; caption: string };
  };

  featuresTitle: string;
  featuresSub: string;
  features: { icon: string; title: string; body: ReactNode }[];

  aboutTitle: string;
  aboutP1: ReactNode;
  aboutP2: ReactNode;

  compareTitle: string;
  compareSub: string;
  compareHead: [string, string, string];
  compareRows: CompareRow[];
  compareNote: ReactNode;

  whyTitle: string;
  whyP1: ReactNode;
  whyP2: ReactNode;

  howTitle: string;
  howSteps: Step[];

  whoTitle: string;
  who: { title: string; body: ReactNode }[];

  installTitle: string;
  installSub: string;
  installBody: ReactNode;
  /** 安装区块里那颗直接跳 Chrome 应用商店的主按钮文案。 */
  installStore: string;
  installMore: string;

  plansTitle: string;
  plansSub: string;
  plans: PlanItem[];
  plansNote: ReactNode;

  faqTitle: string;
  faqSub: ReactNode;
  faq: QaItem[];
}

export interface PricingCopy {
  h1: string;
  intro: string;
  plans: PlanItem[];
  /** ReactNode 而不是 string：价格表下面那句要带一条到 FAQ 的站内链接，
   *  而站内链接必须走 href(locale, …)（见 content/types.ts 的 LinkTarget）。 */
  plansNote: ReactNode;
  tableTitle: string;
  tableSub: string;
  tableHead: [string, string, string];
  tableRows: CompareRow[];
  buyTitle: string;
  buySub: string;
  buySteps: Step[];
  /** 同上：这一句要带一条到支持页的链接。 */
  buyNote: ReactNode;
  billingTitle: string;
  billingFaq: QaItem[];
}

export interface FaqCopy {
  h1: string;
  intro: ReactNode;
  /**
   * `id` 是可选的：只有需要被外部深链到的那一组才写它（目前是 `mcp`——扩展的
   * 设置卡片里「完整说明」那个链接指向 `/faq/#mcp`）。
   *
   * 为什么不做成必填：必填就意味着另外三组也要各编一个没人用的 id，而
   * `tests/dict.test.ts` 的 `shapeDiff` 会因此要求八份字典在同一位置都有它。
   * 可选字段＋只给一组，八份字典的形状仍然一致，也不会长出三个死锚点。
   */
  groups: { id?: string; title: string; items: QaItem[] }[];
  stuckTitle: string;
  stuckBody: string;
  stuckMail: string;
  stuckMore: string;
}

/** 支持页内嵌的反馈表单。
 *
 *  为什么在站内而不是跳外链（2026-10-30 用户要求）：「Support 页面点击
 *  Send Feedback 按钮不要跳转到 …workers.dev/feedback，直接自己做一个提交
 *  页面或者弹出表单，再提交」。接收端是仓库根的 `functions/api/feedback.ts`
 *  （Cloudflare Pages Function），所以表单是同源 POST，`_headers` 的
 *  `form-action` 因此从 'none' 放开到 'self'。
 *
 *  `categories` 的**键**就是提交上来的值，与 handler 的
 *  `FEEDBACK_CATEGORIES` 是同一份契约——多一个或少一个都会被
 *  `tests/feedback-form.test.ts` 抓到（它读 handler 源码比对）。值只有四个，
 *  标签才是各语言自己的。
 *
 *  没有 `required` 之类可本地化的校验文案：`<textarea required>` 的提示由
 *  浏览器用**浏览器语言**弹，站内翻不了，所以不写一句假的「必填」。 */
export interface FeedbackFormCopy {
  title: string;
  sub: string;
  categoryLabel: string;
  categories: { bug: string; feature: string; purchase: string; other: string };
  messageLabel: string;
  messagePlaceholder: string;
  emailLabel: string;
  emailHint: string;
  submit: string;
  note: string;
}

export interface SupportCopy {
  h1: string;
  intro: ReactNode;
  cards: { icon: string; title: string; body: string; cta: string; to: LinkTarget }[];
  /** 内嵌反馈表单。放在三张卡片之后、「报告截图问题」之前——后者八种语言的
   *  正文都以「上面的反馈表单是最快的路径」开头，表单必须在它**上面**。 */
  form: FeedbackFormCopy;
  beforeTitle: string;
  beforeSub: string;
  before: { title: ReactNode; body: ReactNode }[];
  beforeNote: ReactNode;
  /** 自助答案：三段最常见的"其实不用写信"的问题。
   *
   *  为什么单独一段而不是塞进 `before`：`before` 那两张卡讲的是"写信之前
   *  先看一眼"，而这一段是**替代写信**——它们各自要链到别的页面（FAQ、恢复
   *  购买）。把它并进 `before` 会让两种语气混在一起，也会让 grid-2 变成 5 张
   *  卡片。 */
  selfTitle: string;
  selfSub: string;
  self: { title: ReactNode; body: ReactNode }[];
  reportTitle: string;
  reportP1: ReactNode;
  reportP2: string;
  reportList: ReactNode[];
  privacyTitle: string;
  privacyBody: ReactNode;
}

export interface PrivacyCopy {
  h1: string;
  effective: string;
  intro: ReactNode;
  sections: { title: string; body: ReactNode }[];
}

export interface TermsCopy {
  h1: string;
  effective: string;
  intro: string;
  sections: { title: string; body: ReactNode }[];
}

export interface NotFoundCopy {
  title: string;
  body: string;
  cta: string;
}

export interface Dict {
  meta: Record<Page, PageMeta>;
  notFoundMeta: PageMeta;
  nav: NavCopy;
  footer: FooterCopy;
  home: HomeCopy;
  pricing: PricingCopy;
  faq: FaqCopy;
  support: SupportCopy;
  privacy: PrivacyCopy;
  terms: TermsCopy;
  notFound: NotFoundCopy;
}
