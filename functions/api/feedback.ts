/* 站内反馈表单的接收端 —— Cloudflare Pages Function。
 *
 * 路由：`functions/api/feedback.ts` → `POST /api/feedback`。官网支持页的
 * <form method="post" action="/api/feedback"> 直接打到这里，不经过任何
 * 第三方域名（2026-10-30 用户要求：「Support 页面点击 Send Feedback 按钮
 * 不要跳转到 …workers.dev/feedback，直接自己做一个提交页面或者弹出表单」）。
 *
 * ── 为什么在**仓库根**的 functions/ ──────────────────────────────────
 * Pages 是在 `process.cwd()` 下找 `functions` 目录的（wrangler 里那一行是
 * `path.join(process.cwd(), "functions")`），而 `wrangler pages deploy` 传的
 * projectPath 就是仓库根。所以放在 `src/functions/` 或 `public/functions/`
 * 都永远不会被编译——它会被当静态资源原样上传（`public/` 那份还会连同一个
 * 没人要的 URL 一起发出去），路由不生效，而且**不会报错**（一个没有任何可
 * 发现路由的 functions 目录只会打一条警告）。tsconfig 的 include 里加了
 * `functions`，所以 `npm run typecheck` 会检查它（见下面「类型」一段）。
 *
 * ── 为什么是「返回一个页面」而不是 303 重定向回支持页 ──────────────
 * 原生表单提交会让浏览器**导航到响应**。零 JS 站点（`script-src 'none'`，
 * 产物里一个字节的可执行脚本都没有）没法在页内显示「已收到」，而重定向回
 * /support/ 看起来和「什么都没发生」完全一样——读者会再提交一次。所以这里
 * 直接返回一个自包含的确认页：一行标题、一句话、一个回支持页的链接。
 *
 * 确认页**不回显任何提交内容**，所以没有转义问题，也就不存在 XSS 面。
 *
 * ── 契约与扩展仓库的 psp-pay 那一份保持一致 ──────────────────────────
 * 同一个 `feedback` 表、同一个 `rl:feedback:<ip>` 计数键（所以站内和扩展内
 * 共用一个 5 条/小时的额度）、邮箱真选填（空值存 NULL，绝不填占位符——
 * 「匿名」是表单上给出的承诺）、缺绑定答 503 而不是 500（那是部署问题，
 * 不该让读者以为是自己的网络）。绑定在**部署端**的 wrangler 配置里声明
 * （Pages 项目的 `kv_namespaces` 与 `d1_databases`），本仓库不附那份配置——
 * 它带着账号资源 id，且和扩展仓库共用同一个 KV 命名空间与同一个 D1 库。
 * 那两个 id 必须与扩展那边逐字节相同：不一致不会报错，只会写进一个空库、
 * 然后在「已收到」的页面上静默丢掉。
 *
 * 与 psp-pay 那一份的两点差别，都是「谁来调用」决定的：
 *   1. 这一份收 `application/x-www-form-urlencoded`（原生表单的编码），
 *      psp-pay 那一份只收 JSON（它被扩展和它自己的页面 fetch）。
 *   2. `source` 写 `'site'`，好把官网来的和扩展来的分开统计。
 *
 * **分仓之后，那个「两个 handler 的契约一致」的检查不再跑在这里。**
 * `tests/feedback-form.test.ts` 是扩展仓库的用例，它同时读本文件的源码文本；
 * 本仓库这一侧只由 `tests/feedback-url.test.ts` 钉住「页面上的分类值、两个
 * 长度上限 == 本文件导出的常量」。所以改 `FEEDBACK_CATEGORIES` / `MAX_*` /
 * `RATE_LIMIT` 时要手动去扩展仓库同步——否则官网和扩展会各写各的，而两边都绿。
 *
 * ── 类型 ─────────────────────────────────────────────────────────────
 * 这个仓库没装 `@cloudflare/workers-types`，所以下面的 `Env` / `D1Like` /
 * `KVLike` 是**本地最小声明**，跟 psp-pay 的 backup.ts 同一个做法。tsconfig
 * 的 include 加了 `functions`，所以 `npm run typecheck` 会真的检查这个文件。
 *
 * 它没有单测能跑**真实绑定**（KV/D1 只有部署后才有）。分支逻辑的覆盖在扩展
 * 仓库的 `tests/feedback-form.test.ts`（`normalizeFeedback`、`readInput`、
 * `onRequestPost` 的分支顺序），那份用例同时读本文件的源码文本——分仓之后
 * 它跑在另一边，所以这一侧的改动不会被它当场拦住。
 */

