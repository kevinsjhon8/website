import { createHash } from 'node:crypto';
import { LOCALES, PAGES, pathFor } from '../i18n/paths';

/* sitemap 的 `<lastmod>` 真源。
 *
 * 这个文件存在的唯一理由，是让"这个 URL 的内容什么时候真的变过"有一份**可以
 * 被验证**的记录，而不是每次构建都盖一个今天的时间戳。
 *
 * 为什么不能用构建时间：`<lastmod>` 的语义是"这个地址的内容变了"。构建时间
 * 每次部署都会变，写进去等于每次部署都向爬虫声明全站 48 个页面同时更新。
 * Google 明确说过会因此开始忽略这个字段——编一个日期不只没有收益，还会把
 * 真话一起毁掉。
 *
 * 为什么不能用 git 的 mtime：实测过，这条路是塌的。六个页面文件分别是
 * 10-26 ~ 10-30，但 `content/site.ts` / `content/limits.ts` / `i18n/dict.ts` /
 * `seo/head.ts` / `ui.tsx` 全部停在同一次提交（2026-10-31T05:42:33Z），而每一页
 * 都至少 import 其中一两个——于是"取依赖的最大 mtime"会把 48 条 URL 全部压成
 * 同一天。反过来，任何一次只改注释、不改输出的提交，也会把 48 页重新盖章。
 * git 时间量的是**源码文件**，这里要的是**渲染结果**。
 *
 * 所以判据是内容哈希：渲染同一页的 (head, html)，哈希没变就沿用旧日期，变了
 * 才是今天。清单跟着仓库走（仓库根的 `lastmod.json`），因为 dist/ 是被 gitignore
 * 的构建产物，CI 每次都是干净的——清单若不进库，每次构建都会"发现"全部 48 页
 * 是新的，等于绕回构建时间那个错误。
 *
 * **日期可以是 `null`，含义是"我们观察过这页，但自从观察以来它没变过"。**
 * 首次建立清单时全部是 `null`：那时我们确实不知道这些页面是什么时候变的，
 * 写今天就是编。于是引入这个功能的那次部署，sitemap 与之前逐字节相同（仍然
 * 没有 `<lastmod>`）——这不是没做完，这是唯一诚实的起点。清单进库之后，
 * 任何一页的内容一变，下一次构建就会给它一个真实日期。
 *
 * 三个函数的边界：
 * - `contentHash` 只看渲染结果，不看时间、不看路径、不看构建环境。
 * - `mergeLastmod` 的 `today` 是**参数**，不是 `Date.now()`。构建脚本传今天的
 *   日期，单测传固定值；函数本身因此是纯的，同一份输入永远给同一份输出。
 * - `parseLastmod` 对坏数据是**丢条目**而不是抛错：清单是记账，不是凭据，
 *   一个手改坏的文件不该让整次构建失败——缺的那几页退回"没有日期"，最坏
 *   情况是少声明一次更新，而不是整站发不出去。
 */

export interface LastmodEntry {
  /** 渲染结果的 sha256 前 16 位。变了才更新日期。 */
  hash: string;
  /** `YYYY-MM-DD`（UTC）；`null` = 观察过但从未见它变过。 */
  date: string | null;
}

/** 键是站内路径（`pathFor()` 的产物，如 `/zh-cn/pricing/`），不含域名——
 *  换域名不该让 48 页全部重盖日期。 */
export type LastmodFile = Record<string, LastmodEntry>;

/** 清单文件的版本号。格式一变就加一，旧版本整份丢弃重算。 */
export const LASTMOD_VERSION = 1;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HASH_RE = /^[0-9a-f]{16}$/;

/** 页面内容的指纹。
 *
 * 只取 `renderRoute()` 给的 head 与 html——也就是这个 URL 上真实发出去的东西。
 * 不取整份输出文件，因为外壳（Vite 空壳）里带着构建期噪声，而它 48 页相同；
 * 混进来只会让"某页变了"和"构建换了"分不开。
 *
 * 截 16 位（64 bit）：48 条记录，撞车概率远低于磁盘出错的概率，而清单里
 * 每条短一半、diff 好读。 */
export function contentHash(html: string, head: string): string {
  return createHash('sha256').update(head).update('\u0000').update(html).digest('hex').slice(0, 16);
}

/** 读清单。坏 JSON、坏版本、坏条目一律当作没有——见文件头的说明。
 *
 *  返回值是 `null` 还是 `{}` 有区别：`null` 表示**清单不存在**（首次建立），
 *  `{}` 表示清单存在但内容为空。`mergeLastmod` 靠这个区别判断"这一页是新增的
 *  还是我们从没观察过"。所以坏文件按"不存在"处理，而不是按空清单。 */
