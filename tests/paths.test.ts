import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_LOCALE,
  LOCALES,
  PAGES,
  alternatePath,
  href,
  isLocale,
  isPage,
  pathFor,
  resolvePath,
} from '../src/i18n/paths';

/* 路由与语言前缀的纯函数。
 *
 * 这一组的重点是**往返**：pathFor 生成的地址必须被 resolvePath 解回同一个
 * (语言, 页面)。站点每个地址都是一个真实文件，两边不一致的结果是链接把人
 * 送到一个 404——而预渲染、导航、hreflang 三处都用这两个函数，任何一处单独
 * 改都会分叉。
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, '..');

describe('LOCALES', () => {
  it('默认语言在表里，且 segment 为空', () => {
    const def = LOCALES.find((l) => l.id === DEFAULT_LOCALE);
    expect(def, `DEFAULT_LOCALE ${DEFAULT_LOCALE} 不在 LOCALES 里`).toBeDefined();
    // 默认语言没有前缀：`/pricing/` 而不是 `/en/pricing/`。x-default 与
    // 所有旧地址都依赖这一点。
    expect(def!.segment).toBe('');
  });

  it('每门语言的 segment 互不相同', () => {
    const segs = LOCALES.map((l) => l.segment);
    expect(new Set(segs).size).toBe(segs.length);
  });

  it('每门语言的 htmlLang 互不相同', () => {
    const langs = LOCALES.map((l) => l.htmlLang);
    expect(new Set(langs).size).toBe(langs.length);
  });

  it('繁体中文的 htmlLang 是 zh-Hant，不是 zh 或 zh-CN', () => {
    const zh = LOCALES.find((l) => l.id === 'zh-Hant');
    expect(zh, '繁体中文这门语言不见了').toBeDefined();
    // 写成 zh 或 zh-CN，浏览器会挑简体字形，繁体字被替换成形近字——
    // 页面上看不出「少了什么」，只是字都变成了简体。
    expect(zh!.htmlLang).toBe('zh-Hant');
    expect(zh!.segment).toBe('zh-tw');
  });

  it('简体中文的 htmlLang 是 zh-Hans，与繁体是两门语言', () => {
    /* 两种中文必须分开。共用一个 segment 的话，hreflang 只能报一个
     * 「中文」，Google 会把两份内容当成同一页的重复版本，而读者点进去
     * 拿到的是繁体（或者反过来）。 */
    const hans = LOCALES.find((l) => l.id === 'zh-Hans');
    expect(hans, '简体中文这门语言不见了').toBeDefined();
    expect(hans!.htmlLang).toBe('zh-Hans');
    expect(hans!.segment).toBe('zh-cn');
    expect(hans!.segment).not.toBe(LOCALES.find((l) => l.id === 'zh-Hant')!.segment);
  });

  it('八门语言与扩展本体的语言集一致', () => {
    /* 官网与扩展本体说同样的话。数目对不上就是有一边漏了一门语言，
     * 而「少一门语言」在页面上完全看不出来——只是那一门语言的读者
     * 被挡在门外。 */
    expect(LOCALES.length).toBe(8);
    expect(LOCALES.map((l) => l.htmlLang)).toEqual([
      'en',
      'zh-Hans',
      'zh-Hant',
      'ja',
      'ko',
      'es',
      'fr',
      'de',
    ]);
  });
});

