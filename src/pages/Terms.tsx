import type { Dict } from '../i18n/dict';
import type { Locale } from '../i18n/paths';
import { PageHead } from '../components/ui';

/* 服務條款頁。结构与隐私页相同：生效日期 + 一条 intro + 若干 <h2> 段落。 */

export default function Terms({ dict }: { dict: Dict; locale: Locale }) {
  const c = dict.terms;

  return (
    <>
      <PageHead h1={c.h1}>
        <p className="meta">{c.effective}</p>
        <p>{c.intro}</p>
      </PageHead>

      <section className="section section-tight">
        <div className="wrap">
          <div className="prose prose-flush">
            {c.sections.map((s) => (
              <section key={s.title}>
                <h2>{s.title}</h2>
                {s.body}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
