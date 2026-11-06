import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, renderRoute } from '../src/entry-server';
import { dictFor } from '../src/App';
import { LOCALES, PAGES, pathFor, type Page } from '../src/i18n/paths';
import { SITE_ORIGIN } from '../src/content/site';

const HERE = dirname(fileURLToPath(import.meta.url));
const ALL_ROUTES: (Page | 'notFound')[] = [...PAGES, 'notFound'];

/* 预渲染的正文侧契约。
 *
 * 为什么需要它：`scripts/prerender.mjs` 会把 `<!--app-html-->` 换成
 * renderRoute 的 html、把 `<!--app-head-->` 换成 head、把 `<html lang>` 换成
 * lang。三样里任何一样空了，构建都**不会**失败——空 html 是一个白页面，
 * 空 head 是每页共用一个标题，空 lang 是浏览器按默认语言断词。三者都是
 * "部署成功、线上悄悄错掉"。
 *
 * 顺带钉住 lang 的**来源**：它曾经是 entry-server 里一个
 * `locale === 'zh-Hant' ? 'zh-Hant' : 'en'` 的三元表达式。加第三门语言时
 * 那个写法会静默把新语言判成 'en'，页面上看不出任何异常。现在它取自
 * paths.ts 的 LOCALES[].htmlLang，也就是 head.ts 的 hreflang 读的同一个值。
 */

describe('每个路由都渲染出完整的三件套', () => {
  it('正文非空、head 有 title、lang 是 htmlLang', () => {
    for (const l of LOCALES) {
      for (const page of PAGES) {
        const r = renderRoute(l.id, page);
        const label = `${l.id}${pathFor(l.id, page)}`;

        expect(r.html.trim().length, `${label} 的正文是空的`).toBeGreaterThan(0);
        expect(r.head, `${label} 的 head 里没有 title`).toContain('<title>');
        expect(r.head, `${label} 的 head 里没有 canonical`).toContain('rel="canonical"');
        expect(r.lang, `${label} 的 <html lang> 不是 htmlLang`).toBe(l.htmlLang);
      }
    }
  });

  it('lang 不是从 id 硬编码推出来的', () => {
    /* 这条防的是「把 LOCALES 查找换回三元表达式」。值在现有语言下
     * 恰好相同，所以上一条断言分辨不出来——而它要拦的正是"加一门语言时
     * 静默降级"。这里直接比 lang 与 id：繁中的 id 是 'zh-Hant' 而 segment
     * 是 'zh-tw'，两者不同，写死任何一份都会在其中一处露馅。 */
    const zh = LOCALES.find((l) => l.id === 'zh-Hant')!;
    expect(zh.segment).not.toBe(zh.htmlLang);
    expect(renderRoute('zh-Hant', '').lang).toBe(zh.htmlLang);
    expect(renderRoute('zh-Hant', '').lang).not.toBe(zh.segment);
  });

  it('八门语言的 lang 各不相同', () => {
    /* 全部取自 LOCALES[].htmlLang。若某门语言的 htmlLang 写成了别的
     * 语言（例如把简中写成 zh），浏览器会挑错字形/断词规则——页面上
     * 看不出异常，只是字变了。 */
    const langs = LOCALES.map((l) => l.htmlLang);
    expect(new Set(langs).size).toBe(langs.length);
    for (const l of LOCALES) {
      expect(renderRoute(l.id, '').lang, `${l.id} 的 lang 不对`).toBe(l.htmlLang);
    }
  });

  it('404 也渲染得出来，且语言是默认语言', () => {
    const r = renderRoute('en', 'notFound');
    expect(r.html.trim().length).toBeGreaterThan(0);
    expect(r.head).toContain('noindex');
    expect(r.lang).toBe('en');
  });
});

