import { describe, expect, it } from 'vitest';
import { renderRoute } from '../src/entry-server';
import { LOCALES, PAGES, type Locale, type Page } from '../src/i18n/paths';
import { displayWidth } from '../src/seo/text-width';

/* 全站「安装」类按钮的**交付物**：按钮说什么、点了去哪。
 *
 * 2026-10-29 这一组是为「还没上架」写的——按钮曾写着「Add to Chrome」而点进去
 * 只有一个「留邮箱」的区块。2026-10-31 扩展真的上架了，要求变成
 * 「site更新，插件下载地址是 https://chromewebstore.google.com/detail/…」，
 * 于是**同一条规矩反了个方向**：按钮现在必须承诺能装，而且必须真的落在那条
 * 列表上。上架前的反面断言（不许出现「Add to Chrome」）随之删除——留着它，
 * 修好之后它反过来红。
 *
 * 为什么这些标签必须有检查：它们在 `src/i18n/*.tsx` 里是**纯字符串**，
 * `tsc` 只保证键存在，`dict.test.ts` 只比对八份字典的**形状**（八份一起写错
 * 就一致了），`site-e2e.mjs` 比对线上与本地是否一致（两边一起错它就绿）。
 * 没有任何东西知道那句话**说了什么**，也没有任何东西知道那颗按钮**去了哪**。
 *
 * 断言分工，各管一类失败：
 *   1 数量 —— 按钮被删掉、或选择器改到匹配不上时，下面全是空集合，永远成立。
 *     所以数量对不上要**抛**，不是 expect。
 *   2 落点 —— 每一颗的 href 逐字等于商店地址。写成「以 https 开头」不够：
 *     那样指向本站或指向另一个扩展的地址也过。
 *   3 文案带安装动作 —— 否则「把标签清空」也能过 1、2。
 *   4 清掉的上架标记一处都不剩 —— 页面**正文**里也不许再有「还没上架」的
 *     说法。只查按钮会漏掉段落里的旧句子（`installBody` 正是这样一句）。
 *   5 八门语言各说各的，没有把英文抄过去。
 *   6 宽度 —— 导航栏 64px 固定高，长标签会换行把它撑破。 */

/** 商店地址的**字面量副本**。刻意不从 `content/site.ts` 读：被检查的东西就是
 *  地址本身时，从同一个常量读期望值等于没检查——常量打错一个字符，组件和
 *  断言一起错，照样绿。同 `dict.test.ts` 的 ABOVE/BELOW、
 *  `feedback-url.test.ts` 的 MAX_CELLS，以及 `prices.test.ts` 读
 *  `payment-config.ts` 原文的理由。 */
const STORE_URL =
  'https://chromewebstore.google.com/detail/page-screenshot-pro/bjmglonhfpengikcjhcajojcdadggjkb';

/** 每门语言「装上它」的那个动词。手写，理由同上：被检查的是措辞本身。
 *  有的语言导航用短动词、正文用长动词（es 的 Instalar / Añadir），所以一个
 *  语言可以有多个合法标记，命中任意一个即可——清单本身仍然是手写的第二份
 *  表达，不是从字典里读回来的回声。 */
const INSTALL_VERB: Record<Locale, string[]> = {
  en: ['Add to Chrome'],
  'zh-Hans': ['添加到 Chrome'],
  'zh-Hant': ['加到 Chrome'],
  ja: ['Chrome に追加'],
  ko: ['Chrome에 추가'],
  es: ['Instalar', 'Añadir a Chrome'],
  fr: ['Installer', 'Ajouter à Chrome'],
  de: ['Installieren', 'Zu Chrome hinzufügen'],
};

/** 上架前的那套说法，现在**一处都不许剩**。反面表——与 2026-10-29 那版正好
 *  互换。它管的是「改了按钮、忘了段落」：`installBody` 里那句「还没上架，
 *  正在最后一轮审核」在页面上读起来很正常，只是它是假的。 */
