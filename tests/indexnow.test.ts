import { describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  locsOf,
  payloadFor,
  readKeyFile,
  selectUrls,
} from '../scripts/indexnow.mjs';
import { sitemapXml } from '../src/seo/sitemap';
import { SITE_ORIGIN } from '../src/content/site';

/* IndexNow 推送链路里那些「错了也不报」的地方。
 *
 * IndexNow 只有一个反馈渠道：一次 POST 的状态码。而它最常见的两种失败——
 * key 文件没部署、提交的 host 与 keyLocation 对不上——都发生在**别人家的
 * 服务器上**，本地什么都看不见。所以这里把能在本地钉住的都钉住：key 文件的
 * 字节、key 与文件名的对应、payload 的 host 推导、变更清单的选择规则。
 *
 * 真正发请求的那一步不在单测里（没有网络、也不该有）。它由
 * docs/seo.md §14 的操作清单覆盖。
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const PUBLIC = join(ROOT, 'public');
const DIST = join(ROOT, 'dist');

const KEY_RE = /^[0-9a-f]{32}$/;

describe('key 文件', () => {
  it('public/ 里有且只有一份 .txt，文件名就是 key', async () => {
    /* 多一份的后果不是"挑错一个"，而是 readKeyFile 直接抛错——所以这里也
     * 按"恰好一个"断言。换 key 时忘了删旧文件是最容易犯的错，而它的症状
     * 是持续的 403，看起来像"新 key 还没生效"。 */
    const txt = readdirSync(PUBLIC).filter((f) => f.endsWith('.txt'));
    expect(txt, `public/ 里的 .txt：${JSON.stringify(txt)}`).toHaveLength(1);
    expect(txt[0].slice(0, -4)).toMatch(KEY_RE);
    await expect(readKeyFile(PUBLIC)).resolves.toBe(txt[0].slice(0, -4));
  });

  it('内容与文件名逐字节相同，没有末尾换行', () => {
    /* Bing 会 GET 这个文件做逐字比对。多一个 `\n` 是这里最典型的错：
     * `cat` 看一眼内容是对的，而校验方回 403 "key file not valid"。
     * 用字节断言而不是 `readFile(...,'utf8').trim()`——trim 会把错误掩盖掉。 */
    const name = readdirSync(PUBLIC).find((f) => f.endsWith('.txt'))!;
    const bytes = readFileSync(join(PUBLIC, name));
    expect(bytes.toString('utf8')).toBe(name.slice(0, -4));
    expect(bytes.length).toBe(name.length - 4);
    expect(bytes.at(-1)).not.toBe(0x0a);
  });

  it('构建后落在站点根，地址是 /<key>.txt', () => {
    /* Vite 把 public/ 原样拷到 dist 根，所以这条其实是"public/ 的路径对"。
     * 但它同时钉住 keyLocation 的推导：payloadFor 写的是 `https://<host>/<key>.txt`，
     * 文件不在这里的话那个地址线上 404，而 IndexNow 只在响应码里说 403。 */
    if (!existsSync(join(DIST, 'index.html'))) return; // 没构建过
    const name = readdirSync(PUBLIC).find((f) => f.endsWith('.txt'))!;
    const distFile = join(DIST, name);
    expect(existsSync(distFile), `dist/${name} 不在（public/ 没被拷过去？）`).toBe(true);
    expect(readFileSync(distFile, 'utf8')).toBe(name.slice(0, -4));
  });

  /* 下面两条**必须**用临时目录里的假 public/，不能用真的那份。
   *
   * 用真目录写这两条时它们全绿而完全没在检查：真 public/ 里恰好只有一份
   * .txt、内容恰好没有末尾换行，所以"拒绝多个候选"和"拒绝末尾换行"两个
   * 分支一次都进不去——删掉那两个 guard，11 条测试仍然 11 条通过（变异实测）。
   * 这是本仓库反复踩的"夹具让被测的分支不可达"，不是断言写错。 */
  it('内容末尾多一个换行会被拒绝', async () => {
    /* Bing 会 GET 这个文件做逐字比对。多一个 `\n` 时 `cat` 看起来是对的，
     * 而校验方回 403 "key file not valid"——一个从本地完全看不见的失败。 */
    const dir = mkdtempSync(join(tmpdir(), 'psp-indexnow-'));
    try {
      const key = 'a'.repeat(32);
      writeFileSync(join(dir, `${key}.txt`), `${key}\n`);
      await expect(readKeyFile(dir)).rejects.toThrow(/末尾换行|不一致/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('两份 .txt 同时存在时抛错，而不是挑一个', async () => {
    /* 换 key 时忘删旧文件是最容易犯的错。挑一个的后果是推送用 A、校验方去
     * 取 B，症状是持续的 403，而日志里看不出是哪个 key 在起作用。 */
    const dir = mkdtempSync(join(tmpdir(), 'psp-indexnow-'));
    try {
      writeFileSync(join(dir, `${'a'.repeat(32)}.txt`), 'a'.repeat(32));
      writeFileSync(join(dir, `${'b'.repeat(32)}.txt`), 'b'.repeat(32));
      await expect(readKeyFile(dir)).rejects.toThrow(/多个/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('文件名不是 32 位十六进制时抛错', async () => {
    // 写成 `<key>.txt` 之外的格式（比如从别处拷来的 google 校验文件）会
    // 让 keyLocation 指向一个 IndexNow 不认的地址。
    const dir = mkdtempSync(join(tmpdir(), 'psp-indexnow-'));
    try {
      writeFileSync(join(dir, 'not-a-key.txt'), 'not-a-key');
      await expect(readKeyFile(dir)).rejects.toThrow(/格式/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('payloadFor', () => {
  const KEY = '799cebf865a4fb36d94b1bb9e478a8bc';

  it('host 从 URL 里取，keyLocation 指向站点根的那个文件', () => {
    const p = payloadFor(KEY, [`${SITE_ORIGIN}/`, `${SITE_ORIGIN}/pricing/`]);
    expect(p.host).toBe(new URL(SITE_ORIGIN).host);
    expect(p.key).toBe(KEY);
    expect(p.keyLocation).toBe(`https://${new URL(SITE_ORIGIN).host}/${KEY}.txt`);
    expect(p.urlList).toHaveLength(2);
  });

  it('混进别的域名直接抛错，而不是等 422', () => {
    // IndexNow 对 host 不一致回 422，而本地不会有任何提示——推到线上才发现。
    expect(() => payloadFor(KEY, [`${SITE_ORIGIN}/`, 'https://example.test/'])).toThrow(/422|主机/);
  });

  it('空列表抛错', () => {
    // 空 urlList 会被端点拒绝；在本地抛错至少指向真正的原因。
    expect(() => payloadFor(KEY, [])).toThrow();
  });
});

describe('selectUrls', () => {
  const all = [`${SITE_ORIGIN}/`, `${SITE_ORIGIN}/pricing/`, `${SITE_ORIGIN}/zh-cn/pricing/`];

  it('只推变更清单里的那些', () => {
    /* 这是这个脚本的核心判断：IndexNow 的语义是"这些地址变了"。每次部署都
     * 推 48 条等于每次都对爬虫喊全站更新——和 sitemap 里写构建时间是同一个
     * 假信号。清单由 prerender.mjs 按内容哈希生成。 */
    expect(selectUrls(all, ['/pricing/'], false)).toEqual([`${SITE_ORIGIN}/pricing/`]);
  });

  it('清单里没有的路径被跳过（页面已删，不猜）', () => {
    expect(selectUrls(all, ['/gone/'], false)).toEqual([]);
  });

  it('--all 推全量', () => {
    expect(selectUrls(all, ['/pricing/'], true)).toEqual(all);
  });

  it('没有清单时退回全量，而不是静默什么都不推', () => {
    /* "什么都没推"和"推成功了"在日志上长得一样。没清单多半是没跑构建，
     * 全量至少会留下一次真实的 200/202。 */
    expect(selectUrls(all, null, false)).toEqual(all);
  });
});

describe('locsOf', () => {
  it('解析出的集合与 sitemapXml 生成的完全一致', () => {
    /* 脚本用正则解析 sitemap，而不是共用 sitemapXml 的返回值——它读的是
     * 磁盘上的产物。正则一旦跟不上生成器的格式（比如缩进变了、加了属性），
     * 结果就是"推 0 条"或者"推了一堆残缺 URL"，而脚本会正常退出。 */
    const xml = sitemapXml();
    const fromXml = locsOf(xml);
    expect(fromXml).toHaveLength(48);
    expect(new Set(fromXml)).toEqual(new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])));
    expect(fromXml.every((u) => u.startsWith(SITE_ORIGIN))).toBe(true);
  });
});