describe('render() 走的是 resolvePath', () => {
  it('真实地址解出对应的语言与页面', () => {
    // prerender.mjs 直接用 renderRoute，但 render() 是「地址 → 页面」的入口，
    // 它俩若分叉，说明 resolvePath 与 pathFor 不再互逆（tests/paths.test.ts
    // 管的是那两个纯函数，这里管的是调用点）。
    const zh = render('/zh-tw/pricing/');
    expect(zh.lang).toBe('zh-Hant');
    expect(zh.head).toContain(`${SITE_ORIGIN}/zh-tw/pricing/`);

    const en = render('/pricing/');
    expect(en.lang).toBe('en');
    expect(en.head).toContain(`${SITE_ORIGIN}/pricing/`);

    const ja = render('/ja/faq/');
    expect(ja.lang).toBe('ja');
    expect(ja.head).toContain(`${SITE_ORIGIN}/ja/faq/`);
  });

  it('未知地址渲染成 404 页，不是空白', () => {
    const r = render('/zh-tw/nope');
    expect(r.head).toContain('noindex');
    expect(r.html.trim().length).toBeGreaterThan(0);
    // 保留语言前缀：繁中的 404 页应该还说繁体中文（见 resolvePath）。
    expect(r.lang).toBe('zh-Hant');
  });
});

/** 按文档顺序取出 <body> 里所有标题的级别（1-6）。 */
function headings(html: string): number[] {
  return [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
}

/** 从 `openTag` 开始截出那一层的完整 div（含标签），配不到返回 null。 */
function sliceDiv(html: string, openTag: string): string | null {
  const start = html.indexOf(openTag);
  if (start < 0) return null;
  const re = /<div\b|<\/div>/g;
  re.lastIndex = start;
  let depth = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return html.slice(start, m.index + m[0].length);
  }
  return null;
}

describe('地标与当前页标记', () => {
  /* 这两条都是「页面上看不出来」的：`<nav>` 少了 aria-label，视觉上零差别，
   * 只有读屏器的地标列表里会多出一个无名的"导航"；`aria-current="true"`
   * 在语言切换器里能念出"当前"，但念不出是"当前页"——规范里 `page` 才是
   * 那个意思，`true` 只是"当前项"，语义更弱。
   *
   * 都只能靠断言守：没有任何渲染差异，也没有任何构建错误。 */

  it('<nav> 与 <footer> 各带一个本语言的 aria-label', () => {
    for (const l of LOCALES) {
      const html = renderRoute(l.id, '').html;
      const dict = dictFor(l.id);
      expect(html, `${l.id} 的 <nav> 没有 aria-label`).toContain(
        `<nav class="nav" aria-label="${dict.nav.ariaLabel}">`,
      );
      expect(html, `${l.id} 的 <footer> 没有 aria-label`).toContain(
        `<footer class="footer" aria-label="${dict.footer.ariaLabel}">`,
      );
      // 不能是空串——空 aria-label 与没有它一样，而断言"存在"看不出来。
      expect(dict.nav.ariaLabel.trim().length).toBeGreaterThan(0);
      expect(dict.footer.ariaLabel.trim().length).toBeGreaterThan(0);
    }
  });

  it('八门语言的 aria-label 各不相同，不是抄英文', () => {
    /* 照抄英文的话每门语言都有 label、页面也完全正常，只有读屏器听得出来。
     *
     * 判据是"不同"而不是"与英文不同"：德语的「Support」与英语同形是正常的，
     * 拿英文当唯一反例会在一个正确的翻译上红。所以比集合大小（要求至少五种
     * 不同的说法），再加一条"不能全部等于英文"——后者才是照抄的直接证据。 */
    const navs = LOCALES.map((l) => dictFor(l.id).nav.ariaLabel);
    const foots = LOCALES.map((l) => dictFor(l.id).footer.ariaLabel);
    expect(new Set(navs).size).toBeGreaterThan(4);
    expect(new Set(foots).size).toBeGreaterThan(4);
    expect(navs.filter((v) => v === dictFor('en').nav.ariaLabel).length).toBeLessThan(3);
    expect(foots.filter((v) => v === dictFor('en').footer.ariaLabel).length).toBeLessThan(3);
  });

  it('语言切换器用 aria-current="page"，不是 "true"', () => {
    /* 只有当前语言那一条带 aria-current，其余没有这个属性。
     *
     * 两个方向都查：`="page"` 出现一次（当前语言那一条），`="true"` 一次都
     * 不出现。只查前一半的话，把值写成 "true" 仍然是绿的——而那正是这条
     * 断言要拦的东西。 */
    const html = renderRoute('zh-Hant', 'pricing').html;
    expect(html.match(/aria-current="page"/g) ?? []).toHaveLength(1);
    expect(html).not.toContain('aria-current="true"');
    // 且它确实落在繁体中文那一条上，而不是随手一个链接。
    expect(html).toMatch(/href="\/zh-tw\/pricing\/"[^>]*aria-current="page"/);
  });
});

