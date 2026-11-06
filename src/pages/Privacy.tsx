import type { Dict } from '../i18n/dict';
import type { Locale } from '../i18n/paths';
import { PageHead } from '../components/ui';

/* 隱私政策頁。
 *
 * 兩條規矩，都不是排版偏好：
 *   1. 生效日期寫在頁面上（.meta），與 psp-pay/privacy-policy.html 那一份
 *      必須一致。條款改動時**兩個檔案都要改**——那是同一份政策在兩個地方的
 *      副本，只有一份改動等於對外說兩套。
 *   2. 每一門語言各自是一整頁，不再像舊版那樣在一頁裡上下疊兩份：語言由
 *      路由決定（/privacy/ 與 /zh-tw/privacy/），所以 <html lang> 與 hreflang
 *      都是對的，也才有各自的 canonical。
 */

export default function Privacy({ dict }: { dict: Dict; locale: Locale }) {
  const c = dict.privacy;

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
