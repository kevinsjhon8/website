import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import en from '../src/i18n/en';
import zhHans from '../src/i18n/zh-Hans';
import zhHant from '../src/i18n/zh-Hant';
import ja from '../src/i18n/ja';
import ko from '../src/i18n/ko';
import es from '../src/i18n/es';
import fr from '../src/i18n/fr';
import de from '../src/i18n/de';
import { LOCALES, PAGES, pathFor } from '../src/i18n/paths';
import { absoluteUrl, headHtml, languageLinks } from '../src/seo/head';
import { SITE_ORIGIN, OG_IMAGE_SIZE, PUBLISHER_LOGO, PUBLISHER_LOGO_SIZE, SOFTWARE_VERSION } from '../src/content/site';
import { FREE_AMOUNT, PRICE_AMOUNT } from '../src/content/prices';

/* 每页 <head> 的静态契约。
 *
 * headHtml() 是纯函数，所以这里直接读它的输出，不必跑一遍构建——预渲染只是
 * 把同一段字符串塞进 index.html 的占位符（scripts/prerender.mjs）。
 *
 * 这一组抓的是「页面上看不出来」的那类错：canonical 少一个斜杠、hreflang 漏
 * 一门语言、404 忘了 noindex、JSON-LD 里编了一个不存在的评分。它们全都渲染
 * 得好好的，只有搜索引擎和社交平台看得到差别，而没有任何人会打开页面发现。
 */

const HERE = dirname(fileURLToPath(import.meta.url));
/** 本仓库的根。分仓之后官网源码就是仓库本身，不再有上层目录。 */
const REPO = join(HERE, '..');

const DICTS = { en, 'zh-Hans': zhHans, 'zh-Hant': zhHant, ja, ko, es, fr, de } as const;

/** 从一段 head HTML 里取出某个标签的 content/属性，取不到返回 undefined。 */
function attr(head: string, re: RegExp, group = 1): string | undefined {
  return head.match(re)?.[group];
}

/** 读一张 PNG 的真实尺寸。宽在字节 16-19、高在 20-23，大端序——PNG 规范里
 *  这两个字段的位置是固定的，所以不必解码整张图。
 *
 *  模块级而不是某个 describe 里的局部函数：og:image 与图标两组断言都要用它，
 *  各写一份就是 prices.test.ts 记下的「两个真源」教训。 */
