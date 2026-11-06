/* 与扩展本体共用的数字与口径，官网这边存一份副本。
 *
 * 真源是扩展本体的 utils/entitlements.ts（免费额度）。两边是分开的仓库，直接
 * import 另一边的文件会把扩展的模块图拖进来，所以存快照 `vendor/entitlements.ts`、
 * 由 tests/limits.test.ts 读快照文本比对——与 prices.ts 完全同一个理由（连同
 * 那条边界），只是这里的数字用在了 /llms.txt 里。
 *
 * 为什么单独一个文件而不是塞进 prices.ts：它是「免费额度」不是「价格」，
 * 混在一个叫 prices 的模块里，下一个改额度的人不会想到去看那里。 */
export const FREE_DAILY_CAPTURES = 20;
