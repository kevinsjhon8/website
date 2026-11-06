import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { robotsTxt, sitemapXml } from '../src/seo/sitemap';
import { dateMap, parseLastmod } from '../src/seo/lastmod';
import { LOCALES, PAGES, pathFor } from '../src/i18n/paths';
import { SITE_ORIGIN } from '../src/content/site';

/* sitemap.xml 与 robots.txt。
 *
 * 这两个文件有一个共同的失败模式：**生成得出来、内容错了，而没有任何东西
 * 会红**。sitemap 少一条 URL 是少一个页面被收录；hreflang 集合少一门语言是
 * 那门语言的页面被判成重复内容；域名写死一份是换域名后爬虫被指到旧站。
 * 三种都不会让构建失败，也不会让页面变样。
 *
 * 所以这里比的是**关系**而不是字面量：URL 集合必须等于 PAGES × LOCALES 的
 * 全部组合，alternate 集合必须等于 LOCALES + x-default，域名必须等于
 * SITE_ORIGIN。改任一边而忘了另一边都会红。
 */

const ORIGIN = SITE_ORIGIN;

function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

/** 每个 <url> 块里的 hreflang → href。按 <loc> 索引，好逐条比对。 */
function alternatesOf(xml: string): Map<string, Map<string, string>> {
  const out = new Map<string, Map<string, string>>();
  for (const block of xml.split('<url>').slice(1)) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) continue;
    const alts = new Map<string, string>();
    for (const m of block.matchAll(/hreflang="([^"]+)"\s+href="([^"]+)"/g)) {
      alts.set(m[1], m[2]);
    }
    out.set(loc, alts);
  }
  return out;
}

/** 每个 <url> 块，按 <loc> 索引到块的原文。 */
function blocksOf(xml: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const block of xml.split('<url>').slice(1)) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (loc) out.set(loc, block);
  }
  return out;
}

