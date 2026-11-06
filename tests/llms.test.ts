import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { llmsTxt } from '../src/seo/llms';
import { LOCALES, PAGES, pathFor } from '../src/i18n/paths';
import { SITE_ORIGIN, SOFTWARE_VERSION, SUPPORT_EMAIL } from '../src/content/site';
import { FREE_AMOUNT, PRICE_AMOUNT } from '../src/content/prices';
import { FREE_DAILY_CAPTURES } from '../src/content/limits';
import en from '../src/i18n/en';

/* /llms.txt。
 *
 * 这个文件比 sitemap.xml 更容易「生成得出来、内容全错而没人发现」：
 * 它不是给机器解析的 XML，而是一段 markdown，错了不会 404、不会解析失败，
 * 只会让读它的模型长期拿到一个错误的站点画像。而唯一会读它的那一方——
 * 语言模型——不会回来报错。
 *
 * 所以这里比的全是**关系**，不是字面量：链接必须由 pathFor 派生、数字必须
 * 等于常量、域名必须只有一个。
 */

const ORIGIN = SITE_ORIGIN;

/** 取出所有 markdown 链接的 href。 */
function links(md: string): string[] {
  return [...md.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
}

/** 取某一节（`## Name` 到下一个 `## `）的正文。
 *
 * 分节取而不是全文取：首页地址 `/` 在 Pages 和 Languages 两节里各出现一次，
 * 全文过滤会数出七条而断言六条——那不是内容错了，是断言没分清节。 */
function section(md: string, name: string): string {
  const start = md.indexOf(`## ${name}\n`);
  if (start < 0) throw new Error(`llms.txt 里没有 ## ${name} 这一节`);
  const rest = md.slice(start + name.length + 4);
  const end = rest.indexOf('\n## ');
  return end < 0 ? rest : rest.slice(0, end);
}

describe('llms.txt 的结构', () => {
  it('第一行是 # 标题，第二块是 > 摘要', () => {
    /* llmstxt.org 的约定：H1 是站点名，紧跟一段 blockquote 概括这个站。
     * 少了摘要，读到的就是一份裸链接列表——那正是这个文件想避免的东西。 */
    const lines = llmsTxt().split('\n');
    expect(lines[0]).toBe('# Page Screenshot Pro');
    expect(lines[2]).toBe(`> ${en.meta[''].description}`);
  });

  it('列出全部 6 个页面，地址由 pathFor 派生', () => {
    /* 两个方向都查。少一页 → 那一页对模型不可见；多一页 → 指向 404。
     * 用集合比对而不是逐条 includes：逐条 includes 在 pathFor 变了而
     * 期望值也跟着变的时候仍然是绿的，只有集合相等才能同时钉住两边。 */
    const expected = PAGES.map((p) => `${ORIGIN}${pathFor('en', p)}`);
    const actual = links(section(llmsTxt(), 'Pages'));
    expect(actual.sort()).toEqual([...expected].sort());
  });

  it('每个页面的链接文字不是品牌名重复', () => {
    /* 文件第一行已经是 "Page Screenshot Pro"，六条链接再各带一遍只是噪声。
     * 首页的标题原本是 "Page Screenshot Pro — Full-page screenshots that
     * actually line up"，取破折号之前那半截会得到品牌名本身，所以首页取的
     * 是之后那半句。这条防的是有人把整句塞回来。 */
    const lines = llmsTxt()
      .split('\n')
      .filter((l) => l.startsWith('- [') && l.includes(pathFor('en', '')));
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) {
      expect(line).not.toMatch(/^- \[Page Screenshot Pro\]/);
    }
  });

  it('列出全部 8 门语言，每门指向它自己的首页', () => {
    /* 只列首页而不是 6 页 × 8 语言：多列 40 行会把这份文件撑成 sitemap 的
     * markdown 版本，而八门语言的页面结构完全相同，没有新信息。 */
    const md = llmsTxt();
    for (const l of LOCALES) {
      expect(md, `缺 ${l.id} 的语言链接`).toContain(`(${ORIGIN}${pathFor(l.id, '')})`);
    }
  });
});

