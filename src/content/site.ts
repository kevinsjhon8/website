/* 站点的固定标识：域名、两个邮箱、版本号。
 *
 * 域名是**已绑定的真实地址**，不是占位（2026-10-29 实测：`/zh-tw/pricing/`
 * 在本域名与 `page-screenshot-pro.pages.dev` 上都是 16809 字节、逐字节相同，
 * 且本域名侧 canonical 指向自己）。与同组织的 walletpro.agentsblockchains.com 平行。
 * 换域名只改这里一处 —— canonical / hreflang / og:url / og:image / JSON-LD
 * 全部由它派生。旧版是六个 HTML 各自手写绝对地址，改域名要改六份。
 *
 * 版本号同理：JSON-LD 的 softwareVersion 要跟 package.json 一致，
 * tests/meta.test.ts 读 package.json 比对。
 */

export const SITE_ORIGIN = 'https://screenshotpro.agentsblockchains.com';

export const SUPPORT_EMAIL = 'support@screenshotpro.agentsblockchains.com';

/** 隐私/数据类请求走另一个地址，与 bug 报告分开——隐私页与支持页都这么说。 */
export const PRIVACY_EMAIL = 'privacy@screenshotpro.agentsblockchains.com';

/* 反馈表单是**站内**的，没有外链地址要记。
 *
 * 2026-10-30 之前这里存过一个 `FEEDBACK_URL`（`psp-pay` 那个 Worker 的
 * `/feedback`），支持页的「报告问题」按钮指向它。用户要求「不要跳转到
 * …workers.dev/feedback，直接自己做一个提交页面或者弹出表单，再提交」，
 * 于是表单搬到 `/support/` 页内，接收端是仓库根的
 * `functions/api/feedback.ts`（Cloudflare Pages Function，同源 POST）。
 *
 * 那个常量和它连带的一整段说明都删了，而不是留着不用：留着的话，下一个
 * 读代码的人会以为站内还在往外送人。约束也一起变了——`public/_headers` 的
 * `form-action` 从 'none' 放开到 'self'，因为原生 `<form method="post">`
 * 的提交目标归 form-action 管。`script-src 'none'` 没动：这个表单一个字节的
 * 客户端脚本都不需要。 */

/* Chrome 应用商店的详情页地址，2026-10-31 上架后填入。
 *
 * 只在这里写一次，八份字典与三个组件都引这个常量。理由与上面那段
 * `FEEDBACK_URL` 的教训是同一个：把地址抄进八份字典，改地址就要改八处，
 * 而漏掉的那一份在页面上完全看不出来——它只是把读者送进一个 404。
 *
 * 另一条约束来自 `paths.ts` 的 `href()`：以 `http` 开头的目标**原样返回**，
 * 不补语言前缀。商店页自己按浏览器语言跳转，站点这边没有"中文版商店页"这种
 * 东西，所以按钮落到的永远是同一个地址。
 *
 * `tests/install-cta.test.ts` 里另写了一份**字面量**副本做比对。那不是重复，
 * 是这个仓库反复用的那条规矩（`FULL_PAGE_MARK`、`ABOVE`/`BELOW` 表）：被检查
 * 的东西就是地址本身时，从同一个常量读期望值等于没检查——常量打错一个字符，
 * 两边一起错，断言照样绿。 */
export const CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/page-screenshot-pro/bjmglonhfpengikcjhcajojcdadggjkb';

export const OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;

/* og-image.png 的像素尺寸，喂给 og:image:width / og:image:height。
 *
 * 少了这两个字段，社交平台在**下载图片之前**不知道它多宽多高，于是退回
 * 1:1 居中裁切——1200×630 的卡片被裁成方形，标题两侧的字被切掉。只在第一次
 * 分享时看得见，站内怎么刷都正常，所以它是典型的「只有爬虫能看到」的缺陷。
 *
 * 真源是那张 PNG 自己的 IHDR（宽在字节 16-19、高在 20-23，大端）。
 * tests/meta.test.ts 直接读文件比对，所以换图后忘了改这里会红，而不是
 * 悄悄发一个和图片不符的声明。 */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/* 版本号出现在 JSON-LD 的 softwareVersion 里。真源是扩展本体的
 * package.json，它不在本仓库里，所以这里存一份副本 `vendor/version.json`，
 * 由 tests/meta.test.ts 读那份比对（同 prices.ts 的理由，边界也一样：
 * 分仓之后它保证的是「页面 == vendor/version.json」）。
 * 不同步的后果是结构化数据长期声称一个旧版本，而没有任何检查会红。 */
export const SOFTWARE_VERSION = '0.1.6';

/* publisher.logo 的地址与尺寸，喂给 JSON-LD 里 Organization 的 logo。
 *
 * 为什么现在才加：docs/seo.md §8.4 记过，当时没做是因为「往 publisher 里加
 * logo，134 个测试一个都不红」——一个字段写进去、没人读、也没有断言，就是
 * 这个仓库反复出现的「死字段」形状。所以它单独一条改动 + 自己的断言：
 * tests/meta.test.ts 比对这里的尺寸与 public/icon512.png 的 IHDR，并断言
 * 地址是绝对地址且指向那张真实存在的图。
 *
 * 为什么必须是绝对地址：结构化数据会被**别处**的爬虫解析，相对路径在那种
 * 上下文里没有基准地址。为什么用 512 而不是 192：Google 的 Organization
 * logo 指引要求图标「尽可能接近正方形、至少 112×112」，实际富媒体结果里
 * 取的是可用的最大一张。 */
export const PUBLISHER_LOGO = `${SITE_ORIGIN}/icon512.png`;

/* logo 的像素尺寸。真源同样是那张 PNG 自己的 IHDR——tests/meta.test.ts 读文件
 * 比对，与 OG_IMAGE_SIZE 是同一个理由：写死一个数字，换图之后声明和图片一起
 * 错，断言还是绿的。 */
export const PUBLISHER_LOGO_SIZE = { width: 512, height: 512 } as const;

export function mailto(address: string, subject?: string): string {
  return subject ? `mailto:${address}?subject=${encodeURIComponent(subject)}` : `mailto:${address}`;
}
