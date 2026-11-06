import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUPPORT_EMAIL } from '../src/content/site';
import { dictFor } from '../src/App';
import { renderRoute } from '../src/entry-server';
import { LOCALES, PAGES, type Locale } from '../src/i18n/paths';
import { displayWidth } from '../src/seo/text-width';

/* 支持页三张卡片 + 内嵌反馈表单的**交付物**。
 *
 * 三轮要求叠在这里，每条断言各对应其中一轮：
 *
 * 1（2026-10-29）「Email us 框，邮箱太长，已经出了框的范围，要调整在范围内」
 * 2（2026-10-29）「Report a bug 框，点击按钮不要再用邮箱了…出现一个提交表单」
 * 3（2026-10-30）「点击 Send Feedback 按钮不要跳转到 …workers.dev/feedback，
 *    直接自己做一个提交页面或者弹出表单，再提交」
 * 4（2026-10-30）「提交反馈 表单部分，类别下拉框中除了已经选到的项，其他项都看不清」
 *
 * 第 1 件是**几何**约束，而站内没有任何东西量得到它：`styles.css` 全文件没有
 * `overflow-wrap` / `word-break`，所以 43 字符的地址是一个不可断的 token；
 * `render.test.ts` 读的是 CSS 里的字号，不是排版结果；`scripts/site-e2e.mjs`
 * 比对的是线上与本地是否一致——两边一起错它就绿。真正跑一次浏览器量像素要
 * 部署 + 人工跑 e2e，所以这里用 `src/seo/text-width.ts` 的估算模型卡一个上界。
 *
 * 第 2、3 件都是**调用点**，而 `Support.tsx` / `FeedbackForm.tsx` 都没有套件：
 * 把 `action` 改成相对路径、把 `to` 改回外链、删掉隐藏的 `locale` 字段，
 * `tsc` 和构建都不会响。所以断言落在渲染出来的 HTML 上。
 *
 * 有一条是两个真源：表单的四个 `name="category"` 值与
 * `functions/api/feedback.ts` 的 `FEEDBACK_CATEGORIES` 是同一份契约。分仓之前
 * 那个文件在 npm 项目之外，只能读源码文本；现在它在**仓库根**——因为 Cloudflare
 * Pages 就是在 `process.cwd()` 下找 `functions/`——但仍然**读文本而不 import**：
 * 它用 Pages 的 `Context` 形态，本仓库没有 `@cloudflare/workers-types`，import
 * 进来只会给 tsc 添乱。同一个做法见 `prices.test.ts` 读 `vendor/payment-config.ts`。
 *
 * 分类**文案**的真源仍然是扩展的 `public/_locales/<dir>/messages.json`，那八份
 * 在另一个仓库里，所以本仓库存了一份快照在 `vendor/_locales/`。 */

const HERE = dirname(fileURLToPath(import.meta.url));
/** 本仓库的根：functions/ 与 vendor/ 都在它下面。 */
const REPO = join(HERE, '..');
const HANDLER = readFileSync(join(REPO, 'functions', 'api', 'feedback.ts'), 'utf8');

/** 从 handler 源码里抠一个 `export const NAME = <字面量>;` 的数值。 */
function handlerNumber(name: string): number {
  const m = HANDLER.match(new RegExp(`export const ${name} = (\\d+);`));
  if (!m) throw new Error(`functions/api/feedback.ts 里找不到 ${name}`);
  return Number(m[1]);
}
/** handler 的分类白名单。**从源码读**，不是手抄一份——手抄的那份会和它一起过期。 */
function handlerCategories(): string[] {
  const m = HANDLER.match(/export const FEEDBACK_CATEGORIES = \[([^\]]*)\]/);
  if (!m) throw new Error('functions/api/feedback.ts 里找不到 FEEDBACK_CATEGORIES');
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
}

interface Card {
  title: string;
  cta: string;
  href: string;
  attrs: string;
}

