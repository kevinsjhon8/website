import type { Dict } from '../i18n/dict';
import { href, pathFor, type Locale, type Page } from '../i18n/paths';
import { languageLinks } from '../seo/head';
import { CHROME_STORE_URL } from '../content/site';

/* 顶部导航与语言切换。
 *
 * 语言切换是**链接**，不是按钮：站点是预渲染的，每个语言每个页面都是一个
 * 真实 HTML，切语言就是跳到那个地址。用 <button> + history.pushState 的
 * 话，预渲染出来的 HTML 就浪费了，而且爬虫看到的永远是初始语言。
 *
 * 两门语言时是直接并排的链接，八门语言时改成 <details> 折叠菜单——这个切换
 * 是本次扩容强制触发的，不是审美选择：八条语言名横排在 720px 以下会把导航
 * 挤成一团，而 `display: none` 掉导航链接的移动端断点管不到它们。
 *
 * 用 <details>/<summary> 而不是带状态的 <div>，是为了**没有 JS 也能展开**：
 * 全站的 FAQ 用原生 <details>、导航和切换器用原生 <a>，正是这条原则。用
 * React state 的话，脚本没跑起来时语言菜单就是一个点不动的装饰。
 */

export function Nav({ dict, locale, page }: { dict: Dict; locale: Locale; page: Page | 'notFound' }) {
  const links = languageLinks(locale, page);
  const current = links.find((l) => l.current)!;
  const home = pathFor(locale, '');

  return (
    <nav className="nav" aria-label={dict.nav.ariaLabel}>
      <div className="wrap nav-inner">
        <a className="brand" href={home}>
          <img src="/favicon48.png" alt="" width="24" height="24" />
          <span>Page Screenshot Pro</span>
        </a>
        <div className="nav-links">
          <a href={`${home}#features`}>{dict.nav.features}</a>
          <a href={href(locale, 'pricing')}>{dict.nav.pricing}</a>
          <a href={href(locale, 'faq')}>{dict.nav.faq}</a>
          <a href={href(locale, 'support')}>{dict.nav.support}</a>
          {/* 语言切换放在 CTA 左边。每个链接带 lang 属性，让浏览器按目标语言
              选字体——繁体字在简体字体族里会被替换成形近的简体字形，反过来
              也一样，而页面上看不出「少了什么」。 */}
          <details className="lang-menu">
            <summary title={dict.nav.langLabel} aria-label={dict.nav.langLabel} lang={current.id}>
              <span aria-hidden="true">🌐</span>
              <span>{current.label}</span>
            </summary>
            <div className="lang-menu-list">
              {links.map((l) => (
                <a
                  key={l.id}
                  href={l.href}
                  hrefLang={l.id}
                  lang={l.id}
                  aria-current={l.current ? 'page' : undefined}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </details>
          <a className="btn btn-primary btn-sm" href={CHROME_STORE_URL}>
            {dict.nav.cta}
          </a>
        </div>
      </div>
    </nav>
  );
}

export function Footer({ dict, locale }: { dict: Dict; locale: Locale }) {
  return (
    <footer className="footer" aria-label={dict.footer.ariaLabel}>
      <div className="wrap">
        <div className="footer-inner">
          <div className="footer-brand">
            <a className="brand" href={pathFor(locale, '')}>
              <img src="/favicon48.png" alt="" width="24" height="24" />
              <span>Page Screenshot Pro</span>
            </a>
            <p>{dict.footer.tagline}</p>
          </div>
          <div className="footer-cols">
            <div>
              <h2>{dict.footer.colProduct}</h2>
              <a href={`${pathFor(locale, '')}#features`}>{dict.nav.features}</a>
              <a href={href(locale, 'pricing')}>{dict.nav.pricing}</a>
              <a href={href(locale, 'faq')}>{dict.nav.faq}</a>
            </div>
            <div>
              <h2>{dict.footer.colSupport}</h2>
              <a href={href(locale, 'support')}>{dict.footer.help}</a>
            </div>
            <div>
              <h2>{dict.footer.colLegal}</h2>
              <a href={href(locale, 'privacy')}>{dict.footer.privacy}</a>
              <a href={href(locale, 'terms')}>{dict.footer.terms}</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{dict.footer.copyright}</span>
          <span>{dict.footer.stayLocal}</span>
        </div>
      </div>
    </footer>
  );
}
