import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/* 把站点地图里的 URL 推给 IndexNow。
 *
 * IndexNow 是一个**共享**的推送端点：向 api.indexnow.org 提交一次，Bing /
 * Yandex / Naver / Seznam 等参与方会各自去取。Google **不参与**，它只认
 * sitemap 与 Search Console（见 docs/seo.md §14）。
 *
 * 两个必须的前提，缺一个就白推：
 * 1. 站点根上要有一个 `<key>.txt`，内容**就是** key 本身（不多一个换行）。
 *    放在 public/，Vite 原样拷到 dist 根。Bing 会来 GET 它做归属校验。
 * 2. 提交的 URL 必须和这个 key 所在的主机一致，否则 422。
 *
 * 用法（**必须先在仓库根跑 npm run build**，本脚本读 dist/sitemap.xml）：
 *
 *   node scripts/indexnow.mjs              # 只推本次内容真的变了的页面
 *   node scripts/indexnow.mjs --all        # 推全站 48 条（首次、或换域名后）
 *   node scripts/indexnow.mjs --dry-run    # 只打印，不发请求
 *
 * 为什么不默认推全站：IndexNow 的语义是「这些地址的内容变了」。每次部署都
 * 推 48 条等于每次都对爬虫喊"全站都更新了"——和 sitemap 里写构建时间是同一个
 * 假信号，只是换了个通道。变更清单由 prerender.mjs 写（它算过内容哈希），
 * 本脚本只负责发。
 *
 * 为什么 host 与 key 都不写在这里：host 从 sitemap.xml 的 <loc> 里取（真源
 * 只有 src/content/site.ts 一处，sitemap 由它生成），key 从 public/ 里的文件名
 * 里取。抄一份到脚本里就多了一个换域名/换 key 时会忘的地方，而忘掉的后果是
 * 422，错误信息只说 "key not valid"。
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DIST = join(ROOT, 'dist');
const PUBLIC = join(ROOT, 'public');

/** prerender.mjs 每次构建写一份，列出这一轮内容有变化的站内路径。 */
const CHANGED_FILE = join(ROOT, '.lastmod-changed.json');

const ENDPOINT = 'https://api.indexnow.org/indexnow';
const TIMEOUT_MS = 15_000;

/** IndexNow 的 key 是 8–128 位，字符集 `[a-zA-Z0-9-]`。本仓库用 32 位十六进制。 */
const KEY_RE = /^[0-9a-f]{32}$/;

/** sitemap 里的 <loc>。用正则而不是 XML 解析器：这份文件是我们自己按固定
 *  格式生成的（见 seo/sitemap.ts），而 node 没有内置 DOM——为 48 条地址引入
 *  一个 XML 依赖不值当。`<loc>` 里不会有嵌套标签。 */