function cards(locale: Locale): Card[] {
  const html = renderRoute(locale, 'support').html;
  const out: Card[] = [];
  for (const m of html.matchAll(/<article class="card card-sm">([\s\S]*?)<\/article>/g)) {
    if (out.length === 3) break;
    const inner = m[1];
    const anchor = inner.match(/<a class="btn btn-ghost"([^>]*)>([\s\S]*?)<\/a>/);
    if (!anchor) throw new Error(`${locale} 的支持页第 ${out.length + 1} 张卡片里没有按钮`);
    out.push({
      title: inner.match(/<h2>([\s\S]*?)<\/h2>/)?.[1] ?? '',
      cta: anchor[2],
      href: anchor[1].match(/href="([^"]*)"/)?.[1] ?? '',
      attrs: anchor[1],
    });
  }
  /* 卡片数不对就直接抛，而不是让下面每一条在空数组上"通过"——`for..of` 在
   * 0 张卡片时是零次迭代，那正是本仓库反复记下的「选择器失配后断言全绿」。 */
  if (out.length !== 3) throw new Error(`${locale} 的支持页只渲染出 ${out.length} 张卡片`);
  return out;
}

/** 支持页上那个表单的 HTML 片段。找不到就抛——后面所有断言都以它为锚。 */
function formHtml(locale: Locale): string {
  const html = renderRoute(locale, 'support').html;
  const m = html.match(/<form\b[\s\S]*?<\/form>/);
  if (!m) throw new Error(`${locale} 的支持页上没有 <form>`);
  return m[0];
}

