import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FREE_DAILY_CAPTURES } from '../src/content/limits';

/* 官网上的「免费额度」必须和扩展里的一致。
 *
 * 真源是扩展仓库 utils/entitlements.ts 里 free 套餐的 `dailyCaptures`。官网
 * 仓库里存了一份快照 `vendor/entitlements.ts`，页面又从 `src/content/limits.ts`
 * 读第三份。
 *
 * 页面上那份现在只有一个读者：/llms.txt 的 `Free tier: $0, 20 captures a day`。
 * 看起来只有一行，但它是**给模型看的**——这里不跟着改的话，模型长期被告知
 * 一个错误的上限，而站点上任何一行字都不会因此变红。
 *
 * 为什么单独一个测试文件而不是塞进 prices.test.ts：它是「免费额度」不是
 * 「价格」，两件事的变更节奏完全不同（改额度要同步 CHANGELOG 与八门语言的
 * welcomePricingBody，改价要同步 Waffo 后台）。混在一起，下一次改额度的人
 * 不会想到去看一个叫 prices 的文件。
 *
 * 用正则读源码文本，而不是把 .ts import 进来——与 prices.test.ts 同一个理由：
 * 官网的 vitest 没配转译它的路径别名。下面有「正则确实抓到了 free 那一档」的
 * 兜底断言，防的是失配后比对两个 undefined。
 *
 * 与 prices 一样，分仓之后这条断言保证「页面 == 快照」，保证不了「扩展改了
 * 额度、快照没跟上」。
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT = readFileSync(join(HERE, '..', 'vendor', 'entitlements.ts'), 'utf8');

/** 从 free 套餐块里取 dailyCaptures。
 *
 * 先定位 `free: {` 到它自己的 `dailyCaptures:`，而不是全文搜第一个
 * `dailyCaptures:`：pro 那一档也有同名字段（值是 `Infinity`），谁先出现
 * 取决于对象字面量的书写顺序——而那个顺序是无关的、随时可能被重排。
 * 这正是这个仓库反复踩的「真源取错了位置，断言照样绿」。 */
function freeDailyCaptures(): number {
  const start = SNAPSHOT.search(/\bfree:\s*\{/);
  if (start < 0) throw new Error('vendor/entitlements.ts 里找不到 free 套餐块');
  const block = SNAPSHOT.slice(start, start + 4000);
  const m = block.match(/dailyCaptures:\s*(\d+)/);
  if (!m) throw new Error('free 套餐块里找不到 dailyCaptures 的数字');
  return Number(m[1]);
}

describe('免费额度与快照一致', () => {
  it('真源里 free 套餐确实是有限次，不是 Infinity', () => {
    /* 兜底：如果哪天 free 也被写成 Infinity（或那段被重构掉），正则要么
     * 失配抛错、要么抓到一个不该存在的值。先单独钉住这一点，下面那条
     * 「相等」才有意义——两个 undefined 是相等的。 */
    expect(Number.isFinite(freeDailyCaptures())).toBe(true);
    expect(freeDailyCaptures()).toBeGreaterThan(0);
  });

  it('FREE_DAILY_CAPTURES 等于真源里的 dailyCaptures', () => {
    expect(FREE_DAILY_CAPTURES).toBe(freeDailyCaptures());
  });

  it('是整数，不是「约 20」这种估算', () => {
    // 它会被原样写进 llms.txt 的 "20 captures a day"，小数点在那里是错的。
    expect(Number.isInteger(FREE_DAILY_CAPTURES)).toBe(true);
  });
});