const COMING_SOON: Record<Locale, string[]> = {
  en: ['Coming soon', 'not listed', 'not yet'],
  'zh-Hans': ['即将上架', '还没上架', '尚未上架'],
  'zh-Hant': ['即將上架', '還沒上架', '尚未上架'],
  ja: ['近日公開', 'まだ Chrome ウェブストアに公開されて'],
  ko: ['출시 예정', '아직 Chrome 웹 스토어에 등록되지'],
  es: ['Próximamente', 'todavía no está publicada'],
  fr: ['Bientôt —', "n’est pas encore référencée"],
  de: ['Demnächst', 'noch nicht im Chrome Web Store gelistet'],
};

/* 宽度上界。导航栏是 `position: fixed; height: 64px`，里面已有品牌、四个链接
 * 和语言切换器，而 `.btn` 全文件没有 `white-space: nowrap`——长标签会换行把
 * 按钮撑高，撑出那 64px。实测最长的是 en / zh-Hans / ja / ko 的 13 格与
 * de 的 12 格，完整形态最长是 de 的 20 格。用 `displayWidth` 而不是
 * `.length`——中文一字符两格，按字符数卡阈值的话中文永远"够短"
 * （同 text-width.ts 的说明，那里是唯一一份实现）。 */
const NAV_MAX_CELLS = 14;
const CTA_MAX_CELLS = 26;

interface Cta {
  cls: string;
  href: string;
  label: string;
}

/** 渲染一页并取出所有指向商店的按钮。
 *
 *  正则要求 `class` 在 `href` 之前——属性顺序变了就一条都匹配不到，所以下面
 *  第一条断言是**数量**，不是「存在」。 */
function installCtas(locale: Locale, page: Page | 'notFound'): Cta[] {
  const html = renderRoute(locale, page).html;
  return [...html.matchAll(/<a class="([^"]*)" href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)]
    .filter((m) => m[2] === STORE_URL)
    .map((m) => ({ cls: m[1], href: m[2], label: m[3] }));
}

/** 导航栏那一颗（`.btn-sm`），其余是正文里的。 */
const isNav = (c: Cta) => c.cls.split(/\s+/).includes('btn-sm');

const ALL_PAGES = [...PAGES, 'notFound'] as const;

describe('全站安装按钮的数量与落点', () => {
  it('每页都有导航那一颗，首页与价格页另有正文按钮', () => {
    /* 首页：导航 + hero + Free 套餐卡 + install 区块的主按钮 = 4
     * 价格页：导航 + Free 套餐卡 = 2（价格页**没有** hero 与 install 区块）
     * 其余页面（含 404）：只有导航 = 1
     *
     * 数字对不上就抛——空集合会让下面所有断言恒真，而「按钮没了」恰恰是最
     * 容易发生的回归（删一个区块、改一次类名、或者把 href 写成别的值）。 */
    const extra: Record<string, number> = { '': 3, pricing: 1 };
    for (const l of LOCALES) {
      for (const page of ALL_PAGES) {
        const ctas = installCtas(l.id, page);
        const want = 1 + (extra[page] ?? 0);
        if (ctas.length !== want) {
          throw new Error(
            `${l.id} 的 ${page || '(home)'} 页有 ${ctas.length} 个安装按钮，期望 ${want} 个：` +
              JSON.stringify(ctas.map((c) => c.label)),
          );
        }
        // 导航那一颗在每一页都有且只有一颗；.btn-sm 若换了类名，这里会红。
        expect(ctas.filter(isNav).length, `${l.id}/${page || '(home)'} 的导航按钮数不对`).toBe(1);
      }
    }
  });

  it('每一颗都指向那条商店列表，不是别处', () => {
    /* 逐字比较而不是「以 https 开头」：后者对指向本站、指向别的扩展、或者
     * 少一位 id 的地址全部成立，而那三种都是「点了装不上」。
     *
     * 上半段先确认**首页确实还有 install 区块**：那个区块现在没有任何按钮
     * 指向它（四颗全部直达商店），但它是正文里解释"从哪装、怎么升级"的那
     * 一段，删掉之后首页就只剩一排按钮。断言它还在，是防"顺手把整段删了"。 */
    for (const l of LOCALES) {
      if (!renderRoute(l.id, '').html.includes('id="install"')) {
        throw new Error(`${l.id} 的首页没有 id="install" 区块了`);
      }
    }
    for (const l of LOCALES) {
      for (const page of ALL_PAGES) {
        for (const c of installCtas(l.id, page)) {
          expect(c.href, `${l.id}/${page || '(home)'} 的「${c.label}」没指向商店`).toBe(STORE_URL);
        }
      }
    }
  });
});