describe('llms.txt 里的数字', () => {
  it('免费额度取常量，且是独立数字', () => {
    /* 正则用独立数字的判据：`20` 若被写成 `200`、或额度改成 5 之后残留一个
     * 别处的 20，单纯 includes 都会绿。 */
    const md = llmsTxt();
    expect(md).toContain(FREE_AMOUNT);
    expect(md).toMatch(new RegExp(`(?<![0-9])${FREE_DAILY_CAPTURES}(?![0-9])`));
  });

  it('三档价格都来自 PRICE_AMOUNT', () => {
    const md = llmsTxt();
    for (const key of ['monthly', 'yearly', 'lifetime'] as const) {
      expect(md, `缺 ${key} 的价格`).toContain(PRICE_AMOUNT[key]);
    }
  });

  it('版本号与支持邮箱来自 content/site.ts', () => {
    const md = llmsTxt();
    expect(md).toContain(SOFTWARE_VERSION);
    expect(md).toContain(SUPPORT_EMAIL);
  });
});

describe('llms.txt 的地址', () => {
  it('所有链接都是绝对地址，且主机只有一个', () => {
    /* 相对地址在这里没有基准——这份文件会被别处的抓取方解析，上下文里
     * 没有"当前站点"这个概念。写死域名的第二份副本则是换域名时的坑。 */
    for (const href of links(llmsTxt())) {
      expect(href, `不是绝对地址：${href}`).toMatch(/^https:\/\//);
    }
    const hosts = new Set(links(llmsTxt()).map((h) => new URL(h).host));
    expect([...hosts]).toEqual([new URL(ORIGIN).host]);
  });

  it('换一个域名重新生成，全部地址跟着走', () => {
    // 传参版本是这条的判据：有人把 SITE_ORIGIN 写死回函数体里，这里会红。
    /* 断言用**域名**而不是 ORIGIN 原串：正文里本来就有
     * "Page Screenshot Pro" 和 "screenshotpro.agentsblockchains.com" 作为
     * 产品名与支持邮箱出现，拿整串 ORIGIN 去 not.toContain 会把它们算进去
     * ——那不是「地址没跟着走」，是断言扫错了范围。 */
    const other = 'https://example.test';
    const md = llmsTxt(other);
    expect(md).toContain(`(${other}/)`);
    const hosts = new Set(links(md).map((h) => new URL(h).host));
    expect([...hosts]).toEqual(['example.test']);
    expect(md).not.toContain(`${ORIGIN}/`);
  });

  it('没有 <script> / <style> 之类会被当成 HTML 的东西', () => {
    /* 这个文件由 Pages 以 text/plain 发出，但内容里混进标签仍然说明有人把
     * 页面片段当文案抄了进来。 */
    expect(llmsTxt()).not.toMatch(/<\/?(script|style|div|span)\b/i);
  });
});

describe('构建产物里真的有 llms.txt', () => {
  /* 上面测的是纯函数。生成得再对，prerender.mjs 忘了写盘也一样是零——
   * 而"忘了一行 writeFile"不会让构建失败，只会让 /llms.txt 在线上 404，
   * 且没有任何东西会报错。这里直接读 dist/。 */
  const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

  /* 跳过的判据是**别的**产物在不在，不是 llms.txt 自己。
   *
   * 这一条是被变异测出来的：把 prerender.mjs 里那两行 writeFile/push 删掉、
   * 完整构建一遍，dist/llms.txt 不存在，而 `if (md === null) 跳过` 走进的正是
   * 「没构建过」那个分支——11 条全绿。**「没构建过」与「构建过但忘了写盘」在
   * 这条断言里是同一个状态**，于是它检查的正是自己被删掉的那一刻。
   *
   * dist/index.html 是每页必有的产物，它不在才真的是没构建过。 */
  const built = existsSync(join(DIST, 'index.html'));

  it('dist/llms.txt 在，且内容与纯函数一致', async () => {
    if (!built) {
      // 没构建过就跳过，而不是假绿（与 build-output.test.ts 同一条规矩）。
      expect(built, 'dist/ 还没构建过（先 npm run build）').toBe(false);
      return;
    }
    const md = await readFile(join(DIST, 'llms.txt'), 'utf8').catch(() => null);
    expect(md, 'dist/ 构建过了，但里面没有 llms.txt（prerender.mjs 忘了写盘？）').not.toBeNull();
    expect(md).toBe(llmsTxt());
  });
});