describe('pathFor', () => {
  it('默认语言不带前缀', () => {
    expect(pathFor('en', '')).toBe('/');
    expect(pathFor('en', 'pricing')).toBe('/pricing/');
  });

  it('繁体中文带 /zh-tw/ 前缀', () => {
    expect(pathFor('zh-Hant', '')).toBe('/zh-tw/');
    expect(pathFor('zh-Hant', 'pricing')).toBe('/zh-tw/pricing/');
  });

  it('简体中文带 /zh-cn/ 前缀', () => {
    expect(pathFor('zh-Hans', '')).toBe('/zh-cn/');
    expect(pathFor('zh-Hans', 'pricing')).toBe('/zh-cn/pricing/');
  });

  it('其余语言各带自己的前缀', () => {
    expect(pathFor('ja', '')).toBe('/ja/');
    expect(pathFor('ko', 'faq')).toBe('/ko/faq/');
    expect(pathFor('es', '')).toBe('/es/');
    expect(pathFor('fr', '')).toBe('/fr/');
    expect(pathFor('de', '')).toBe('/de/');
  });

  it('每个页面都带尾斜杠', () => {
    // Cloudflare Pages 把 /pricing 308 到 /pricing/。canonical 若写成不带
    // 斜杠的那份，每个页面都会声明一个会重定向的地址。
    for (const l of LOCALES) {
      for (const p of PAGES) {
        const path = pathFor(l.id, p);
        expect(path.endsWith('/'), `${path} 没有尾斜杠`).toBe(true);
      }
    }
  });
});

describe('resolvePath', () => {
  it('pathFor 的产物能解回原来的 (语言, 页面)', () => {
    for (const l of LOCALES) {
      for (const p of PAGES) {
        expect(resolvePath(pathFor(l.id, p))).toEqual({ locale: l.id, page: p });
      }
    }
  });

  it('不带尾斜杠也认', () => {
    expect(resolvePath('/pricing')).toEqual({ locale: 'en', page: 'pricing' });
    expect(resolvePath('/zh-tw/pricing')).toEqual({ locale: 'zh-Hant', page: 'pricing' });
    expect(resolvePath('/zh-cn/pricing')).toEqual({ locale: 'zh-Hans', page: 'pricing' });
    expect(resolvePath('/ja/faq')).toEqual({ locale: 'ja', page: 'faq' });
  });

  it('带 index.html 也认', () => {
    // 用户手打地址、旧书签、爬虫三者给的形状并不一致。
    expect(resolvePath('/pricing/index.html')).toEqual({ locale: 'en', page: 'pricing' });
    expect(resolvePath('/zh-tw/index.html')).toEqual({ locale: 'zh-Hant', page: '' });
    expect(resolvePath('/de/index.html')).toEqual({ locale: 'de', page: '' });
  });

  it('忽略查询串与锚点', () => {
    expect(resolvePath('/pricing/?a=1#plans')).toEqual({ locale: 'en', page: 'pricing' });
    expect(resolvePath('/zh-tw/#faq')).toEqual({ locale: 'zh-Hant', page: '' });
  });

  it('未知路径是 notFound，且保留语言前缀', () => {
    // 保留语言是刻意的：/zh-tw/nope 的 404 页应该还说繁体中文。
    expect(resolvePath('/nope')).toEqual({ locale: 'en', page: 'notFound' });
    expect(resolvePath('/zh-tw/nope')).toEqual({ locale: 'zh-Hant', page: 'notFound' });
    expect(resolvePath('/ko/nope')).toEqual({ locale: 'ko', page: 'notFound' });
  });

  it('多一层路径是 notFound，不静默降级成首页', () => {
    // 静默降级会让 /zh/pricing/extra 变成 200 的首页——一个软 404。
    expect(resolvePath('/pricing/extra')).toEqual({ locale: 'en', page: 'notFound' });
  });
});

