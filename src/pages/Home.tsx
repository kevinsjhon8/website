import type { Dict } from '../i18n/dict';
import { href, type Locale } from '../i18n/paths';
import { CHROME_STORE_URL } from '../content/site';
import { CellView, Figure, PlanCard, QaList, SectionHead, Steps } from '../components/ui';

/* 首页。
 *
 * 区块顺序即阅读顺序：能做什么 → 是什么 → 免费/Pro 差别 → 为什么不直接用
 * DevTools → 怎么用 → 给谁用 → 怎么拿到 → 方案 → 常见问题。
 *
 * 首屏那张"长截图"完全是 CSS 画的（.shot / .shot-sticky / .shot-seam），
 * 不加载任何图片：它要展示的正是拼接与接缝，用真图反而看不出在讲什么。
 *
 * 后面三张插图则是真的位图（public/images/*.webp，由 scripts/gen-site-images.mjs
 * 从手写 SVG 生成）：它们各自讲一个"过程"，CSS 画不出来，而图里**没有文字**，
 * 所以 alt 和图注都由字典提供、逐语言翻译。
 *
 * 用 WebP 而不是 PNG：这三张是几何图形加大面积渐变，PNG 对它几乎压不动
 * （291 KB），WebP q82 是 37 KB，肉眼无差。理由与 `og:image` 为什么仍是 PNG
 * 写在 scripts/gen-site-images.mjs 的 JOBS 注释里。
 */

export default function Home({ dict, locale }: { dict: Dict; locale: Locale }) {
  const c = dict.home;

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">
            {c.eyebrowRest} <b>{c.eyebrowStrong}</b>
          </p>
          <h1 className="hero-title">
            {c.heroTitleLead} <span className="text-gradient">{c.heroTitleAccent}</span>
          </h1>
          <p className="lead">{c.lead}</p>
          <div className="btn-row">
            <a className="btn btn-primary" href={CHROME_STORE_URL}>
              {c.ctaPrimary}
            </a>
            <a className="btn btn-ghost" href="#plans">
              {c.ctaGhost}
            </a>
          </div>
          <ul className="trust">
            {c.trust.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <div className="shot" aria-hidden="true">
            <div className="shot-bar">
              <span className="shot-dot" />
              <span className="shot-dot" />
              <span className="shot-dot" />
              <span className="shot-url">{c.shotUrl}</span>
            </div>
            <div className="shot-page">
              <div className="shot-sticky">{c.shotSticky}</div>
              <div className="shot-h" />
              <div className="shot-line w90" />
              <div className="shot-line" />
              <div className="shot-line w80" />
              <div className="shot-seam">
                <span>{c.shotSeam}</span>
              </div>
              <div className="shot-line" />
              <div className="shot-line w62" />
              <div className="shot-line w90" />
              <div className="shot-line w80" />
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="wrap">
          <SectionHead title={c.featuresTitle} sub={c.featuresSub} />
          <div className="grid grid-3">
            {c.features.map((f) => (
              <article className="card" key={f.title}>
                <div className="icon" aria-hidden="true">
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
          <Figure src="/images/editor-tools.webp" alt={c.figures.editor.alt} caption={c.figures.editor.caption} />
        </div>
      </section>

      <section className="section section-tight">
        <div className="wrap">
          <div className="card card-mid">
            <h2>{c.aboutTitle}</h2>
            <p>{c.aboutP1}</p>
            <p>{c.aboutP2}</p>
          </div>
          <Figure
            src="/images/capture-stitch.webp"
            alt={c.figures.stitch.alt}
            caption={c.figures.stitch.caption}
            mid
          />
        </div>
      </section>

      <section className="section" id="compare">
        <div className="wrap">
          <SectionHead title={c.compareTitle} sub={c.compareSub} />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{c.compareHead[0]}</th>
                  <th>{c.compareHead[1]}</th>
                  <th>{c.compareHead[2]}</th>
                </tr>
              </thead>
              <tbody>
                {c.compareRows.map((row, i) => (
                  <tr key={i}>
                    <th scope="row">{row.label}</th>
                    <td>
                      <CellView cell={row.free} />
                    </td>
                    <td className="col-us">
                      <CellView cell={row.pro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="note">{c.compareNote}</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="card card-mid">
            <h2>{c.whyTitle}</h2>
            <p>{c.whyP1}</p>
            <p>{c.whyP2}</p>
          </div>
          <Figure
            src="/images/local-pipeline.webp"
            alt={c.figures.local.alt}
            caption={c.figures.local.caption}
            mid
          />
        </div>
      </section>

      <section className="section" id="how">
        <div className="wrap">
          <SectionHead title={c.howTitle} />
          <Steps steps={c.howSteps} />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead title={c.whoTitle} />
          <div className="grid grid-2">
            {c.who.map((w) => (
              <article className="card" key={w.title}>
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="install">
        <div className="wrap">
          <SectionHead title={c.installTitle} sub={c.installSub} />
          <div className="card card-mid card-center">
            <p>{c.installBody}</p>
            <div className="btn-row">
              <a className="btn btn-primary" href={CHROME_STORE_URL}>
                {c.installStore}
              </a>
              <a className="btn btn-ghost" href={href(locale, 'support')}>
                {c.installMore}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="plans">
        <div className="wrap">
          <SectionHead title={c.plansTitle} sub={c.plansSub} />
          <div className="plans">
            {c.plans.map((plan) => (
              <PlanCard key={plan.tag} plan={plan} locale={locale} level={3} />
            ))}
          </div>
          <p className="note">{c.plansNote}</p>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="wrap">
          <SectionHead title={c.faqTitle} sub={c.faqSub} />
          <div className="card card-narrow">
            <QaList items={c.faq} />
          </div>
        </div>
      </section>

      {/* 首页最后一段留白由页脚自己的 margin-top 提供。 */}
    </>
  );
}