describe('反馈表单是同源的，不再跳外链', () => {
  it('整个站点只有支持页有表单，且只有一张', () => {
    /* 数量先抛：一条「action 是 /api/feedback」的断言在 0 张表单时是**空集合**，
     * `expect(undefined).toBe(...)` 会红，但如果写成遍历匹配结果，就会静默通过。 */
    for (const l of LOCALES) {
      for (const page of PAGES) {
        const html = renderRoute(l.id, page).html;
        const n = (html.match(/<form\b/g) ?? []).length;
        if (page === 'support') {
          if (n !== 1) throw new Error(`${l.id} 的支持页有 ${n} 张表单，应该是 1 张`);
        } else if (n !== 0) {
          throw new Error(`${l.id} 的 ${page} 页上出现了 ${n} 张表单`);
        }
      }
    }
  });

  it('action 是绝对路径 /api/feedback，method 是 post', () => {
    /* 绝对路径是硬要求：支持页在 `/support/` 与 `/zh-cn/support/` 两种深度下
     * 渲染，相对路径 `api/feedback` 会解成 `/zh-cn/api/feedback`——Pages 上没有
     * 这个路由，提交失败的样子是一个 404 页面，看起来像「表单坏了」。
     * 写成 `toContain('action="/api/feedback"')` 而不是正则解析，是为了让
     * `action="api/feedback"`（少一个斜杠）也红。 */
    for (const l of LOCALES) {
      const f = formHtml(l.id);
      expect(f, `${l.id} 的表单 action 不是绝对路径 /api/feedback`).toContain('action="/api/feedback"');
      expect(f, `${l.id} 的表单 method 不是 post`).toMatch(/<form\b[^>]*method="post"/);
    }
  });

  it('隐藏字段把当前语言带给接收端', () => {
    /* 这是站内表单相对外链页的实打实好处：确认页能说读者选的语言。少了它
     * 确认页一律回英文，而读者在中文页上刚提交完——看起来像另一家的页面。 */
    for (const l of LOCALES) {
      expect(formHtml(l.id), `${l.id} 的表单没带 locale`).toContain(
        `<input type="hidden" name="locale" value="${l.id}"/>`,
      );
    }
  });

  it('四个分类值就是 handler 的白名单', () => {
    /* 两个真源、两个项目。多一个：读者选了，handler 归到 'other'，标签白写。
     * 少一个：某个分类在界面上消失，而 handler 仍然认它。 */
    const expected = handlerCategories().sort();
    expect(expected, 'handler 的分类白名单看起来不对').toHaveLength(4);
    for (const l of LOCALES) {
      const got = [...formHtml(l.id).matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]).sort();
      expect(got, `${l.id} 的表单分类与 FEEDBACK_CATEGORIES 不一致`).toEqual(expected);
    }
  });

  it('四个分类的**文案**与扩展本体一致', () => {
    /* 2026-10-31：「关于提交反馈部分 类别 下拉选择框，选项保持和 插件项目一致」。
     *
     * 值是同一份契约（上一条已钉），但**标签**曾经是两套：官网写
     * 「Something is broken / Licence or payment」，插件写
     * 「Bug / something broke / Purchase or license issue」。同一个人在插件里
     * 提交过一次、又来官网提交，会以为自己看到了两套不同的分类。
     *
     * 真源是扩展的 `public/_locales/<dir>/messages.json` 的
     * `feedbackType{Bug,Feature,Purchase,Other}`。那八份在另一个仓库里，所以
     * 本仓库的快照在 `vendor/_locales/`（见 vendor/payment-config.ts 里对
     * 「快照的边界」的说明）。这里读那八份**真实的资源文件**，不是手抄一份
     * 期望值——手抄的那份会和它一起过期（`prices.test.ts` / `limits.test.ts`
     * 的同一个理由）。
     *
     * 两个项目的语言目录名不一样（`zh-Hans` vs `zh_CN`），映射表见
     * `src/seo/head.ts` 的 OG_LOCALE；这里独立写一份 `Record<Locale, string>`
     * 是因为 OG_LOCALE 的语义是 Open Graph 的 language_TERRITORY，将来若某个
     * 语言的 og 写法与 chrome.i18n 目录名分叉（`es_ES` vs `es`），复用会静默错。
     * 两份都由 `Record<Locale, …>` 保证加语言时漏写是编译错误。 */
    const EXT_DIR: Record<Locale, string> = {
      en: 'en',
      'zh-Hans': 'zh_CN',
      'zh-Hant': 'zh_TW',
      ja: 'ja',
      ko: 'ko',
      es: 'es',
      fr: 'fr',
      de: 'de',
    };
    const KEY = { bug: 'feedbackTypeBug', feature: 'feedbackTypeFeature', purchase: 'feedbackTypePurchase', other: 'feedbackTypeOther' } as const;

    /* 直撇号与弯撇号归一化：插件 `fr` 写 `d'achat`（U+0027），站点写 `d’achat`
     * （U+2019）。站点的 fr 通篇用弯撇号（`Ce qui s’est passé`），为这四个标签
     * 单独换回直撇号会让同一份字典里出现两种撇号。所以保留站点的排印惯例，
     * 比对时归一化——**这是唯一允许的差异**，其余逐字相同。 */
    const norm = (s: string) => s.replace(/[‘’]/g, "'");

    for (const l of LOCALES) {
      const dir = EXT_DIR[l.id];
      const file = join(REPO, 'vendor', '_locales', dir, 'messages.json');
      const messages = JSON.parse(readFileSync(file, 'utf8')) as Record<string, { message: string }>;
      const rendered = formHtml(l.id);

      for (const [value, key] of Object.entries(KEY)) {
        const want = messages[key]?.message;
        expect(want, `扩展的 ${dir}/messages.json 里没有 ${key}`).toBeTruthy();
        // 从渲染结果里取这个 value 对应的 option 文本。
        const m = rendered.match(new RegExp(`<option value="${value}"[^>]*>([^<]*)</option>`));
        expect(m, `${l.id} 的表单里没有 value="${value}" 的 option`).not.toBeNull();
        expect(
          norm(m![1]),
          `${l.id} 的「${value}」标签与扩展不一致：官网「${m![1]}」/ 扩展「${want}」`,
        ).toBe(norm(want));
      }
    }
  });

  it('分类文案是逐语言翻译的，不是八份英文', () => {
    /* 上一条比对的是「与扩展一致」，而如果八门语言都被写成英文，那条照样全绿
     * ——扩展那份也是英文的英文，中文的也是中文的，可官网若整列贴了 en，
     * 每门语言都只跟"自己那份扩展"比，而 en 那份恰好对得上。
     * 所以另加一条只看官网自身：四门语言里至少四种不同的 bug 文案。 */
    const bugs = LOCALES.map((l) => dictFor(l.id).support.form.categories.bug);
    expect(new Set(bugs).size, `八门语言的 bug 标签只有 ${new Set(bugs).size} 种：${bugs.join(' / ')}`).toBeGreaterThan(4);
  });

  it('maxLength 与 handler 的上限对齐', () => {
    /* 对不上的方向是**静默截断**：读者写了 5000 字，浏览器放行，服务端切到
     * 4000，而界面上没有任何提示说末尾丢了。 */
    for (const l of LOCALES) {
      const f = formHtml(l.id);
      expect(f, `${l.id} 的正文上限与 MAX_MESSAGE 不一致`).toContain(
        `maxLength="${handlerNumber('MAX_MESSAGE')}"`,
      );
      expect(f, `${l.id} 的邮箱上限与 MAX_EMAIL 不一致`).toContain(
        `maxLength="${handlerNumber('MAX_EMAIL')}"`,
      );
    }
  });

  it('表单里没有内联 style（CSP 会静默丢弃）', () => {
    /* `style-src 'self'` 管不到 `style=""`——它归 style-src-attr，缺省回落到
     * style-src，于是内联样式被丢掉。本地 file:// 看完全正常（没有头），
     * 部署后全没了，而任何静态检查都不会红。 */
    for (const l of LOCALES) {
      expect(formHtml(l.id), `${l.id} 的表单里有内联 style`).not.toContain('style="');
    }
  });

  it('表单在「报告截图问题」上面', () => {
    /* 位置不是审美：八种语言的 `reportP1` 都以「上面的反馈表单是最快的路径 /
     * The feedback form above is the fastest route」开头。把表单挪到卡片下面
     * 会让那八句话同时变成假话，而页面渲染完全正常。
     *
     * 锚点用 `<h2>{reportTitle}</h2>` 而不是 `indexOf('feedback')`——后者会先
     * 命中卡片上的 `href="#feedback"`，把「表单在哪」判成「按钮在哪」。 */
    for (const l of LOCALES) {
      const html = renderRoute(l.id, 'support').html;
      const title = dictFor(l.id).support.reportTitle;
      const formAt = html.indexOf('<form');
      const reportAt = html.indexOf(`<h2>${title}</h2>`);
      expect(reportAt, `${l.id} 找不到「${title}」这张卡`).toBeGreaterThan(-1);
      expect(formAt, `${l.id} 的反馈表单在报告卡片下面`).toBeLessThan(reportAt);
    }
  });
});

