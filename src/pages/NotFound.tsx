import type { Dict } from '../i18n/dict';
import { pathFor, type Locale } from '../i18n/paths';

/* 404。
 *
 * 由 prerender.mjs 单独写成 dist/404.html，不进路由表——它不是内容页，
 * 没有 canonical、不进 hreflang、也不该被索引（noindex 在 head.ts 里加）。
 *
 * 页面里的链接必须是**根绝对**路径（/、/pricing/）：这个文件会在任意深度的
 * 坏地址下渲染（/foo/bar），相对链接在那里会解析成 /foo/styles.css 而 404。
 */

export default function NotFound({ dict, locale }: { dict: Dict; locale: Locale }) {
  const c = dict.notFound;

  return (
    <section className="hero">
      <div className="wrap">
        <h1 className="hero-title">{c.title}</h1>
        <p className="lead">{c.body}</p>
        <div className="btn-row">
          <a className="btn btn-primary" href={pathFor(locale, '')}>
            {c.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