describe('href', () => {
  it('同页锚点原样返回', () => {
    expect(href('zh-Hant', '#install')).toBe('#install');
  });

  it('跨页锚点补语言前缀，锚点保留', () => {
    /* `'/#install'` 与 `'#install'` 必须走两条不同的路，这是价格页那个按钮
     * 唯一能真的跳过去的方式（价格页没有 install 区块）。反过来写错——把
     * `'#install'` 也补前缀——会让首页那个按钮把读者送去 `/zh-cn/#install`，
     * 即离开当前页再回到首页，多一次整页加载。 */
    expect(href('en', '/#install')).toBe('/#install');
    expect(href('zh-Hant', '/#install')).toBe('/zh-tw/#install');
    expect(href('zh-Hans', '/#install')).toBe('/zh-cn/#install');
    // 同页锚点不受影响：它**不能**变成 `/zh-tw/#install`
    expect(href('zh-Hant', '#install')).toBe('#install');
  });

  it('跨页锚点的页面部分同样要认', () => {
    expect(href('ja', '/pricing#compare')).toBe('/ja/pricing/#compare');
    expect(() => href('en', '/nope#x')).toThrow(/未知页面/);
  });

  it('外部地址原样返回', () => {
    expect(href('en', 'mailto:a@b.c')).toBe('mailto:a@b.c');
    expect(href('en', 'https://example.com')).toBe('https://example.com');
    /* 八门语言下都必须原样返回。补前缀会把安装按钮送到
     * `/zh-tw/https://chromewebstore.google.com/…`，那是本站的一个 404 页，
     * 而按钮看起来完全正常——上架后全站每一颗安装按钮都走这条路径。 */
    const store = 'https://chromewebstore.google.com/detail/page-screenshot-pro/bjmglonhfpengikcjhcajojcdadggjkb';
    for (const l of LOCALES) expect(href(l.id, store), `${l.id} 给商店地址加了前缀`).toBe(store);
  });

  it('页面 id 按当前语言补前缀', () => {
    expect(href('en', 'pricing')).toBe('/pricing/');
    expect(href('zh-Hant', 'pricing')).toBe('/zh-tw/pricing/');
    expect(href('ja', 'pricing')).toBe('/ja/pricing/');
  });

  it('带斜杠的页面 id 也认', () => {
    expect(href('zh-Hant', '/faq/')).toBe('/zh-tw/faq/');
  });

  it('未知目标抛错，而不是渲染出一个坏链接', () => {
    expect(() => href('en', 'nope')).toThrow(/未知页面/);
  });
});

describe('alternatePath', () => {
  it('切语言留在同一页', () => {
    expect(alternatePath('faq', 'zh-Hant')).toBe('/zh-tw/faq/');
    expect(alternatePath('faq', 'en')).toBe('/faq/');
    expect(alternatePath('faq', 'ja')).toBe('/ja/faq/');
  });

  it('404 切语言回首页', () => {
    // 404 没有对应页面，指回另一门语言的首页比指回它自己的 404 有用。
    expect(alternatePath('notFound', 'zh-Hant')).toBe('/zh-tw/');
  });
});

describe('isLocale / isPage', () => {
  it('只认表里的值', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('zh-Hant')).toBe(true);
    expect(isLocale('zh-Hans')).toBe(true);
    expect(isLocale('zh-CN')).toBe(false);
    expect(isPage('pricing')).toBe(true);
    expect(isPage('pricing/')).toBe(false);
  });
});

