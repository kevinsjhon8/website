import type { Dict } from '../i18n/dict';
import { href, type Locale } from '../i18n/paths';
import { mailto, SUPPORT_EMAIL } from '../content/site';
import { PageHead, QaList, SectionHead } from '../components/ui';

/* 常见问题页。
 *
 * 四组问答（截图 / 隐私与数据 / 授权与账务 / AI 客户端（MCP））直接由字典
 * 渲染。FAQPage 结构化数据由同一份 QaItem[] 生成（见 seo/head.ts），不另存
 * 一份纯文本——两份一旦分叉，页面和 Google 读到的答案就会不一样，而没有任何
 * 检查会红。
 *
 * 第四组是 2026-11-01 加的：扩展的设置卡片里 MCP 那段只能给三行速览，完整
 * 说明（怎么装、八件工具各自要什么、needs_user_gesture 为什么不是缺陷）放
 * 在这里，八个语言都有。卡片里「完整说明」那个链接就是打到本页的 `#mcp`。
 */

export default function Faq({ dict, locale }: { dict: Dict; locale: Locale }) {
  const c = dict.faq;

  return (
    <>
      <PageHead h1={c.h1}>
        <p>{c.intro}</p>
      </PageHead>

      {/* `id` 与 Home/Pricing 的写法一致，落在包裹的 `<section>` 上而不是标题
          元素上。唯一带 id 的那组是「AI 客户端（MCP）」，扩展设置页卡片里
          「完整说明」按钮指向 `/faq/#mcp`（见 utils/site-links.ts 的
          `siteUrl(locale, 'faq')` + '#mcp'）。滚动偏移由 `styles.css` 的
          `html { scroll-padding-top: calc(var(--nav-h) + 20px) }` 负责，
          否则锚点会停在固定导航栏底下。 */}
      {c.groups.map((group) => (
        <section className="section" key={group.title} id={group.id}>
          <div className="wrap">
            <SectionHead title={group.title} left />
            <div className="card">
              <QaList items={group.items} />
            </div>
          </div>
        </section>
      ))}

      <section className="section">
        <div className="wrap">
          <div className="card card-narrow card-center">
            <h2>{c.stuckTitle}</h2>
            <p>{c.stuckBody}</p>
            <div className="btn-row">
              <a className="btn btn-primary" href={mailto(SUPPORT_EMAIL)}>
                {c.stuckMail}
              </a>
              <a className="btn btn-ghost" href={href(locale, 'support')}>
                {c.stuckMore}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
