import { describe, expect, it } from 'vitest';
import {
  LASTMOD_VERSION,
  contentHash,
  currentHashes,
  dateMap,
  mergeLastmod,
  parseLastmod,
  restampedPaths,
  serializeLastmod,
  type LastmodFile,
} from '../src/seo/lastmod';
import { LOCALES, PAGES, pathFor } from '../src/i18n/paths';

/* sitemap 的 `<lastmod>` 清单。
 *
 * 这一组钉的不是"能算出日期"，而是**日期只在内容真的变了时才动**。那个区别
 * 是整件事的全部价值：一个每次构建都盖今天日期的实现同样能通过"sitemap 里有
 * lastmod"这种断言，而它正是这个功能要避免的假信号。所以下面每一条都在问
 * "什么时候不该变"。
 *
 * 这些函数是纯的（`today` 是参数不是 `Date.now()`），所以能在这里跑，不需要
 * 构建。prerender.mjs 与这里共用同一份实现——它只从 SSR bundle 里拿。
 */

const TODAY = '2026-10-31';

/** 一份"上次构建"的清单：两页，一页有日期、一页观察过但没变过。 */
const PREV: LastmodFile = {
  '/': { hash: 'aaaaaaaaaaaaaaaa', date: '2026-01-01' },
  '/pricing/': { hash: 'bbbbbbbbbbbbbbbb', date: null },
};

describe('contentHash', () => {
  it('同样的输入永远给同样的结果', () => {
    /* 这条看着废话，但它是"日期不前进"的前提：只要渲染是确定性的（站点里
     * 没有任何 new Date / Date.now，实测），同一份内容两次构建就该给同一个
     * 哈希，否则每次构建 48 页全部重盖日期，等于绕回构建时间那个错误。 */
    expect(contentHash('<p>hi</p>', '<title>x</title>')).toBe(contentHash('<p>hi</p>', '<title>x</title>'));
  });

  it('正文变了就变，head 变了也变', () => {
    const base = contentHash('<p>hi</p>', '<title>x</title>');
    expect(contentHash('<p>hi!</p>', '<title>x</title>'), '正文改动没被发现').not.toBe(base);
    expect(contentHash('<p>hi</p>', '<title>y</title>'), 'head 改动没被发现').not.toBe(base);
  });

  it('head 与 html 的拼接不会互相抵消', () => {
    /* 用 `\u0000` 分隔而不是直接相加，否则 ("ab","c") 与 ("a","bc") 会撞成
     * 同一个哈希——两页恰好这么错位一次，日期就会互串。 */
    expect(contentHash('c', 'ab')).not.toBe(contentHash('bc', 'a'));
  });

  it('是 16 位十六进制', () => {
    // 长度写进清单格式（HASH_RE），parseLastmod 会据此丢掉坏条目。
    expect(contentHash('', '')).toMatch(/^[0-9a-f]{16}$/);
  });
});

describe('parseLastmod', () => {
  it('没有文件是 null，不是空清单', () => {
    /* `null` 与 `{}` 的区别是有意义的：前者是"从没观察过"，后者是"观察过，
     * 但现在一页都没有"。mergeLastmod 靠它决定首建时该给 null 还是今天。 */
    expect(parseLastmod(null)).toBeNull();
  });

  it('坏 JSON、坏版本、坏形状一律当没有', () => {
    /* 清单是记账不是凭据：一个手改坏的文件不该让整次构建失败。最坏的结果是
     * 少声明一次更新，而不是整站发不出去。 */
    expect(parseLastmod('{not json')).toBeNull();
    expect(parseLastmod('[]')).toBeNull();
    expect(parseLastmod('null')).toBeNull();
    expect(parseLastmod(JSON.stringify({ version: LASTMOD_VERSION + 1, entries: {} }))).toBeNull();
    expect(parseLastmod(JSON.stringify({ version: LASTMOD_VERSION }))).toBeNull();
  });

  it('逐条校验，坏的丢掉、好的留下', () => {
    const raw = JSON.stringify({
      version: LASTMOD_VERSION,
      entries: {
        '/': { hash: 'aaaaaaaaaaaaaaaa', date: '2026-01-01' },
        '/null-date/': { hash: 'bbbbbbbbbbbbbbbb', date: null },
        '/bad-hash/': { hash: 'xyz', date: '2026-01-01' },
        '/bad-date/': { hash: 'cccccccccccccccc', date: '2026/01/01' },
        '/not-object/': 'nope',
      },
    });
    expect(parseLastmod(raw)).toEqual({
      '/': { hash: 'aaaaaaaaaaaaaaaa', date: '2026-01-01' },
      '/null-date/': { hash: 'bbbbbbbbbbbbbbbb', date: null },
    });
  });

  it('写出去再读回来是同一份', () => {
    expect(parseLastmod(serializeLastmod(PREV))).toEqual(PREV);
  });
});