/** 与 psp-pay/src/index.ts 的 FEEDBACK_CATEGORIES 同值。改了那边要改这边。 */
export const FEEDBACK_CATEGORIES = ['bug', 'feature', 'purchase', 'other'] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const MAX_MESSAGE = 4000;
export const MAX_EMAIL = 200;
export const MAX_LOCALE = 20;

/** 每 IP 每小时的条数上限。键与 psp-pay 相同，两个入口共用一份额度。 */
export const RATE_LIMIT = 5;
export const RATE_WINDOW_S = 3600;

export interface FeedbackInput {
  message: string;
  category: FeedbackCategory;
  email: string | null;
  locale: string | null;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/* 归一化：只做**存在性**与长度校验，不做邮箱格式校验（同 psp-pay）。
 *
 * 上限在这里截断而不是拒绝：读者写了 4001 个字符，把最后一字切掉远好过
 * 让他重写一遍。唯一的硬性拒绝是「正文为空」，那个必须 400——静默收下一条
 * 空记录等于让读者以为提交成功了。 */
export function normalizeFeedback(raw: Record<string, unknown>): FeedbackInput {
  const message = str(raw.message).slice(0, MAX_MESSAGE);
  const cat = str(raw.category);
  const email = str(raw.email).toLowerCase().slice(0, MAX_EMAIL);
  const locale = str(raw.locale).slice(0, MAX_LOCALE);
  return {
    message,
    category: (FEEDBACK_CATEGORIES as readonly string[]).includes(cat)
      ? (cat as FeedbackCategory)
      : 'other',
    email: email ? email : null,
    locale: locale ? locale : null,
  };
}

/* ── 绑定与请求的本地最小类型 ─────────────────────────────────────── */

interface D1Stmt {
  bind(...values: unknown[]): { run(): Promise<unknown> };
}
interface D1Like {
  prepare(sql: string): D1Stmt;
}
interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}
export interface Env {
  DB?: D1Like;
  LICENSES?: KVLike;
}
interface Ctx {
  request: Request;
  env: Env;
}

/* ── 确认页的文案 ─────────────────────────────────────────────────── */

type Kind = 'ok' | 'bad' | 'busy' | 'down';

interface PageCopy {
  back: string;
  ok: [string, string];
  bad: [string, string];
  busy: [string, string];
  down: [string, string];
}

/* 八种语言，键就是 `public/_locales/` 之外本站自己的 Locale id（也是 htmlLang）。
 *
 * 为什么这里另写一份而不是复用 `src/i18n/`：那八份是 `.tsx`（正文里有
 * JSX，import 了 React），打进 Worker bundle 毫无道理，而 Pages Function 也
 * 拿不到预渲染时的 dict。四句话 × 八语言，代价比把 React 拖进后端小得多。
 *
 * 语言从表单的隐藏字段 `locale` 来——这是站内表单相对外链页的一个实际好处：
 * 读者选的语言会被带过来，而不是靠 `navigator.language` 猜。 */
