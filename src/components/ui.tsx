import type { ReactNode } from 'react';
import type { Cell, PlanItem, QaItem, Step } from '../content/types';
import { href } from '../i18n/paths';
import type { Locale } from '../i18n/paths';

/* 页面共用的展示组件。
 *
 * 全部是纯渲染：没有 useState、没有 useEffect、没有浏览器 API。原因有两个，
 * 都很实际：
 *   1. 预渲染在 Node 里跑这些组件（entry-server.tsx），任何 DOM 调用都会
 *      在构建时直接炸掉。
 *   2. 站点唯一的交互是 <details>，而它是浏览器原生行为，不需要 JS。
 *      这也是 _headers 里 connect-src 'none' 还站得住的原因。
 */

/** 对比表的一格。'yes'/'no' 的 class 由判别式决定，不看单元格里的字符。 */
export function CellView({ cell }: { cell: Cell }) {
  if (cell === 'yes') return <span className="yes">✓</span>;
  if (cell === 'no') return <span className="no">—</span>;
  return <>{cell.text}</>;
}

/** 一条问答。<details> 原生折叠，不依赖脚本。 */
export function Qa({ item }: { item: QaItem }) {
  return (
    <details className="qa">
      <summary>{item.q}</summary>
      <div className="answer">{item.a}</div>
    </details>
  );
}

export function QaList({ items }: { items: QaItem[] }) {
  return (
    <div className="faq">
      {items.map((item) => (
        <Qa key={item.q} item={item} />
      ))}
    </div>
  );
}

/** 一张插图：图片 + 图注。
 *
 * 图片来自 public/images/，由 scripts/gen-site-images.mjs 从手写 SVG
 * 光栅化而成。**图里没有任何文字**——八种语言没法烘焙进一张 PNG，所有说明
 * 都在 alt 和图注里，由字典提供。
 *
 * width/height 是 HTML 属性，不是内联样式：CSP 是 style-src 'self'，内联
 * style 属性部署后会被静默丢弃（见 styles.css 顶部），而宽高属性既不受它管，
 * 又能让浏览器在图片下载完成前就按正确比例占好位置——site-e2e.mjs 逐字节
 * 比对线上与本地基准的文档高度，少了这个高度，两边会因为加载时机不同而差
 * 出一整张图。 */
export function Figure({
  src,
  alt,
  caption,
  mid = false,
  width = 1200,
  height = 750,
}: {
  src: string;
  alt: string;
  caption: string;
  /** 跟在 .card-mid（760px）下面时收窄到同宽，见 styles.css 里的 .figure-mid。 */
  mid?: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <figure className={mid ? 'figure figure-mid' : 'figure'}>
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/* 套餐卡。`level` 是标题层级，不是样式参数：两张页面把这张卡挂在不同的
 * 标题下面，层级必须跟着调用点走。
 *
 * - 首页：卡片在 <SectionHead>（渲染 <h2>）下面，套餐名是 <h3>，正确。
 * - 价格页：卡片直接在 <PageHead> 的 <h1> 下面，中间**没有**分区标题，
 *   写 <h3> 就是 h1 → h3 跳级。所以那里要传 2。
 *
 * 写死成任何一种都会错一半：全传 h3 则价格页跳级，全传 h2 则首页的套餐名
 * 与分区标题平级（不跳级，但语义错了，屏幕阅读器的目录也会乱）。
 * 字号两边都是 1.15rem——语义修好不该让价格页的字变大，见 styles.css。 */
export function PlanCard({ plan, locale, level }: { plan: PlanItem; locale: Locale; level: 2 | 3 }) {
  const Name = level === 2 ? 'h2' : 'h3';
  return (
    <article className={plan.featured ? 'plan featured' : 'plan'}>
      <span className="plan-tag">{plan.tag}</span>
      <Name>{plan.name}</Name>
      <p className="price">
        <b>{plan.amount}</b> <span>{plan.period}</span>
      </p>
      <ul>
        {plan.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      <a className={plan.cta.primary ? 'btn btn-primary' : 'btn btn-ghost'} href={href(locale, plan.cta.to)}>
        {plan.cta.label}
      </a>
    </article>
  );
}

export function Steps({ steps }: { steps: Step[] }) {
  return (
    <ol className="steps">
      {steps.map((s) => (
        <li key={s.title}>
          <strong>{s.title}</strong>
          <span>{s.body}</span>
        </li>
      ))}
    </ol>
  );
}

/** 正文页的页头：大标题 + 可选的一段/几段说明。 */
export function PageHead({ h1, children }: { h1: string; children?: ReactNode }) {
  return (
    <header className="page-head">
      <div className="wrap">
        <h1>{h1}</h1>
        {children}
      </div>
    </header>
  );
}

export function SectionHead({
  title,
  sub,
  id,
  left,
}: {
  title: string;
  sub?: ReactNode;
  id?: string;
  left?: boolean;
}) {
  return (
    <div className={left ? 'section-head left' : 'section-head'}>
      <h2 id={id}>{title}</h2>
      {sub ? <p>{sub}</p> : null}
    </div>
  );
}
