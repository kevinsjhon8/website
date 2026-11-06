import { describe, expect, it } from 'vitest';
import { isValidElement, type ReactNode } from 'react';
import en from '../src/i18n/en';
import zhHans from '../src/i18n/zh-Hans';
import zhHant from '../src/i18n/zh-Hant';
import ja from '../src/i18n/ja';
import ko from '../src/i18n/ko';
import es from '../src/i18n/es';
import fr from '../src/i18n/fr';
import de from '../src/i18n/de';
import { LOCALES, PAGES, pathFor, type Locale, type Page } from '../src/i18n/paths';
import { renderRoute } from '../src/entry-server';
import { displayWidth } from '../src/seo/text-width';

/* 八份字典的**形状**必须一样。
 *
 * TypeScript 已经保证了键名与字段类型（八份都标注成 Dict），但它数不了数组
 * 的长度：en 的 FAQ 有 13 条、繁中只写了 12 条，编译照样通过——页面上少一条
 * 问答，而没有任何东西会红。这个仓库里 i18n 的旧伤正是这一类：缺的那条渲染成
 * 空白，看起来像「这一题本来就不存在」。
 *
 * 所以这里递归走所有字典，比对每一层的键集合与每个数组的长度。ReactNode
 * 字段不比对文本（各语言本来就不该相同），只比对「这里是不是一块内容」。
 */

/** 八门语言的字典表。键是 LOCALES 里的 id，改了 paths.ts 这里会编译不过。 */
const DICTS = {
  en,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  ja,
  ko,
  es,
  fr,
  de,
} as const;