describe('prerender.mjs 里的路由清单与 paths.ts 一致', () => {
  /* prerender.mjs 是 .mjs，在 Node 里跑，不 import paths.ts（那要靠 Vite 才能
   * 转译）。所以它自己抄了一份 PAGES / LOCALES。抄两份的风险是：加了一个页面
   * 而只改了其中一处——那不会报错，只会少生成一个 HTML（或生成一个没人链的
   * 空目录）。这个用例就是那条链接。
   */
  const src = readFileSync(join(SITE, 'scripts', 'prerender.mjs'), 'utf8');

  it('PAGES 相同', () => {
    const m = src.match(/const PAGES = \[([^\]]*)\]/);
    expect(m, 'prerender.mjs 里找不到 PAGES 定义').not.toBeNull();
    const list = [...m![1].matchAll(/'([^']*)'/g)].map((x) => x[1]);
    expect(list).toEqual([...PAGES]);
  });

  it('语言与 segment 相同', () => {
    const m = src.match(/const LOCALES = \[([\s\S]*?)\];/);
    expect(m, 'prerender.mjs 里找不到 LOCALES 定义').not.toBeNull();
    const body = m![1];
    for (const l of LOCALES) {
      expect(body.includes(`id: '${l.id}'`), `prerender.mjs 里没有 ${l.id}`).toBe(true);
      expect(body.includes(`segment: '${l.segment}'`), `prerender.mjs 里 ${l.id} 的 segment 不对`).toBe(
        true,
      );
    }
  });

  it('两边列出的语言集合完全相同（多列一门也算错）', () => {
    /* 上面那条只从 paths.ts 出发查「都在」，所以 prerender.mjs 多出一门语言
     * 查不出来——而多出来那一门会**真的**生成一整套目录：`/ja/…` 六个 HTML，
     * 没有任何导航链到它，hreflang 也不列它。它们是可访问的重复页面，而站点
     * 看起来一切正常。反向比对一下，代价只有一行。 */
    const m = src.match(/const LOCALES = \[([\s\S]*?)\];/);
    const ids = [...m![1].matchAll(/id: '([^']*)'/g)].map((x) => x[1]);
    expect(ids.sort()).toEqual(LOCALES.map((l) => l.id).sort());
  });

  it('prerender.mjs 没有自己再存一份 lang', () => {
    /* 这个文件曾经有 `lang: 'zh-Hant'`，而它**从头到尾没有被读过**：写进
     * <html lang> 的是 entry-server.tsx 的 renderRoute().lang。实测：把这里
     * 改成 'zh' 再构建，dist/zh/index.html 仍然是 lang="zh-Hant"——一个改了
     * 等于没改的字段，比没有更糟，因为它让人以为改到了。
     *
     * 现在真源是 paths.ts 的 LOCALES[].htmlLang（head.ts 的 hreflang 也读它），
     * 所以这里连字段都不该有。 */
    const m = src.match(/const LOCALES = \[([\s\S]*?)\];/);
    expect(m![1], 'prerender.mjs 又存了一份 lang').not.toMatch(/\blang\s*:/);
  });
});

describe('site-e2e.mjs 里的路由清单与 paths.ts 一致', () => {
  /* 这个脚本要真浏览器，跑不进单测，所以它那份 LOCALES 曾经没有任何东西
   * 钉住——脚本里自己写着「少一条的后果是那条路由没人检查，而脚本照样全绿」。
   *
   * 那份清单的写法是 `{ id, segment, htmlLang }` 三件套，所以这里连 htmlLang
   * 也一起比对：脚本断言的是 `live.html.lang !== r.htmlLang`，若它自己那列
   * 写错（比如把简中也写成 zh-Hant），八条路由会以「线上 lang 不对」的名义
   * 变红——而真正错的是检查脚本。 */
  const e2e = readFileSync(join(SITE, 'scripts', 'site-e2e.mjs'), 'utf8');

  it('语言、segment、htmlLang 三项都相同', () => {
    const m = e2e.match(/const LOCALES = \[([\s\S]*?)\];/);
    expect(m, 'site-e2e.mjs 里找不到 LOCALES 定义').not.toBeNull();
    const body = m![1];
    for (const l of LOCALES) {
      expect(body.includes(`id: '${l.id}'`), `site-e2e.mjs 里没有 ${l.id}`).toBe(true);
      expect(
        body.includes(`segment: '${l.segment}'`),
        `site-e2e.mjs 里 ${l.id} 的 segment 不对`,
      ).toBe(true);
      expect(
        body.includes(`htmlLang: '${l.htmlLang}'`),
        `site-e2e.mjs 里 ${l.id} 的 htmlLang 不对`,
      ).toBe(true);
    }
  });

  it('两边列出的语言集合完全相同（多列一门也算错）', () => {
    // 多出来的那门会去请求一个不存在的地址，整条路由报红——噪音，不是发现。
    const m = e2e.match(/const LOCALES = \[([\s\S]*?)\];/);
    const ids = [...m![1].matchAll(/id: '([^']*)'/g)].map((x) => x[1]);
    expect(ids.sort()).toEqual(LOCALES.map((l) => l.id).sort());
  });
});
