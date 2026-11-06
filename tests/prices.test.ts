import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FREE_AMOUNT, PRICE_AMOUNT, YEARLY_PER_MONTH } from '../src/content/prices';

/* 官网上的价格必须和扩展里的按钮文案一致。
 *
 * 真源是扩展仓库的 utils/payment-config.ts 的 PRICE_AMOUNT。官网仓库里存了
 * 一份快照 `vendor/payment-config.ts`（**只有价格**，不带商户凭证），而页面
 * 又从 `src/content/prices.ts` 读第三份——三份里任意两份对不上，页面就会长期
 * 写着旧价，而且**没有任何东西会红**。
 *
 * 所以这里读快照的**文件文本**逐项比对页面的那份。
 *
 * 用正则从源码里取值，而不是把 .ts import 进来：快照是 TypeScript，而官网的
 * vitest 没配转译它的路径别名（也不需要——它只被这一个测试当文本读）。这个
 * 文件里 PRICE_AMOUNT 是一个纯字面量对象，正则足够稳，并且下面有「正则确实
 * 抓到了三档」的断言兜底——万一将来那个对象改成计算出来的值，这条会红，
 * 而不是静默比对空字符串。
 *
 * 这个检查的边界写在 `vendor/payment-config.ts` 的文件头：分仓之后它保证
 * 「页面 == 本仓库声明的价」，保证不了「扩展改了价、快照没跟上」。后者靠人。
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT = readFileSync(join(HERE, '..', 'vendor', 'payment-config.ts'), 'utf8');

function realPrices(): Record<string, string> {
  const block = SNAPSHOT.match(/export const PRICE_AMOUNT = \{([\s\S]*?)\} as const;/);
  if (!block) throw new Error('vendor/payment-config.ts 里找不到 PRICE_AMOUNT');
  const out: Record<string, string> = {};
  for (const m of block[1].matchAll(/(\w+):\s*'([^']*)'/g)) out[m[1]] = m[2];
  return out;
}

describe('价格与快照一致', () => {
  it('快照里确实有三档价格', () => {
    // 防的是正则失配后「比对两个空集合」——那会让下面几条全部变成空断言。
    const real = realPrices();
    expect(Object.keys(real).sort()).toEqual(['lifetime', 'monthly', 'yearly']);
  });

  it.each(['monthly', 'yearly', 'lifetime'] as const)('%s 一致', (key) => {
    const real = realPrices();
    expect(PRICE_AMOUNT[key]).toBe(real[key]);
  });

  it('免费档是 $0', () => {
    // 免费档不在 PRICE_AMOUNT 里（扩展不需要给「免费」标价），所以这条是
    // 独立断言，而不是跟真源比对。
    expect(FREE_AMOUNT).toBe('$0');
  });
});

describe('年付折算', () => {
  it('由年价算出来，不是手写的', () => {
    const n = Number(PRICE_AMOUNT.yearly.replace('$', ''));
    expect(YEARLY_PER_MONTH).toBe(`$${(n / 12).toFixed(2)}`);
  });

  it('落在「比月付便宜」这个结论上', () => {
    // 页面写的是「平均每月约 $1.66」，用意是让人一眼看出年付划算。
    // 若哪天价格调到年付反而比月付贵，这句话就成了反话。
    const monthly = Number(PRICE_AMOUNT.monthly.replace('$', ''));
    const perMonth = Number(YEARLY_PER_MONTH.replace('$', ''));
    expect(perMonth).toBeLessThan(monthly);
  });
});

describe('八份字典里没有手写的价格', () => {
  /* 上面那几条只保证 prices.ts 与扩展一致。字典里若把金额抄成字面量，
   * 改价时 prices.ts 跟着变、页面上的数字不变，而**没有任何东西会红**——
   * 页面渲染得好好的，只是数字错了。这正是这个仓库反复记的「死字段」
   * 形状：一处被读、另一处被抄。
   *
   * 这不是理论风险。2026-10-26 加八语言时实测：en 和 zh-Hant 的 pricing
   * 描述里写死了 $4.99 / $19.9 / $39.9，另外六份用的是常量——同一页面上
   * 两套数字来源，改价只改得动一半。 */
  const I18N = join(HERE, '..', 'src', 'i18n');
  const files = ['en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'es', 'fr', 'de'];

  it('每份字典都能读到', () => {
    // 防的是下面几条扫了个空集合——路径写错时 for 循环一次都不跑，全绿。
    for (const f of files) {
      expect(readFileSync(join(I18N, `${f}.tsx`), 'utf8').length, `${f}.tsx 是空的`).toBeGreaterThan(1000);
    }
  });

  it('金额只出现在常量里', () => {
    const amounts = [PRICE_AMOUNT.monthly, PRICE_AMOUNT.yearly, PRICE_AMOUNT.lifetime];
    const hits: string[] = [];
    for (const f of files) {
      const src = readFileSync(join(I18N, `${f}.tsx`), 'utf8');
      for (const a of amounts) if (src.includes(a)) hits.push(`${f}.tsx 里写死了 ${a}`);
    }
    expect(hits, `价格要从 content/prices.ts 取，别抄字面量：\n${hits.join('\n')}`).toEqual([]);
  });
});