describe('mergeLastmod', () => {
  it('首次建立清单时全部是 null，一个日期都不编', () => {
    /* 这是"引入这个功能的那次部署，sitemap 与之前逐字节相同"的实现基础。
     * 那一刻我们确实不知道这些页面是什么时候变的——写今天就是编。 */
    const out = mergeLastmod(null, { '/': 'aaaaaaaaaaaaaaaa', '/pricing/': 'bbbbbbbbbbbbbbbb' }, TODAY);
    expect(out).toEqual({
      '/': { hash: 'aaaaaaaaaaaaaaaa', date: null },
      '/pricing/': { hash: 'bbbbbbbbbbbbbbbb', date: null },
    });
  });

  it('哈希没变就沿用旧日期——哪怕今天是另一个日子', () => {
    /* 这条是核心。改了别的页面、或者根本没改内容而重新部署，这一页的日期
     * 都不许动。一个用 `today` 无条件覆盖的实现会在这里红。 */
    const out = mergeLastmod(PREV, { '/': 'aaaaaaaaaaaaaaaa', '/pricing/': 'bbbbbbbbbbbbbbbb' }, '2026-12-25');
    expect(out['/'].date).toBe('2026-01-01');
    expect(out['/pricing/'].date).toBeNull();
  });

  it('哈希变了才换成今天', () => {
    const out = mergeLastmod(PREV, { '/': 'dddddddddddddddd', '/pricing/': 'bbbbbbbbbbbbbbbb' }, TODAY);
    expect(out['/']).toEqual({ hash: 'dddddddddddddddd', date: TODAY });
    // 邻居不受牵连：只有变了的那一页重盖。
    expect(out['/pricing/'].date).toBeNull();
  });

  it('清单里没有的路径算新页面，给今天', () => {
    const out = mergeLastmod(PREV, { '/': 'aaaaaaaaaaaaaaaa', '/faq/': 'eeeeeeeeeeeeeeee' }, TODAY);
    expect(out['/faq/']).toEqual({ hash: 'eeeeeeeeeeeeeeee', date: TODAY });
  });

  it('本次没渲染的路径被丢掉，不留下指向不存在地址的记录', () => {
    const out = mergeLastmod(PREV, { '/': 'aaaaaaaaaaaaaaaa' }, TODAY);
    expect(Object.keys(out)).toEqual(['/']);
  });

  it('输出按键排序，两次构建的 diff 只反映真实变化', () => {
    const out = mergeLastmod(null, { '/z/': '1111111111111111', '/a/': '2222222222222222' }, TODAY);
    expect(Object.keys(out)).toEqual(['/a/', '/z/']);
  });

  it('日期格式不对直接抛错，而不是写进 sitemap', () => {
    // 一个 `2026/10/31` 会让整份 sitemap 在爬虫那边被判格式错，而本地全绿。
    expect(() => mergeLastmod(null, { '/': 'aaaaaaaaaaaaaaaa' }, '2026/10/31')).toThrow(/YYYY-MM-DD/);
  });
});

describe('serializeLastmod / dateMap / restampedPaths', () => {
  it('序列化带版本号、排序、末尾换行', () => {
    const text = serializeLastmod({ '/z/': { hash: '1111111111111111', date: null }, '/a/': { hash: '2222222222222222', date: null } });
    expect(text.endsWith('\n')).toBe(true);
    expect(text.indexOf('"/a/"')).toBeLessThan(text.indexOf('"/z/"'));
    expect(JSON.parse(text).version).toBe(LASTMOD_VERSION);
  });

  it('dateMap 丢掉 null，sitemap 因此不写那一行', () => {
    expect(dateMap(PREV)).toEqual({ '/': '2026-01-01' });
  });

  it('restampedPaths 只报日期真的动了的页', () => {
    const next = mergeLastmod(PREV, { '/': 'dddddddddddddddd', '/pricing/': 'bbbbbbbbbbbbbbbb' }, TODAY);
    expect(restampedPaths(PREV, next)).toEqual(['/']);
    // 首建时全部从"没有"变成 null —— 日期没变（都是没有），所以不报。
    expect(restampedPaths(null, mergeLastmod(null, { '/': 'aaaaaaaaaaaaaaaa' }, TODAY))).toEqual([]);
  });
});

describe('currentHashes', () => {
  it('正好 48 条，键是 pathFor 的产物', () => {
    /* 键必须是 `/zh-cn/pricing/` 这种站内路径，不是 locale id 也不是页面名：
     * sitemap 用同一个 pathFor 生成 <loc>，两边必须对得上，否则日期会落到
     * 另一条 URL 上（或一条都不落），而 sitemap 格式完全合法。 */
    const hashes = currentHashes((locale, page) => ({
      html: `<p>${locale}/${page}</p>`,
      head: `<title>${locale}/${page}</title>`,
    }));
    expect(Object.keys(hashes).sort()).toEqual(
      LOCALES.flatMap((l) => PAGES.map((p) => pathFor(l.id, p))).sort(),
    );
    expect(Object.keys(hashes)).toHaveLength(48);
  });
});
