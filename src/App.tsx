import type { Dict } from './i18n/dict';
import type { Locale, Page } from './i18n/paths';
import { Footer, Nav } from './components/chrome';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Faq from './pages/Faq';
import Support from './pages/Support';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import en from './i18n/en';
import zhHans from './i18n/zh-Hans';
import zhHant from './i18n/zh-Hant';
import ja from './i18n/ja';
import ko from './i18n/ko';
import es from './i18n/es';
import fr from './i18n/fr';
import de from './i18n/de';

/* 整个站点的骨架：导航 + 正文 + 页脚。
 *
 * 路由是 `switch`，不是 react-router。这个站点每个地址都是一个预渲染好的
 * 真实 HTML（prerender.mjs 逐个生成），浏览器里根本没有「切换路由」这件事；
 * 装一个路由库只会为了一个在预渲染里不会发生的跳转多背一个依赖。
 * 语言同理：语言由地址前缀决定（/ja/…），不是存在某个 state 里。
 *
 * switch 没有 default，靠 Page | 'notFound' 这个联合类型的穷尽性兜底：
 * 往 PAGES 里加一个页面而忘了在这里加分支，TypeScript 会报「不是所有路径
 * 都返回值」，而不是渲染出一个空白页。
 */

/* 八门语言的字典。`Record<Locale, Dict>` 里的 Locale 来自 paths.ts 的
 * LOCALES，所以往那张表里加一门语言而不在这里加字典是编译错误——比在运行时
 * `dictFor` 里拿到 undefined、页面白掉强得多。 */
const DICTS: Record<Locale, Dict> = {
  en,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  ja,
  ko,
  es,
  fr,
  de,
};

export function dictFor(locale: Locale): Dict {
  return DICTS[locale];
}

export function PageBody({
  dict,
  locale,
  page,
}: {
  dict: Dict;
  locale: Locale;
  page: Page | 'notFound';
}) {
  switch (page) {
    case '':
      return <Home dict={dict} locale={locale} />;
    case 'pricing':
      return <Pricing dict={dict} locale={locale} />;
    case 'faq':
      return <Faq dict={dict} locale={locale} />;
    case 'support':
      return <Support dict={dict} locale={locale} />;
    case 'privacy':
      return <Privacy dict={dict} locale={locale} />;
    case 'terms':
      return <Terms dict={dict} locale={locale} />;
    case 'notFound':
      return <NotFound dict={dict} locale={locale} />;
  }
}

export default function App({
  dict,
  locale,
  page,
}: {
  dict: Dict;
  locale: Locale;
  page: Page | 'notFound';
}) {
  return (
    <>
      <Nav dict={dict} locale={locale} page={page} />
      <main>
        <PageBody dict={dict} locale={locale} page={page} />
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