describe('「Email us」卡片不再用地址当按钮文案', () => {
  /* 几何账：`--maxw` 1120px、`.wrap` 左右各 20px 内边距 → 内容宽 1080px；
   * `.grid-3` 三列、`gap: 1.25rem`(20px) → 每列 (1080 − 40) / 3 ≈ 347px；
   * 再减 `.card` 左右各 `1.75rem`(28px) → 内容盒约 291px（更窄的视口只会更小）。
   * `.btn` 左右各 `1.5rem`(24px) 内边距 → 文字区约 243px。
   *
   * 文字是 `0.95rem`(15.2px)、字重 600：拉丁字母平均约 0.52em ≈ 7.9px/格，
   * 全角约 15.2px/格。所以 26 格 ≈ 拉丁 205px / 全角 198px，都在 243px 以内；
   * 而地址是 43 格 ≈ 340px，必然出框——这正是用户看到的那一幕。
   *
   * 26 是**估算**的上界，不是浏览器量出来的排版结果（同 text-width.ts 的口径）。
   * 它的作用是卡住「又拿一长串不可断的东西当按钮」，不是冒充像素级验收。 */
  const MAX_CELLS = 26;

  it('八种语言的按钮文案都不是邮箱地址', () => {
    for (const l of LOCALES) {
      const c = cards(l.id)[0];
      expect(c.href, `${l.id} 的「Email us」不再是 mailto`).toBe(`mailto:${SUPPORT_EMAIL}`);
      expect(c.cta, `${l.id} 的「Email us」按钮文案还是地址本身`).not.toBe(SUPPORT_EMAIL);
      expect(c.cta.includes('@'), `${l.id} 的按钮文案里还有邮箱：${c.cta}`).toBe(false);
    }
  });

  it('三张卡片的按钮文案都在 26 格以内', () => {
    for (const l of LOCALES) {
      for (const [i, c] of cards(l.id).entries()) {
        const w = displayWidth(c.cta);
        expect(w, `${l.id} 第 ${i + 1} 张卡片的按钮有 ${w} 格，会出框：${c.cta}`).toBeLessThanOrEqual(
          MAX_CELLS,
        );
      }
    }
  });

  it('地址没有丢，仍然在 intro 里可点', () => {
    /* 缩短按钮文案之所以不是删功能：`support.intro` 八种语言都把地址渲染成
     * mailto 链接。哪天有人把 intro 改成纯文本，这条要红。
     *
     * **两次收窄都是 mutation 逼出来的。** 第一版断言「页面上有
     * `href="mailto:<地址>"`」——另两张卡本身就是 mailto，intro 改成纯文本它照样绿。
     * 第二版断言「有个链接，文字就是地址」——支持页下半部分的恢复购买卡片
     * （`before` 组）也这么写，还是绿。所以锚点必须收窄到 **page-head 那一块**：
     * 那里只有 intro。 */
    for (const l of LOCALES) {
      const html = renderRoute(l.id, 'support').html;
      const head = html.match(/<header class="page-head">[\s\S]*?<\/header>/)?.[0] ?? '';
      expect(head.length, `${l.id} 的支持页没有 page-head 区块`).toBeGreaterThan(0);
      expect(head, `${l.id} 的 intro 里地址不再可点`).toContain(
        `<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`,
      );
    }
  });
});