function ihdr(file: string): { width: number; height: number } {
  const b = readFileSync(join(HERE, '..', 'public', file));
  expect(b.subarray(0, 8).toString('hex'), `${file} 不是 PNG`).toBe('89504e470d0a1a0a');
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

describe('JSON-LD 的版本号与真源一致', () => {
  /* softwareVersion 的真源是**扩展**的版本号，而真源那份 package.json 在另一个
   * 仓库里。这里用 `vendor/version.json` 做快照，理由同 vendor/payment-config.ts：
   * 页面上的版本号（content/site.ts 的 SOFTWARE_VERSION）必须和它一致。
   *
   * 分仓带来的边界也同上：这比对不出来「扩展升级了、快照没跟上」。扩展发版时
   * 把新版本号写进 vendor/version.json（与 content/site.ts 的 SOFTWARE_VERSION
   * 同步改），这条断言保证两者不会再分叉。
   *
   * 不同步的后果很具体：结构化数据长期声称一个旧版本，Google 的软件富媒体
   * 结果里显示的版本号就是错的，而站点看起来一切正常。 */
  it('SOFTWARE_VERSION 等于 vendor/version.json 的 version', () => {
    const pkg = JSON.parse(readFileSync(join(REPO, 'vendor', 'version.json'), 'utf8')) as { version?: string };
    expect(pkg.version, 'vendor/version.json 里没有 version').toBeTruthy();
    expect(SOFTWARE_VERSION).toBe(pkg.version);
  });

  it('首页的 JSON-LD 里真的写进去了', () => {
    const head = headHtml(en, 'en', '');
    const m = head.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    expect(m, '首页没有 JSON-LD').not.toBeNull();
    const data = JSON.parse(m![1]) as { softwareVersion?: string };
    expect(data.softwareVersion).toBe(SOFTWARE_VERSION);
  });
});

describe('首页的结构化数据', () => {
  function blocks(locale: (typeof LOCALES)[number]['id'], page: string): unknown[] {
    const head = headHtml(DICTS[locale], locale, page as never);
    return [...head.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
      (m) => JSON.parse(m[1]) as unknown,
    );
  }

  it('没有 aggregateRating', () => {
    /* 评分必须来自真实的用户评价。这个扩展刚上架，商店里还没有一份评分，
     * 编一个会直接显示在搜索结果里，等于对用户声称有人评过。这条断言就是
     * head.ts 里那句注释的执行版本：注释说「刻意没有」，这里让它保持没有。
     *
     * 上架之后依然保留：真实评分该由商店页承载，本站没有任何渠道核实它，
     * 抄一份过来只是把别人的数字写进自己的结构化数据。 */
    const text = JSON.stringify(blocks('en', ''));
    expect(text).not.toContain('aggregateRating');
    expect(text).not.toContain('ratingValue');
    expect(text).not.toContain('reviewCount');
  });

  it('四档价格来自 prices.ts，不写字面量', () => {
    const apps = blocks('en', '').filter(
      (b) => (b as { '@type'?: string })['@type'] === 'SoftwareApplication',
    ) as { offers?: { name: string; price: string; priceCurrency: string }[] }[];
    expect(apps).toHaveLength(1);
    const offers = apps[0].offers!;
    expect(offers.map((o) => o.price)).toEqual([
      FREE_AMOUNT.replace('$', ''),
      PRICE_AMOUNT.monthly.replace('$', ''),
      PRICE_AMOUNT.yearly.replace('$', ''),
      PRICE_AMOUNT.lifetime.replace('$', ''),
    ]);
    for (const o of offers) expect(o.priceCurrency).toBe('USD');
  });

  it('featureList 与页面上的功能卡是同一份', () => {
    /* 两处若各写一份，结构化数据会长期描述一组页面上已经删掉的功能。
     * 断言的是「等于字典里的标题数组」，而不是「长度大于 0」——后者在两边
     * 一起被改成空数组时也是绿的。 */
    const apps = blocks('en', '').filter(
      (b) => (b as { '@type'?: string })['@type'] === 'SoftwareApplication',
    ) as { featureList?: string[] }[];
    expect(apps[0].featureList).toEqual(en.home.features.map((f) => f.title));
    expect(apps[0].featureList!.length).toBeGreaterThanOrEqual(4);
  });

  it('FAQ 页的问答条数等于页面上渲染的条数', () => {
    const faq = blocks('en', 'faq').filter((b) => (b as { '@type'?: string })['@type'] === 'FAQPage') as {
      mainEntity?: { name: string }[];
    }[];
    expect(faq).toHaveLength(1);
    const rendered = en.faq.groups.reduce((n, g) => n + g.items.length, 0);
    expect(faq[0].mainEntity).toHaveLength(rendered);
    // 答案文本非空：nodeText 走查失败时会得到 ''，而空答案在结构化数据里是
    // 「这题没有答案」，比没有这条问答更糟。
    for (const q of faq[0].mainEntity!) expect(q.name.length).toBeGreaterThan(0);
  });

  it('首页的 FAQPage 条数等于首页渲染的那几条', () => {
    /* 首页在 #faq 区块里渲染 dict.home.faq，而那五条里有三条（本地文件、
     * 无限滚动、界面语言）在 /faq/ 页上没有。此前首页一条 FAQPage 都不发，
     * 等于对爬虫隐瞒了最常被搜的三个问题。
     *
     * 断言「等于首页自己的条数」而不是「大于 0」：把 FAQ 页那份数组抄到首页
     * 头上也是大于 0，而那会在首页上声明五条页面上并不存在的问答——Google
     * 对结构化数据与可见内容对不上是按垃圾数据处理的。
     *
     * 同时要求与 FAQ 页的那份**不相等**：两份字典字段本来就不同，若哪天有人
     * 为了省事让首页也读 dict.faq.groups，条数会撞上而内容已经错了。 */
    const home = blocks('en', '').filter(
      (b) => (b as { '@type'?: string })['@type'] === 'FAQPage',
    ) as { mainEntity?: { name: string }[] }[];
    expect(home).toHaveLength(1);
    expect(home[0].mainEntity).toHaveLength(en.home.faq.length);
    expect(home[0].mainEntity!.map((q) => q.name)).toEqual(en.home.faq.map((q) => q.q));

    const faqPage = blocks('en', 'faq').filter(
      (b) => (b as { '@type'?: string })['@type'] === 'FAQPage',
    ) as { mainEntity?: { name: string }[] }[];
    expect(home[0].mainEntity!.map((q) => q.name)).not.toEqual(
      faqPage[0].mainEntity!.map((q) => q.name),
    );
  });

  it('每页的结构化数据类型与它的角色相符', () => {
    /* 往每页都塞一份 FAQPage 是常见的「SEO 优化」，但那等于在定价页上声称
     * 有问答内容，属于垃圾结构化数据。
     *
     * 比的是**类型集合**，不是「有没有 JSON-LD」：加了面包屑之后每页都有
     * 一个 JSON-LD 块，原来那条 `toHaveLength(0)` 就变成了「面包屑不许存在」。
     * 集合比对两个方向都查——多一种（定价页冒出 FAQPage）和少一种（FAQ 页的
     * 面包屑掉了）都会红。 */
    const WANT: Record<string, string[]> = {
      '': ['SoftwareApplication', 'WebSite', 'FAQPage'],
      faq: ['BreadcrumbList', 'FAQPage'],
      pricing: ['BreadcrumbList'],
      support: ['BreadcrumbList'],
      privacy: ['BreadcrumbList'],
      terms: ['BreadcrumbList'],
    };
    for (const page of PAGES) {
      const types = blocks('en', page).map((b) => (b as { '@type'?: string })['@type'] ?? '');
      expect(types.sort(), `${page || '(home)'} 页的结构化数据类型不对`).toEqual(
        [...WANT[page]].sort(),
      );
    }
  });
});

describe('面包屑', () => {
  type Crumb = {
    itemListElement?: { position: number; name: string; item: string }[];
  };

  function crumbs(locale: (typeof LOCALES)[number]['id'], page: string): Crumb | undefined {
    const head = headHtml(DICTS[locale], locale, page as never);
    return [...head.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
      .map((m) => JSON.parse(m[1]) as Crumb & { '@type'?: string })
      .find((b) => b['@type'] === 'BreadcrumbList');
  }

  it('五个子页各两级，地址是该语言下的首页与本页', () => {
    /* 只做两级是因为站点的真实结构就是两级——六个页面全在根下。编一个
     * 「首页 › 产品 › 定价」是伪造结构，Google 会拿它和实际 URL 对，对不上
     * 就是不一致。这条同时钉住"第二级的 item 指向本页而不是首页"：八种语言
     * × 五个页面里，写成首页那种错在英文下看不出来（en 的首页地址恰好是
     * 前缀），只有繁中/日文这类带路径的语言才会露馅。 */
    for (const l of LOCALES) {
      for (const page of ['pricing', 'faq', 'support', 'privacy', 'terms'] as const) {
        const c = crumbs(l.id, page);
        expect(c, `${l.id}/${page} 没有 BreadcrumbList`).toBeTruthy();
        const items = c!.itemListElement!;
        expect(items).toHaveLength(2);
        expect(items.map((i) => i.position)).toEqual([1, 2]);
        expect(items[0].item).toBe(`${SITE_ORIGIN}${pathFor(l.id, '')}`);
        expect(items[1].item).toBe(`${SITE_ORIGIN}${pathFor(l.id, page)}`);
      }
    }
  });

  it('第二级的名字是该语言那个页面自己的 h1', () => {
    /* 用 meta.title 会让面包屑变成「Pricing — Page Screenshot Pro › 定价」，
     * 又长又不像导航。这里逐语言比对 h1，防的是"英文 h1 抄进所有语言"——
     * 那种版本每门语言都有名字，看起来完全正常。
     *
     * 断言写成「等于本语言字典的 h1」而不是「不等于英文」：德语的 Support
     * 和英文拼写相同（是德语自己的词，不是漏翻），拿 en 当反例会在一个正确
     * 的实现上红。逐语言比对同样有分辨力——把 en.support.h1 写死在
     * head.ts 里，其余六门语言会各自红一次。 */
    for (const l of LOCALES) {
      const name = crumbs(l.id, 'support')!.itemListElement![1].name;
      expect(name, `${l.id} 的面包屑名字不是本语言字典里的 h1`).toBe(DICTS[l.id].support.h1);
    }
    // 至少要有几种语言真的不同，否则上面那条在"全部照抄英文"时也是绿的。
    const names = new Set(LOCALES.map((l) => crumbs(l.id, 'support')!.itemListElement![1].name));
    expect(names.size).toBeGreaterThan(4);
  });

  it('首页与 404 不发面包屑', () => {
    // 只有"首页"一条的面包屑没有信息量，Google 对单层面包屑也不展示。
    expect(crumbs('en', '')).toBeUndefined();
    expect(crumbs('en', 'notFound')).toBeUndefined();
  });
});

describe('og:image 的声明与那张 PNG 相符', () => {
  /* og:image:width / :height 只在**第一次分享**时起作用：社交平台拿到它们
   * 就不必先下载图片才知道比例，否则退回 1:1 居中裁切，1200×630 的卡片被
   * 裁成方形、两侧文字被切掉。站内无论怎么刷都看不出来。
   *
   * 断言的是「等于 PNG 的 IHDR」而不是「等于 1200/630」：写死常量的话，
   * 换图之后声明和图片一起错，测试还是绿的。 */

  it('OG_IMAGE_SIZE 等于 og-image.png 的实际尺寸', () => {
    expect(OG_IMAGE_SIZE).toEqual(ihdr('og-image.png'));
  });

  it('每页都声明了 width/height/type/alt', () => {
    for (const page of [...PAGES, 'notFound' as const]) {
      const head = headHtml(en, 'en', page);
      expect(attr(head, /<meta property="og:image:width" content="(\d+)">/)).toBe(
        String(OG_IMAGE_SIZE.width),
      );
      expect(attr(head, /<meta property="og:image:height" content="(\d+)">/)).toBe(
        String(OG_IMAGE_SIZE.height),
      );
      expect(head).toContain('<meta property="og:image:type" content="image/png">');
      // alt 不能为空：空 alt 在图片没加载出来时等于什么都没说。
      const alt = attr(head, /<meta property="og:image:alt" content="([^"]*)">/);
      expect(alt, `${page || '(home)'} 的 og:image:alt 为空`).toBeTruthy();
    }
  });

  it('og:image 指向的确实是仓库里那张图', () => {
    /* 地址里的文件名和 public/ 下的文件名必须对得上。改图名却只改
     * OG_IMAGE 会在发布后 404，而 head 里那行看起来完全正常。 */
    const name = attr(headHtml(en, 'en', ''), /<meta property="og:image" content="[^"]*\/([^/"]*)">/);
    expect(name).toBe('og-image.png');
    expect(() => ihdr(name!)).not.toThrow();
  });

  it('alt 随语言变，不是八份都抄英文', () => {
    // tagline 是各语言自己的句子；照抄英文的话每页仍有 alt，看起来正常。
    const alt = (d: typeof en) => attr(headHtml(d, 'en', ''), /<meta property="og:image:alt" content="([^"]*)">/);
    expect(alt(zhHant)).not.toBe(alt(en));
    const all = [en, zhHans, zhHant, ja, ko, es, fr, de].map(alt);
    expect(new Set(all).size).toBeGreaterThan(4);
  });
});

describe('SoftwareApplication 的 url / inLanguage / publisher.logo', () => {
  type App = {
    url?: string;
    inLanguage?: string;
    publisher?: { logo?: { url?: string; width?: number; height?: number } };
  };

  function app(locale: (typeof LOCALES)[number]['id']): App {
    const head = headHtml(DICTS[locale], locale, '');
    const blocks = [...head.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
      (m) => JSON.parse(m[1]) as App & { '@type'?: string },
    );
    const hit = blocks.find((b) => b['@type'] === 'SoftwareApplication');
    expect(hit, `${locale} 首页没有 SoftwareApplication`).toBeTruthy();
    return hit!;
  }

  it('url 指向本语言的首页，不是英文那份', () => {
    /* 八份首页曾经都写死 `absoluteUrl('en', '')`，于是 zh-tw 页面的结构化
     * 数据声明「我的规范地址是英文首页」——与同页 canonical 自相矛盾。
     *
     * 断言逐语言比对 absoluteUrl(l.id, '')，而不是「不等于英文首页」：后者
     * 在英文那份上永远为假，而英文恰好是唯一一处看不出来的。 */
    for (const l of LOCALES) {
      expect(app(l.id).url, `${l.id} 的 url 不是本语言首页`).toBe(
        `${SITE_ORIGIN}${pathFor(l.id, '')}`,
      );
    }
    // 有分辨力的那一半：八门语言里至少要有几种地址真的不同。
    expect(new Set(LOCALES.map((l) => app(l.id).url)).size).toBeGreaterThan(4);
  });

  it('inLanguage 跟着当前语言走，不是八份都写 en', () => {
    /* SoftwareApplication 没有 hreflang 机制，语言只能靠这一条字段说明；
     * 缺了它，八份内容相近的描述在机器眼里是同一份。
     *
     * 注意这条断言的**分辨力在第二半**：这个仓库里 LOCALES 的 id 与 htmlLang
     * 逐字相同（'zh-Hans' 两边都是 'zh-Hans'），所以「等于 htmlLang」这半句
     * 对写死 `locale` 和写死 `'en'` 的实现都成立——八门语言里只有 en 那一次
     * 会通过。真正能抓住「八份都写 en」的是「集合里有多种值」那一半。 */
    for (const l of LOCALES) {
      expect(app(l.id).inLanguage, `${l.id} 的 inLanguage 不对`).toBe(l.htmlLang);
    }
    expect(new Set(LOCALES.map((l) => app(l.id).inLanguage)).size).toBe(LOCALES.length);
  });

  it('publisher.logo 是绝对地址，指向仓库里真实存在的那张图', () => {
    /* docs/seo.md §8.4 记过：加这个字段时 134 个测试一个都不红——字段写进
     * 去了、没人读、也没有断言，就是这个仓库反复出现的死字段形状。这条断言
     * 是它存在的前提。
     *
     * 地址必须绝对：结构化数据会被别处的爬虫解析，相对路径在那种上下文里
     * 没有基准地址。文件必须存在：改图名只改常量会在发布后 404，而 head
     * 里那行看起来完全正常。 */
    const logo = app('en').publisher?.logo;
    expect(logo, 'SoftwareApplication 没有 publisher.logo').toBeTruthy();
    expect(logo!.url).toBe(PUBLISHER_LOGO);
    expect(logo!.url!.startsWith(SITE_ORIGIN)).toBe(true);

    const name = logo!.url!.split('/').pop()!;
    expect(() => ihdr(name), `public/${name} 不存在`).not.toThrow();
  });

  it('publisher.logo 的宽高等于那张 PNG 的 IHDR', () => {
    /* 与 og:image:width/height 同一个理由：写死常量的话，换图之后声明和图片
     * 一起错，断言还是绿的。真源是 PNG 自己的 IHDR。 */
    const name = PUBLISHER_LOGO.split('/').pop()!;
    expect(PUBLISHER_LOGO_SIZE).toEqual(ihdr(name));
    const logo = app('en').publisher!.logo!;
    expect({ width: logo.width, height: logo.height }).toEqual(ihdr(name));
  });
});

describe('twitter 卡片', () => {
  it('twitter:image:alt 存在，且与 og:image:alt 是同一句', () => {
    /* 少了它卡片在 X 上仍然显示图片，只是没有替代文本——页面上完全看不出
     * 差别，而用读屏器的人拿到的是一张没有说明的图。两处描述的是同一张图，
     * 所以必须同值；各写一份就会在改 tagline 时漏掉一处。 */
    for (const page of [...PAGES, 'notFound' as const]) {
      const head = headHtml(en, 'en', page);
      const ogAlt = attr(head, /<meta property="og:image:alt" content="([^"]*)">/);
      const twAlt = attr(head, /<meta name="twitter:image:alt" content="([^"]*)">/);
      expect(twAlt, `${page || '(home)'} 缺 twitter:image:alt`).toBeTruthy();
      expect(twAlt).toBe(ogAlt);
    }
  });

  it('twitter:image:alt 随语言变，不是八份都抄英文', () => {
    const twAlt = (d: typeof en) =>
      attr(headHtml(d, 'en', ''), /<meta name="twitter:image:alt" content="([^"]*)">/);
    expect(twAlt(zhHant)).not.toBe(twAlt(en));
    const all = [en, zhHans, zhHant, ja, ko, es, fr, de].map(twAlt);
    expect(new Set(all).size).toBeGreaterThan(4);
  });
});