const COPY: Record<string, PageCopy> = {
  en: {
    back: 'Back to support',
    ok: ['Thanks — your message is in.', 'We read every report. If you left an email address, the reply goes there.'],
    bad: ['The message was empty', 'Nothing was sent. Go back, write a line or two, and submit again.'],
    busy: ['Too many submissions', 'This network has sent 5 messages in the last hour. Please try again later, or email us directly.'],
    down: ['The form is unavailable', 'Something on our side is misconfigured. Please email us instead — the address is on the support page.'],
  },
  'zh-Hans': {
    back: '返回支持页',
    ok: ['已收到，谢谢。', '每一份反馈都会看。留了邮箱的话，回复会发到那里。'],
    bad: ['正文是空的', '什么都没发出去。返回上一页，写上一两句再提交。'],
    busy: ['提交太频繁', '这个网络在一小时内已经发了 5 条。请稍后再试，或直接发邮件给我们。'],
    down: ['表单暂时不可用', '我们这边的配置出了问题。请改用邮件联系，地址在支持页上。'],
  },
  'zh-Hant': {
    back: '返回支援頁',
    ok: ['已收到，謝謝。', '每一份回饋都會看。留了信箱的話，回覆會寄到那裡。'],
    bad: ['內文是空的', '什麼都沒送出去。返回上一頁，寫上一兩句再提交。'],
    busy: ['提交太頻繁', '這個網路在一小時內已經送了 5 則。請稍後再試，或直接寄信給我們。'],
    down: ['表單暫時無法使用', '我們這邊的設定出了問題。請改用郵件聯絡，地址在支援頁上。'],
  },
  ja: {
    back: 'サポートページに戻る',
    ok: ['ありがとうございます。受け付けました。', 'すべての報告に目を通します。メールアドレスを記入した場合は、そちらに返信します。'],
    bad: ['本文が空です', '何も送信されていません。前のページに戻り、一言書いてからもう一度送信してください。'],
    busy: ['送信が多すぎます', 'このネットワークから 1 時間に 5 件送信されています。しばらく待つか、メールでご連絡ください。'],
    down: ['フォームを利用できません', 'こちらの設定に問題があります。サポートページのメールアドレスまでご連絡ください。'],
  },
  ko: {
    back: '지원 페이지로 돌아가기',
    ok: ['감사합니다. 접수되었습니다.', '보내주신 내용은 모두 확인합니다. 이메일을 남기셨다면 그쪽으로 답장드립니다.'],
    bad: ['본문이 비어 있습니다', '아무것도 전송되지 않았습니다. 이전 페이지로 돌아가 한두 줄 적고 다시 보내주세요.'],
    busy: ['전송이 너무 많습니다', '이 네트워크에서 한 시간에 5건을 보냈습니다. 잠시 후 다시 시도하시거나 이메일로 연락해 주세요.'],
    down: ['양식을 사용할 수 없습니다', '저희 쪽 설정에 문제가 있습니다. 지원 페이지의 이메일 주소로 연락해 주세요.'],
  },
  es: {
    back: 'Volver a soporte',
    ok: ['Gracias, hemos recibido tu mensaje.', 'Leemos todos los informes. Si dejaste un correo, la respuesta irá allí.'],
    bad: ['El mensaje estaba vacío', 'No se envió nada. Vuelve atrás, escribe un par de líneas y envía de nuevo.'],
    busy: ['Demasiados envíos', 'Esta red ha enviado 5 mensajes en la última hora. Inténtalo más tarde o escríbenos por correo.'],
    down: ['El formulario no está disponible', 'Hay un problema de configuración por nuestra parte. Escríbenos por correo; la dirección está en la página de soporte.'],
  },
  fr: {
    back: 'Retour à l’assistance',
    ok: ['Merci, votre message est arrivé.', 'Nous lisons chaque signalement. Si vous avez laissé une adresse e-mail, la réponse partira là.'],
    bad: ['Le message était vide', 'Rien n’a été envoyé. Revenez en arrière, écrivez quelques lignes et renvoyez.'],
    busy: ['Trop d’envois', 'Ce réseau a envoyé 5 messages dans la dernière heure. Réessayez plus tard ou écrivez-nous directement.'],
    down: ['Le formulaire est indisponible', 'Un réglage est mal configuré de notre côté. Écrivez-nous par e-mail ; l’adresse est sur la page d’assistance.'],
  },
  de: {
    back: 'Zurück zum Support',
    ok: ['Danke — Ihre Nachricht ist angekommen.', 'Wir lesen jede Meldung. Wenn Sie eine E-Mail-Adresse hinterlassen haben, geht die Antwort dorthin.'],
    bad: ['Die Nachricht war leer', 'Es wurde nichts gesendet. Gehen Sie zurück, schreiben Sie ein paar Zeilen und senden Sie erneut.'],
    busy: ['Zu viele Einsendungen', 'Dieses Netzwerk hat in der letzten Stunde 5 Nachrichten gesendet. Bitte später erneut versuchen oder uns direkt schreiben.'],
    down: ['Das Formular ist nicht verfügbar', 'Bei uns ist etwas falsch konfiguriert. Bitte schreiben Sie uns per E-Mail — die Adresse steht auf der Support-Seite.'],
  },
};