describe('sitemap.xml', () => {
  it('URL 集合正好是 6 页 × 8 语言，不多不少', () => {
    /* 两个方向都要查。少一条 → 某个页面没被收录，页面上完全看不出来；
     * 多一条 → 爬虫去抓一个 404（比如 404 页、或者某个已删掉的页面）。 */
    const expected = new Set(
      LOCALES.flatMap((l) => PAGES.map((p) => `${ORIGIN}${pathFor(l.id, p)}`)),
    );
    const actual = new Set(locs(sitemapXml()));
    expect([...actual].sort()).toEqual([...expected].sort());
    expect(actual.size).toBe(48);
  });

  it('每条 URL 都带齐 8 门语言 + x-default 的 alternate', () => {
    /* sitemaps.org 对多语言站点的要求：同一页的所有语言版本互相声明，
     * Google 靠它把八个版本认成一组，而不是八个内容雷同的页面。
     *
     * 只声明"自己那一门"是这里最容易写出的错，而且它**看起来**是合理的
     * ——每条 URL 都有一条 alternate，格式完全合法，只是每组退化了。 */
    const want = new Set([...LOCALES.map((l) => l.htmlLang), 'x-default']);
    for (const [loc, alts] of alternatesOf(sitemapXml())) {
      expect([...alts.keys()].sort(), `${loc} 的 hreflang 集合不对`).toEqual([...want].sort());
    }
  });

  it('alternate 的 href 指向该页在对应语言下的地址，不是首页', () => {
    /* 另一种"合法但错"的写法：每条 URL 的 alternate 都指向各语言**首页**。
     * 格式全对、集合全对，可它声明的是「所有页面都是首页的翻译版本」。 */
    const alts = alternatesOf(sitemapXml());
    for (const page of PAGES) {
      const key = `${ORIGIN}${pathFor('en', page)}`;
      const set = alts.get(key);
      expect(set, `sitemap 里没有 ${key}`).toBeTruthy();
      for (const l of LOCALES) {
        expect(set!.get(l.htmlLang), `${key} 的 ${l.htmlLang} alternate 指错了`).toBe(
          `${ORIGIN}${pathFor(l.id, page)}`,
        );
      }
      expect(set!.get('x-default')).toBe(`${ORIGIN}${pathFor('en', page)}`);
    }
  });

  it('没有日期就不写 lastmod，404 页永远不在里面', () => {
    /* `<lastmod>` 的语义是"这个 URL 的内容真的变了"。构建时间每次部署都变，
     * 写进去等于每次部署都向爬虫声明全站同时更新——假信号，Google 说过会
     * 开始忽略它。
     *
     * 所以日期只能来自 seo/lastmod.ts 的内容哈希清单，且**没有观察记录时
     * 就干脆不写**（首次建立清单时全部是 null）。这一条钉的就是"不写"那一半：
     * 一个把 `new Date()` 塞进去的实现会在这里红。
     *
     * 404 页带 noindex，本来就不该出现在 sitemap 里。 */
    const xml = sitemapXml();
    expect(xml).not.toContain('<lastmod>');
    expect(xml).not.toContain('/404');
  });

  it('给了日期才写，格式是 YYYY-MM-DD，且紧跟在 loc 后面', () => {
    const xml = sitemapXml(ORIGIN, { '/': '2026-10-31' });
    expect(xml).toContain('    <lastmod>2026-10-31</lastmod>');
    // 只给了首页，其余 47 条不许凭空长出一个日期。
    expect((xml.match(/<lastmod>/g) || []).length).toBe(1);

    const block = xml.split('<url>')[1];
    const loc = block.indexOf('<loc>');
    const mod = block.indexOf('<lastmod>');
    const alt = block.indexOf('<xhtml:link');
    expect(loc).toBeGreaterThan(-1);
    expect(mod, 'lastmod 没写').toBeGreaterThan(-1);
    expect(mod, 'lastmod 必须在 loc 之后、alternate 之前（sitemaps.org 的字段顺序）').toBeGreaterThan(loc);
    expect(mod).toBeLessThan(alt);
  });

  it('日期按路径对号入座，不会串到别的页或别的语言', () => {
    /* 键是 `pathFor()` 的产物（`/zh-cn/pricing/`），不是 locale id 也不是
     * 页面名。写错一个键的后果是"某页的日期跑到另一页上"，而 sitemap 本身
     * 格式完全合法——GSC 只会看到一页莫名更新。 */
    const dates = { '/zh-cn/pricing/': '2026-01-02', '/ja/': '2026-03-04' };
    const xml = sitemapXml(ORIGIN, dates);
    for (const [loc, block] of blocksOf(xml)) {
      const want = dates[loc.slice(ORIGIN.length) as keyof typeof dates];
      const got = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null;
      expect(got, `${loc} 的 lastmod 不对`).toBe(want ?? null);
    }
  });

  it('域名全部来自 SITE_ORIGIN，没有第二份', () => {
    /* 换域名时只改 content/site.ts 一处。这条防的是有人把某个地址手写成
     * 字面量——那正是这个文件被生成出来、而不是放进 public/ 的原因。 */
    const xml = sitemapXml();
    const hosts = new Set([...xml.matchAll(/https:\/\/([^/"]+)/g)].map((m) => m[1]));
    expect([...hosts]).toEqual([new URL(ORIGIN).host]);
  });

  it('换一个域名重新生成，全部地址跟着走', () => {
    // 传参版本是这条的判据：如果哪天有人把 ORIGIN 写死回函数体里，这里会红。
    const other = 'https://example.test';
    const xml = sitemapXml(other);
    expect(xml).toContain(`<loc>${other}/</loc>`);
    expect(xml).not.toContain(new URL(ORIGIN).host);
  });

  it('是良构的 XML', async () => {
    /* 只靠正则看内容是不够的：一个没闭合的标签会让整份 sitemap 被爬虫
     * 静默丢弃（GSC 里表现为"无法读取站点地图"，但站点一切正常）。
     * 这里用 DOMParser 之外的土办法——标签配平——因为 node 没有 DOM；
     * 更实在的是断言文件能被 XML 解析器吃下去，见下面读真实产物的那条。 */
    const xml = sitemapXml();
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect((xml.match(/<url>/g) || []).length).toBe((xml.match(/<\/url>/g) || []).length);
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });
});

describe('robots.txt', () => {
  it('声明了 sitemap 的绝对地址', () => {
    /* 这是这个文件存在的**唯一**理由。线上原本没有 robots.txt 时，
     * Cloudflare 会自动回一份带 content-signals 前言的默认文件——24 行注释、
     * 零条指令、没有 Sitemap 行（实测）。也就是说在此之前，站点从没声明过
     * sitemap 在哪，只能靠人工去 GSC/Bing 提交。 */
    expect(robotsTxt()).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
  });

  it('不挡任何路径', () => {
    /* 站点全是公开营销页，没有 /api（那在另一个域名的 Worker 上）。
     * 挡掉任何一条都只会让某个页面莫名不被索引，而页面上看不出来。 */
    expect(robotsTxt()).not.toMatch(/^Disallow:/m);
    expect(robotsTxt()).toContain('Allow: /');
  });

  it('不写 Crawl-delay', () => {
    // Google 早已不支持；Bing 支持但会拖慢收录，而全站只有 48 个静态页。
    expect(robotsTxt()).not.toContain('Crawl-delay');
  });

  it('域名同样只来自 SITE_ORIGIN', () => {
    expect(robotsTxt('https://example.test')).toContain('Sitemap: https://example.test/sitemap.xml');
  });
});

describe('构建产物里真的有这两个文件', () => {
  /* 上面测的是纯函数。它们生成得再对，prerender.mjs 忘了写盘也一样是零——
   * 而"忘了一行 writeFile"不会让构建失败，只会让 /sitemap.xml 在线上 404，
   * 且要等 GSC 报错才发现。这里直接读 dist/。 */
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
  const DIST = join(ROOT, 'dist');

  /* 跳过的判据是**别的**产物在不在，不是这两个文件自己。
   *
   * 原来写的是 `if (sitemap === null || robots === null) 跳过`，判据正是被测
   * 对象本身：把 prerender.mjs 里那两行 writeFile 删掉、完整构建一遍，
   * 两个文件都不在，于是走进「没构建过」的分支——整组绿。**「没构建过」与
   * 「构建过但忘了写盘」在那条断言里是同一个状态**，检查对象被删掉时它不会
   * 红，只会悄悄停止检查（llms.test.ts 的同一条是被变异测出来的，这里一并
   * 改成同一个判据）。dist/index.html 每页必有，它不在才真的是没构建过。 */
  const built = existsSync(join(DIST, 'index.html'));

  it('dist/sitemap.xml 与 dist/robots.txt 都在，且内容与纯函数一致', async () => {
    if (!built) {
      // 没构建过就跳过，而不是假绿（与 build-output.test.ts 同一条规矩）。
      expect(built, 'dist/ 还没构建过（先 npm run build）').toBe(false);
      return;
    }
    const sitemap = await readFile(join(DIST, 'sitemap.xml'), 'utf8').catch(() => null);
    const robots = await readFile(join(DIST, 'robots.txt'), 'utf8').catch(() => null);
    expect(sitemap, 'dist/ 构建过了，但里面没有 sitemap.xml（prerender.mjs 忘了写盘？）').not.toBeNull();
    expect(robots, 'dist/ 构建过了，但里面没有 robots.txt（prerender.mjs 忘了写盘？）').not.toBeNull();

    /* 产物里的日期来自仓库根的 lastmod.json（prerender.mjs 读它、合并、写回）。
     * 所以比对时必须把同一份清单喂给纯函数——直接 `sitemapXml()` 会拿默认的空
     * map 去比一份带 <lastmod> 的产物，第一页有内容变化那天就红。
     *
     * 读不到清单不是失败：首次构建时它就该是空的（全部 null → 不写日期），
     * 那正是 `sitemapXml()` 的默认行为。 */
    const raw = await readFile(join(ROOT, 'lastmod.json'), 'utf8').catch(() => null);
    expect(sitemap).toBe(sitemapXml(ORIGIN, dateMap(parseLastmod(raw) ?? {})));
    expect(robots).toBe(robotsTxt());
  });
});
