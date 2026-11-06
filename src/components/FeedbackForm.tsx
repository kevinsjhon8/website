import type { FeedbackFormCopy } from '../i18n/dict';

/* 支持页内嵌的反馈表单。
 *
 * 一个原生 `<form method="post" action="/api/feedback">`，**没有** onSubmit、
 * 没有 useState、没有 fetch。三条约束都指向同一个形状：
 *
 * 1. `script-src 'none'` —— 产物里一个字节的可执行脚本都没有（prerender.mjs
 *    的 stripClientScript），所以任何客户端提交都是不可能的。
 * 2. 提交目标归 `form-action` 管，`_headers` 因此从 'none' 放开到 'self'。
 *    跨域仍被禁止——表单只可能打到本站。
 * 3. `vitest.config.ts` 是 **node** 环境，没有 DOM。有状态的组件连渲染
 *    都渲染不了，所以这个组件必须保持纯渲染。
 *
 * 确认页由 handler 直接返回（见 functions/api/feedback.ts 顶部那段说明）：
 * 原生表单提交会让浏览器导航到响应，零 JS 站点没法在页内显示「已收到」，
 * 而 303 回 /support/ 看起来和「什么都没发生」一样。
 *
 * 几个不那么显眼但必须这么写的地方：
 *
 * - **`name` 是契约，`label` 才是文案。** `name="category"` 的四个值
 *   （bug/feature/purchase/other）必须与 handler 的 `FEEDBACK_CATEGORIES`
 *   一致，`tests/feedback-form.test.ts` 读 handler 源码比对。`locale` 用
 *   隐藏字段带上当前语言——这是站内表单相对外链页的实打实好处：确认页能
 *   说读者选的语言，而那个外链页只能靠 navigator.language 猜。
 * - **`required` 只写在 textarea 上，且不配自定义校验文案。** 浏览器弹的
 *   提示是浏览器语言，站内翻不了；写一句中文「必填」在德语界面上只会更糟。
 *   服务端仍然独立校验（空正文答 400），所以这是「少一次往返」而不是唯一
 *   一道防线。
 * - **`maxLength` 与 handler 的上限对齐**（4000 / 200），否则读者能写进一个
 *   服务端会静默截断的长度。
 * - **不写 `style=""`。** CSP 的 `style-src 'self'` 会静默丢弃内联样式，
 *   本地看完全正常、部署后全没了。所有版式在 styles.css 的 `.form-*` 类里。
 * - **`autoComplete` 显式关掉邮箱的自动填充猜测**：`autoComplete="email"` 是
 *   要的（读者自己的邮箱），但类别选择不需要任何猜测。
 *
 * `action` 用绝对路径 `/api/feedback` 而不是相对路径：支持页在
 * `/support/` 和 `/zh-cn/support/` 两种深度下渲染，相对路径会解成
 * `/zh-cn/api/feedback`——Pages 上没有这个路由，而表单提交失败的样子是
 * 跳到一个 404 页面，看起来像「表单坏了」。 */

export default function FeedbackForm({ copy, locale }: { copy: FeedbackFormCopy; locale: string }) {
  return (
    <form className="feedback-form" method="post" action="/api/feedback">
      <input type="hidden" name="locale" value={locale} />

      <div className="field">
        <label className="field-label" htmlFor="fb-category">
          {copy.categoryLabel}
        </label>
        <select className="field-input" id="fb-category" name="category" defaultValue="bug">
          <option value="bug">{copy.categories.bug}</option>
          <option value="feature">{copy.categories.feature}</option>
          <option value="purchase">{copy.categories.purchase}</option>
          <option value="other">{copy.categories.other}</option>
        </select>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="fb-message">
          {copy.messageLabel}
        </label>
        <textarea
          className="field-input field-textarea"
          id="fb-message"
          name="message"
          rows={6}
          maxLength={4000}
          required
          placeholder={copy.messagePlaceholder}
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="fb-email">
          {copy.emailLabel}
        </label>
        <input className="field-input" id="fb-email" name="email" type="email" maxLength={200} autoComplete="email" />
        <p className="field-hint">{copy.emailHint}</p>
      </div>

      <div className="field-submit">
        <button className="btn btn-primary" type="submit">
          {copy.submit}
        </button>
        <p className="field-note">{copy.note}</p>
      </div>
    </form>
  );
}