describe('canonical 与 hreflang', () => {
  it('每页每语言的 canonical 都指向自己', () => {
    for (const l of LOCALES) {
      for (const page of PAGES) {
        const head = headHtml(DICTS[l.id], l.id, page);
        const canonical = attr(head, /<link rel="canonical" href="([^"]*)">/);
        expect(canonical, `${l.id}/${page || '(home)'} 没有 canonical`).toBe(
          `${SITE_ORIGIN}${pathFor(l.id, page)}`,
        );
        // 尾斜杠：Cloudflare Pages 把 /pricing 308 到 /pricing/，canonical 若写成
        // 不带斜杠的那份，等于每页都声明一个会重定向的地址。
        expect(canonical!.endsWith('/'), `${canonical} 没有尾斜杠`).toBe(true);
      }
    }
  });

  it('每页都列出全部语言，外加 x-default', () => {
    for (const page of PAGES) {
      const head = headHtml(en, 'en', page);
      const links = [...head.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)">/g)];
      const langs = links.map((m) => m[1]);
      expect(langs.sort()).toEqual([...LOCALES.map((l) => l.htmlLang), 'x-default'].sort());
      // x-default 必须指向默认语言那份：它是「没有匹配语言时给谁看」。
      const xDefault = links.find((m) => m[1] === 'x-default')![2];
      expect(xDefault).toBe(`${SITE_ORIGIN}${pathFor('en', page)}`);
    }
  });

  it('繁中页面的 hreflang 是 zh-Hant，不是 zh', () => {
    // 写成 zh，Google 会把它当成「中文（未指定字形）」，与简体内容混在一起；
    // 浏览器那边则是挑简体字形，把繁体字替换成形近字。
    const head = headHtml(zhHant, 'zh-Hant', 'pricing');
    expect(head).toContain('hreflang="zh-Hant"');
    expect(head).not.toContain('hreflang="zh"');
  });

  it('简中页面的 hreflang 是 zh-Hans，与繁中分开', () => {
    /* 两种中文必须是两条独立的 hreflang。共用一条的话，Google 会把两份
     * 内容当成同一页的重复版本，读者点进去拿到的还可能是另一种字形。 */
    const head = headHtml(zhHans, 'zh-Hans', 'pricing');
    expect(head).toContain('hreflang="zh-Hans"');
    expect(head).toContain('hreflang="zh-Hant"');
    expect(head).not.toContain('hreflang="zh"');
  });

  it('绝对地址都以 SITE_ORIGIN 开头', () => {
    for (const l of LOCALES) {
      expect(absoluteUrl(l.id, 'pricing').startsWith(SITE_ORIGIN)).toBe(true);
    }
  });
});