describe('标题层级不跳级', () => {
  /* 跳级（h2 → h4）不影响渲染，只影响读屏器的目录和 Google 对文档结构的
   * 理解——页面上一切正常，所以只有断言能守住它。三个位置曾经同时跳：
   * 页脚三列（h4，全部 49 页）、价格页套餐名（h1 → h3）、支持页卡片（同）。
   *
   * 判据用**相邻两个标题**的级别差，不是整棵 DOM 的父子关系：`h3` 出现在
   * 两个 `h2` 之间是合法的（§7.1 的首页就是这样），拿父元素判会误报。 */
  it('每个路由的 body 里没有 hN -> hM（M > N+1）', () => {
    for (const l of LOCALES) {
      for (const page of ALL_ROUTES) {
        const seq = headings(renderRoute(l.id, page).html);
        const label = `${l.id}${page === 'notFound' ? '/404' : pathFor(l.id, page)}`;
        expect(seq.length, `${label} 一个标题都没有`).toBeGreaterThan(0);
        expect(seq[0], `${label} 的第一个标题不是 h1`).toBe(1);
        for (let i = 1; i < seq.length; i++) {
          expect(
            seq[i] <= seq[i - 1] + 1,
            `${label} 跳级：h${seq[i - 1]} -> h${seq[i]}（第 ${i + 1} 个标题）`,
          ).toBe(true);
        }
      }
    }
  });

  it('每页恰好一个 h1', () => {
    /* 这条现在是事实（49 页全部如此），加它是防退步：改这一组标题时最
     * 容易被顺手破坏的不变量就是把页脚的某个标题写成 h1。 */
    for (const l of LOCALES) {
      for (const page of ALL_ROUTES) {
        const seq = headings(renderRoute(l.id, page).html);
        const n = seq.filter((x) => x === 1).length;
        expect(n, `${l.id}${page === 'notFound' ? '/404' : pathFor(l.id, page)} 的 h1 有 ${n} 个`).toBe(1);
      }
    }
  });

  it('首页的套餐名是 h3、价格页的是 h2', () => {
    /* PlanCard 的级别由调用点传入（ui.tsx 的 `level` 注释）。两处传同一个
     * 值能让上面两条都通过——首页传 2 只是「套餐名与分区标题平级」，不跳级；
     * 价格页传 3 则跳级仍然存在，第一条会红。所以「首页对」必须单独断言，
     * 这是唯一能分开两种接错法的检查点。
     *
     * 断言在 `<div class="plans">` 那一块里做，不是搜全页「有没有这个字符串」：
     * 套餐名在页面别处（对比表、功能描述）本来就可能出现。 */
    const dict = dictFor('en');
    const cases = [
      { page: '' as const, level: 3, names: dict.home.plans.map((p) => p.name) },
      { page: 'pricing' as const, level: 2, names: dict.pricing.plans.map((p) => p.name) },
    ];
    for (const c of cases) {
      const block = sliceDiv(renderRoute('en', c.page).html, '<div class="plans">');
      expect(block, `${c.page || '(home)'} 页找不到 .plans 容器`).toBeTruthy();
      const levels = headings(block!);
      expect(levels.length, `${c.page || '(home)'} 页的套餐标题数不对`).toBe(c.names.length);
      expect(levels, `${c.page || '(home)'} 页的套餐名不是 h${c.level}`).toEqual(
        c.names.map(() => c.level),
      );
    }
  });
});

