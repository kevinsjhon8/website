import type { ReactNode } from 'react';

/* ReactNode → 纯文本。
 *
 * 结构化数据（FAQPage 的 acceptedAnswer.text、SoftwareApplication 的
 * featureList）要的是字符串，而字典里存的是带 <code>/<strong> 的 ReactNode。
 * 这里做递归走查而不是「再存一份纯文本字段」：两份文本一旦分叉，页面和
 * 结构化数据就会各自说一套，而没有任何检查会红——这个仓库里「写在一侧、
 * 另一侧从不读」的字段已经出过好几次事。
 *
 * 刻意**不用** renderToStaticMarkup + 去标签：那样还得自己解 &amp; 之类的
 * 实体，解漏一个，Google 读到的就是 "&amp;"。走查 React 树拿到的本来就是
 * 原文。
 */

function walk(node: ReactNode, out: string[]): void {
  if (node === null || node === undefined || typeof node === 'boolean') return;
  if (typeof node === 'string') {
    out.push(node);
    return;
  }
  if (typeof node === 'number') {
    out.push(String(node));
    return;
  }
  if (Array.isArray(node)) {
    for (const child of node) walk(child as ReactNode, out);
    return;
  }
  if (typeof node === 'object' && 'props' in node) {
    const el = node as { type: unknown; props: { children?: ReactNode } };
    // <br> 在正文里是一个换行，在纯文本里必须是空格，否则两句话会黏在一起。
    if (el.type === 'br') {
      out.push(' ');
      return;
    }
    walk(el.props.children, out);
  }
}

/** 取一段 ReactNode 的纯文本，并把连续空白压成一个空格。 */
export function nodeText(node: ReactNode): string {
  const out: string[] = [];
  walk(node, out);
  return out.join('').replace(/\s+/g, ' ').trim();
}
