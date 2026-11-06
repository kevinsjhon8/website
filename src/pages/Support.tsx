import type { Dict } from '../i18n/dict';
import { href, type Locale } from '../i18n/paths';
import { PageHead, SectionHead } from '../components/ui';
import FeedbackForm from '../components/FeedbackForm';

/* 支援页。
 *
 * 三张联络卡片：寄信 / 回報問題 / 授權或退費，之后是**站内的反馈表单**。
 *
 * 前两张的形态是 2026-10-29 用户指定的：「Email us 框，邮箱太长，已经出了框
 * 的范围，要调整在范围内」「Report a bug 框，点击按钮不要再用邮箱了，和插件
 * 项目的提交反馈一样，出现一个提交表单」。两件事各有一条硬约束：
 *
 * 一、**邮箱地址不能当按钮文案。** `support@screenshotpro.agentsblockchains.com`
 * 是 43 个字符、没有断点的单个 token，而 `styles.css` 里根本没有
 * `overflow-wrap` / `word-break`（全文件零命中），所以它无法在卡片里换行：
 * 1080px 版心下 `.grid-3` 每列约 318px，减去 `.card` 左右各 1.75rem 内边距，
 * 内容盒约 262px —— 字还没排完就出框了。改文案是唯一不动字号、不放松版式的
 * 修法，地址本身没有丢失：`support.intro` 八种语言都把它渲染成 mailto 链接。
 *
 * 二、**表单就在这一页上，点卡片上的按钮只是滚到它。** 这是 2026-10-30 的
 * 第二次改动，推翻了本文件此前的结论。旧结论是「站内造不出表单」——四条路
 * 同时封死：`script-src 'none'` 禁掉客户端 JS、`form-action 'none'` 连原生
 * `<form action>` 也禁掉、`POST /api/feedback` 只收 JSON，而且没有
 * `functions/` 目录。用户的反馈是「点击 Send Feedback 按钮不要跳转到
 * …workers.dev/feedback，直接自己做一个提交页面或者弹出表单，再提交」。
 *
 * 前三条里只有一条是真的限制：零 JS 意味着**不能 fetch 提交**，但原生表单
 * 不需要 JS。所以 `form-action` 放开到 `'self'`，接收端是仓库根的
 * `functions/api/feedback.ts`（Cloudflare Pages Function，同源 POST，与
 * `psp-pay` 共用同一张 `feedback` 表、同一个 `rl:feedback:<ip>` 计数）。
 * `script-src 'none'` 一个字节没动——这个表单确实不需要脚本。
 *
 * 表单的位置是被**文案**钉死的：八种语言的 `reportP1` 都以「上面的反馈表单是
 * 最快的路径 / The feedback form above is the fastest route」开头，所以表单
 * 必须在 `report` 卡片**上面**。挪到它下面会让那八句话同时变成假话。
 *
 * 卡片按钮因此从外链变成同页锚点 `'#feedback'`：`href()` 对 `#` 开头原样
 * 返回，所以在哪种语言、哪一层深度下都指向这一页自己的表单。`target`/`rel`
 * 的派生逻辑保留着——第三张卡仍是 mailto，而将来真出现外链时那个分支是对的。
 *
 * "写之前先看" 的两张卡片解决大部分来信：延迟载入图片和 file:// 授权。
 */

export default function Support({ dict, locale }: { dict: Dict; locale: Locale }) {
  const c = dict.support;

  return (
    <>
      <PageHead h1={c.h1}>
        <p>{c.intro}</p>
      </PageHead>

      <section className="section section-tight">
        <div className="wrap">
          <div className="grid grid-3">
            {c.cards.map((card) => {
              const external = card.to.startsWith('http');
              return (
                <article className="card card-sm" key={card.title}>
                  <div className="icon" aria-hidden="true">
                    {card.icon}
                  </div>
                  <h2>{card.title}</h2>
                  <p>{card.body}</p>
                  <a
                    className="btn btn-ghost"
                    href={href(locale, card.to)}
                    {...(external ? { target: '_blank', rel: 'noopener' } : {})}
                  >
                    {card.cta}
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead title={c.beforeTitle} sub={c.beforeSub} />
          <div className="grid grid-2">
            {c.before.map((item, i) => (
              <article className="card card-sm" key={i}>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <p className="note">{c.beforeNote}</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead title={c.selfTitle} sub={c.selfSub} />
          <div className="grid grid-3">
            {c.self.map((item, i) => (
              <article className="card card-sm" key={i}>
                <h2>{item.title}</h2>
                {item.body}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="feedback">
        <div className="wrap">
          <SectionHead title={c.form.title} sub={c.form.sub} />
          <div className="card card-mid">
            <FeedbackForm copy={c.form} locale={locale} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="card card-mid">
            <h2>{c.reportTitle}</h2>
            <p>{c.reportP1}</p>
            <p>{c.reportP2}</p>
            <ul>
              {c.reportList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="card card-mid">
            <h2>{c.privacyTitle}</h2>
            <p>{c.privacyBody}</p>
          </div>
        </div>
      </section>
    </>
  );
}
