/* 站点语言与路由的纯函数。
 *
 * 刻意不 import 任何 messages：这个文件要能被 Node（prerender.mjs 走 esbuild
 * 编译后的 SSR bundle）和单测直接引用，而 messages 是 .tsx（正文里有 JSX）。
 *
 * 路由形状：每个页面输出 `dist/<page>/index.html`，非默认语言带前缀。
 *   en       → `/` `/pricing/` `/faq/` …
 *   zh-Hant  → `/zh-tw/` `/zh-tw/pricing/` …
 * 全部带尾斜杠，canonical、hreflang、站内链接都用同一个形状——Cloudflare Pages
 * 把 `/pricing` 308 到 `/pricing/`（目录索引），canonical 若写成不带斜杠的那份，
 * 每个页面都会声明一个会重定向的地址。
 *
 * 八门语言与扩展本体（public/_locales/）是同一套：en / zh_CN / zh_TW / ja /
 * ko / es / fr / de。两处 id 的拼法不同是有意的——站点这边 id 就是 htmlLang
 * （BCP 47），因为 head.ts 的 hreflang、entry-server 的 <html lang> 都直接读它；
 * 扩展那边是 chrome.i18n 的目录名（下划线），只能照抄。
 *
 * 两种中文**必须**分成两个 segment。`zh` 单独一个前缀是有歧义的（BCP 47 的
 * `zh` 未指定字形），而且两门语言共用前缀就等于只能有一门。`zh-tw`/`zh-cn`
 * 是读者一眼能认出的写法，也正好与 hreflang 的 zh-Hant/zh-Hans 对应。
 */

export const LOCALES = [
  { id: 'en', segment: '', htmlLang: 'en', name: 'English', switchLabel: 'English' },
  { id: 'zh-Hans', segment: 'zh-cn', htmlLang: 'zh-Hans', name: '简体中文', switchLabel: '简体中文' },
  { id: 'zh-Hant', segment: 'zh-tw', htmlLang: 'zh-Hant', name: '繁體中文', switchLabel: '繁體中文' },
  { id: 'ja', segment: 'ja', htmlLang: 'ja', name: '日本語', switchLabel: '日本語' },
  { id: 'ko', segment: 'ko', htmlLang: 'ko', name: '한국어', switchLabel: '한국어' },
  { id: 'es', segment: 'es', htmlLang: 'es', name: 'Español', switchLabel: 'Español' },
  { id: 'fr', segment: 'fr', htmlLang: 'fr', name: 'Français', switchLabel: 'Français' },
  { id: 'de', segment: 'de', htmlLang: 'de', name: 'Deutsch', switchLabel: 'Deutsch' },
] as const;

export type Locale = (typeof LOCALES)[number]['id'];

/** 站点根下的页面。'' 是首页。顺序也是 prerender 与 sitemap 的输出顺序。 */
export const PAGES = ['', 'pricing', 'faq', 'support', 'privacy', 'terms'] as const;

export type Page = (typeof PAGES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(v: string): v is Locale {
  return LOCALES.some((l) => l.id === v);
}

export function isPage(v: string): v is Page {
  return (PAGES as readonly string[]).includes(v);
}

/** 某语言下某页面的站内绝对路径。`''` 是首页。 */
export function pathFor(locale: Locale, page: Page): string {
  const seg = LOCALES.find((l) => l.id === locale)!.segment;
  if (!seg) return page ? `/${page}/` : '/';
  return page ? `/${seg}/${page}/` : `/${seg}/`;
}

/** 站内链接。
 *
 *  三种站内形状，区别是**有没有页面部分**，而这一区别是必须的：
 *   `'#install'`   同页锚点，原样返回（在哪个页面都指向该页面自己的 install 区块）
 *   `'/#install'`  首页的 install 区块 —— 带页面部分，按当前语言补前缀
 *   `'pricing'`    整页
 *
 * 外加一条出口：`mailto:` 与 `http(s)://` 开头的目标**原样返回**，不补前缀。
 * 2026-10-31 上架后，全站的安装按钮直指 Chrome 应用商店详情页——商店页自己
 * 按浏览器语言跳转，站点这边没有"中文版商店页"这种东西，补一个 `/zh-cn/`
 * 前缀只会得到 404。
 *
 * 为什么要有第二种：`LinkTarget` 存的是「跳哪儿」，而价格页**没有** install
 * 区块（它只有 #compare / #how-to-buy / #billing）。价格页 Free 套餐卡的按钮
 * 原本写 `'#install'`，同页锚点原样返回，于是在 `/pricing/` 上它既不安装也不
 * 跳转——点了没有任何反应，而 `hrefsIn` 只查以 `/` 开头的 href，看不见它。
 * 现在那个按钮写 `'/#install'`，真的会走到首页的安装区块。
 *
 * 首字符判据（`#` vs 其余）而不是 `indexOf('#') >= 0`：同页锚点必须原样返回，
 * 否则 `'#install'` 会变成 `/zh-cn/#install`，在**任意**页面点它都会离开当前页
 * 回到首页——包括本来就站在首页的时候。 */
export function href(locale: Locale, target: string): string {
  if (target.startsWith('mailto:') || target.startsWith('http')) return target;
  if (target.startsWith('#')) return target;
  const hash = target.indexOf('#');
  const anchor = hash < 0 ? '' : target.slice(hash);
  const raw = hash < 0 ? target : target.slice(0, hash);
  const page = raw === '' ? '' : raw.replace(/^\/+|\/+$/g, '');
  if (!isPage(page)) throw new Error(`未知页面：${target}`);
  return pathFor(locale, page) + anchor;
}

export interface Resolved {
  locale: Locale;
  page: Page | 'notFound';
}

/**
 * 把浏览器给的 pathname 解成 (语言, 页面)。
 *
 * 带不带尾斜杠、带不带 index.html 都要认——prerender 生成的是目录索引，
 * 而用户手打地址、旧书签、爬虫三者给的形状并不一致。
 */
export function resolvePath(rawPath: string): Resolved {
  const path = rawPath.split('#')[0].split('?')[0];
  const parts = path.split('/').filter(Boolean);
  if (parts[parts.length - 1] === 'index.html') parts.pop();

  const first = parts[0];
  const hit = LOCALES.find((l) => l.segment && l.segment === first);
  const locale: Locale = hit ? hit.id : DEFAULT_LOCALE;
  const rest = hit ? parts.slice(1) : parts;

  if (rest.length === 0) return { locale, page: '' };
  if (rest.length > 1) return { locale, page: 'notFound' };
  return { locale, page: isPage(rest[0]) ? rest[0] : 'notFound' };
}

/** 语言切换器里另一门语言的地址：同一页面，换语言。
 *
 *  只收 target，不收当前语言：结果完全由目标语言和目标页面决定，多收一个
 *  当前语言只会让人以为「从哪来」会影响结果。 */
export function alternatePath(page: Page | 'notFound', target: Locale): string {
  return page === 'notFound' ? pathFor(target, '') : pathFor(target, page);
}