/** 递归比较两份值的形状，返回第一个不一致处的路径。 */
function shapeDiff(a: unknown, b: unknown, path: string): string | null {
  // React 元素是**叶子**：它的 props 里混着 _owner/_store 这类内部字段，
  // 两份字典各自渲染一遍，那些字段天然不同，走进去只会得到满屏假差异。
  // 元素本身只要有内容就够了，文案由下面「不是同一份」那条另外把关。
  if (isValidElement(a) || isValidElement(b)) {
    const empty = (v: unknown) => v === undefined || v === null || v === '';
    if (empty(a) || empty(b)) return `${path}: 有一边没有元素`;
    return null;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return `${path}: 一边是数组、一边不是`;
    if (a.length !== b.length) return `${path}: 两边长度不同（${a.length} vs ${b.length}）`;
    for (let i = 0; i < a.length; i++) {
      const d = shapeDiff(a[i], b[i], `${path}[${i}]`);
      if (d) return d;
    }
    return null;
  }

  if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    const onlyA = ka.filter((k) => !kb.includes(k));
    const onlyB = kb.filter((k) => !ka.includes(k));
    if (onlyA.length) return `${path}: 缺字段 ${onlyA.join(', ')}`;
    if (onlyB.length) return `${path}: 多出字段 ${onlyB.join(', ')}`;
    for (const k of ka) {
      const d = shapeDiff((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}.${k}`);
      if (d) return d;
    }
    return null;
  }

  // ReactNode：只要求「两边都有内容」。空字符串与 undefined 都算漏写。
  const empty = (v: unknown) => v === undefined || v === null || v === '';
  if (empty(a) || empty(b)) return `${path}: 有一边是空的`;
  return null;
}

function allStrings(node: unknown, out: string[] = []): string[] {
  if (node === null || node === undefined) return out;
  if (typeof node === 'string') {
    out.push(node);
    return out;
  }
  if (Array.isArray(node)) {
    for (const c of node) allStrings(c, out);
    return out;
  }
  if (isValidElement(node)) {
    const props = (node as { props: { children?: ReactNode; href?: string } }).props;
    allStrings(props.children, out);
    return out;
  }
  if (typeof node === 'object') {
    for (const v of Object.values(node)) allStrings(v, out);
  }
  return out;
}

describe('八份字典形状一致', () => {
  it('每门语言与 en 都没有结构性差异', () => {
    /* 逐门比对，不是一趟。少写一门语言是这个扩容最容易犯的错，而且
     * 它在页面上完全看不出来——那门语言根本不会被渲染，所以「页面正常」
     * 不构成任何证据。 */
    for (const l of LOCALES) {
      if (l.id === 'en') continue;
      const diff = shapeDiff(en, DICTS[l.id], `dict`);
      expect(diff, `${l.id} 与 en 的形状不一致：${diff}`).toBeNull();
    }
  });

  it('LOCALES 里的每门语言都有一份字典', () => {
    // 少一份 → dictFor 返回 undefined → 那一门语言的页面整页空白。
    expect(Object.keys(DICTS).sort()).toEqual(LOCALES.map((l) => l.id).sort());
  });

  it('每个页面都有 meta', () => {
    for (const l of LOCALES) {
      for (const page of PAGES) {
        expect(DICTS[l.id].meta[page]?.title, `${l.id} 缺 ${page || '(home)'} 的 title`).toBeTruthy();
        expect(DICTS[l.id].meta[page]?.description, `${l.id} 缺 ${page || '(home)'} 的 description`).toBeTruthy();
      }
    }
  });

  it('FAQ 页的问答条数与首页摘录都不为空', () => {
    // 数量比对由上面那条递归覆盖；这里断言「至少有一条」是防所有字典同时被
    // 改成空数组——那种情况下 shapeDiff 会认为两边一致。
    for (const l of LOCALES) {
      const count = DICTS[l.id].faq.groups.reduce((n, g) => n + g.items.length, 0);
      expect(count, `${l.id} 的 FAQ 是空的`).toBeGreaterThan(10);
      expect(DICTS[l.id].home.faq.length, `${l.id} 的首页问答摘录是空的`).toBeGreaterThanOrEqual(5);
    }
  });

  /* FAQ 里唯一带 `id` 的那一组，是**扩展**设置页「完整说明」链接的落点。
   *
   * `shapeDiff` 只比键的**存在性**，所以把某门语言的 `id: 'mcp'` 写成
   * `id: 'mcpp'` 它是绿的：键还在，类型也对，只是那个人点过来会停在页首。
   * 扩展侧 `tests/site-links.test.ts` 钉的是**地址里的后缀**，站点侧没有任何
   * 东西钉**这个 id 的值**——两边各写一份、对不上时一处都不红，正是这个仓库
   * 反复记的"两个真源"形状。这条就是站点这一半。
   *
   * 同时断言「只有一组带 id」：多出来的 id 是无主的锚点，将来有人手滑把
   * 另一组也写上 id，链接就可能在两个分组间漂，而没有任何检查会红。 */
  it('FAQ 有且只有一个 id 为 mcp 的分组（扩展的「完整说明」链接落点）', () => {
    for (const l of LOCALES) {
      const groups = DICTS[l.id].faq.groups;
      const withId = groups.filter((g) => typeof g.id === 'string');
      expect(withId.length, `${l.id} 带 id 的 FAQ 分组应当恰好 1 个，实际 ${withId.length} 个`).toBe(1);
      expect(withId[0].id, `${l.id} 的 FAQ 分组 id 不对`).toBe('mcp');
    }
  });
});

describe('繁体中文确实是繁体中文', () => {
  /* 这一组的目的是抓「把简体文案原样复制过来」。
   *
   * 判据不是「含繁体字」（简体文案里也有繁简同形的字），而是**不得含只在
   * 简体里出现的字**。下面这张表是几个高频、且在正常繁体文案里不会出现的
   * 简体专用字；它们在本项目文案里各自都有对应用法（设/扩/滚/导/档/页…）。
   */
  const SIMPLIFIED_ONLY = ['设', '扩', '滚', '导', '档', '页', '题', '换', '删', '订', '权', '费', '击', '载', '历'];

  it('文案里没有简体专用字', () => {
    // 只看「内容」字段：meta 的 title/description 是给搜索结果的，同样是
    // 面向繁体用户，一样不该出现简体字。
    const texts = allStrings(zhHant).join('\n');
    const hits = SIMPLIFIED_ONLY.filter((ch) => texts.includes(ch));
    expect(hits, `繁体字典里出现了简体字：${hits.join(' ')}`).toEqual([]);
  });

  it('繁体与英文的正文不是同一份', () => {
    // 防的是「复制了 en.tsx 只改了几处」。取一个足够长的字段比一比。
    const zhLead = allStrings(zhHant.home.lead).join('');
    const enLead = allStrings(en.home.lead).join('');
    expect(zhLead).not.toBe(enLead);
    expect(zhLead.length).toBeGreaterThan(20);
  });
});

describe('简体中文确实是简体中文', () => {
  /* 繁中那份的检查是「不得含简体专用字」；这份反过来。繁体专用字里挑几个
   * 高频的（擴/設/檔/捲/匯/權/費/預/譯），它们在正常简体文案里不会出現。
   *
   * 方向反了会怎样：一份其实是繁体的「简中」字典，页面照样渲染、编译照样
   * 通过，只是简体读者看到的是繁体字——而浏览器会挑简体字形去显示繁体
   * 码位，于是那字看着像简体的错字。 */
  const TRADITIONAL_ONLY = ['擴', '設', '檔', '捲', '匯', '權', '費', '預', '譯', '攝', '與', '說'];

  it('文案里没有繁体专用字', () => {
    const texts = allStrings(zhHans).join('\n');
    const hits = TRADITIONAL_ONLY.filter((ch) => texts.includes(ch));
    expect(hits, `简体字典里出现了繁体字：${hits.join(' ')}`).toEqual([]);
  });

  it('简体与繁体的正文不是同一份', () => {
    const hansLead = allStrings(zhHans.home.lead).join('');
    const hantLead = allStrings(zhHant.home.lead).join('');
    expect(hansLead).not.toBe(hantLead);
    expect(hansLead.length).toBeGreaterThan(20);
  });
});

describe('每门语言都不是照抄英文', () => {
  it('首页正文与英文不同', () => {
    /* 防的是「复制了 en.tsx 只改了几处」。逐门取一个足够长的字段比一比。 */
    const enLead = allStrings(en.home.lead).join('');
    for (const l of LOCALES) {
      if (l.id === 'en') continue;
      const lead = allStrings(DICTS[l.id].home.lead).join('');
      expect(lead, `${l.id} 的首页正文与英文相同`).not.toBe(enLead);
      expect(lead.length, `${l.id} 的首页正文太短`).toBeGreaterThan(20);
    }
  });

  it('每门语言的 meta 标题都与英文不同', () => {
    /* meta 恰好是唯一一处「有内容但可以是英文」的地方：复制过来编译通过、
     * 页面本地化、搜索结果英文。 */
    for (const l of LOCALES) {
      if (l.id === 'en') continue;
      for (const page of PAGES) {
        expect(DICTS[l.id].meta[page].title, `${l.id}/${page} 的 title 与英文相同`).not.toBe(
          en.meta[page].title,
        );
      }
    }
  });
});

describe('字典里的站内链接', () => {
  /* 正文里的站内链接必须走 pathFor()，不能写字面量 `/pricing/`。
   * 字面量在英文下今天是对的，但繁中那份若照抄就会把人留在英文站；
   * 而且哪天默认语言也加了前缀，字面量会全站失效。
   *
   * 检查方式：把两份字典渲染成文本后，抓 href，凡是以 `/` 开头且不像资源
   * 路径的，必须等于某个 pathFor() 的产物。
   */
  function hrefsIn(node: unknown, out: string[] = []): string[] {
    if (node === null || node === undefined) return out;
    if (Array.isArray(node)) {
      for (const c of node) hrefsIn(c, out);
      return out;
    }
    if (isValidElement(node)) {
      const props = (node as { props: { children?: ReactNode; href?: string } }).props;
      if (typeof props.href === 'string') out.push(props.href);
      hrefsIn(props.children, out);
      return out;
    }
    if (typeof node === 'object') {
      for (const v of Object.values(node)) hrefsIn(v, out);
    }
    return out;
  }

  it('正文里的站内链接都是已知页面', () => {
    /* 判据是**按该字典自己的语言**比对，不是「等于任何一个 pathFor 产物」。
     *
     * 这一条是被变异测出来的：把 zh-Hant 的 `P('pricing')` 改写成字面量
     * `/pricing/`，旧版本照样全绿——因为 `/pricing/` 确实是 pathFor('en',
     * 'pricing') 的产物，集合里有它。可那正是这条检查要拦的东西：繁体读者
     * 点「價格頁」会被送到英文站。所以允许集合按语言分开，繁中字典只认
     * `/zh/...`。 */
    const allowedFor = (locale: (typeof LOCALES)[number]['id']) =>
      new Set(PAGES.map((p) => pathFor(locale, p)));

    for (const l of LOCALES) {
      const allowed = allowedFor(l.id);
      const bad = hrefsIn(DICTS[l.id]).filter((h) => h.startsWith('/') && !allowed.has(h));
      expect(bad, `${l.id} 里有拼错的站内链接：${bad.join(' ')}`).toEqual([]);
    }
  });
});

describe('标题的显示宽度', () => {
  /* 度量见 src/seo/text-width.ts，与下面的断言共用同一份——两个测试各写一份
   * 宽度函数就是这个仓库在 prices.test.ts 记下的「两个真源」教训。
   *
   * 为什么要有这一组：子页标题原来一律是 `{页面名词} — Page Screenshot Pro`，
   * 前半是导航标签、后半是品牌名，中间没有一个描述性词。搜索结果里那 25~38 格
   * 全在重复用户已经知道的两件事（他点的是 FAQ，站点叫什么）。而同一门语言的
   * 六个页面标题彼此只差一个名词，`site:域名` 并排出现时像同一个页面。
   *
   * 阈值 40~60 是**估算**：Google 的文档只说"按设备宽度截断"，不给字符数，
   * 这两个数字来自「桌面端标题行约 600px」的经验换算。它们在这里的作用是
   * 卡住两个极端——短到没有任何描述，或长到一定被截断。 */
  const CONTENT_PAGES = ['pricing', 'faq', 'support', 'privacy', 'terms'] as const;

  it('每个子页的标题显示宽度在 40~60 之间', () => {
    for (const l of LOCALES) {
      for (const page of CONTENT_PAGES) {
        const title = DICTS[l.id].meta[page].title;
        const w = displayWidth(title);
        expect(w, `${l.id}/${page} 的标题只有 ${w} 格：${title}`).toBeGreaterThanOrEqual(40);
        expect(w, `${l.id}/${page} 的标题有 ${w} 格，会被截断：${title}`).toBeLessThanOrEqual(60);
      }
    }
  });

  it('首页的标题显示宽度也在 40~60 之间', () => {
    /* 上面那条只走 CONTENT_PAGES，首页被排除在外——而首页的标题恰恰是全站
     * 最常被显示的一条（品牌搜索、直达流量、外部链接的锚文本都落在它身上）。
     *
     * 2026-11-05 实测：八门语言里五门超过 60 格（de 73、es 71、fr 70、ja 66、
     * en 65），最长的 de 比子页上限还多 13 格。这不是"没人量过"的意外——
     * docs/seo.md §2.2 开头那张"到 2026-10-29 仍然成立，最短 42、最长 73"的
     * 现状摘录把 73 当成了**已知现状**记下来，而断言的范围不包括它，
     * 于是"记录在案"顶替了"被检查住"。
     *
     * 这条与上面那条的关系是**加严**而不是修改：CONTENT_PAGES 那条一字未动，
     * 这里把 PAGES（含首页）单独再量一遍，两条并存。§11 只允许新增断言。 */
    for (const l of LOCALES) {
      for (const page of PAGES) {
        const title = DICTS[l.id].meta[page].title;
        const w = displayWidth(title);
        expect(w, `${l.id}/${page || 'home'} 的标题只有 ${w} 格：${title}`).toBeGreaterThanOrEqual(40);
        expect(
          w,
          `${l.id}/${page || 'home'} 的标题有 ${w} 格，会被截断：${title}`,
        ).toBeLessThanOrEqual(60);
      }
    }
  });

  it('上面那条确实扫到了首页，不是只重复了子页', () => {
    /* 一个 `for … of PAGES` 把 PAGES 读成只有子页、或者 `meta['']` 取成
     * undefined 再被 `?.title` 吞掉，上一条会**空转通过**——本仓库为同一个
     * 原因加过 `cardCount > 1`（选择器落空时 `cardIdx === cardCount - 1`
     * 变成 `-1 !== -1`）。这里钉住首页那一条真的被量到了。 */
    const homeTitles = LOCALES.map((l) => DICTS[l.id].meta['']?.title);
    expect(homeTitles.every((t) => typeof t === 'string' && t.length > 0)).toBe(true);
    expect(homeTitles.length).toBe(LOCALES.length);
    expect(displayWidth(DICTS.en.meta[''].title)).toBeGreaterThan(0);
  });

  it('没有「页面名 — Page Screenshot Pro」这种只有名词的标题', () => {
    /* 形状断言，不是长度断言。只卡长度的话，把 `FAQ — Page Screenshot Pro`
     * 补成 `FAQ — Frequently asked questions · Page Screenshot Pro` 也能过
     * （54 格），但那仍然是"标题 = 页面名"——§2.1 说的"六页在 SERP 里长得
     * 一样"一个字都没解决。 */
    for (const l of LOCALES) {
      for (const page of CONTENT_PAGES) {
        const title = DICTS[l.id].meta[page].title;
        expect(
          title.endsWith('— Page Screenshot Pro'),
          `${l.id}/${page} 的标题只有页面名 + 品牌名：${title}`,
        ).toBe(false);
      }
    }
  });

  it('破折号后是一句描述，不是把页面名换个说法再写一遍', () => {
    /* 上面那条只能拦住"什么都沒写"；把 FAQ 展开成
     * `FAQ — Frequently asked questions` 它就瞎了，而那正是 §2.4 里计划要
     * 红的那一条。这里换个判据：破折号后那一段不能等于本页的 h1——h1 就是
     * 页面名本身（`Frequently asked questions`），描述句照抄它等于没写。
     *
     * 比对前去掉空白与标点，因为原文里 h1 和标题不必逐字对齐（中文的
     * 「价格」与 h1「简单、诚实的定价」本来就不同，这条不会误伤）。 */
    const h1Of = (d: (typeof DICTS)[keyof typeof DICTS], page: string): string =>
      (d as unknown as Record<string, { h1: string }>)[page as string].h1;
    const norm = (s: string) => s.toLowerCase().replace(/[\s、，,。.:：·—\-]+/g, '');

    for (const l of LOCALES) {
      for (const page of CONTENT_PAGES) {
        const title = DICTS[l.id].meta[page].title;
        const desc = title.split('—')[1]?.split('·')[0]?.trim() ?? '';
        expect(displayWidth(desc), `${l.id}/${page} 的破折号后没有描述：${title}`).toBeGreaterThan(7);
        expect(
          norm(desc),
          `${l.id}/${page} 的描述只是把 h1（${h1Of(DICTS[l.id], page)}）再写一遍：${title}`,
        ).not.toBe(norm(h1Of(DICTS[l.id], page)));
      }
    }
  });

  it('八门语言各自量过，不是照抄英文的宽度', () => {
    /* 逐门比对标题互不相同由「每门语言的 meta 标题都与英文不同」覆盖。
     * 这里防的是另一件事：把英文标题原样贴到其它七门（那样每条都恰好同宽，
     * 长度断言全绿，而页面上是八份英文）。 */
    for (const page of CONTENT_PAGES) {
      const widths = LOCALES.map((l) => displayWidth(DICTS[l.id].meta[page].title));
      expect(new Set(widths).size, `${page} 页八门语言的标题宽度全相同`).toBeGreaterThan(1);
    }
  });
});

describe('首页 h1 说的是「整页」', () => {
  /* h1 是全站权重最高的一段文字，而它此前八门语言都只说「长截图」/「long
   * screenshots」——「整页截图 / full-page screenshot」这个用户真正会搜的词
   * 一次都没出现（它只在 meta description 和正文里）。搜索结果里 h1 未必
   * 直接显示，但它决定了 Google 对"这页讲什么"的判读。
   *
   * 判据是**每门语言各有一个手写的标记词**，不是从字典里取：从同一份字典
   * 取期望值，改文案时两边一起动，断言永远绿——这个仓库在 subChangeTo 与
   * support 的 ABOVE/BELOW 表上各记过一次。
   *
   * 长度上界（60 格）同时卡住"为了塞关键词写成一整句"：h1 的 CSS 是
   * `max-width: 15em`，超长会换行成三行。 */
  const FULL_PAGE_MARK: Record<Locale, string> = {
    en: 'full-page',
    'zh-Hans': '整页',
    'zh-Hant': '整頁',
    ja: 'ページ全体',
    ko: '전체 페이지',
    es: 'página completa',
    fr: 'pleine page',
    de: 'Ganzseiten',
  };

  it('每门语言的 hero 标题里都有「整页」那个词', () => {
    for (const l of LOCALES) {
      const title = `${DICTS[l.id].home.heroTitleLead} ${DICTS[l.id].home.heroTitleAccent}`;
      const mark = FULL_PAGE_MARK[l.id];
      expect(title.toLowerCase(), `${l.id} 的 h1 里没有「${mark}」：${title}`).toContain(
        mark.toLowerCase(),
      );
    }
  });

  it('标记词表覆盖了全部八门语言，一门都不漏', () => {
    // 少一门就是那一门完全不被检查——它仍然有 h1，只是没人看它写了什么。
    expect(Object.keys(FULL_PAGE_MARK).sort()).toEqual(LOCALES.map((l) => l.id).sort());
  });

  it('h1 长度不超过 60 格，且八门语言不是同一句', () => {
    /* 60 格是 h1 换行的界（`.hero-title` 的 max-width: 15em，font-size 随
     * 视口缩到 2.3rem）。超了不会报错，只是首页第一屏被一行标题占满。 */
    const widths = LOCALES.map((l) => {
      const t = `${DICTS[l.id].home.heroTitleLead} ${DICTS[l.id].home.heroTitleAccent}`;
      const w = displayWidth(t);
      expect(w, `${l.id} 的 h1 有 ${w} 格，会换行：${t}`).toBeLessThanOrEqual(60);
      return w;
    });
    expect(new Set(widths).size).toBeGreaterThan(1);
  });
});

describe('meta description 的宽度上界', () => {
  /* docs/seo.md §3.3：只加**上界**，不加下界。
   *
   * 下界会逼着人往短描述里塞字——而短描述没有坏处（Google 会自己从正文补），
   * 塞字才是坏处。上界拦的是另一半：>200 格的尾部一定被截掉，而截在哪里由
   * 设备宽度决定，写的人无从预料。
   *
   * 阈值 200 而不是 160：Google 的文档只说"按设备宽度截断"，不给字符数；
   * 160 是社区估算。200 留出的余量让现有文案基本不用改，只拦真正失控的。 */
  it('每条 description 都不超过 200 格', () => {
    for (const l of LOCALES) {
      for (const page of PAGES) {
        const d = DICTS[l.id].meta[page].description;
        const w = displayWidth(d);
        expect(w, `${l.id}/${page || 'home'} 的 description 有 ${w} 格：${d}`).toBeLessThanOrEqual(
          200,
        );
      }
    }
  });

  it('没有空 description', () => {
    /* 空串会让 head 里出现 content=""，社交卡片和搜索结果都是空白——
     * 而长度上界对空串是绿的。 */
    for (const l of LOCALES) {
      for (const page of PAGES) {
        expect(
          DICTS[l.id].meta[page].description.trim().length,
          `${l.id}/${page || 'home'} 的 description 是空的`,
        ).toBeGreaterThan(0);
      }
    }
  });
});

describe('meta description 收口到 160 格（2026-10-31 起）', () => {
  /* 上面那条 200 是 2026-10-31 第一轮定的，**原样保留**（docs/seo.md §11：
   * tests/ 里已有的断言不改）。这一条是**另加**的更严上界，两轮改动的
   * 关系是「第一轮只收 >190 的 6 条，第二轮把剩下 31 条也收口」。
   *
   * 为什么需要它：31 条文案已经全部压到 ≤160，但**"≤160"当时只靠文案维持**——
   * 上一条断言的上界是 200，所以谁把某条描述写回 180 格，npm run check 照样全绿，
   * 唯一能发现的地方是下一次人工测量。这正是本仓库反复记过的 `expired` 死字段
   * 形状：判据写在一处、事实写在另一处，中间没有人读。
   *
   * 为什么是 160 而不是继续用 200：200 只保证"大致显示得完"，160 才是桌面端
   * 单行切点。第一轮之后剩下的 31 条全部落在 161~190 这个最尴尬的区间——
   * 长到一定被截，又没长到值得当"要点补充"来看。
   *
   * 与上面那条的**唯一**区别就是阈值；两条并存是有意的（§11 只能加严，
   * 不能修改既有断言）。下界仍然不加，理由见上。 */
  const LIMIT = 160;

  it(`每条 description 都不超过 ${LIMIT} 格`, () => {
    for (const l of LOCALES) {
      for (const page of PAGES) {
        const d = DICTS[l.id].meta[page].description;
        const w = displayWidth(d);
        expect(
          w,
          `${l.id}/${page || 'home'} 的 description 有 ${w} 格（上限 ${LIMIT}）：${d}`,
        ).toBeLessThanOrEqual(LIMIT);
      }
    }
  });

  it('这条断言确实扫到了东西', () => {
    /* 一个 `for … of` 循环把 DICTS 或 PAGES 读成空集合时，上一条会**空转通过**。
     * 这不是假想的：本仓库的 `cardCount > 1` 断言就是为同一个原因加的
     * （选择器落空时 `cardIdx === cardCount - 1` 变成了 `-1 !== -1`）。
     * 这里钉住两条：页数与语言数对得上，且每一条都真的量到了正数。 */
    let seen = 0;
    for (const l of LOCALES) {
      for (const page of PAGES) {
        seen += 1;
        expect(displayWidth(DICTS[l.id].meta[page].description)).toBeGreaterThan(0);
      }
    }
    expect(seen, '扫到的 description 条数与「语言 × 页面」对不上').toBe(LOCALES.length * PAGES.length);
    expect(seen).toBeGreaterThan(40);
  });
});

describe('正文的厚度与互链', () => {
  /* 量的是**渲染出来的** `<main>`，不是字典对象。两件事只有在渲染后才是真的：
   * ReactNode 里的行内 <a> 展开成什么 href，以及正文实际有多少字。
   * 直接从字典里数 hrefsIn 也行，但它数的是「写了几个 <a>」，而这一组要问的
   * 是「读者能不能走到别的页面去」——目标去重、跨页/页内分开，都得看成品。
   *
   * 剥注释→标签换空格→折叠空白，是 docs/seo.md §6.1 的口径。标签换空格而不
   * 是直接删掉，是因为 `</p><p>` 删成空串会把两句话粘成一个词。 */

  /** 取某个路由渲染后 `<main>` 的内层 HTML。 */
  function mainHtml(locale: Locale, page: Page | 'notFound'): string {
    const html = renderRoute(locale, page).html;
    const m = /<main[^>]*>([\s\S]*)<\/main>/.exec(html);
    // 正则落空说明 App.tsx 的 <main> 被改了；抛出来比拿空串去断言好。
    if (!m) throw new Error(`${locale}/${page} 渲染结果里没有 <main>`);
    return m[1];
  }

  function textOf(html: string): string {
    return html
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** 去重后的跨页链接目标。页内锚点（`#…`）、mailto 与站外链接都不算：
   *  价格页有 4 个 `#how-to-buy`，把它们和跨页链接加在一起，一个「点完还
   *  在原处」的页面就会被读成「有出口」。 */
  function crossPageTargets(html: string): string[] {
    const out = new Set<string>();
    for (const m of html.matchAll(/<a\b[^>]*href="([^"]*)"/g)) {
      if (m[1].startsWith('/')) out.add(m[1]);
    }
    return [...out].sort();
  }

  const CONTENT_PAGES = ['', 'pricing', 'faq', 'support', 'privacy', 'terms'] as const;

  it('每个内容页的正文不少于 1500 字符', () => {
    /* **按字符数，不按词数。** CJK 不用空格分词：同一个支持页，en 是 2062 字符
     * / 331 词，zh-cn 是 826 字符 / 65 词。用词数当阈值，中文页会永远够不着，
     * 而日文（63 词）比中文还低——量出来的不是「页面薄」而是「这门语言不数词」。
     * 字符数是唯一跨语言可比的量（seo/text-width 的 CJK 记 2 的口径在这里也
     * 不适用：那个衡量「显示多宽」，这个要的是「有多少内容」）。
     *
     * 1500 贴着现状定（补写之前最薄是 zh-cn 支持页 826），作用是**防止退步**，
     * 不是推动扩张。 */
    for (const l of LOCALES) {
      for (const page of CONTENT_PAGES) {
        const n = textOf(mainHtml(l.id, page)).length;
        expect(n, `${l.id}${pathFor(l.id, page)} 的正文只有 ${n} 字符`).toBeGreaterThanOrEqual(1500);
      }
    }
  });

  it('价格页与隐私页至少各有一条正文跨页链接', () => {
    /* 这两页在 §6.1 的度量里都是 **0**，而 0 不是「少」而是「没有」：价格页是
     * 转化页，用户读完三档却没有任何一条路通往 FAQ 或支持页；隐私页则走不到
     * 条款页（反向是通的）。所以这一条不设「至少两条」，就要求 ≥1——它是
     * 缺陷本身的判据。
     *
     * 检查前提：`目标数 === 0` 单独报错，比泛泛的「少于 1」清楚。 */
    for (const l of LOCALES) {
      for (const page of ['pricing', 'privacy'] as const) {
        const tg = crossPageTargets(mainHtml(l.id, page));
        expect(tg.length, `${l.id}${pathFor(l.id, page)} 正文里一条跨页链接都没有`).toBeGreaterThan(0);
      }
    }
  });

  it('每个内容页至少链到两个不同的页面', () => {
    /* **按去重后的目标数，不按 href 条数。** FAQ 页曾经数出来是 2 条、但两条
     * 都指向 `/support/`，等于只有一个出口——数 href 会把它读成「已经有两个」。
     * 单位是「路」，不是「链接」。 */
    for (const l of LOCALES) {
      for (const page of CONTENT_PAGES) {
        const tg = crossPageTargets(mainHtml(l.id, page));
        expect(
          tg.length,
          `${l.id}${pathFor(l.id, page)} 只链到 ${tg.length} 个不同的页面：${tg.join(' ') || '(无)'}`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