describe('「Report a bug」卡片交出的是一张站内表单', () => {
  it('八种语言都滚到本页的表单，不再是外链', () => {
    /* `#feedback` 是 `href()` 原样返回的那种形状，所以在哪门语言、哪一层
     * 深度下都指向这一页自己的表单。写死 `#feedback` 而不是解析出锚点：
     * 改成 `'/api/feedback'` 或某个 workers.dev 地址都要红。 */
    for (const l of LOCALES) {
      const c = cards(l.id)[1];
      expect(c.href, `${l.id} 的「Report a bug」没有指向站内表单`).toBe('#feedback');
      expect(c.attrs, `${l.id} 的「Report a bug」还开着新标签页`).not.toContain('target=');
    }
  });

  it('锚点真的落在一个存在的区块上', () => {
    /* 和 `install-cta.test.ts` 记下的那次同一个形状：锚点写对、目标区块不存在，
     * 点了什么都不发生，而 href 本身看起来完全正确。 */
    for (const l of LOCALES) {
      expect(renderRoute(l.id, 'support').html, `${l.id} 的支持页没有 id="feedback" 区块`).toContain(
        'id="feedback"',
      );
    }
  });

  it('另外两张仍是 mailto，没有被顺带改成新标签页', () => {
    /* 派生规则写成 `external ? {…} : {}` 的意义就在这里：写死成「所有卡片都
     * target=_blank」会让点「写邮件」也开一个空白标签页再交给邮件客户端。 */
    for (const l of LOCALES) {
      for (const c of [cards(l.id)[0], cards(l.id)[2]]) {
        expect(c.href.startsWith('mailto:'), `${l.id} 的 ${c.title} 不再是 mailto`).toBe(true);
        expect(c.attrs.includes('target='), `${l.id} 的 ${c.title} 被改成了新标签页`).toBe(false);
      }
    }
  });

  it('支持页的正文里没有任何绝对 http 链接', () => {
    /* 这一条是 2026-10-30 那次要求的**否定形式**：用户的诉求是「不要跳转到
     * …workers.dev/feedback」，所以最直接的可执行断言是「支持页正文不再指向
     * 任何站外地址」。它比「卡片 href 不等于那个常量」强——常量已经删了，而
     * 有人手打一个新的外链时，只有这条会红。
     *
     * **范围是 `<main>`，不是 `<body>`**（2026-10-31 改）。导航栏有一颗全站
     * 统一的「Add to Chrome」，上架后它指向 Chrome 应用商店——那是这个站的
     * 一个正当出口，不是"又把支持页送出去"。从 `<body>` 起扫会把那一颗也算
     * 进来，八门语言全红，而红的原因跟支持页毫无关系。
     *
     * 只收 `<main>` 也保住了这条断言的**分辨力**：它问的一直是"这一页的正文
     * 里有没有外链"，导航和页脚从来不是它的对象。 */
    for (const l of LOCALES) {
      const html = renderRoute(l.id, 'support').html;
      const m = /<main[^>]*>([\s\S]*)<\/main>/.exec(html);
      // 正则落空说明 App.tsx 的 <main> 被改了；抛出来比拿空串去断言好——空串
      // 会让下面那条 toEqual([]) 永远成立。
      if (!m) throw new Error(`${l.id} 的支持页渲染结果里没有 <main>`);
      const external = [...m[1].matchAll(/href="(https?:[^"]*)"/g)].map((mm) => mm[1]);
      expect(external, `${l.id} 的支持页正文里有站外链接`).toEqual([]);
    }
  });
});

