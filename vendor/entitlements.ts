/* 【快照，不是真源】扩展本体的 `utils/entitlements.ts` 逐字节副本。
 *
 * 搬过来的理由与边界同 `vendor/payment-config.ts`：`tests/limits.test.ts` 读
 * 这个文件里的 `free.dailyCaptures`，比对官网 `src/content/limits.ts` 的
 * `FREE_DAILY_CAPTURES`（它只喂给 `/llms.txt` 的一行 `Free tier: $0, 20
 * captures a day`）。分仓之后这个快照不会自动跟着扩展更新，所以那条断言
 * 保证的是「页面 == 本仓库的快照」，**不是**「扩展改了额度、这里跟上了」。
 * 扩展的 `dailyCaptures` 一变，必须手动把整个文件重新拷一遍。
 *
 * 这个文件**没有任何东西 import 它**，只被当文本读——所以它不必通过 tsc 的
 * 严格检查，也不需要和 src/ 的类型对齐。
 */

/* utils/entitlements.ts —— 套餐与功能的唯一真相源
 *
 * 为什么要有这一层：之前"是不是 Pro"这个判断散落在 background.ts（元素截图）、
 * editor（PDF/OCR）、popup（合并 PDF）里，各写各的布尔判断。加一个套餐、改一个
 * 功能的归属，就得去翻所有调用点，漏一处就是"付了钱但功能没解锁"。
 *
 * 现在业务代码只问 `can(license, FEATURE.X)`，付费墙的决策集中在这里一处可审。
 * 加套餐是改数据，不是改代码。
 */

export const PLAN = Object.freeze({
  FREE: 'free',
  PRO: 'pro',
});

export type PlanId = 'free' | 'pro';

/**
 * 功能键。**没有列在这里的东西对所有人开放**——只把"真的要花钱"或"就是升级
 * 理由"的功能设成门槛。
 */
export const FEATURE = Object.freeze({
  CAPTURE_FULL_PAGE: 'capture.full_page',
  CAPTURE_VISIBLE: 'capture.visible',
  CAPTURE_REGION: 'capture.region',
  CAPTURE_ELEMENT: 'capture.element',

  FORMAT_PNG: 'format.png',
  FORMAT_PDF: 'format.pdf',
  MERGE_PDF: 'merge_pdf',

  OCR: 'ocr',

  /*
   * MCP 访问（2026-11-01）。**整条通道**算一个功能键，不是每个工具一个。
   *
   * 判据是"用户在买什么"：AI 客户端能通过本机 WS 让扩展截图，这件事本身
   * 就是升级理由；拆成 `mcp.capture` / `mcp.ocr` 只是让同一个闸门有五个
   * 落点、五处都能漏。工具级的差异由 `utils/mcp-protocol.ts` 的
   * `MCP_FREE_TOOLS` 表达（目前只有诊断工具 `psp_status` 免费），它不参与
   * 套餐判定——那条通道只要进来就是 Pro。
   */
  MCP: 'mcp',
});

export type Feature = (typeof FEATURE)[keyof typeof FEATURE];

export interface PlanDef {
  id: PlanId;
  label: string;
  features: ReadonlySet<string>;
  /** 每日截图上限；Infinity 表示不限 */
  dailyCaptures: number;
}

/**
 * 免费版刻意给得大方：插件必须先真的有用，才谈得上付费。升级点是元素截图、
 * PDF、OCR、MCP 访问这些用一天就会撞上的能力。
 *
 * **标注自 2026-10-25 起也是免费的**，`FEATURE.ANNOTATE` 这个键已经删除。
 * 用户的原话是「编辑页面的编辑功能开放给免费用户」——编辑器里的九个工具
 * （选择/裁剪/马赛克/矩形/椭圆/箭头/自由笔/荧光笔/文字）对所有人开放。
 *
 * 这一条是**整键退役**，不是"从 PRO_FEATURES 里划到 FREE_FEATURES"：留着键
 * 就还得留调用点，而调用点一旦不拦人，它就是个骗人的门禁（这正是这个仓库
 * 反复栽的「写一边、读另一边」形状）。`tools/validate.mjs` 第 21 条对
 * `PRO_FEATURES` 的作用域是**双向**的，键删了而登记表还留着会直接变红。
 */
const FREE_FEATURES: Feature[] = [
  FEATURE.CAPTURE_FULL_PAGE,
  FEATURE.CAPTURE_VISIBLE,
  FEATURE.CAPTURE_REGION,
  FEATURE.FORMAT_PNG,
];

const PRO_FEATURES: Feature[] = [
  ...FREE_FEATURES,
  FEATURE.CAPTURE_ELEMENT,
  FEATURE.FORMAT_PDF,
  FEATURE.MERGE_PDF,
  FEATURE.OCR,
  FEATURE.MCP,
];

export const PLANS: Readonly<Record<PlanId, PlanDef>> = Object.freeze({
  free: {
    id: 'free',
    label: '免费版',
    features: new Set<string>(FREE_FEATURES),
    /*
     * 匿名使用的硬上限：挡住滥用，但不影响正常用户。
     *
     * 2026-10-23 由 50 下调到 20（用户要求「50 次会不会太多了，研究一下」）。
     * 判据不是"别人定多少"，而是这个数字在**这套**定价里干什么活：
     *
     * - 它**不是**变现闸门。真正的付费点是元素截图、PDF、合并 PDF、OCR——
     *   免费版一个都没有（见 `FREE_FEATURES`/`PRO_FEATURES`；标注与马赛克
     *   例外，免费版可用）。所以额度只需要回答"匿名/白嫖能不能把成本拖垮"，
     *   而不是"怎么逼人升级"。
     * - 50 次在真实用量分布里**永远撞不到**：普通用户一天截 2–5 张，重度用户
     *   10–20 张。撞不到的上限等于没有上限，而它同时还让 popup 上那句
     *   「今日剩余 N 次」变成一个从不变动的死数字。
     * - 20 次 ≈ 普通用量的 4–10 倍，正常用户依旧撞不到；只有"全天反复截图"
     *   的人会在下午看到提示——那正是唯一合理的摩擦点。
     *
     * 改这里要同步改：`public/_locales/<locale>` 下每条 `messages.json` 的
     * `welcomePricingBody` 营销文案（八种语言都写死了次数）、README、MANUAL-TEST。
     */
    dailyCaptures: 20,
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    features: new Set<string>(PRO_FEATURES),
    dailyCaptures: Infinity,
  },
});

/** 取某套餐的功能集；未知套餐按免费版处理（安全默认：不越权解锁） */
export function planFeatures(planId: string | null | undefined): ReadonlySet<string> {
  const p = planId === PLAN.PRO ? PLANS.pro : PLANS.free;
  return p.features;
}

/** 取某套餐的每日上限；未知套餐按免费版处理 */
export function planDailyCap(planId: string | null | undefined): number {
  const p = planId === PLAN.PRO ? PLANS.pro : PLANS.free;
  return p.dailyCaptures;
}

/**
 * 由授权状态推导套餐。存储格式保持 `{pro, source, ts}` 不变（无需数据迁移），
 * 套餐是派生值——只有 pro 布尔位是持久化的。
 */
export function planOf(license: { pro?: boolean } | null | undefined): PlanId {
  return license && license.pro === true ? 'pro' : 'free';
}

/** 单一判定入口：业务代码只该调这个，不要自己去读 license.pro */
export function can(
  license: { pro?: boolean } | null | undefined,
  feature: Feature | string,
): boolean {
  return planFeatures(planOf(license)).has(feature);
}