const SEGMENT: Record<string, string> = {
  en: '',
  'zh-Hans': 'zh-cn',
  'zh-Hant': 'zh-tw',
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  fr: 'fr',
  de: 'de',
};

function copyOf(locale: string | null): { id: string; copy: PageCopy } {
  const id = locale && SEGMENT[locale] !== undefined ? locale : 'en';
  return { id, copy: COPY[id] ?? COPY.en };
}

/* 确认页。CSP 自己写，**不依赖 `public/_headers`**——那份只作用于静态
 * 资源，Function 的响应得自己带头。所以这里给一条比全站更紧的策略：没有
 * script-src 的需求（一个脚本都不发），没有 form-action（这个页面没有表单），
 * 只放行同源样式表，好让确认页沿用站点的深色底与卡片样式而不是裸 HTML。 */
function page(status: number, locale: string | null, kind: Kind): Response {
  const { id, copy } = copyOf(locale);
  const [title, body] = copy[kind];
  const back = `/${SEGMENT[id] ? SEGMENT[id] + '/' : ''}support/`;
  const html = `<!doctype html>
<html lang="${id}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title}</title>
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<main>
<div class="wrap">
<div class="card card-mid card-center">
<h1>${title}</h1>
<p>${body}</p>
<p><a class="btn btn-ghost" href="${back}">${copy.back}</a></p>
</div>
</div>
</main>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy':
        "default-src 'none'; style-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  });
}

/* 读请求体：原生表单是 urlencoded，程序化调用可能是 JSON。两者都收，
 * 其余一律当「读不懂」处理（返回 null），由调用方答 400。 */
export async function readInput(request: Request): Promise<Record<string, unknown> | null> {
  const type = request.headers.get('content-type') ?? '';
  try {
    if (type.includes('application/json')) {
      const raw: unknown = await request.json();
      return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
    }
    const fd = await request.formData();
    const out: Record<string, unknown> = {};
    for (const [k, v] of fd.entries()) {
      if (typeof v === 'string') out[k] = v;
    }
    return out;
  } catch {
    return null;
  }
}

export async function onRequestPost({ request, env }: Ctx): Promise<Response> {
  const raw = await readInput(request);
  if (!raw) return page(400, null, 'bad');

  const input = normalizeFeedback(raw);
  const locale = input.locale;
  if (!input.message) return page(400, locale, 'bad');

  /* 限流与 D1 一样，是**部署状态**而不是读者的问题。缺绑定答 503，
   * 不答 500——同一个判断 psp-pay 那份也是这么写的。 */
  if (!env.LICENSES) {
    console.error('feedback: LICENSES 绑定缺失 — 部署端 wrangler 配置的 kv_namespaces 配好了吗');
    return page(503, locale, 'down');
  }

  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const rlKey = `rl:feedback:${ip}`;
  try {
    const hits = Number((await env.LICENSES.get(rlKey)) ?? 0);
    if (hits >= RATE_LIMIT) return page(429, locale, 'busy');
    await env.LICENSES.put(rlKey, String(hits + 1), { expirationTtl: RATE_WINDOW_S });
  } catch (e) {
    console.error('feedback: 限流读写失败', e);
    return page(503, locale, 'down');
  }

  if (!env.DB) {
    console.error('feedback: DB 绑定缺失 — 部署端 wrangler 配置的 d1_databases 配好了吗');
    return page(503, locale, 'down');
  }

  try {
    await env.DB.prepare(
      'INSERT INTO feedback (category, message, email, locale, source, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(
        input.category,
        input.message,
        input.email,
        request.headers.get('accept-language')?.slice(0, 50) ?? input.locale,
        'site',
        request.headers.get('user-agent')?.slice(0, 300) ?? null,
        Date.now(),
      )
      .run();
  } catch (e) {
    console.error('feedback: 写入失败', e);
    return page(500, locale, 'down');
  }

  return page(200, locale, 'ok');
}