export function parseLastmod(raw: string | null): LastmodFile | null {
  if (raw === null) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== 'object' || data === null) return null;
  const doc = data as { version?: unknown; entries?: unknown };
  if (doc.version !== LASTMOD_VERSION) return null;
  if (typeof doc.entries !== 'object' || doc.entries === null) return null;

  const out: LastmodFile = {};
  for (const [path, entry] of Object.entries(doc.entries as Record<string, unknown>)) {
    if (typeof entry !== 'object' || entry === null) continue;
    const { hash, date } = entry as { hash?: unknown; date?: unknown };
    if (typeof hash !== 'string' || !HASH_RE.test(hash)) continue;
    if (date !== null && (typeof date !== 'string' || !DATE_RE.test(date))) continue;
    out[path] = { hash, date: date as string | null };
  }
  return out;
}

/** 把本次构建的哈希并进旧清单。
 *
 * - 清单不存在（首次建立）→ 全部 `date: null`，见文件头
 * - 哈希相同 → 沿用旧日期（这一页的内容真的没变）
 * - 哈希不同 → 今天
 * - 路径不在旧清单里（清单存在时）→ 今天：那是一页**新加的页面**，它的
 *   内容确实是这一刻才出现的
 * - 本次没渲染的路径 → 丢掉（页面被删了，清单不该留一条指向不存在地址的记录）
 *
 * 输出按路径排序，这样两次构建的 diff 只反映真实变化，不会因为 Map 顺序抖出
 * 一整片重排。 */
export function mergeLastmod(
  prev: LastmodFile | null,
  hashes: Readonly<Record<string, string>>,
  today: string,
): LastmodFile {
  if (!DATE_RE.test(today)) throw new Error(`lastmod 的日期必须是 YYYY-MM-DD，收到 ${today}`);
  const out: LastmodFile = {};
  for (const path of Object.keys(hashes).sort()) {
    const hash = hashes[path];
    const old = prev?.[path];
    if (!prev) {
      out[path] = { hash, date: null };
    } else if (!old) {
      out[path] = { hash, date: today };
    } else {
      out[path] = old.hash === hash ? { hash, date: old.date } : { hash, date: today };
    }
  }
  return out;
}

/** 写回磁盘的文本。`null, 2` 是有意的：这份文件要进 code review，一行 JSON
 *  的 diff 只会告诉你"它变了"，不会告诉你哪一页变了。 */
export function serializeLastmod(file: LastmodFile): string {
  const entries: LastmodFile = {};
  for (const path of Object.keys(file).sort()) entries[path] = file[path];
  return `${JSON.stringify({ version: LASTMOD_VERSION, entries }, null, 2)}\n`;
}

/** 清单 → `sitemapXml()` 要的 `path → 日期`，`null` 的条目直接不出现。
 *  构建脚本与测试共用这一份，避免两边各写一次过滤。 */
export function dateMap(file: LastmodFile): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [path, entry] of Object.entries(file)) {
    if (entry.date) out[path] = entry.date;
  }
  return out;
}

/** 本次构建里"日期被更新"的路径，只用于构建日志。
 *
 *  比较前把"没有记录"归一成 `null`：首次建立清单时每一页都是 `undefined → null`，
 *  若按 `!==` 直比就会报"48 页内容有变化"，而那一轮 sitemap 里其实一个日期都
 *  没出现。日志说假话和日期写假话是同一个错误，只是少一个读者。
 *  `next[p].date === null` 的一律不算——没有日期可写，就没有"更新"可言。 */
export function restampedPaths(prev: LastmodFile | null, next: LastmodFile): string[] {
  return Object.keys(next)
    .filter((p) => {
      const before = prev?.[p]?.date ?? null;
      return next[p].date !== null && next[p].date !== before;
    })
    .sort();
}

/** 当前内容下每页应有的哈希。构建脚本与测试共用这一份，避免两边各算一套。
 *
 * `render` 由调用方注入（构建时是 SSR bundle 的 `renderRoute`，测试里也是），
 * 这个模块因此不 import React——`src/seo/` 里其余文件同样不 import 渲染层。 */
export function currentHashes(
  render: (locale: string, page: string) => { html: string; head: string },
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const locale of LOCALES) {
    for (const page of PAGES) {
      const { html, head } = render(locale.id, page);
      out[pathFor(locale.id, page)] = contentHash(html, head);
    }
  }
  return out;
}
