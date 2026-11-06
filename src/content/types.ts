import type { ReactNode } from 'react';

/* 各页面共享的展示型数据结构。
 *
 * 之所以是「结构化数据 + 组件渲染」而不是一张扁平 key 表：这些页面的正文里
 * 大量是列表、表格、卡片和 <details>，扁平 key 只能存字符串，组件那边就得
 * 再写一遍结构，两份结构一旦不同步，缺的那条会渲染成空白而不报错。
 * 结构化数据让 TypeScript 直接比对两个语言的对象形状——少一个字段就编译不过。
 */

/** 一条问答。<details> 与 FAQPage 结构化数据都从它来，不另存一份纯文本。 */
export interface QaItem {
  q: string;
  a: ReactNode;
}

/** 对比表的一格：有/无/一段文字。
 *  用判别式而不是让组件去猜 `'✓'` 这个字面量——猜的版本一旦有人把 ✓ 换成
 *  ✅（看着完全一样），那一格就会掉 class 变成灰的，而没有任何检查会红。 */
export type Cell = 'yes' | 'no' | { text: ReactNode };

/** 对比表的一行。label 允许是 ReactNode，因为表里有 <code>file://</code>。 */
export interface CompareRow {
  label: ReactNode;
  free: Cell;
  pro: Cell;
}

/** 站内跳转目标。四种形状：
 *    `'pricing'`    整页
 *    `'#install'`   同页锚点（本页的 install 区块）
 *    `'/#install'`  首页的 install 区块，带语言前缀
 *    `'https://…'`  站外整址，原样返回（2026-10-31 加：套餐卡直指商店详情页）
 *
 *  第三种是必须的：套餐卡片在首页和价格页**都**会渲染，而价格页没有 install
 *  区块。写 `'#install'` 时 href() 原样返回，于是在 `/pricing/` 上那个按钮既
 *  不安装也不跳转——点了没反应。写 `'/#install'` 才真的走到首页的安装区块。
 *
 *  第四种是上架之后才有的一类：`href()` 对 `http` 开头的目标原样返回，因为
 *  商店页没有"中文版"，语言前缀在那种地址上没有任何意义。
 *
 *  存目标而不是成品 URL —— 语言前缀由渲染时的 href() 补，字典里不写 `/zh-tw/…`，
 *  否则切换语言后链接会把人留在原语言。 */
export type LinkTarget = string;

export interface PlanCta {
  label: string;
  to: LinkTarget;
  primary?: boolean;
}

export interface PlanItem {
  tag: string;
  name: string;
  /** 金额文本，来自 prices.ts，页面里不写字面量。 */
  amount: string;
  /** 金额后面的单位，如 `/ month`、`forever`。 */
  period: string;
  featured?: boolean;
  bullets: ReactNode[];
  cta: PlanCta;
}

export interface Step {
  title: string;
  body: ReactNode;
}