describe('全站安装按钮的文案', () => {
  it('每一颗都在说「装上它」', () => {
    for (const l of LOCALES) {
      const marks = INSTALL_VERB[l.id];
      for (const page of ALL_PAGES) {
        for (const c of installCtas(l.id, page)) {
          expect(
            marks.some((m) => c.label.includes(m)),
            `${l.id}/${page || '(home)'} 的按钮「${c.label}」没有一个安装动词（${marks.join(' / ')}）`,
          ).toBe(true);
        }
      }
    }
  });

  it('全站正文里一处「即将上架」都不剩', () => {
    /* 只查按钮会漏掉段落：`installBody` 曾写「这个扩展程序还没上架 Chrome
     * 应用商店，目前正在最后一轮审核」，换成上架后的文案时最容易只改按钮。
     * 所以扫的是整页渲染结果——它同时覆盖按钮、install 区块、FAQ 与方案卡
     * 里任何一处提到"上架"的句子。
     *
     * 扫全文而不是 `<main>`：导航与页脚同样不该再说没上架。 */
    for (const l of LOCALES) {
      for (const page of ALL_PAGES) {
        const html = renderRoute(l.id, page).html;
        for (const mark of COMING_SOON[l.id]) {
          expect(
            html.includes(mark),
            `${l.id}/${page || '(home)'} 的页面上还留着上架前的说法「${mark}」`,
          ).toBe(false);
        }
      }
    }
  });

  it('八种语言各说各的，没有把英文抄过去', () => {
    /* 反向断言。上面几条只说「含本语言的动词」，而把 en 的整句复制到 zh-Hans
     * 也满足它们——那正是 `dict.test.ts` 用简体/繁体字表在防的事，只是这里防
     * 的是别的语言。所以要求：**一门语言的按钮里不许出现另一门语言的标记**。
     *
     * 一个必要的豁免，而且是实测出来的：zh-Hans 的「添加到 Chrome」**包含**
     * zh-Hant 的「加到 Chrome」——不是抄错，是中文本身就这么叠。同语系的写法
     * 天然互相包含，把它算成"抄过去了"只会让这条断言在正确的文案上永久红。
     *
     * 判据因此写成「别的语言的标记是不是本语言标记的子串」：是就跳过（包含
     * 关系是语言性质，不是复制痕迹），不是就必须真的查。跨语系抄袭——比如把
     * 'Add to Chrome' 贴进 zh-Hans——两种标记谁也不包含谁，照样红。 */
    for (const l of LOCALES) {
      for (const other of LOCALES) {
        if (other.id === l.id) continue;
        for (const page of ALL_PAGES) {
          for (const c of installCtas(l.id, page)) {
            for (const mark of INSTALL_VERB[other.id]) {
              const inherent = INSTALL_VERB[l.id].some((own) => own.includes(mark));
              if (inherent) continue;
              expect(
                c.label.includes(mark),
                `${l.id} 的按钮里出现了 ${other.id} 的说法「${mark}」`,
              ).toBe(false);
            }
          }
        }
      }
    }
  });

  it('标签短到不会把导航撑高', () => {
    for (const l of LOCALES) {
      for (const page of ALL_PAGES) {
        for (const c of installCtas(l.id, page)) {
          const max = isNav(c) ? NAV_MAX_CELLS : CTA_MAX_CELLS;
          const w = displayWidth(c.label);
          expect(
            w,
            `${l.id}/${page || '(home)'} 的按钮「${c.label}」占 ${w} 格，超过 ${max} 格`,
          ).toBeLessThanOrEqual(max);
        }
      }
    }
  });
});