describe('404 页', () => {
  const head = headHtml(en, 'en', 'notFound');

  it('带 noindex', () => {
    expect(head).toContain('<meta name="robots" content="noindex">');
  });

  it('不带 hreflang 与 canonical 到自己的地址', () => {
    /* 404 没有规范地址。给它一组 hreflang 等于告诉 Google「这是六个语言的
     * 真实页面」，而这六个地址都是 404。canonical 指向站点根是可以的（那是
     * 一种「这个地址不存在」的表示），但不能指向 404 自己。 */
    expect(head).not.toContain('hreflang=');
    const canonical = attr(head, /<link rel="canonical" href="([^"]*)">/);
    expect(canonical).toBe(`${SITE_ORIGIN}/`);
  });

  it('没有结构化数据', () => {
    expect(head).not.toContain('application/ld+json');
  });
});

describe('八门语言的 head 互不相同', () => {
  it('title 与 description 都不同', () => {
    /* 防的是「字典照抄了 en 的 meta」。形状比对（tests/dict.test.ts）只看「有没有
     * 内容」，而 meta 恰好是唯一一处「有内容但可以是英文」的地方：复制过来
     * 编译通过、页面本地化、搜索结果英文。 */
    for (const page of PAGES) {
      const enHead = headHtml(en, 'en', page);
      for (const l of LOCALES) {
        if (l.id === 'en') continue;
        const head = headHtml(DICTS[l.id], l.id, page);
        expect(attr(head, /<title>([^<]*)<\/title>/), `${l.id}/${page || '(home)'} 的 title 与英文相同`).not.toBe(
          attr(enHead, /<title>([^<]*)<\/title>/),
        );
        expect(
          attr(head, /<meta name="description" content="([^"]*)">/),
          `${l.id}/${page || '(home)'} 的 description 与英文相同`,
        ).not.toBe(attr(enHead, /<meta name="description" content="([^"]*)">/));
      }
    }
  });

  it('og:locale 随语言变，alternate 里是别的语言', () => {
    /* og:locale 用 Open Graph 的 language_TERRITORY 写法（zh_TW / en_US），
     * 与 hreflang 的 BCP 47 写法（zh-Hant）不是一套拼法——这正是它必须手写
     * 映射表、不能从 htmlLang 推导的原因。 */
    const zh = headHtml(zhHant, 'zh-Hant', '');
    expect(zh).toContain('<meta property="og:locale" content="zh_TW">');
    expect(zh).toContain('<meta property="og:locale:alternate" content="en_US">');
    const e = headHtml(en, 'en', '');
    expect(e).toContain('<meta property="og:locale" content="en_US">');
    expect(e).toContain('<meta property="og:locale:alternate" content="zh_TW">');

    // 每门语言都有自己的 og:locale，且 alternate 数等于语言数减一。
    const OG: Record<string, string> = {
      en: 'en_US',
      'zh-Hans': 'zh_CN',
      'zh-Hant': 'zh_TW',
      ja: 'ja_JP',
      ko: 'ko_KR',
      es: 'es_ES',
      fr: 'fr_FR',
      de: 'de_DE',
    };
    for (const l of LOCALES) {
      const head = headHtml(DICTS[l.id], l.id, '');
      expect(head, `${l.id} 的 og:locale 不对`).toContain(
        `<meta property="og:locale" content="${OG[l.id]}">`,
      );
      const alts = [...head.matchAll(/<meta property="og:locale:alternate" content="([^"]*)">/g)];
      expect(alts.length, `${l.id} 的 og:locale:alternate 数量不对`).toBe(LOCALES.length - 1);
    }
  });
});

