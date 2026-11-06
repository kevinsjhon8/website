# Page Screenshot Pro — 官网

`https://screenshotpro.agentsblockchains.com` 的源码。React 19 + Vite 8，
构建产物是**预渲染好的静态页**，部署在 Cloudflare Pages。

这里是**独立**的一份代码，与浏览器扩展本体分仓。站点不需要扩展的任何运行时
代码；两边共享的只有几个数字（价格、免费额度、版本号、反馈分类文案），它们以
快照的形式放在 `vendor/` 下，见下面「扩展仓库的快照」。

## 命令

```bash
npm install
npm run dev        # Vite 开发服务器
npm run build      # 预渲染到 dist/（49 个 HTML + sitemap/robots/llms）
npm test           # vitest，13 个套件
npm run typecheck  # tsc --noEmit
npm run check      # typecheck + build + test —— 提交前跑这个
```

`npm test` 里有几个套件读 `dist/`（`build-output`、`sitemap`、`llms`），没构建过
就自动跳过并说明原因，不会假绿。所以 `npm run check` 的顺序是 typecheck →
build → test。

浏览器端回归是 `node scripts/site-e2e.mjs [chrome路径] [线上地址]`，打的是**已部署**
的地址（本地假服务器验不了平台有没有采纳 `_headers` 的 CSP）。它需要真实 Chrome，
不在 `npm run check` 里。

## 结构

| 路径 | 作用 |
|---|---|
| `src/` | 页面、字典、SEO。八门语言 × 六个页面，路由是 `src/i18n/paths.ts` 的纯函数 |
| `public/` | 原样拷进 `dist/` 的静态资源：`styles.css`、图标、`og-image.png`、`_headers`（CSP 与缓存头） |
| `scripts/prerender.mjs` | 预渲染 + 注入 per-URL 的 head + 剥掉客户端 bundle |
| `functions/api/feedback.ts` | 支持页表单的接收端（Cloudflare Pages Function） |
| `vendor/` | 扩展本体那几个数字的快照，只被测试当**文本**读 |
| `tests/` | 纯函数、字典形状、渲染交付物 |

**产出的站点里没有一字节可执行 JavaScript**：`prerender.mjs` 会把 Vite 注入的
module 脚本剥掉并删除 `dist/assets/`，`_headers` 的 CSP 是 `script-src 'none'`。
表单用原生 `<form method="post">`，FAQ 用原生 `<details>`，语言切换是普通 `<a>`。
想加客户端交互之前，先读 `tests/build-output.test.ts` 与 `scripts/site-e2e.mjs`
里那几条断言——它们会告诉你代价（2026-10-28 剥掉的那个 bundle 是 184 KB gzip，
只为 re-hydrate 一份已经正确的 DOM）。

## 部署

```bash
npm run build
npx wrangler pages deploy dist --project-name <pages项目名>
```

**在仓库根跑，不要从别的目录跑。** `wrangler pages deploy` 把 `process.cwd()`
当 projectPath，Pages 就是在它下面找 `functions/` 的——从错误的位置执行会把
`functions/` 漏掉，而部署照样成功、页面照样打开，只有表单提交时才发现 404。

`functions/api/feedback.ts` 需要两个绑定：`LICENSES`（KV）与 `DB`（D1）。它们由
部署端的 wrangler 配置声明，**必须是扩展那边同一组 id**——两个入口写同一张
`feedback` 表、共用同一个 `rl:feedback:<ip>` 限流计数。写进一个空库不会报错，
只会在「已收到」的确认页上静默丢掉。

本地跑 `wrangler pages dev` 时它绑的是**本地** D1，需要先建表：

```bash
npx wrangler d1 execute psp-feedback --file=<扩展仓库>/psp-pay/migrations/0001_feedback.sql --local
```

## 扩展仓库的快照（`vendor/`）

分仓之前，价格、免费额度、版本号和反馈分类文案的真源都在扩展仓库里，测试直接
读那边的源码文本。分仓之后读不到了，所以搬了一份快照过来：

| 文件 | 真源 | 读它的测试 |
|---|---|---|
| `vendor/payment-config.ts` | 扩展 `utils/payment-config.ts` 的 `PRICE_AMOUNT` | `tests/prices.test.ts` |
| `vendor/entitlements.ts` | 扩展 `utils/entitlements.ts` 全文 | `tests/limits.test.ts` |
| `vendor/version.json` | 扩展 `package.json` 的 `version` | `tests/meta.test.ts` |
| `vendor/_locales/*/messages.json` | 扩展 `public/_locales/*/messages.json` | `tests/feedback-url.test.ts` |

**这些断言保证的是什么，别高估。** 它们保证「页面上的数字 == 本仓库声明的数字」，
**不保证**「扩展改了、这里跟上了」——分仓之后没有任何东西能替你发现后者。扩展那边
改价、改免费额度、发版、改反馈分类文案时，同步这几个文件是人的责任。漏掉的后果
是官网长期写着一个旧数字，而 `npm run check` 全绿。

`vendor/payment-config.ts` **只搬了 `PRICE_AMOUNT`**：那个文件里的 `backendUrl` 与
`merchantId` 是商户凭证，不属于这个公开仓库。

## 约定

- **内联 `style=""` 一律不许用**：CSP 的 `style-src 'self'` 会静默丢掉它们，
  本地渲染正常、部署后全没。样式写成 `public/styles.css` 里的工具类。
- **站内链接由 `href(locale, target)` 派生，不要写字面量**：`/pricing/` 在一份
  翻译里是对的，抄到另一份就把读者送回英文站。
- **八份字典必须同形**：`tsc` 能查缺键，查不了数组长度，所以
  `tests/dict.test.ts` 逐个比。
- **价格只出现在 `src/content/prices.ts`**：写进字典里的金额是第二份真源，改价时
  只改得动一半。

## 许可

见 `LICENSE`。
