/* 官网上的价格数字，**唯一**一份。
 *
 * 真源是扩展本体的 utils/payment-config.ts 的 PRICE_AMOUNT —— 扩展里的
 * 按钮文案也是从那里来的。那两个项目是分开的仓库（官网有自己的
 * node_modules、自己的 Vite root），直接 import 另一边的文件会把扩展的
 * 模块图拖进来，而且那份文件里还有商户凭证，所以本仓库存一份只含价格的
 * 快照 `vendor/payment-config.ts`，由 tests/prices.test.ts 逐项比对：
 * 页面写错一个数字会让那个测试变红。**边界**：分仓之后它保证的是
 * 「页面 == 快照」，扩展改价后本仓库要手动同步快照（见 vendor/ 那份的文件头）。
 *
 * 金额本身还**不是**实际扣款额——Waffo 后台的商品金额才是。改价要三处
 * 一起改：utils/payment-config.ts、Waffo 后台商品、以及本文件（若金额变了）。
 */

/** 与 PRICE_AMOUNT 一一对应，`$` 前缀也照抄。 */
export const PRICE_AMOUNT = {
  monthly: '$4.99',
  yearly: '$19.9',
  lifetime: '$39.9',
} as const;

/** 免费档，页面上写 $0 而不是 $0.00。 */
export const FREE_AMOUNT = '$0';

/** 年付折算到月：由年价算出来，不手写，改价时自动跟着变。 */
export const YEARLY_PER_MONTH = (() => {
  const n = Number(PRICE_AMOUNT.yearly.replace('$', ''));
  return `$${(n / 12).toFixed(2)}`;
})();