describe('标题标签与 CSS 选择器成对', () => {
  /* 上面那一组只读 HTML 字符串，不跑样式引擎：标签改对了、选择器没跟上，
   * 它全绿而页面掉样式。`site-e2e.mjs` 也抓不到——它比对的是本地构建与线上
   * 部署**同一份**构建，CSS 对不对两边一样，diffs 恒为空（见 docs/seo.md §7.5）。
   *
   * 所以这里是文本级兜底：按选择器**列表**逐项匹配，不做子串匹配。`.plan h2,
   * .plan h3` 里含 `.plan h3`，子串检查会把正确写法判成旧规则残留。
   *
   * 它抓不住「字号写对了但被别的规则盖住」——那需要真实布局引擎，留在人工确认。 */
  const CSS = readFileSync(join(HERE, '..', 'public', 'styles.css'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  interface Rule {
    selectors: string[];
    body: string;
  }

  /* 只取最内层的 `<sel> { <无大括号的声明> }`。@media 的外层块 `[^{}]+`
   * 配不到，里面的规则照配——这里关心的几条都不在媒体查询里，但让解析器
   * 容忍嵌套，比记住「不许把规则挪进 @media」可靠。 */
  const RULES: Rule[] = [...CSS.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selectors: m[1]
      .split(',')
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .filter(Boolean),
    body: m[2],
  }));

  function rulesWith(selector: string): Rule[] {
    return RULES.filter((r) => r.selectors.includes(selector));
  }

  function fontSize(selector: string): string | undefined {
    const hit = rulesWith(selector);
    if (hit.length === 0) return undefined;
    return hit[hit.length - 1].body.match(/font-size:\s*([^;]+)/)?.[1].trim();
  }

  it('.footer-cols 的标题规则挂在 h2 上，字号仍是 0.74rem', () => {
    // 页脚三列从 h4 改成了 h2（理由见 chrome.tsx 的注释：404 页只有 h1，
    // 改 h3 会把跳级搬到 404）。h2 默认比 h4 大得多，选择器跟上了而字号
    // 没搬过来，页脚会突然变成一堆大字——这半句是真正的视觉保护。
    expect(fontSize('.footer-cols h2'), 'styles.css 里没有 .footer-cols h2 规则').toBe('0.74rem');
  });

  it('.plan 的标题规则同时覆盖 h2 与 h3，字号都是 1.15rem', () => {
    // PlanCard 在首页渲染 h3、在价格页渲染 h2，两条都要有规则；价格页的
    // 套餐名不该因为语义修好了就比首页大。
    expect(fontSize('.plan h2'), 'styles.css 里没有 .plan h2 规则').toBe('1.15rem');
    expect(fontSize('.plan h3'), 'styles.css 里没有 .plan h3 规则').toBe('1.15rem');
  });

  it('styles.css 里不存在 .footer-cols h4 / .plan h3 单独成条', () => {
    /* 旧规则留着比漏加新规则更隐蔽：样式表里有一条只覆盖一半场景的规则，
     * 下一个人看到它就会以为改完了。判「单独成条」（选择器列表长度为 1），
     * 而不是判「某处出现这串字」。 */
    const alone = (s: string) => RULES.filter((r) => r.selectors.length === 1 && r.selectors[0] === s);
    expect(alone('.footer-cols h4').length, 'styles.css 里还留着 .footer-cols h4 单独成条').toBe(0);
    expect(alone('.plan h3').length, 'styles.css 里还留着 .plan h3 单独成条').toBe(0);
  });

  it('支持页卡片的 h2 字号钉回 1.1rem', () => {
    /* §7.2 选的那条例外：支持页六张卡片的标题是 h2（直接挂在 h1 下面，
     * 写 h3 就跳级），但 `.card h2` 是 1.5rem，不钉住的话这六张卡片的标题会
     * 比现在大 36%，与其它页不一致。这条断言就是那个例外的执行版本。 */
    expect(fontSize('.card-sm h2'), 'styles.css 里没有 .card-sm h2 规则').toBe('1.1rem');
  });
});