export function locsOf(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

/** 从 public/ 里找出 IndexNow 的 key。
 *
 *  文件名本身就是 key（`<key>.txt`），内容也必须等于文件名——校验方会去
 *  GET 那个文件并比对。返回 `null` 表示还没配。
 *
 *  **多个候选时抛错而不是挑一个**：两把 key 同时存在多半是换 key 时忘了删旧的，
 *  而"挑第一个"会让推送用一把、校验方去取另一把，症状是持续的 403 且看起来
 *  像 key 没生效。 */
export async function readKeyFile(dir = PUBLIC) {
  const found = (await readdir(dir)).filter((f) => f.endsWith('.txt')).sort();
  if (found.length === 0) return null;
  if (found.length > 1) {
    throw new Error(
      `public/ 里有多个 .txt，无法判断哪个是 IndexNow key：${found.join(', ')}。` +
        '换 key 时请删掉旧的那个文件。',
    );
  }
  const name = found[0];
  const key = name.slice(0, -'.txt'.length);
  if (!KEY_RE.test(key)) {
    throw new Error(`public/${name} 不是 IndexNow key 的格式（32 位十六进制），检查文件名`);
  }
  const body = await readFile(join(dir, name), 'utf8');
  if (body !== key) {
    /* 末尾多一个换行是最常见的错。Bing 取这个文件做逐字比对，多一个字节就是
     * 403 "key file not valid"，而 curl 看一眼只会觉得内容是对的。 */
    throw new Error(
      `public/${name} 的内容与文件名不一致（长度 ${body.length}，期望 ${key.length}）。` +
        '注意不要有末尾换行。',
    );
  }
  return key;
}

/** 组装请求体。`urlList` 必须都在 host 下，否则 422。 */
export function payloadFor(key, urls) {
  if (urls.length === 0) throw new Error('没有可推送的 URL');
  const host = new URL(urls[0]).host;
  for (const u of urls) {
    if (new URL(u).host !== host) {
      throw new Error(`URL 与主机不一致（${u} 不属于 ${host}），IndexNow 会回 422`);
    }
  }
  return { host, key, keyLocation: `https://${host}/${key}.txt`, urlList: urls };
}

/** 本次要推的 URL。
 *
 *  `--all` → sitemap 全量。否则读 `.lastmod-changed.json`（prerender 写的站内
 *  路径），映射回绝对地址。清单不存在时**退回全量**：那多半是没跑构建，而
 *  "什么都没推"看起来和"推成功了"一样，全量至少会留下一次 200。 */
export function selectUrls(allUrls, changedPaths, forceAll) {
  if (forceAll || changedPaths === null) return allUrls;
  const byPath = new Map(allUrls.map((u) => [new URL(u).pathname, u]));
  const out = [];
  for (const p of changedPaths) {
    const u = byPath.get(p);
    // 清单里有、sitemap 里没有：页面被删了。IndexNow 支持推送删除，但需要
    // 明确的状态语义，而这里没有——不猜，跳过并在下面报告条数。
    if (u) out.push(u);
  }
  return out;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const forceAll = args.has('--all');

  const key = await readKeyFile();
  if (!key) {
    console.error(
      '没有找到 IndexNow key。在 public/ 放一个 <key>.txt（32 位十六进制，内容与文件名相同、无末尾换行）。',
    );
    return 1;
  }

  const xml = await readFile(join(DIST, 'sitemap.xml'), 'utf8').catch(() => null);
  if (xml === null) {
    console.error('读不到 dist/sitemap.xml —— 先在仓库根跑 npm run build。');
    return 1;
  }
  const allUrls = locsOf(xml);

  let changedPaths = null;
  const changedRaw = await readFile(CHANGED_FILE, 'utf8').catch(() => null);
  if (changedRaw !== null) {
    try {
      const parsed = JSON.parse(changedRaw);
      if (Array.isArray(parsed)) changedPaths = parsed.filter((p) => typeof p === 'string');
    } catch {
      /* 坏文件按"没有清单"处理 → 退回全量。宁可多推，不可静默不推。 */
    }
  }

  const urls = await selectUrls(allUrls, forceAll ? null : changedPaths, forceAll);
  const why = forceAll
    ? '--all'
    : changedPaths === null
      ? '没有变更清单（退回全量）'
      : `变更清单（${changedPaths.length} 条站内路径）`;
  console.log(`IndexNow：${urls.length} 条 URL，来源 ${why}`);

  if (urls.length === 0) {
    console.log('本次没有内容变化，不推送。（要强制全量：--all）');
    return 0;
  }
  for (const u of urls) console.log(`  ${u}`);

  if (dryRun) {
    console.log('--dry-run：没有发请求。');
    return 0;
  }

  const payload = payloadFor(key, urls);
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
    // 没有超时的话一次挂起的连接会让脚本永远停在"推送中"，而运维看不出
    // 是没发出去还是发出去了没回来。
    signal: AbortSignal.timeout(TIMEOUT_MS),
  }).catch((err) => {
    console.error(`推送失败（网络）：${err.message}`);
    return null;
  });
  if (!res) return 1;

  /* 状态码的含义（IndexNow 规范）：
   *   200 已接收  202 已接收、key 校验待完成
   *   400 格式错  403 key 无效  422 URL 与 key/host 不匹配  429 太频繁
   * 只有 200/202 算成功。其余都打印出来——静默吞掉的话，最常见的 403
   * （key 文件没发上去）会表现成"推过了但没效果"，而那是查不出来的。 */
  if (res.status === 200 || res.status === 202) {
    console.log(`✅ 已提交（HTTP ${res.status}${res.status === 202 ? '，key 校验待完成' : ''}）`);
    return 0;
  }
  const body = await res.text().catch(() => '');
  console.error(`❌ HTTP ${res.status}${body ? `：${body.slice(0, 300)}` : ''}`);
  if (res.status === 403) console.error('   多半是 key 文件没部署到站点根：检查 https://' + payload.host + `/${key}.txt`);
  if (res.status === 422) console.error('   检查 URL 的 host 与 keyLocation 是否一致。');
  return 1;
}

// 只有被直接执行时才跑 main()，被单测 import 时只拿纯函数。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then((code) => process.exit(code));
}