describe('转义', () => {
  it('title/description 里的引号与尖括号不会截断标签', () => {
    /* 字典里的文案含中文引号，但将来可能有人写 " 或 <。一旦漏转义，一个
     * 引号就能让整个 content 属性提前结束，后面的标签被解析成正文。 */
    const fake = {
      ...en,
      meta: { ...en.meta, pricing: { title: 'A "quoted" <title>', description: 'x & y' } },
    };
    const head = headHtml(fake, 'en', 'pricing');
    expect(head).toContain('content="A &quot;quoted&quot; &lt;title&gt;"');
    expect(head).toContain('content="x &amp; y"');
  });

  it('JSON-LD 里的 < 被转义，正文里的 </script> 关不掉脚本块', () => {
    // 答案文本来自字典，字典里本来就有 <code>；万一哪天出现 `</script>`，
    // 未转义的版本会让整段结构化数据变成页面正文。
    const head = headHtml(en, 'en', '');
    const bodies = [...head.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
    expect(bodies.length).toBeGreaterThan(0);
    for (const b of bodies) expect(b[1]).not.toContain('<');
  });
});

describe('语言切换器', () => {
  it('每门语言一条，当前语言标记为 current', () => {
    const links = languageLinks('zh-Hant', 'faq');
    expect(links.map((l) => l.id)).toEqual(LOCALES.map((l) => l.id));
    expect(links.find((l) => l.current)!.id).toBe('zh-Hant');
    // 切语言留在同一页：从 /zh/faq/ 切英文是 /faq/，不是首页。
    expect(links.find((l) => l.id === 'en')!.href).toBe('/faq/');
  });

  it('404 上切语言回首页', () => {
    // 404 没有对应页面；指回另一门语言的 404 只会让人再看到一次 404。
    expect(languageLinks('en', 'notFound').find((l) => l.id === 'zh-Hant')!.href).toBe('/zh-tw/');
  });
});

describe('搜索结果里的图片预览', () => {
  /* 不写 `max-image-preview` 时 Google 按 `standard` 处理，搜索结果里只给默认
   * 小图。对一个卖截图工具的站点，「能不能在 SERP 里显示一张大截图」直接影响
   * 点击率，而这条声明在页面上完全看不见——只有爬虫看得到。 */

  const TAG = '<meta name="robots" content="max-image-preview:large">';

  it('每页每门语言都声明 max-image-preview:large', () => {
    for (const l of LOCALES) {
      for (const page of PAGES) {
        expect(headHtml(DICTS[l.id], l.id, page), `${l.id}/${page || '(home)'} 缺 max-image-preview`).toContain(
          TAG,
        );
      }
    }
  });

  it('404 页没有这一条，且仍然只有 noindex', () => {
    /* 反向断言是必须的：只写「每页都有」的话，一个无条件输出的实现也能通过，
     * 而它会给 404 发一条与 noindex 并列的预览声明——两个指令互相拆台。
     * 这与 settings-e2e 第 10b 步「client 显示、mock 不显示」是同一个道理。 */
    const head = headHtml(en, 'en', 'notFound');
    expect(head).not.toContain('max-image-preview');
    const robots = [...head.matchAll(/<meta name="robots" content="([^"]*)">/g)].map((m) => m[1]);
    expect(robots).toEqual(['noindex']);
  });

  it('值不是 standard 也不是 none', () => {
    // 断言比对的是 `large` 这个值，不是「存在一条 robots meta」——后者在
    // 值被改成 standard 时依然绿，而那正好是这次要修的那件事。
    const head = headHtml(en, 'en', '');
    expect(head).toContain('content="max-image-preview:large"');
    expect(head).not.toContain('max-image-preview:standard');
    expect(head).not.toContain('max-image-preview:none');
  });

  it('内容页的 robots meta 只有预览这一条，没有误加 noindex', () => {
    // noindex 掉一个内容页等于把它从索引里删掉，而页面看上去毫无异常。
    const head = headHtml(en, 'en', 'pricing');
    const robots = [...head.matchAll(/<meta name="robots" content="([^"]*)">/g)].map((m) => m[1]);
    expect(robots).toEqual(['max-image-preview:large']);
  });
});

describe('图标声明与实际文件相符', () => {
  /* 图标这一组全是「点开才看得见」的缺陷，而且都要在**别的设备**上才看得见：
   * 声明 sizes="48x48" 却发了张 96×96，桌面浏览器照常缩放显示，标签页图标
   * 一点异常都没有；只有 Android 装到主屏、iOS「添加到主屏幕」时才露馅。
   *
   * 所以判据是**文件自己的 IHDR**，不是声明里的数字——两边都写在同一个仓库
   * 里读同一个真源，就等于让左眼看右眼。生成器直接把 density: 144 输出成
   * 尺寸，实测过一次五个图标全部翻倍（32/96/360/384/1024），而所有断言当时
   * 都是绿的，因为谁都没去读文件。 */
  const SHELL = readFileSync(join(HERE, '..', 'index.html'), 'utf8');
  const PUBLIC = join(HERE, '..', 'public');

  /** index.html 里所有 <link rel="icon"> / apple-touch-icon / manifest 的 href,
   *  以及 icon 的 sizes 属性。 */
  function iconLinks(): { rel: string; href: string; sizes?: string }[] {
    return [...SHELL.matchAll(/<link\b([^>]*)>/g)]
      .map((m) => m[1])
      .filter((a) => /\brel="(?:icon|apple-touch-icon|manifest)"/.test(a))
      .map((a) => ({
        rel: a.match(/\brel="([^"]*)"/)![1],
        href: a.match(/\bhref="([^"]*)"/)![1],
        sizes: a.match(/\bsizes="([^"]*)"/)?.[1],
      }));
  }

  it('apple-touch-icon 是 180x180', () => {
    /* iOS 的规范尺寸就是 180×180。原来那张是 128×128，iOS 放大到 180 之后
     * 发虚——而这个缺陷**只在 iOS 的「添加到主屏幕」里看得见**，桌面浏览器
     * 根本不加载 apple-touch-icon。 */
    const link = iconLinks().find((l) => l.rel === 'apple-touch-icon');
    expect(link, 'index.html 里没有 apple-touch-icon').toBeTruthy();
    expect(ihdr(link!.href.replace(/^\//, ''))).toEqual({ width: 180, height: 180 });
  });

  it('每个 icon 声明的 sizes 与文件真实尺寸一致', () => {
    /* 声明写 48 而文件是 96，浏览器仍会用它，只是挑图的逻辑错了（它按声明
     * 判断"这张够不够大"）；反过来声明 96 而文件是 48，Chrome 会缩放一张小图
     * 去填 96×96 的槽，糊得看得见。 */
    const icons = iconLinks().filter((l) => l.rel === 'icon');
    expect(icons.length, 'index.html 里一个 favicon 都没有').toBeGreaterThanOrEqual(2);
    for (const l of icons) {
      expect(l.sizes, `${l.href} 没写 sizes`).toBeTruthy();
      const actual = ihdr(l.href.replace(/^\//, ''));
      expect(l.sizes, `${l.href} 声明 ${l.sizes}，实际 ${actual.width}×${actual.height}`).toBe(
        `${actual.width}x${actual.height}`,
      );
    }
  });

  it('index.html 有 <link rel="manifest">', () => {
    /* 没有它，Android Chrome 的「添加到主屏幕」拿不到 name / theme_color /
     * 192-512 的图标，只能退回 favicon——装出来的图标是 48px 放大的一团糊。
     * 单独一条断言是因为 manifest 文件本身完全正确也可以根本没人引用。 */
    expect(iconLinks().some((l) => l.rel === 'manifest' && l.href === '/site.webmanifest')).toBe(true);
  });

  it('site.webmanifest 能解析，且字段是我们要的那几个', () => {
    /* JSON.parse 抛错是这条最便宜的价值：一个尾逗号就让整份 manifest 被浏览器
     * 静默忽略（不报错、不显示，只是不生效）。 */
    const raw = readFileSync(join(PUBLIC, 'site.webmanifest'), 'utf8');
    const m = JSON.parse(raw) as {
      name?: string; short_name?: string; start_url?: string;
      display?: string; theme_color?: string; icons?: { src: string; sizes: string; type: string; purpose?: string }[];
    };
    expect(m.name).toBeTruthy();
    expect(m.short_name, 'short_name 会显示在主屏图标下面，必须有').toBeTruthy();
    expect(m.start_url).toBe('/');
    expect(m.display).toBe('standalone');
    // theme_color 与 index.html 的 <meta name="theme-color"> 必须同一个色，
    // 否则 Android 的标题栏与页面顶色对不上。
    const metaColor = attr(SHELL, /<meta name="theme-color" content="([^"]*)">/);
    expect(m.theme_color).toBe(metaColor);
    expect(m.icons?.length, 'manifest 里没有图标').toBeGreaterThanOrEqual(2);
  });

  it('manifest 里的图标都指向真实文件，且尺寸对得上', () => {
    const m = JSON.parse(readFileSync(join(PUBLIC, 'site.webmanifest'), 'utf8')) as {
      icons: { src: string; sizes: string }[];
    };
    for (const icon of m.icons) {
      const actual = ihdr(icon.src.replace(/^\//, ''));
      expect(icon.sizes, `${icon.src} 声明 ${icon.sizes}，实际 ${actual.width}×${actual.height}`).toBe(
        `${actual.width}x${actual.height}`,
      );
    }
  });

  it('有一个 maskable 图标，且它是满幅不透明的', () => {
    /* Android 会把 maskable 图标裁成圆形/水滴形，只保证中间 80% 可见。
     * 拿一张带透明圆角的图去当 maskable，四个角被切出来的是透明（渲染成
     * 黑或白，看系统），看起来像图标缺了角。
     *
     * 这里只能验到"文件存在且尺寸够大"——像素级的不透明度检查要求把 PNG
     * 解出来（zlib + 反滤波），在这个项目的测试里不值得。生成器那一侧
     * （scripts/gen-site-images.mjs 的 maskableSvg）才是真正的保证：它画的是
     * 一个满幅 <rect>，几何上不可能有透明像素。 */
    const m = JSON.parse(readFileSync(join(PUBLIC, 'site.webmanifest'), 'utf8')) as {
      icons: { src: string; sizes: string; purpose?: string }[];
    };
    const maskable = m.icons.filter((i) => i.purpose?.split(/\s+/).includes('maskable'));
    expect(maskable.length, 'manifest 里没有 purpose: maskable 的图标').toBeGreaterThan(0);
    for (const icon of maskable) {
      const actual = ihdr(icon.src.replace(/^\//, ''));
      // 512 是 Chrome 的推荐下限；192 的图在 1080p 主屏上会被放大到看得见糊。
      expect(Math.min(actual.width, actual.height)).toBeGreaterThanOrEqual(512);
    }
  });
});

describe('sameAs 与 offers 的 url / availability（2026-10-31 上架后补的）', () => {
  /* docs/seo.md §14.6 的两条待办，在扩展真上架那天做掉：
   *   - `SoftwareApplication.sameAs` 填商店详情页地址；
   *   - 每条 `offers[]` 补 `url` 指向商店 + `availability: InStock`。
   *
   * 两条共性都是「字段被加进去之后就没人再读它」——这个仓库反复出现的死字段
   * 形状（`expired`、`publisher.logo`）。所以两条都有断言，而且断言的不是
   * 「存在」：一个指向本站首页的 sameAs 在任何"有没有"检查里都绿，但它声明的
   * 是「我和我自己是同一个实体」，等于什么都没说。 */

  type App = {
    sameAs?: string[];
    offers?: { url?: string; availability?: string }[];
  };

  function app(locale: (typeof LOCALES)[number]['id']): App {
    const head = headHtml(DICTS[locale], locale, '');
    const blocks = [...head.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
      (m) => JSON.parse(m[1]) as App & { '@type'?: string },
    );
    const hit = blocks.find((b) => b['@type'] === 'SoftwareApplication');
    if (!hit) throw new Error(`${locale} 首页没有 SoftwareApplication`);
    return hit;
  }

  /** 商店地址的**字面量副本**。与 `install-cta.test.ts` 同一个理由：被检查的
   *  东西就是地址本身时，从 `content/site.ts` 读期望值等于没检查。 */
  const STORE_URL =
    'https://chromewebstore.google.com/detail/page-screenshot-pro/bjmglonhfpengikcjhcajojcdadggjkb';

  it('sameAs 是绝对地址，且指向 Chrome 应用商店（不是本站）', () => {
    /* 三条，各管一类错：
     *   1 绝对地址 —— 结构化数据会被别处的爬虫解析，相对路径在那里没有基准；
     *   2 主机是商店 —— 只断言"存在"或"以 https 开头"，对着一个指向本站首页
     *     或者随便哪个域名的 sameAs 都是绿的；
     *   3 不是本站 —— 2 已经蕴含，但单独写出来是因为它是这个字段唯一的失败
     *     形态：有人为了"让它别是空数组"随手填了 SITE_ORIGIN。 */
    const sameAs = app('en').sameAs;
    expect(Array.isArray(sameAs) && sameAs.length > 0, 'SoftwareApplication 没有 sameAs').toBe(true);
    for (const url of sameAs!) {
      expect(url.startsWith('https://'), `sameAs「${url}」不是绝对地址`).toBe(true);
      const host = new URL(url).host;
      expect(
        host === 'chromewebstore.google.com' || host === 'chrome.google.com',
        `sameAs「${url}」指向 ${host}，不是 Chrome 应用商店`,
      ).toBe(true);
      expect(url.startsWith(SITE_ORIGIN), `sameAs「${url}」指向了本站自己`).toBe(false);
    }
    // 地址就是那颗按钮的地址：两处各写一份的话，改了按钮忘了结构化数据，
    // 搜索结果里那条链接会指向一个已经不存在的列表。
    expect(sameAs).toContain(STORE_URL);
  });

  it('每条 offer 都有 url 与 InStock', () => {
    const offers = app('en').offers!;
    expect(offers).toHaveLength(4);
    for (const o of offers) {
      expect(o.url, `一条 offer 没有 url：${JSON.stringify(o)}`).toBe(STORE_URL);
      expect(o.availability, `一条 offer 没有 availability：${JSON.stringify(o)}`).toBe(
        'https://schema.org/InStock',
      );
    }
  });
});