describe('下拉框展开后其余几项看得清（选项底色必须不透明）', () => {
  /* 2026-10-30：「提交反馈 表单部分，类别下拉框中除了已经选到的项，其他项都看不清」。
   *
   * 机制值得写下来，因为它是这个 bug 唯一容易复发的地方：
   *
   * - 收起时只显示**当前选中项**，那一段是控件自己画的，底下就是深色卡片，
   *   所以 `.field-input` 的 `background: rgba(255,255,255,0.04)`（半透明，
   *   压在卡片上才好看）完全没问题。
   * - 展开的那一列是**浏览器画的**，它拿控件的 `background-color` 合成到
   *   **白底**上——半透明白合成完接近纯白，而字色是 `var(--text)` #f8fafc，
   *   于是白底白字。只有选中项还看得清，因为它走的还是控件那条路。
   * - `color-scheme: dark` 救不了：显式写了 background 就以显式值为准。
   *
   * 所以约束不是「给 option 写个好看的色」，而是「**不透明**」。这里判的就是
   * 不透明这一件事：写成 rgba() 半透明、写成 transparent、或者干脆把这条规则
   * 删掉，三种都红。
   *
   * 文本级解析，口径同 `render.test.ts`：按选择器**列表**逐项匹配，不做子串
   * 匹配，先剥注释（注释里写着 `rgba(255,255,255,0.04)` 反例，不剥会自证）。 */
  const CSS = readFileSync(join(HERE, '..', 'public', 'styles.css'), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );

  interface Rule {
    selectors: string[];
    body: string;
  }

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

  /** 取某条规则最后一个声明的值（后写的覆盖先写的）。 */
  function prop(selector: string, name: string): string | undefined {
    const hit = rulesWith(selector);
    if (hit.length === 0) return undefined;
    const all = [...hit[hit.length - 1].body.matchAll(new RegExp(`(?:^|;)\\s*${name}\\s*:\\s*([^;]+)`, 'g'))];
    return all.length === 0 ? undefined : all[all.length - 1][1].trim();
  }

  /** 把 `var(--x)` 就地展开成 `:root` 里的字面量；不是 var() 就原样返回。
   *  只展开一层——这个文件里的 token 没有互相引用的。 */
  function resolve(value: string | undefined): string | undefined {
    if (value === undefined) return undefined;
    const m = value.match(/^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)$/);
    if (!m) return value;
    return prop(':root', m[1]);
  }

  /** 一个颜色值是否**不透明**。判不透明而不是判等于某个色号：需求是
   *  「别让浏览器合成到白底上」，任何不透明深色都满足，钉死色号只会让
   *  下次调色板微调时红一条与缺陷无关的断言。 */
  function isOpaque(color: string | undefined): boolean {
    if (!color) return false;
    const c = color.toLowerCase().replace(/\s+/g, '');
    if (c === 'transparent' || c === 'currentcolor') return false;
    /* rgba()/rgb() 的第四位是 alpha；三位 / 带斜杠的新语法也一并当半透明处理，
     * 这个文件里没有，但漏判的方向是「半透明被当成不透明」，那正是这个 bug。 */
    const fn = c.match(/^(?:rgba|rgb|hsla|hsl|color)\(([^)]*)\)$/);
    if (fn) {
      const parts = fn[1].split(/[,/]/);
      if (parts.length === 4) return Number(parts[3]) >= 1;
      return parts.length === 3;
    }
    if (c.startsWith('#')) {
      /* #RGBA / #RRGGBBAA 的末两位是 alpha。 */
      if (c.length === 5) return c[4] === 'f';
      if (c.length === 9) return c.slice(7) === 'ff';
      return true;
    }
    /* 具名颜色（white / black / …）都不透明。 */
    return true;
  }

  it('option 有自己的一条规则，且底色展开后不透明', () => {
    /* 三种坏写法都落在这条上：规则被删（prop 返回 undefined）、写成
     *  rgba(…)、写成 transparent。 */
    const bg = resolve(prop('.feedback-form .field-input option', 'background-color'));
    expect(
      bg,
      'styles.css 里没有 `.feedback-form .field-input option` 的 background-color——' +
        '下拉框展开后浏览器会把控件的半透明底色合成到白底上，其余几项就看不清了',
    ).toBeDefined();
    expect(isOpaque(bg), `下拉框选项底色 ${bg} 是半透明的，展开后会变成白底白字`).toBe(true);
  });

  it('option 的字色是显式写的，不靠继承', () => {
    /* 有些平台会拿系统色盖掉 option 的继承字色；显式写一遍是唯一稳的写法。
     * 断言它等于 --text：改了字色却不改底色，同样会掉回同色系。 */
    expect(
      resolve(prop('.feedback-form .field-input option', 'color')),
      'option 没有显式 color，或与 --text 不一致',
    ).toBe(prop(':root', '--text'));
  });

  it('两个浏览器画的浮层共用一个不透明 token', () => {
    /* `.lang-menu-list` 是站内另一个「浏览器/绝对定位画的弹层」，它早就有
     *  不透明底色 #0b1120。两份字面量会各自漂移（改一处忘一处），所以两边都
     *  必须引用同一个 token，且这个 token 本身必须不透明——否则「引用了 token」
     *  这条断言会在 token 被改成 rgba 时全绿。 */
    const token = resolve(prop(':root', '--popover-bg'));
    expect(token, ':root 里没有 --popover-bg').toBeDefined();
    expect(isOpaque(token), `--popover-bg 的值 ${token} 不是不透明色`).toBe(true);
    for (const sel of ['.lang-menu-list', '.feedback-form .field-input option']) {
      const bg = prop(sel, 'background');
      const bgc = prop(sel, 'background-color');
      expect(
        [bg, bgc].some((v) => (v ?? '').includes('var(--popover-bg)')),
        `${sel} 的底色没有引用 --popover-bg，站内两个浮层会各写各的颜色`,
      ).toBe(true);
    }
  });
});
