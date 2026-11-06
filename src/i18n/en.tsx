import { FREE_AMOUNT, PRICE_AMOUNT, YEARLY_PER_MONTH } from '../content/prices';
import { CHROME_STORE_URL, PRIVACY_EMAIL, SUPPORT_EMAIL, mailto } from '../content/site';
import type { Dict } from './dict';
import { pathFor } from './paths';

/* 英文文案。**默认语言**，也是 _headers / manifest 之外的第二处回退：
 * prerender 里 localeOf() 的最终 return 就是 'en'。改这里的键名要同步改
 * 其余七份（zh-Hans / zh-Hant / ja / ko / es / fr / de）——八份都标注成
 * Dict，漏一处是编译错误。
 *
 * 正文里的站内链接也走 pathFor('en', …)，不写字面量 `/pricing/`：英文目前
 * 没有前缀，字面量今天是对的，但哪天 LOCALES 给 en 加了段（比如 `/en/`），
 * 字面量会留在旧地址而没有任何检查会红。八份字典用同一个函数就不会分叉。 */

const S = SUPPORT_EMAIL;
const P = (page: Parameters<typeof pathFor>[1]) => pathFor('en', page);

const en: Dict = {
  meta: {
    '': {
      title: 'Page Screenshot Pro — Full-page screenshots that line up',
      description:
        'Full page screenshot extension for Chrome: scrolling feeds, lazy images, wide tables and sticky headers in one image. Annotations, PDF export, OCR — all local.',
      ogDescription:
        'Capture a whole page in one image. Annotations, PDF export and OCR. Everything runs on your device.',
    },
    pricing: {
      title: 'Pricing — free tier and Pro plans · Page Screenshot Pro',
      description: `Free: 20 captures a day and the full annotation editor. Pro adds element capture, PDF export and merge, OCR and MCP — ${PRICE_AMOUNT.monthly} a month, ${PRICE_AMOUNT.yearly} a year or ${PRICE_AMOUNT.lifetime} once.`,
      ogDescription:
        'Free with 20 captures a day and the whole annotation editor. Pro adds element capture, PDF export and merge, OCR and MCP.',
    },
    faq: {
      title: 'FAQ — long pages and lazy images · Page Screenshot Pro',
      description:
        'Long pages, infinite scroll, lazy images, local file:// pages, privacy, licences, restoring a purchase and letting an AI client capture over MCP.',
      ogDescription:
        'Answers about long pages, infinite scroll, local files, privacy, licences and MCP access.',
    },
    support: {
      title: 'Support — bug reports and refunds · Page Screenshot Pro',
      description:
        'Email support for Page Screenshot Pro: bug reports, capture problems, licence and refund questions. A real person answers, usually within two business days.',
      ogDescription: 'Bug reports, capture problems, licence and refund questions.',
    },
    privacy: {
      title: 'Privacy Policy — what stays on device · Page Screenshot Pro',
      description:
        'Page Screenshot Pro keeps screenshots, annotations and OCR on your device. Only the licence check, Waffo checkout and the feedback you send leave it.',
      ogDescription:
        'Screenshots, annotations and OCR stay on your device. The only network requests are the optional licence check, opening Waffo’s hosted checkout when you buy, and the feedback you choose to send. Local MCP access over 127.0.0.1 never leaves your machine.',
    },
    terms: {
      title: 'Terms of Service — licences & refunds · Page Screenshot Pro',
      description:
        'Terms for the Page Screenshot Pro extension and its licence server: licence scope, the free tier, purchases and refunds, acceptable use and limitations.',
      ogDescription: 'Licence scope, the free tier, purchases and refunds, and limitations.',
    },
  },
  notFoundMeta: {
    title: 'Page not found — Page Screenshot Pro',
    description: 'That page does not exist. Head back to the home page.',
  },

  nav: {
    features: 'Features',
    pricing: 'Pricing',
    faq: 'FAQ',
    support: 'Support',
    cta: 'Add to Chrome',
    langLabel: 'Language',
    ariaLabel: 'Main',
  },

  footer: {
    tagline: 'Long screenshots, annotations, PDF and OCR — all processed inside your browser.',
    colProduct: 'Product',
    colSupport: 'Support',
    colLegal: 'Legal',
    help: 'Help & contact',
    privacy: 'Privacy policy',
    terms: 'Terms of service',
    copyright: '© 2026 Page Screenshot Pro',
    stayLocal: 'Screenshots stay on your device.',
    ariaLabel: 'Footer',
  },

  home: {
    eyebrowStrong: 'Runs entirely on your device',
    eyebrowRest: 'Chrome 116+ ·',
    heroTitleLead: 'Full-page screenshots',
    heroTitleAccent: 'that actually line up',
    lead: (
      <>
        Page Screenshot Pro is a screenshot extension for Chrome that captures a whole page in one
        image — scrolling feeds, lazy-loaded images, wide tables and sticky navigation included.{' '}
        <strong>Nothing is uploaded.</strong> No account, no server for your images, no queue.
      </>
    ),
    ctaPrimary: 'Add to Chrome',
    ctaGhost: 'See plans',
    trust: ['Free tier, no card', 'Works offline', 'Annotations free', 'Eight interface languages'],
    shotUrl: 'example.com/a-really-long-article',
    shotSticky: 'sticky header — captured once',
    shotSeam: 'seam corrected ±16 px',

    figures: {
      stitch: {
        alt: 'Diagram: a long page captured as six tiles in three rows and two columns, with dashed lines marking the horizontal and vertical seams between them and an arrow showing the capture running down one column before moving to the next.',
        caption:
          'The page is photographed one screen at a time, then the pieces are matched and joined — the dashed lines are where two captures meet.',
      },
      editor: {
        alt: 'Diagram: a screenshot inside the annotation editor, with a toolbar of nine tools above it and a rectangle, an ellipse, an arrow, a freehand stroke and a mosaic block drawn on top.',
        caption: 'Nine tools, all free: rectangle, ellipse, arrow, pen, highlight, text, mosaic, crop, select.',
      },
      local: {
        alt: 'Diagram: a browser window on the left and a local disk on the right, joined through a shield with a padlock in the middle; a cloud above them is struck through.',
        caption: 'Capture, edit and export happen on your machine. No cloud, no upload, no account.',
      },
    },

    featuresTitle: 'What it does well',
    featuresSub:
      'What separates this from a general-purpose screenshot extension: the parts that make a full page screenshot readable instead of a pile of repeated headers and half-drawn images. A screen capture is easy; a readable one is not.',
    features: [
      {
        icon: '↕',
        title: 'Infinite-scroll pages',
        body: (
          <>
            A scrolling screenshot of an endless feed loads the whole feed before the capture starts,
            instead of stopping at the first screen. Long feeds are capped at 40 screens and tell you
            when they were cut.
          </>
        ),
      },
      {
        icon: '🖼',
        title: 'Lazy-loaded images',
        body: (
          <>
            Scrolls ahead and waits for <code>img.decode()</code>, so each bitmap is genuinely
            painted rather than a grey placeholder.
          </>
        ),
      },
      {
        icon: '↔',
        title: 'Pages wider than the window',
        body: (
          <>
            Wide tables, kanban boards and diagrams are captured as a grid and reassembled, without
            losing the right edge.
          </>
        ),
      },
      {
        icon: '🧩',
        title: 'Stitched like one page',
        body: (
          <>
            Navigation stays on the first screen and fixed or sticky elements are hidden after it —
            including inside web components — while adjacent screens are compared and aligned
            within ±16 px. Nothing repeats, nothing jumps.
          </>
        ),
      },
      {
        icon: '🤖',
        title: 'Screenshots for AI clients',
        body: (
          <>
            Claude Desktop, Cursor and other MCP clients can ask the extension to capture the visible
            area, a single element or a full-page scroll, and read the text back with OCR. The bridge
            runs on <code>127.0.0.1</code> on your own machine.
          </>
        ),
      },
      {
        icon: '🔒',
        title: 'Processed on your device',
        body: (
          <>
            Screenshots, annotations and OCR never leave the browser. The extension talks to the
            network only for the optional licence check, for opening Waffo's hosted checkout, and
            for feedback you submit yourself.
          </>
        ),
      },
    ],

    aboutTitle: 'About Page Screenshot Pro',
    aboutP1: (
      <>
        Page Screenshot Pro is a Chrome extension for capturing pages the browser won't capture by
        itself. It scrolls the page, photographs each screen, and stitches the pieces into a single
        image — correcting for the two things that make naive stitching look broken: fixed chrome
        repeating down the page, and content that shifts when that chrome leaves the layout.
      </>
    ),
    aboutP2: (
      <>
        Everything after the capture is here too: a nine-tool annotation editor (rectangle, ellipse,
        arrow, pen, highlight, text, mosaic, crop, select), PDF export, and OCR for Chinese and
        English. Local <code>file://</code> pages work as well, once you tick “Allow access to file
        URLs”.
      </>
    ),

    compareTitle: 'Free and Pro',
    compareSub:
      'The whole annotation editor is free. Pro is about volume, plus element capture, PDF export and merge, OCR and MCP.',
    compareHead: ['Capability', 'Free', 'Pro'],
    compareRows: [
      { label: 'Full-page capture with stitching', free: 'yes', pro: 'yes' },
      { label: 'Visible-area capture', free: 'yes', pro: 'yes' },
      { label: 'Drag-to-select region', free: 'yes', pro: 'yes' },
      { label: 'Infinite-scroll expansion', free: 'yes', pro: 'yes' },
      { label: 'Lazy-image preloading', free: 'yes', pro: 'yes' },
      { label: 'Annotation editor, all nine tools', free: 'yes', pro: 'yes' },
      { label: 'PNG and JPG output, filename templates, subfolders', free: 'yes', pro: 'yes' },
      { label: 'Captures per day', free: { text: '20' }, pro: { text: 'Unlimited' } },
      { label: 'Click-to-capture a single element', free: 'no', pro: 'yes' },
      { label: 'PDF export', free: 'no', pro: 'yes' },
      { label: 'Merge several shots into one PDF', free: 'no', pro: 'yes' },
      { label: 'OCR — extract text, Chinese and English', free: 'no', pro: 'yes' },
      { label: 'MCP access — let AI clients take screenshots', free: 'no', pro: 'yes' },
    ],
    compareNote: (
      <>
        Prices and what's included are on the <a href={P('pricing')}>pricing page</a>.
      </>
    ),

    whyTitle: "Why not just use the browser's built-in screenshot?",
    whyP1: (
      <>
        Chrome DevTools can take a full-size screenshot, and for a plain article it is fine. It
        doesn't expand infinite-scroll feeds, doesn't wait for lazy images, and repeats the sticky
        navigation down the whole image — which is exactly what a feed or a dashboard looks like.
      </>
    ),
    whyP2: (
      <>
        It also can't annotate, can't export PDF, and can't read text out of an image. Those are the
        parts this extension adds, and the annotation half is free. That combination is what
        separates a full-page screenshot tool from a keyboard shortcut.
      </>
    ),

    howTitle: 'Three steps',
    howSteps: [
      {
        title: 'Open a long page',
        body: 'Articles, feeds and release notes all work. Longer pages are where the difference shows.',
      },
      {
        title: 'Click the toolbar icon, or press Alt+Shift+D',
        body: 'Alt+Shift+V grabs only the visible area. Both shortcuts can be rebound on Chrome\'s keyboard shortcuts page.',
      },
      {
        title: 'The file lands in Downloads',
        body: (
          <>
            Named from your template — default <code>{'{title} - {date} {time}.png'}</code>. The
            editor opens if you asked it to.
          </>
        ),
      },
    ],

    whoTitle: "Who it's for",
    who: [
      {
        title: 'Bug reports and QA',
        body: 'Capture the whole broken layout in one image, then circle the defect and mosaic the account name out of it.',
      },
      {
        title: 'Documentation and tutorials',
        body: 'Long step-by-step guides with arrows and numbered highlights, exported as one PNG or one PDF.',
      },
      {
        title: 'Design and content review',
        body: 'Wide boards and tables come back intact, so a review comment can point at a pixel instead of describing it.',
      },
      {
        title: 'Research and archiving',
        body: 'Keep a readable copy of a page before it changes. With OCR, the text inside the image is searchable again.',
      },
    ],

    installTitle: 'Get Page Screenshot Pro',
    installSub: 'Chrome 116 or newer, on Windows, macOS or Linux.',
    installBody: (
      <>
        Page Screenshot Pro is now on the Chrome Web Store. Install it from the listing and
        Chrome keeps it up to date — no manual download, no sideloading.
      </>
    ),
    installStore: 'Add to Chrome',
    installMore: 'Other ways to get it',

    plansTitle: 'Plans',
    plansSub:
      'Free forever. Pro if you need volume, element capture, PDF export and merge, OCR or MCP access. Billed in US dollars by Waffo Pancake, our merchant of record.',
    plans: [
      {
        tag: 'Free',
        name: 'Everyday capture',
        amount: FREE_AMOUNT,
        period: 'forever',
        bullets: [
          'Full-page, visible and region capture',
          'Infinite-scroll and lazy-image handling',
          'The whole annotation editor',
          'PNG and JPG output',
          'Up to 20 captures a day',
        ],
        cta: { label: 'Add to Chrome', to: CHROME_STORE_URL },
      },
      {
        tag: 'Pro Monthly',
        name: 'Short projects',
        amount: PRICE_AMOUNT.monthly,
        period: '/ month',
        bullets: [
          'Everything in Free, unlimited',
          'Element capture',
          'PDF export and PDF merge',
          'OCR, Chinese and English',
          'MCP access for AI clients',
          'Cancel any time',
        ],
        cta: { label: 'Compare plans', to: 'pricing' },
      },
      {
        tag: 'Pro Yearly · Most popular',
        name: 'All year',
        amount: PRICE_AMOUNT.yearly,
        period: '/ year',
        featured: true,
        bullets: [
          'Everything in Free, unlimited',
          'Element capture',
          'PDF export and PDF merge',
          'OCR, Chinese and English',
          'MCP access for AI clients',
          `Works out at about ${YEARLY_PER_MONTH} a month`,
        ],
        cta: { label: 'See how to buy', to: 'pricing', primary: true },
      },
      {
        tag: 'Pro Lifetime',
        name: 'Pay once',
        amount: PRICE_AMOUNT.lifetime,
        period: 'one time',
        bullets: [
          'Everything in Free, unlimited',
          'Element capture',
          'PDF export and PDF merge',
          'OCR, Chinese and English',
          'MCP access for AI clients',
          'No renewal, ever',
        ],
        cta: { label: 'Compare plans', to: 'pricing' },
      },
    ],
    plansNote: (
      <>
        Pro is tied to the browser profile it was bought in. Changed computers or reinstalled?
        Restore it with the email you paid with — inside the extension, no support ticket needed.
        One licence stays active on up to five profiles at a time.
      </>
    ),

    faqTitle: 'Questions',
    faqSub: (
      <>
        The five that come up most. The rest are on the <a href={P('faq')}>FAQ page</a>.
      </>
    ),
    faq: [
      {
        q: 'Are my screenshots uploaded anywhere?',
        a: (
          <>
            <p>
              No. Capture, stitching, annotation, PDF export and OCR all run inside your browser. The
              extension has no analytics and no server for images.
            </p>
            <p>
              The extension only talks to the network for three things: the optional licence check,
              which sends an installation ID and nothing else; opening Waffo's hosted checkout when
              you buy; and the feedback form, if you choose to submit it. MCP access is a fourth
              path that never leaves your machine — see the privacy policy.
            </p>
          </>
        ),
      },
      {
        q: 'Why does the free tier stop at 20 captures a day?',
        a: (
          <>
            <p>
              It's a ceiling against runaway scrolling captures, not a demo limit. Every feature
              except element capture, PDF export and merge, OCR and MCP access is available on
              the free tier, including the whole annotation editor.
            </p>
            <p>The counter resets each day and never counts Pro users.</p>
          </>
        ),
      },
      {
        q: 'Does it work on local HTML files?',
        a: (
          <>
            <p>
              Yes, once you allow it. On <code>chrome://extensions</code>, open the extension's
              details and switch on “Allow access to file URLs”. Chrome will otherwise refuse to
              photograph a <code>file://</code> tab, and the extension will tell you so.
            </p>
          </>
        ),
      },
      {
        q: 'What happens on a page that scrolls forever?',
        a: (
          <>
            <p>
              The extension expands the feed first, then captures up to 40 screens. If it hits that
              cap it says so in the progress text rather than silently truncating.
            </p>
          </>
        ),
      },
      {
        q: 'Which languages does the interface speak?',
        a: (
          <>
            <p>
              English, Simplified Chinese, Traditional Chinese, Japanese, Korean, Spanish, French
              and German. It follows Chrome's UI language by default, and you can override it per
              device from the extension's own language menu.
            </p>
          </>
        ),
      },
    ],
  },

  pricing: {
    h1: 'Simple, honest pricing',
    intro:
      'Free forever for everyday capture, including the whole annotation editor. Pro is for volume, element capture, PDF export and merge, OCR and MCP access. No trials, no credit card on the free tier, no per-image metering.',
    plans: [
      {
        tag: 'Free',
        name: 'Everyday capture',
        amount: FREE_AMOUNT,
        period: 'forever',
        bullets: [
          'Full-page, visible-area and region capture',
          'Infinite-scroll expansion',
          'Lazy-image preloading',
          'Wide pages, stitched in a grid',
          'Annotation editor — all nine tools',
          'PNG and JPG output',
          'Filename templates and subfolders',
          '20 captures a day',
        ],
        cta: { label: 'Add to Chrome', to: CHROME_STORE_URL },
      },
      {
        tag: 'Pro Monthly',
        name: 'Short projects',
        amount: PRICE_AMOUNT.monthly,
        period: '/ month',
        bullets: [
          'Everything in Free, without the daily cap',
          'Click to capture a single element',
          'PDF export',
          'Merge several shots into one PDF',
          'OCR — Chinese and English',
          'MCP access for AI clients',
          'Cancel from the extension, no email needed',
        ],
        cta: { label: 'How to buy', to: '#how-to-buy' },
      },
      {
        tag: 'Pro Yearly · Most popular',
        name: 'All year',
        amount: PRICE_AMOUNT.yearly,
        period: '/ year',
        featured: true,
        bullets: [
          'Everything in Free, without the daily cap',
          'Click to capture a single element',
          'PDF export',
          'Merge several shots into one PDF',
          'OCR — Chinese and English',
          'MCP access for AI clients',
          `About ${YEARLY_PER_MONTH} a month`,
        ],
        cta: { label: 'How to buy', to: '#how-to-buy', primary: true },
      },
      {
        tag: 'Pro Lifetime',
        name: 'Pay once',
        amount: PRICE_AMOUNT.lifetime,
        period: 'one time',
        bullets: [
          'Everything in Free, without the daily cap',
          'Click to capture a single element',
          'PDF export',
          'Merge several shots into one PDF',
          'OCR — Chinese and English',
          'MCP access for AI clients',
          'No renewal, no expiry',
        ],
        cta: { label: 'How to buy', to: '#how-to-buy' },
      },
    ],
    plansNote: (
      <>
        Prices in US dollars. Payment is handled by Waffo Pancake as merchant of record; local taxes
        are added at checkout where they apply. Not sure which tier fits? The{' '}
        <a href={P('faq')}>FAQ</a> has a straight answer to "what does Pro add".
      </>
    ),

    tableTitle: "What's in each tier",
    tableSub: 'One table, no asterisks.',
    tableHead: ['Feature', 'Free', 'Pro'],
    tableRows: [
      { label: 'Full-page capture with automatic stitching', free: 'yes', pro: 'yes' },
      { label: 'Visible-area capture', free: 'yes', pro: 'yes' },
      { label: 'Drag-to-select region', free: 'yes', pro: 'yes' },
      { label: 'Infinite-scroll expansion (up to 40 screens)', free: 'yes', pro: 'yes' },
      { label: 'Lazy-image preloading', free: 'yes', pro: 'yes' },
      { label: 'Fixed and sticky elements captured once', free: 'yes', pro: 'yes' },
      { label: 'Wide pages tiled and reassembled', free: 'yes', pro: 'yes' },
      {
        label:
          'Annotation editor — rectangle, ellipse, arrow, pen, highlight, text, mosaic, crop, select',
        free: 'yes',
        pro: 'yes',
      },
      { label: 'PNG and JPG output with quality control', free: 'yes', pro: 'yes' },
      { label: 'Filename templates and download subfolders', free: 'yes', pro: 'yes' },
      { label: 'Copy to clipboard after capture', free: 'yes', pro: 'yes' },
      {
        label: (
          <>
            Local <code>file://</code> pages
          </>
        ),
        free: 'yes',
        pro: 'yes',
      },
      { label: 'Eight interface languages', free: 'yes', pro: 'yes' },
      { label: 'Captures per day', free: { text: '20' }, pro: { text: 'Unlimited' } },
      { label: 'Click-to-capture a single element', free: 'no', pro: 'yes' },
      { label: 'PDF export', free: 'no', pro: 'yes' },
      { label: 'Merge several shots into one PDF', free: 'no', pro: 'yes' },
      { label: 'OCR — extract text from an image', free: 'no', pro: 'yes' },
      { label: 'MCP access — let AI clients take screenshots', free: 'no', pro: 'yes' },
    ],

    buyTitle: 'How buying works',
    buySub:
      'Checkout starts from inside the extension, so Pro is attached to the right browser profile.',
    buySteps: [
      {
        title: 'Open the extension popup',
        body: 'Click the toolbar icon. The plan buttons sit below the capture buttons.',
      },
      {
        title: 'Pick a plan',
        body: 'A secure Waffo Pancake checkout opens in a new tab. Pay by card; local taxes are shown before you confirm.',
      },
      {
        title: 'Come back — Pro is already on',
        body: 'Closing the tab is fine. The extension picks up the purchase on its own and the badge changes to Pro.',
      },
    ],
    buyNote: (
      <>
        Buying a subscription and a lifetime licence on the same machine is supported: the lifetime
        licence always wins, and a subscription renewal or cancellation never takes it away. Refund
        terms are in the <a href={P('terms')}>terms of service</a>; if the checkout itself misbehaves,{' '}
        <a href={P('support')}>tell us</a> and we'll sort out the order with the payment provider.
      </>
    ),

    billingTitle: 'Billing questions',
    billingFaq: [
      {
        q: 'Can I use Pro on more than one computer?',
        a: (
          <>
            <p>
              A licence is tied to one browser profile. To move it — a new machine, a reinstall, a
              wiped profile — open the popup and use <strong>Restore purchase</strong> with the email
              you paid with. It takes effect immediately and there is no need to pay again.
            </p>
            <p>
              Restore works by pointing the new profile at the original purchase, so both point at
              the same licence rather than duplicating it.
            </p>
            <p>
              One licence covers up to five browser profiles at a time, counting the one it was
              bought on. Restoring on a sixth profile does not fail — it pushes the least recently
              used one off the licence, so keep the email safe and restore on that profile again if
              you go back to it.
            </p>
          </>
        ),
      },
      {
        q: 'How do I cancel a subscription?',
        a: (
          <>
            <p>
              Open the extension's Settings page and scroll to the bottom. The subscription card
              shows your current plan, its status and the expiry date; click it to open the details
              screen, where the cancel button is. No email, no portal, no support ticket.
            </p>
            <p>
              Cancelling stops the renewal. Pro keeps working until the end of the period you already
              paid for, and the details screen says the date. Changed your mind before then? The
              resume button is on that same screen.
            </p>
          </>
        ),
      },
      {
        q: 'Can I switch between monthly and yearly?',
        a: (
          <>
            <p>
              Not in place — a running subscription cannot change tier. Cancel it first, then
              subscribe to the plan you want. The time you have already paid for is added to the new
              plan's period, so changing plans never throws away the days you bought.
            </p>
          </>
        ),
      },
      {
        q: 'Do you offer refunds?',
        a: (
          <>
            <p>
              Yes — write to <a href={mailto(S)}>{S}</a> from the address you paid with, and say
              which order it is. Refunds are processed by Waffo Pancake, our merchant of record.
            </p>
            <p>
              A refunded subscription stops Pro. A refunded lifetime licence also stops Pro — the
              extension checks with the licence server, so the change reaches the machine rather than
              only the invoice.
            </p>
          </>
        ),
      },
      {
        q: 'Is there a trial?',
        a: (
          <>
            <p>
              No, and the free tier makes one unnecessary: every capture mode and the entire
              annotation editor are free, capped at 20 captures a day. Pro is only about removing
              that cap and adding element capture, PDF export and merge, OCR and MCP access.
            </p>
          </>
        ),
      },
      {
        q: 'What happens to my screenshots if I stop paying?',
        a: (
          <>
            <p>
              Nothing. Files already saved are yours and stay where you put them; the extension has
              no server that could hold them. The history list inside the extension stays readable
              too. You simply fall back to the free tier's 20 captures a day, and element capture,
              PDF export and merge, OCR and MCP access go away.
            </p>
          </>
        ),
      },
      {
        q: 'Which payment methods are accepted?',
        a: (
          <>
            <p>
              Whatever Waffo Pancake's checkout offers in your region, typically major credit and
              debit cards. The extension itself never sees or stores your card details — checkout
              runs on Waffo's page, not ours.
            </p>
          </>
        ),
      },
    ],
  },

  faq: {
    h1: 'Frequently asked questions',
    intro: (
      <>
        Capture behaviour first, then licensing. If the answer isn't here,{' '}
        <a href={P('support')}>write to us</a> — a real person reads it.
      </>
    ),
    groups: [
      {
        title: 'Capturing',
        items: [
          {
            q: 'Why is a sticky header missing from the middle of my screenshot?',
            a: (
              <>
                <p>
                  That's deliberate, and it's the main thing that makes a long screenshot readable. A
                  sticky navigation bar would otherwise be photographed on every single screen, so it
                  appears once at the top and is hidden from everything after.
                </p>
                <p>
                  The hiding uses <code>visibility</code> rather than <code>display: none</code>,
                  because removing an element from the layout would change the page height halfway
                  through the capture and put the pieces in two different coordinate systems.
                </p>
                <p>
                  If a header you expected to stay <em>is</em> missing, the page is probably making
                  it sticky with CSS on scroll. The extension re-checks positions as it scrolls, so
                  send us the URL.
                </p>
              </>
            ),
          },
          {
            q: 'Why are some images blank?',
            a: (
              <>
                <p>
                  Images that load lazily may not have finished decoding when that screen was
                  photographed. Turn on{' '}
                  <strong>Trigger and wait for lazy-loaded images before capture</strong> in
                  Settings — the extension then scrolls ahead and waits for each bitmap to decode.
                </p>
                <p>
                  Content behind a login, a cookie wall, or a click cannot be helped: the extension
                  photographs what the page actually renders.
                </p>
              </>
            ),
          },
          {
            q: 'The page scrolls forever. Does it work?',
            a: (
              <>
                <p>
                  Yes. <strong>Expand infinite-scroll pages before capture</strong> is on by default:
                  the page is scrolled to the bottom in steps until no new content arrives, and only
                  then does capturing begin.
                </p>
                <p>
                  There is a hard cap of 40 screens so a genuinely endless feed can't hang the
                  browser. When the cap is hit, the progress text says the capture was cut short — it
                  never silently truncates.
                </p>
              </>
            ),
          },
          {
            q: 'What about a page wider than my window?',
            a: (
              <>
                <p>
                  Wide tables, kanban boards and diagrams are captured as a grid and reassembled row
                  by row, so the right edge isn't lost. Horizontal seams are hard-edged rather than
                  faded — on a page with vertical rules or card boundaries that's invisible; across
                  one continuous bitmap you may notice the join.
                </p>
                <p>
                  If the page is only a few pixels wider than the window because of a rounding quirk,
                  the extension treats it as one column rather than adding a sliver of a second one.
                </p>
              </>
            ),
          },
          {
            q: 'Can I capture a local HTML file?',
            a: (
              <>
                <p>
                  Yes, after granting permission. Open <code>chrome://extensions</code>, find Page
                  Screenshot Pro, open its details, and switch on{' '}
                  <strong>Allow access to file URLs</strong>. Chrome blocks a <code>file://</code> tab
                  from being photographed otherwise, and the extension will tell you that's what
                  happened rather than failing quietly.
                </p>
              </>
            ),
          },
          {
            q: 'Does it work in Edge, Brave or other Chromium browsers?',
            a: (
              <>
                <p>
                  It targets Chrome 116 and newer. Chromium-based browsers that implement the same
                  extension APIs generally work, but Chrome is what it's built and tested against —
                  the capture path uses APIs that are not guaranteed to behave identically elsewhere.
                </p>
              </>
            ),
          },
          {
            q: 'Where do the files go, and can I change the name?',
            a: (
              <>
                <p>
                  Downloads, by default. In Settings you can set a filename template using{' '}
                  <code>{'{title}'}</code>, <code>{'{host}'}</code>, <code>{'{date}'}</code>,{' '}
                  <code>{'{time}'}</code>, <code>{'{width}'}</code> and <code>{'{height}'}</code>,
                  choose a subfolder, switch the default format between PNG and JPG, and decide
                  whether the Save As dialog appears each time.
                </p>
              </>
            ),
          },
          {
            q: 'Can I capture just one element, without the whole page?',
            a: (
              <>
                <p>
                  Yes — right-click the element and choose the capture item from the context menu.
                  Element capture is a Pro feature; the other three capture modes (full page, visible
                  area, drag-to-select region) are free.
                </p>
              </>
            ),
          },
        ],
      },
      {
        title: 'Privacy and data',
        items: [
          {
            q: 'Are my screenshots uploaded anywhere?',
            a: (
              <>
                <p>
                  No. Capture, stitching, annotation, PDF export and OCR all run inside your browser.
                  There is no analytics, no telemetry, and no image server.
                </p>
                <p>
                  The extension talks to the network only for the optional licence check, which
                  sends a randomly generated installation ID and receives a plan status; for opening
                  Waffo's hosted checkout when you buy; and for the feedback form, if you submit it.
                  The licence request contains no image, no page URL and no browsing history. With
                  payment disabled, the extension makes no network requests at all unless you submit
                  feedback or turn on MCP, which only ever connects to your own machine over
                  127.0.0.1.
                </p>
              </>
            ),
          },
          {
            q: 'What is the installation ID?',
            a: (
              <>
                <p>
                  A random identifier created on first run and stored locally. It exists so a licence
                  can be attached to a browser profile without an account, an email login or a
                  password. It is not derived from your machine, your Chrome profile or your
                  browsing.
                </p>
                <p>
                  Restoring a purchase links a new installation ID to the original one; nothing else
                  is sent.
                </p>
              </>
            ),
          },
          {
            q: 'Does OCR send my image anywhere?',
            a: (
              <>
                <p>
                  No. The OCR engine and its language data ship inside the extension and run locally
                  in a sandboxed document. Nothing leaves the browser, and it works with no network
                  connection.
                </p>
              </>
            ),
          },
          {
            q: "What's kept in the extension's history?",
            a: (
              <>
                <p>
                  The last 30 captures, with a thumbnail, kept in local browser storage so you can
                  re-open or re-export them. Older entries are pruned automatically. You can clear
                  the list from the popup, and uninstalling the extension removes it with the rest of
                  its storage.
                </p>
              </>
            ),
          },
        ],
      },
      {
        title: 'Licences and billing',
        items: [
          {
            q: 'Why does the free tier stop at 20 captures a day?',
            a: (
              <>
                <p>
                  It's a ceiling against runaway scrolling captures — a page with an endless feed can
                  produce dozens of screens in one click — not a demo limitation. Everything except
                  element capture, PDF export and merge, OCR and MCP access is on the free tier,
                  including the
                  entire annotation editor. The <a href={P('pricing')}>pricing page</a> lists the
                  split line by line.
                </p>
                <p>
                  The counter resets each day and never counts Pro users. A capture that
                  fails or that you cancel does not use up one of the 20.
                </p>
              </>
            ),
          },
          {
            q: 'How do I get Pro back after reinstalling, or on a new computer?',
            a: (
              <>
                <p>
                  Open the popup and use <strong>Restore purchase</strong> with the email you paid
                  with. It takes effect immediately and you don't pay again.
                </p>
                <p>
                  For safety the response is the same whether or not that email has a purchase, so a
                  stranger can't use the form to find out whether you bought something. If Pro
                  doesn't appear, the email is probably not the one on the order — write to{' '}
                  <a href={mailto(S)}>{S}</a>.
                </p>
              </>
            ),
          },
          {
            q: 'How do I cancel a subscription?',
            a: (
              <>
                <p>
                  Open the extension's Settings page and scroll to the bottom. The subscription card
                  shows your current plan, its status and the expiry date. Click it to open the
                  details screen: the order list and the cancel button are there. There's no portal
                  to visit and no support ticket to file.
                </p>
                <p>
                  Cancelling stops the renewal; Pro keeps working until the end of the period you
                  already paid for, and the details screen shows that date. You can resume from the
                  same screen before it expires, and if you subscribe again later the time left is
                  added to the new period.
                </p>
              </>
            ),
          },
          {
            q: 'I bought lifetime and also have a subscription. Which wins?',
            a: (
              <>
                <p>
                  The lifetime licence always wins. A subscription renewal, cancellation or expiry
                  never removes a lifetime licence — that's enforced on the server, not just in the
                  interface.
                </p>
                <p>
                  The popup says which one you have, so a lifetime owner and a subscriber don't see
                  the same screen.
                </p>
              </>
            ),
          },
          {
            q: 'Do you offer refunds?',
            a: (
              <>
                <p>
                  Yes. Write to <a href={mailto(S)}>{S}</a> from the address you paid with and say
                  which order it is. Refunds are processed by Waffo Pancake, our merchant of record,
                  so the money comes back the way it went out.
                </p>
                <p>
                  If the refunded order is the lifetime licence, Pro is revoked; a refund on one
                  order doesn't touch a separate licence you still own.
                </p>
              </>
            ),
          },
          {
            q: 'What happens to my screenshots if I stop paying?',
            a: (
              <>
                <p>
                  Nothing. Files already saved are yours and stay where you put them; the history
                  list inside the extension stays readable. You fall back to the free tier's 20
                  captures a day, and element capture, PDF export and merge, OCR and MCP access stop
                  being
                  available.
                </p>
              </>
            ),
          },
        ],
      },
      {
        /* 唯一带 `id` 的一组：扩展设置页的 MCP 卡片里那个「完整说明」按钮
           就指向 `/faq/#mcp`。八份字典必须都有这个 id，否则
           `tests/dict.test.ts` 的 shapeDiff 会在「多出字段/缺字段」上报错。 */
        id: 'mcp',
        title: 'AI clients (MCP)',
        items: [
          {
            q: 'What is MCP access?',
            a: (
              <>
                <p>
                  It lets an AI client — Claude Desktop, Cursor, Claude Code, or anything else that
                  speaks the Model Context Protocol — take screenshots through this extension. You
                  ask in the chat, the client calls a tool, and the extension captures the active
                  tab.
                </p>
                <p>
                  Nothing is uploaded. The client and the extension talk over a loopback socket on{' '}
                  <code>127.0.0.1</code>, so the image goes from your browser straight to the client
                  on the same machine. There is no account and no server in between.
                </p>
              </>
            ),
          },
          {
            q: 'How do I set it up?',
            a: (
              <>
                <p>Two pieces, and you need both.</p>
                <ul>
                  <li>
                    Turn on <strong>Settings → AI / MCP access</strong> in the extension and tick
                    the checkbox. The card then shows a token and a ready-made JSON block.
                  </li>
                  <li>
                    Your MCP client runs <code>npx -y page-screenshot-mcp</code>; you do not install
                    it by hand. Node <strong>20 or newer</strong> is required.
                  </li>
                </ul>
                <p>
                  Paste that JSON into the <code>mcpServers</code> block of the client's config
                  file, then restart the client. The status dot on the extension's card turns green
                  once the bridge connects.
                </p>
              </>
            ),
          },
          {
            q: 'The AI reports needs_user_gesture. What do I do?',
            a: (
              <>
                <p>
                  Chrome requires a real click before a page can be captured, and a call started by
                  an AI has no click behind it. Click the extension's toolbar icon once (or press{' '}
                  <code>Alt+Shift+D</code>), then let the AI retry — it will go through.
                </p>
                <p>
                  This is a browser rule, not a defect. Bypassing it would mean asking for access to
                  every site you visit, which this extension deliberately does not do.
                </p>
              </>
            ),
          },
          {
            q: 'Which tools need Pro?',
            a: (
              <>
                <p>
                  <code>psp_status</code> is free: it only reports the connection and licence
                  state, so an AI can always tell you what is wrong. The other seven need Pro.
                </p>
                <ul>
                  <li>
                    <code>capture_visible</code>, <code>capture_full_page</code>,{' '}
                    <code>capture_element</code> — the three capture modes.
                  </li>
                  <li>
                    <code>ocr_capture</code>, <code>export_pdf</code> — OCR and PDF over a capture.
                  </li>
                  <li>
                    <code>history_list</code>, <code>history_get</code> — the stored screenshots.
                  </li>
                </ul>
                <p>
                  Captures run through the extension's normal pipeline, so the daily quota,{' '}
                  <code>file://</code> permission, infinite-scroll expansion and lazy-image
                  preloading all apply exactly as they do for a click.
                </p>
              </>
            ),
          },
        ],
      },
    ],
    stuckTitle: 'Still stuck?',
    stuckBody:
      "Include the page URL (if public), your Chrome version and the output image. That's usually enough to reproduce it.",
    stuckMail: 'Email support',
    stuckMore: 'All contact options',
  },

  support: {
    h1: 'Support',
    intro: (
      <>
        There's no ticket system and no chatbot. Every message goes to{' '}
        <a href={mailto(S)}>{S}</a> and a real person answers it, usually within two business days.
      </>
    ),
    cards: [
      {
        icon: '✉',
        title: 'Email us',
        body: "For anything: a bug, a question about a feature, a licence that didn't come back after a reinstall.",
        cta: 'Open your mail app',
        to: mailto(S),
      },
      {
        icon: '🐞',
        title: 'Report a bug',
        body: "Pick a category, describe what happened, and leave an email if you want a reply. Mentioning the page URL (if it's public) and your Chrome version is usually enough to reproduce it.",
        cta: 'Send feedback',
        to: '#feedback',
      },
      {
        icon: '💳',
        title: 'Licence or refund',
        body: 'Write from the address you paid with and say which order it is. Refunds are handled by Waffo Pancake, our merchant of record.',
        cta: 'Contact billing',
        to: mailto(S, 'Licence or refund — Page Screenshot Pro'),
      },
    ],
    form: {
      title: 'Send feedback',
      sub: 'Straight to the developer — no ticket system, no bot. It is the same form as the one inside the extension.',
      categoryLabel: 'Category',
      categories: {
        bug: 'Bug / something broke',
        feature: 'Feature request',
        purchase: 'Purchase or license issue',
        other: 'Other',
      },
      messageLabel: 'What happened',
      messagePlaceholder: 'What you expected, what you got, and the steps that got you there. The page URL and your Chrome version help if you have them.',
      emailLabel: 'Your email (optional)',
      emailHint: 'Leave it empty to stay anonymous. Fill it in and the reply goes there — it is also the only way to recover a licence after a reinstall.',
      submit: 'Send',
      note: 'The message goes to the developer only. Nothing from the page you were capturing is sent.',
    },
    beforeTitle: 'Before you write',
    beforeSub: 'Two things solve most reports on their own.',
    before: [
      {
        title: 'Blank areas in the image',
        body: (
          <>
            Usually lazy-loaded images that hadn't decoded yet. Settings → Capture → turn on{' '}
            <strong>Trigger and wait for lazy-loaded images before capture</strong>. It's slower,
            which is why it isn't the only mode.
          </>
        ),
      },
      {
        title: (
          <>
            A local <code>file://</code> page won't capture
          </>
        ),
        body: (
          <>
            Chrome blocks it until you allow it. Open <code>chrome://extensions</code>, open this
            extension's details, and switch on <strong>Allow access to file URLs</strong>. The
            extension shows a link straight to that page when it's the cause.
          </>
        ),
      },
    ],
    beforeNote: (
      <>
        More answers on the <a href={P('faq')}>FAQ page</a>.
      </>
    ),
    selfTitle: 'The three things people write in about',
    selfSub: 'Each of these has a straight answer, and none of them is a bug.',
    self: [
      {
        title: 'The screenshot is misaligned, or the bottom is missing',
        body: (
          <>
            <p>
              Long captures are photographed one screen at a time and stitched by measured scroll
              position, so if the page moves while it is being captured, the seams land in the wrong
              place. Two things move a page on their own.
            </p>
            <p>
              The first is an infinite-scroll feed still loading new content: turn on{' '}
              <strong>Expand infinite-scroll pages before capture</strong> in Settings, which
              exhausts the feed before the first tile is taken instead of during the run. The second
              is a header that becomes <code>position: fixed</code> only after you scroll, which
              takes its height out of the document flow and shifts everything below it by that much.
              The extension measures that shift and corrects the tiles, but the correction is a
              median over anchor elements — a page whose entire layout depends on scroll position can
              still defeat it.
            </p>
            <p>
              If a capture is still off, the <a href={P('faq')}>FAQ</a> has the exact conditions
              under which each mode wins, and sending us the URL with the output image is usually
              enough to reproduce it.
            </p>
          </>
        ),
      },
      {
        title: (
          <>
            A local <code>file://</code> page won't capture
          </>
        ),
        body: (
          <>
            <p>
              This one is Chrome, not the extension. A <code>file://</code> page is a separate
              permission from "read the page you're on", and Chrome refuses to hand it over until you
              allow it explicitly — for every extension, not just this one.
            </p>
            <p>
              Open <code>chrome://extensions</code>, open this extension's details, and switch on{' '}
              <strong>Allow access to file URLs</strong>. The extension detects exactly this state
              and shows a link straight to that page, so you don't have to hunt for it.
            </p>
            <p>
              Note that this is a permission, not a switch inside the extension: there is no setting
              in the popup that can grant it on Chrome's behalf. The <a href={P('faq')}>FAQ</a> lists
              what else needs a permission rather than a toggle.
            </p>
          </>
        ),
      },
      {
        title: 'I bought Pro, but a new machine says Free',
        body: (
          <>
            <p>
              A licence is attached to the browser profile that paid, so a new machine, a fresh
              profile or a wiped one starts out free. Nothing is lost: open the popup and use{' '}
              <strong>Restore purchase</strong> with the email address you paid with.
            </p>
            <p>
              That email is the only credential — there is no password and no account page — so keep
              it somewhere you'll still have it after a reinstall. Restore takes effect immediately
              and does not charge again.
            </p>
            <p>
              If the email no longer reaches you, write to{' '}
              <a href={mailto(S)}>{S}</a> from any address and include the order number from the
              receipt; that is enough to find the purchase. The rest of the licensing questions are
              on the <a href={P('pricing')}>pricing page</a>.
            </p>
          </>
        ),
      },
    ],
    reportTitle: 'Reporting a capture problem',
    reportP1: (
      <>
        The feedback form above is the fastest route: pick a category, write what happened, add an
        email if you want a reply, and it goes straight to the developer. With the extension
        installed the same form opens inside it — popup → <strong>Send feedback</strong>, or the
        button on the Settings page. Either way it sends only what you type, so still mention the
        extension version and the page you were on.
      </>
    ),
    reportP2: 'Either way — form or email — these four details save a round trip:',
    reportList: [
      "The page URL, if it's public.",
      <>
        Your Chrome version (from <code>chrome://version</code>).
      </>,
      'Where the output image goes wrong — the form has no attachment field, so describe it (or email us the image).',
      'Whether the page uses its own scroll container, like a document editor or a dashboard panel.',
    ],
    privacyTitle: 'Privacy questions',
    privacyBody: (
      <>
        For data requests, deletion or anything else covered by the privacy policy, write to{' '}
        <a href={mailto(PRIVACY_EMAIL)}>{PRIVACY_EMAIL}</a> — a different address from support, so
        those requests don't get mixed in with bug reports. The policy itself is at{' '}
        <a href={P('privacy')}>/privacy/</a>.
      </>
    ),
  },

  privacy: {
    h1: 'Privacy Policy',
    effective: 'Effective date: November 2, 2026',
    intro: (
      <>
        Page Screenshot Pro (“the extension”) captures full-page screenshots, annotates them, exports
        PDFs and runs on-device OCR. This policy explains what the extension and its licence server
        handle — in short: <strong>your screenshots never leave your device</strong>.
      </>
    ),
    sections: [
      {
        title: '1. What stays on your device',
        body: (
          <ul>
            <li>
              <strong>Screenshots and captures.</strong> Everything you capture is processed and
              stored locally in your browser (browser storage / IndexedDB). Captured images are never
              uploaded to us or to any third party.
            </li>
            <li>
              <strong>OCR.</strong> Text recognition runs fully offline using a bundled OCR engine
              (Tesseract.js) inside your browser. Images used for OCR never leave your device.
            </li>
            <li>
              <strong>Editor and clipboard.</strong> Annotations happen locally. The clipboard is
              written to only when you explicitly click a copy action.
            </li>
            <li>
              <strong>MCP access (Pro, off by default).</strong> When you turn it on, the extension
              acts as a client connecting to a bridge process you start yourself on{' '}
              <code>127.0.0.1</code> on your own machine, so an AI client such as Claude Desktop or
              Cursor can drive captures. That connection never leaves your machine — it does not
              pass through us or any third party, and it does not leave your local network. Capture
              data only travels between two processes on your own computer. Unless you flip that
              switch, the connection is never established.
            </li>
          </ul>
        ),
      },
      {
        title: '2. What we store to manage your licence',
        body: (
          <ul>
            <li>
              <strong>Install ID.</strong> On first run the extension generates a random identifier
              (UUID). It is stored in your browser (<code>chrome.storage.sync</code>, which roams
              across your devices under your own Google account, with a local fallback). It is used
              only as the key for your Pro licence — it contains no personal information.
            </li>
            <li>
              <strong>Licence state.</strong> Whether Pro is unlocked and which plan you bought is
              stored locally in your browser.
            </li>
          </ul>
        ),
      },
      {
        title: '3. Payments',
        body: (
          <>
            <p>
              Payments are processed by <strong>Waffo</strong>, our merchant of record. The
              checkout opens a page hosted by Waffo in your browser — your card details go directly
              to Waffo and never reach the extension or our servers. See{' '}
              <a href="https://waffo.ai" rel="noopener">
                waffo.ai
              </a>{' '}
              for Waffo's own privacy policy.
            </p>
            <p>
              After a successful payment, Waffo notifies our licence server, which records: the
              plan purchased, its status and period, your installation ID, and — only so you can
              restore a purchase later — the email address you paid with, mapped to that installation
              ID. No screenshot content, page content or browsing history is ever sent to the
              licence server.
            </p>
          </>
        ),
      },
      {
        title: '4. Restore purchase',
        body: (
          <p>
            If you reinstall the extension or move to a new computer, you can restore Pro by entering
            the email you paid with. The server looks up the email → installation ID mapping and
            links your new installation ID to the original licence. Restore requests are
            rate-limited; the server never reveals whether an email has purchases on record.
          </p>
        ),
      },
      {
        title: '5. Permissions — why the extension asks for them',
        body: (
          <ul>
            <li>
              <code>activeTab</code> / <code>scripting</code> — to capture the tab you ask it to;
              content scripts are injected on demand only.
            </li>
            <li>
              <code>file:///</code> host access — only for local-file screenshots, and only if you
              enable “Allow access to file URLs” in Chrome.
            </li>
            <li>
              <code>downloads</code> — to save images and PDFs you export.
            </li>
            <li>
              <code>storage</code> / <code>unlimitedStorage</code> — for settings, licence state and
              capture history.
            </li>
            <li>
              <code>clipboardWrite</code> — only when you use a copy action.
            </li>
            <li>
              <code>contextMenus</code> — right-click menu entries.
            </li>
            <li>
              <code>notifications</code> — local error alerts only (for example, a capture failure).
            </li>
            <li>
              <code>tabs</code> — to notice when the checkout tab returns, so a completed payment
              unlocks Pro.
            </li>
            <li>
              <code>offscreen</code> — to stitch images in an invisible document instead of opening a
              tab.
            </li>
            <li>
              <code>identity</code> / <code>identity.email</code> — to pre-fill the email field on
              the checkout page. The address is read from your Chrome profile and, once you have
              typed one in, remembered in this browser's local storage so the next checkout can
              pre-fill it. It reaches our licence server only as part of a purchase you start or a
              feedback you submit.
            </li>
          </ul>
        ),
      },
      {
        title: '6. What we do NOT do',
        body: (
          <ul>
            <li>No analytics, no telemetry, no advertising SDKs.</li>
            <li>We do not sell, rent or share your data with third parties for marketing.</li>
            <li>
              The extension makes no network requests of its own except licence checks to our
              licence server (installation ID only), opening Waffo's hosted checkout, the feedback
              form when you submit it, and the local MCP connection you enable yourself.
            </li>
          </ul>
        ),
      },
      {
        title: '7. Data retention and deletion',
        body: (
          <p>
            Licence records are kept for as long as your purchase or subscription is active, and
            afterwards for as long as our payment processor needs them for tax and accounting.
            Uninstalling the extension removes all locally stored data — screenshots, settings and
            installation ID. To delete your licence-server record, contact us at the address below.
            What a licence entitles you to, and how refunds work, are the subject of the{' '}
            <a href={P('terms')}>terms of service</a> rather than this policy.
          </p>
        ),
      },
      {
        title: '8. Changes',
        body: (
          <p>
            If this policy changes materially, we will update the effective date above and note the
            change in the extension's release notes.
          </p>
        ),
      },
      {
        title: '9. Contact',
        body: (
          <p>
            Questions about this policy: <a href={mailto(PRIVACY_EMAIL)}>{PRIVACY_EMAIL}</a> — a
            different address from ordinary support, so data requests don't get mixed in with bug
            reports. Anything that isn't about privacy goes to{' '}
            <a href={P('support')}>the support page</a>.
          </p>
        ),
      },
    ],
  },

  terms: {
    h1: 'Terms of Service',
    effective: 'Effective date: October 29, 2026',
    intro:
      'These terms cover your use of the Page Screenshot Pro browser extension and of the licence server behind it. By installing or using the extension you agree to them. If you do not, uninstall it — that removes everything it stored locally.',
    sections: [
      {
        title: '1. Licence scope',
        body: (
          <>
            <p>
              We grant you a personal, non-exclusive, non-transferable licence to install and use the
              extension on browser profiles you control. Pro features are licensed per browser
              profile, not per person; moving a licence between profiles is done with{' '}
              <strong>Restore purchase</strong>, not by sharing one. One licence may be active on up
              to five browser profiles at once, counting the profile it was bought on; restoring on
              a sixth pushes the least recently used one off the licence.
            </p>
            <p>
              You may not resell, sublicense, rent or redistribute the extension, or bundle it into
              another product, without written permission.
            </p>
          </>
        ),
      },
      {
        title: '2. The free tier',
        body: (
          <>
            <p>
              The free tier includes full-page, visible-area and region capture, infinite-scroll
              expansion, lazy-image handling, the complete annotation editor, and PNG/JPG output,
              capped at <strong>20 captures per calendar day</strong>. The cap, the split between
              Free and Pro, and the features themselves may change in a future version; when they
              do, we will say so in the release notes rather than changing them silently.
            </p>
            <p>
              Pro removes the daily cap and adds element capture, PDF export, PDF merge, OCR and
              MCP access. A
              capture that fails or that you cancel does not count against the daily limit.
            </p>
          </>
        ),
      },
      {
        title: '3. Purchases, renewals and refunds',
        body: (
          <>
            <p>
              Paid plans are sold and processed by <strong>Waffo</strong> as merchant of record.
              Waffo's own terms apply to the payment transaction itself; these terms govern the
              licence the payment buys.
            </p>
            <ul>
              <li>
                <strong>Subscriptions</strong> renew automatically until cancelled. You can cancel at
                any time from the extension's Settings page — no email, no portal.
              </li>
              <li>
                <strong>Cancelling</strong> stops the renewal; Pro keeps working until the end of the
                period already paid for.
              </li>
              <li>
                <strong>Changing plan</strong> means cancelling and subscribing again: a running
                subscription cannot change tier in place. Time already paid for is added to the new
                plan's period, so a change never costs you the days you bought.
              </li>
              <li>
                <strong>Lifetime</strong> is a one-time payment with no renewal. It is not affected
                by a subscription renewal, cancellation or expiry on the same profile.
              </li>
              <li>
                <strong>Refunds</strong> are available on request — write to{' '}
                <a href={mailto(S)}>{S}</a> from the address you paid with. A refund ends the licence
                it paid for.
              </li>
            </ul>
            <p>
              Prices are shown in US dollars and may change. A price change never applies
              retroactively to a period you have already paid for.
            </p>
          </>
        ),
      },
      {
        title: '4. Your responsibilities',
        body: (
          <>
            <p>
              The extension captures whatever is on screen. That means the content of your screenshot
              is your responsibility, including:
            </p>
            <ul>
              <li>
                <strong>Copyright and other rights.</strong> Capturing a page is not a licence to
                republish it. If you share or publish a capture, make sure you have the right to.
              </li>
              <li>
                <strong>Confidential and personal information.</strong> A screenshot can contain
                names, addresses, account numbers or private messages. The annotation editor's mosaic
                and crop tools exist for exactly this; use them before sharing.
              </li>
              <li>
                <strong>Terms of the sites you capture.</strong> Some services prohibit automated or
                scripted capture of their pages. That is between you and them.
              </li>
            </ul>
          </>
        ),
      },
      {
        title: '5. Acceptable use',
        body: (
          <p>
            You may not use the extension to capture content you have no lawful access to, to
            circumvent a paywall or access control, or in any way that breaks applicable law. We may
            suspend a licence obtained through fraud or a reversed payment.
          </p>
        ),
      },
      {
        title: '6. What the extension does not promise',
        body: (
          <>
            <p>
              A screenshot is a photograph of a rendering, and some pages are hostile to that.
              Specifically:
            </p>
            <ul>
              <li>
                <strong>Content behind a login, a click or a consent wall</strong> is not captured,
                because the extension photographs what the page actually renders.
              </li>
              <li>
                <strong>Pages with unusual scroll containers</strong> — document editors, dashboards
                with their own panes — are handled heuristically. The extension measures the scroll
                container and corrects for content that shifts, but a page can always be built in a
                way it misreads.
              </li>
              <li>
                <strong>Very long feeds</strong> are capped at 40 screens per capture. The progress
                text says when the cap was hit.
              </li>
              <li>
                <strong>Horizontal seams</strong> on a page that is both very wide and continuous may
                be visible as a hard edge. This is a documented limitation, not a defect we are
                hiding.
              </li>
              <li>
                <strong>OCR accuracy</strong> depends on the image. Text below roughly 6 pixels tall
                will not be recognised reliably.
              </li>
            </ul>
          </>
        ),
      },
      {
        title: '7. Availability and changes',
        body: (
          <>
            <p>
              The extension runs locally and needs no server, so a server outage does not stop you
              capturing. The licence server is used for purchases, restoring a purchase and checking
              subscription status; if it is unreachable, an existing local licence keeps working.
            </p>
            <p>
              We may update, change or discontinue features. If we discontinue a feature you paid
              for, we will offer a remedy proportionate to what remains of your paid period.
            </p>
          </>
        ),
      },
      {
        title: '8. Disclaimer of warranty',
        body: (
          <p>
            The extension is provided “as is”, without warranties of any kind, express or implied,
            including fitness for a particular purpose. It is a tool, not a guarantee: verify that a
            capture is complete before relying on it for anything that matters.
          </p>
        ),
      },
      {
        title: '9. Limitation of liability',
        body: (
          <>
            <p>
              To the extent permitted by law, our total liability arising out of or relating to the
              extension is limited to the amount you paid for it in the twelve months before the
              claim. We are not liable for indirect or consequential loss — including lost data, lost
              profits, or a screenshot that failed to capture something you needed.
            </p>
            <p>Nothing in these terms excludes liability that cannot be excluded by law.</p>
          </>
        ),
      },
      {
        title: '10. Privacy',
        body: (
          <p>
            What the extension stores and what it never sends is described in the{' '}
            <a href={P('privacy')}>privacy policy</a>, which forms part of these terms.
          </p>
        ),
      },
      {
        title: '11. Termination',
        body: (
          <p>
            You can stop at any time by uninstalling the extension. We may terminate a licence for a
            material breach of section 4 or 5. On termination, sections 8, 9 and 12 survive.
          </p>
        ),
      },
      {
        title: '12. Governing law and contact',
        body: (
          <p>
            These terms are governed by the laws applicable at the merchant of record's place of
            business, without regard to conflict-of-law rules. Questions about these terms:{' '}
            <a href={mailto(S)}>{S}</a>. For anything about the extension itself rather than these
            terms, the <a href={P('support')}>support page</a> reaches us faster.
          </p>
        ),
      },
    ],
  },

  notFound: {
    title: 'Page not found',
    body: 'That page does not exist. It may have moved, or the link may be a typo.',
    cta: 'Back to the home page',
  },
};

export default en;
