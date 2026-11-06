import { FREE_AMOUNT, PRICE_AMOUNT, YEARLY_PER_MONTH } from '../content/prices';
import { CHROME_STORE_URL, PRIVACY_EMAIL, SUPPORT_EMAIL, mailto } from '../content/site';
import type { Dict } from './dict';
import { pathFor } from './paths';

/* 德语文案。
 *
 * 结构、键名、数组长度与 en.tsx 完全一致（`Dict` 只保证键齐全，数不了数组
 * 长度；漏一条问答在页面上就是少一行，编译不报错——所以 tests/dict.test.ts
 * 会递归比对八份字典的形状）。
 *
 * 站内链接走 `P()`，金额走 prices.ts 的常量，地址走 site.ts。这三样都不在
 * 这份文件里出现字面量，否则改一次要改八处。
 *
 * **德语文句也不要在源码里折行。** JSX 会把「换行 + 缩进」折成一个空格；
 * 德语的长复合词配上一段断行，很容易在词中间或标点前插进一个空格。每个
 * 文本段写成一行，只在标签外换行。
 */

const S = SUPPORT_EMAIL;
const P = (page: Parameters<typeof pathFor>[1]) => pathFor('de', page);

const de: Dict = {
  meta: {
    '': {
      title: 'Page Screenshot Pro — Ganzseiten-Screenshots ohne Lücken',
      description:
        'Screenshot-Erweiterung für Chrome: ganze Seiten als ein Bild — endloses Scrollen, nachgeladene Bilder, breite Tabellen, fixe Kopfzeilen. Anmerkungen, PDF, OCR.',
      ogDescription:
        'Eine ganze Seite als ein Bild aufnehmen. Anmerkungen, PDF-Export und OCR. Alles läuft auf Ihrem Gerät.',
    },
    pricing: {
      title: 'Preise — kostenlos und Pro · Page Screenshot Pro',
      description: `Kostenlos: 20 Aufnahmen/Tag inkl. Editor. Pro: Element-Aufnahme, PDF-Export/-Zusammenführung, OCR, MCP-Zugriff — ${PRICE_AMOUNT.monthly}/Monat, ${PRICE_AMOUNT.yearly}/Jahr oder ${PRICE_AMOUNT.lifetime} einmalig.`,
      ogDescription:
        'Kostenlos mit 20 Aufnahmen pro Tag und dem vollständigen Anmerkungs-Editor. Pro ergänzt Element-Aufnahme, PDF-Export, PDF-Zusammenführung, OCR und MCP-Zugriff.',
    },
    faq: {
      title: 'Häufige Fragen — lange Seiten · Page Screenshot Pro',
      description:
        'Lange Seiten, Endlos-Scrollen, nachgeladene Bilder, lokale file://-Dateien, Datenschutz, Lizenzen, Kauf wiederherstellen und Aufnahmen per MCP.',
      ogDescription:
        'Antworten zu langen Seiten, Endlos-Scrollen, lokalen Dateien, Datenschutz, Lizenzen und MCP-Zugriff.',
    },
    support: {
      title: 'Hilfe und Kontakt — Fehler, Erstattung · Page Screenshot Pro',
      description:
        'E-Mail-Support für Page Screenshot Pro: Fehlerberichte, Aufnahmeprobleme, Lizenz- und Erstattungsfragen. Ein Mensch antwortet, meist in 2 Werktagen.',
      ogDescription: 'Fehlerberichte, Aufnahmeprobleme, Lizenz- und Erstattungsfragen.',
    },
    privacy: {
      title: 'Datenschutz — alles bleibt lokal · Page Screenshot Pro',
      description:
        'Was Page Screenshot Pro speichert und nie überträgt: Aufnahmen, Anmerkungen und OCR bleiben auf Ihrem Gerät. Netzwerk für Lizenzprüfung, Waffo-Kasse, Feedback.',
      ogDescription:
        'Aufnahmen, Anmerkungen und OCR bleiben auf Ihrem Gerät. Die einzigen Netzwerkanfragen sind die optionale Lizenzprüfung, das Öffnen der von Waffo gehosteten Kasse beim Kauf und das Feedback, das Sie selbst absenden. Der lokale MCP-Zugriff über 127.0.0.1 verlässt Ihren Rechner nie.',
    },
    terms: {
      title: 'Nutzungsbedingungen — Lizenzen · Page Screenshot Pro',
      description:
        'Bedingungen für die Erweiterung Page Screenshot Pro und ihren Lizenzserver: Lizenzumfang, Gratis-Tarif, Käufe und Erstattungen, zulässige Nutzung, Grenzen.',
      ogDescription: 'Lizenzumfang, kostenloses Angebot, Käufe und Erstattungen sowie Grenzen.',
    },
  },
  notFoundMeta: {
    title: 'Seite nicht gefunden — Page Screenshot Pro',
    description: 'Diese Seite gibt es nicht. Zurück zur Startseite.',
  },

  nav: {
    features: 'Funktionen',
    pricing: 'Preise',
    faq: 'FAQ',
    support: 'Support',
    cta: 'Installieren',
    langLabel: 'Sprache',
    ariaLabel: 'Hauptnavigation',
  },

  footer: {
    tagline: 'Lange Aufnahmen, Anmerkungen, PDF und OCR — alles wird in Ihrem Browser verarbeitet.',
    colProduct: 'Produkt',
    colSupport: 'Support',
    colLegal: 'Rechtliches',
    help: 'Hilfe und Kontakt',
    privacy: 'Datenschutzerklärung',
    terms: 'Nutzungsbedingungen',
    copyright: '© 2026 Page Screenshot Pro',
    stayLocal: 'Ihre Aufnahmen bleiben auf Ihrem Gerät.',
    ariaLabel: 'Fußzeile',
  },

  home: {
    eyebrowStrong: 'Läuft vollständig auf Ihrem Gerät',
    eyebrowRest: 'Chrome 116+ ·',
    heroTitleLead: 'Ganzseiten-Screenshots,',
    heroTitleAccent: 'die wirklich zusammenpassen',
    lead: (
      <>
        Page Screenshot Pro ist eine Screenshot-Erweiterung für Chrome und nimmt eine ganze Seite als ein einziges Bild auf — Endlos-Feeds, nachgeladene Bilder, breite Tabellen und fixierte Navigation inklusive. <strong>Nichts wird gesendet.</strong> Kein Konto, kein Server für Ihre Bilder, keine Warteschlange.
      </>
    ),
    ctaPrimary: 'Zu Chrome hinzufügen',
    ctaGhost: 'Preise ansehen',
    trust: ['Kostenlos, ohne Karte', 'Funktioniert offline', 'Anmerkungen inklusive', '8 Oberflächensprachen'],
    shotUrl: 'beispiel.de/ein-wirklich-langer-artikel',
    shotSticky: 'fixierte Kopfzeile — genau einmal aufgenommen',
    shotSeam: 'Naht auf ±16 px ausgerichtet',

    figures: {
      stitch: {
        alt: 'Schaubild: eine lange Seite, aufgenommen als sechs Kacheln in drei Zeilen und zwei Spalten; gestrichelte Linien markieren die waagerechten und senkrechten Nähte, ein Pfeil zeigt, dass die Aufnahme erst eine Spalte hinunterläuft und dann zur nächsten wechselt.',
        caption:
          'Die Seite wird Bildschirm für Bildschirm fotografiert und dann zusammengesetzt; die gestrichelten Linien sind die Stellen, an denen zwei Aufnahmen aneinanderstoßen.',
      },
      editor: {
        alt: 'Schaubild: ein Screenshot im Anmerkungs-Editor, darüber eine Werkzeugleiste mit neun Werkzeugen; auf dem Bild liegen ein Rechteck, eine Ellipse, ein Pfeil, ein Freihandstrich und ein Mosaikblock.',
        caption:
          'Neun Werkzeuge, alle kostenlos: Rechteck, Ellipse, Pfeil, Stift, Textmarker, Text, Mosaik, Zuschneiden, Auswahl.',
      },
      local: {
        alt: 'Schaubild: links ein Browserfenster, rechts eine lokale Festplatte, dazwischen ein Schild mit Schloss; eine Wolke darüber ist durchgestrichen.',
        caption:
          'Aufnehmen, Bearbeiten und Exportieren passieren auf Ihrem Rechner. Keine Cloud, kein Upload, kein Konto.',
      },
    },

    featuresTitle: 'Was es gut macht',
    featuresSub:
      'Genau hier hört eine gewöhnliche Screenshot-Erweiterung auf: das ist der Unterschied zwischen einem lesbaren Bildschirmfoto einer ganzen Seite und einem Stapel wiederholter Kopfzeilen und halb gezeichneter Bilder. Ein Screenshot ist schnell gemacht, ein lesbares Bildschirmfoto nicht.',
    features: [
      {
        icon: '↕',
        title: 'Endlos scrollende Seiten',
        body: (
          <>
            Ein scrollendes Bildschirmfoto eines endlosen Feeds lädt den Feed vor der Aufnahme vollständig, statt am ersten Bildschirm zu enden. Sehr lange Feeds werden bei 40 Bildschirmen gedeckelt, und die Erweiterung sagt Ihnen, wann sie abgeschnitten hat.
          </>
        ),
      },
      {
        icon: '🖼',
        title: 'Nachgeladene Bilder',
        body: (
          <>
            Die Erweiterung scrollt voraus und wartet auf <code>img.decode()</code>, damit jede Bitmap wirklich gezeichnet ist und kein graues Rechteck.
          </>
        ),
      },
      {
        icon: '↔',
        title: 'Breiter als das Fenster',
        body: (
          <>
            Breite Tabellen, Kanban-Boards und Diagramme werden im Raster aufgenommen und wieder zusammengesetzt, ohne den rechten Rand zu verlieren.
          </>
        ),
      },
      {
        icon: '🧩',
        title: 'Zusammengesetzt wie eine Seite',
        body: (
          <>
            Die Navigation bleibt auf dem ersten Bildschirm, fixierte und klebende Elemente werden auf allen weiteren ausgeblendet — auch innerhalb von Web Components. Benachbarte Bildschirme werden zusätzlich verglichen und auf ±16 px ausgerichtet. Nichts wiederholt sich, nichts springt.
          </>
        ),
      },
      {
        icon: '🤖',
        title: 'Aufnahmen für KI-Clients',
        body: (
          <>
            Claude Desktop, Cursor und andere MCP-Clients können die Erweiterung bitten, den sichtbaren Bereich, ein einzelnes Element oder eine ganze Seite aufzunehmen und den Text per OCR auszulesen. Die Brücke läuft auf <code>127.0.0.1</code> auf Ihrem eigenen Rechner.
          </>
        ),
      },
      {
        icon: '🔒',
        title: 'Verarbeitung auf Ihrem Gerät',
        body: (
          <>
            Aufnahmen, Anmerkungen und OCR verlassen den Browser nie. Die Erweiterung geht nur für drei Dinge ins Netz: die optionale Lizenzprüfung, das Öffnen der von Waffo gehosteten Kasse und das Feedback, das Sie selbst absenden. Der MCP-Zugriff ist ein vierter Weg, verlässt aber nie Ihren Rechner — siehe Datenschutzerklärung.
          </>
        ),
      },
    ],

    aboutTitle: 'Über Page Screenshot Pro',
    aboutP1: (
      <>
        Page Screenshot Pro ist eine Chrome-Erweiterung für die Seiten, die der Browser nicht von selbst aufnimmt. Sie scrollt die Seite, fotografiert jeden Bildschirm und setzt die Teile zu einem Bild zusammen — und korrigiert dabei die beiden Dinge, die eine naive Montage kaputt aussehen lassen: die fixierte Navigation, die sich über die ganze Länge wiederholt, und der Inhalt, der verrutscht, wenn diese Navigation aus dem Layout fällt.
      </>
    ),
    aboutP2: (
      <>
        Alles nach der Aufnahme ist ebenfalls dabei: ein Anmerkungs-Editor mit neun Werkzeugen (Rechteck, Ellipse, Pfeil, Stift, Textmarker, Text, Mosaik, Zuschneiden, Auswahl), PDF-Export und OCR für Chinesisch und Englisch. Lokale <code>file://</code>-Seiten funktionieren ebenfalls, sobald „Zugriff auf Datei-URLs zulassen“ aktiviert ist.
      </>
    ),

    compareTitle: 'Kostenlos und Pro',
    compareSub:
      'Der gesamte Anmerkungs-Editor ist kostenlos. Pro steht für das Volumen und bringt zusätzlich Element-Aufnahme, PDF-Export und -Zusammenführung sowie OCR und MCP-Zugriff.',
    compareHead: ['Funktion', 'Kostenlos', 'Pro'],
    compareRows: [
      { label: 'Ganzseiten-Aufnahme mit Zusammensetzen', free: 'yes', pro: 'yes' },
      { label: 'Aufnahme des sichtbaren Bereichs', free: 'yes', pro: 'yes' },
      { label: 'Bereich mit der Maus aufziehen', free: 'yes', pro: 'yes' },
      { label: 'Endlos-Scrollen entfalten', free: 'yes', pro: 'yes' },
      { label: 'Nachgeladene Bilder vorladen', free: 'yes', pro: 'yes' },
      { label: 'Anmerkungs-Editor, alle neun Werkzeuge', free: 'yes', pro: 'yes' },
      { label: 'PNG- und JPG-Ausgabe, Dateinamen-Vorlagen, Unterordner', free: 'yes', pro: 'yes' },
      { label: 'Aufnahmen pro Tag', free: { text: '20' }, pro: { text: 'Unbegrenzt' } },
      { label: 'Ein einzelnes Element per Klick aufnehmen', free: 'no', pro: 'yes' },
      { label: 'PDF-Export', free: 'no', pro: 'yes' },
      { label: 'Mehrere Aufnahmen zu einem PDF zusammenführen', free: 'no', pro: 'yes' },
      { label: 'OCR — Text erkennen, Chinesisch und Englisch', free: 'no', pro: 'yes' },
      { label: 'MCP-Zugriff — KI-Clients aufnehmen lassen', free: 'no', pro: 'yes' },
    ],
    compareNote: (
      <>
        Preise und die genaue Aufteilung der Tarife stehen auf der <a href={P('pricing')}>Preisseite</a>.
      </>
    ),

    whyTitle: 'Warum nicht die Aufnahme der Entwicklertools?',
    whyP1: (
      <>
        Die Chrome-Entwicklertools können einen ganzen Screenshot machen, und für einen einfachen Artikel reicht das. Sie entfalten keine Endlos-Feeds, warten nicht auf nachgeladene Bilder, und die klebende Navigation wiederholt sich über das ganze Bild — also genau das Aussehen eines Feeds oder eines Dashboards.
      </>
    ),
    whyP2: (
      <>
        Sie können außerdem nicht anmerken, nicht als PDF exportieren und keinen Text aus einem Bild lesen. Genau das ergänzt diese Erweiterung, und die Hälfte mit den Anmerkungen ist kostenlos. Erst zusammen unterscheidet sich eine Screenshot-Erweiterung von einem Tastenkürzel.
      </>
    ),

    howTitle: 'Drei Schritte',
    howSteps: [
      {
        title: 'Eine lange Seite öffnen',
        body: 'Artikel, Feeds und Release-Notes funktionieren alle. Bei langen Seiten sieht man den Unterschied.',
      },
      {
        title: 'Auf das Symbol in der Symbolleiste klicken oder Alt+Umschalt+D drücken',
        body: 'Alt+Umschalt+V nimmt nur den sichtbaren Bereich auf. Beide Kürzel lassen sich in der Tastenkürzel-Seite von Chrome ändern.',
      },
      {
        title: 'Die Datei landet in „Downloads“',
        body: (
          <>
            Benannt nach Ihrer Vorlage — standardmäßig <code>{'{title} - {date} {time}.png'}</code>. Der Editor öffnet sich, wenn Sie das so eingestellt haben.
          </>
        ),
      },
    ],

    whoTitle: 'Für wen das gedacht ist',
    who: [
      {
        title: 'Fehlerberichte und QA',
        body: 'Das ganze kaputte Layout als ein Bild festhalten, dann den Fehler einkreisen und den Kontonamen mit dem Mosaik-Werkzeug überdecken.',
      },
      {
        title: 'Dokumentation und Tutorials',
        body: 'Schritt-für-Schritt-Anleitungen mit Pfeilen und nummerierten Markierungen, als PNG oder PDF exportiert.',
      },
      {
        title: 'Design- und Text-Review',
        body: 'Breite Tabellen und Boards kommen unversehrt zurück, sodass ein Review-Kommentar auf ein Pixel zeigen kann statt es zu beschreiben.',
      },
      {
        title: 'Recherche und Archivierung',
        body: 'Eine lesbare Kopie einer Seite behalten, bevor sie sich ändert. Mit OCR wird der Text im Bild wieder durchsuchbar.',
      },
    ],

    installTitle: 'Page Screenshot Pro bekommen',
    installSub: 'Chrome 116 oder neuer, unter Windows, macOS oder Linux.',
    installBody: (
      <>
        Page Screenshot Pro ist jetzt im Chrome Web Store. Installieren Sie sie von dort, und
        Chrome hält sie aktuell — kein manueller Download, keine manuelle Installation.
      </>
    ),
    installStore: 'Zu Chrome hinzufügen',
    installMore: 'Andere Wege, sie zu bekommen',

    plansTitle: 'Tarife',
    plansSub:
      'Für immer kostenlos. Pro, wenn Sie Volumen, Element-Aufnahme, PDF-Export und -Zusammenführung, OCR oder MCP-Zugriff brauchen. Abgerechnet in US-Dollar über Waffo Pancake als Merchant of Record.',
    plans: [
      {
        tag: 'Kostenlos',
        name: 'Der Alltag',
        amount: FREE_AMOUNT,
        period: 'für immer',
        bullets: [
          'Ganzseite, sichtbarer Bereich und Auswahlbereich',
          'Endlos-Scrollen und nachgeladene Bilder werden behandelt',
          'Der vollständige Anmerkungs-Editor',
          'PNG- und JPG-Ausgabe',
          'Bis zu 20 Aufnahmen pro Tag',
        ],
        cta: { label: 'Zu Chrome hinzufügen', to: CHROME_STORE_URL },
      },
      {
        tag: 'Pro monatlich',
        name: 'Kurze Projekte',
        amount: PRICE_AMOUNT.monthly,
        period: '/ Monat',
        bullets: [
          'Alles aus Kostenlos, ohne Limit',
          'Element-Aufnahme',
          'PDF-Export und PDF-Zusammenführung',
          'OCR für Chinesisch und Englisch',
          'MCP-Zugriff für KI-Clients',
          'Jederzeit kündbar',
        ],
        cta: { label: 'Tarife vergleichen', to: 'pricing' },
      },
      {
        tag: 'Pro jährlich · Am häufigsten gewählt',
        name: 'Das ganze Jahr',
        amount: PRICE_AMOUNT.yearly,
        period: '/ Jahr',
        featured: true,
        bullets: [
          'Alles aus Kostenlos, ohne Limit',
          'Element-Aufnahme',
          'PDF-Export und PDF-Zusammenführung',
          'OCR für Chinesisch und Englisch',
          'MCP-Zugriff für KI-Clients',
          `Entspricht etwa ${YEARLY_PER_MONTH} pro Monat`,
        ],
        cta: { label: 'So kaufen Sie', to: 'pricing', primary: true },
      },
      {
        tag: 'Pro einmalig',
        name: 'Einmal zahlen',
        amount: PRICE_AMOUNT.lifetime,
        period: 'einmalig',
        bullets: [
          'Alles aus Kostenlos, ohne Limit',
          'Element-Aufnahme',
          'PDF-Export und PDF-Zusammenführung',
          'OCR für Chinesisch und Englisch',
          'MCP-Zugriff für KI-Clients',
          'Keine Verlängerung, niemals',
        ],
        cta: { label: 'Tarife vergleichen', to: 'pricing' },
      },
    ],
    plansNote: (
      <>
        Pro ist an das Browserprofil gebunden, in dem es gekauft wurde. Neuer Rechner oder Neuinstallation? Stellen Sie es mit der beim Kauf verwendeten E-Mail-Adresse wieder her — aus der Erweiterung heraus, ohne Support-Ticket. Eine Lizenz bleibt gleichzeitig auf höchstens fünf Profilen aktiv.
      </>
    ),

    faqTitle: 'Fragen',
    faqSub: (
      <>
        Die fünf häufigsten. Alle anderen stehen auf der <a href={P('faq')}>FAQ-Seite</a>.
      </>
    ),
    faq: [
      {
        q: 'Werden meine Aufnahmen irgendwohin gesendet?',
        a: (
          <>
            <p>
              Nein. Aufnahme, Zusammensetzen, Anmerkungen, PDF-Export und OCR laufen alle in Ihrem Browser. Die Erweiterung hat keine Analytik und keinen Server für die Bilder.
            </p>
            <p>
              Sie geht nur für drei Dinge ins Netz: die optionale Lizenzprüfung (die eine Installations-ID und sonst nichts überträgt), das Öffnen der von Waffo gehosteten Kasse beim Kauf und das Feedback, das Sie selbst absenden. Wenn Sie den MCP-Zugriff selbst einschalten, verbindet sie sich außerdem mit 127.0.0.1 auf Ihrem Rechner — diese Verbindung verlässt Ihr Gerät nicht.
            </p>
          </>
        ),
      },
      {
        q: 'Warum endet das kostenlose Angebot bei 20 Aufnahmen pro Tag?',
        a: (
          <>
            <p>
              Das ist eine Obergrenze gegen Aufnahmen mit Endlos-Scrollen, keine Demo-Einschränkung. Alles außer Element-Aufnahme, PDF-Export und -Zusammenführung, OCR und MCP-Zugriff ist im kostenlosen Tarif enthalten, einschließlich des vollständigen Anmerkungs-Editors.
            </p>
            <p>Der Zähler wird täglich zurückgesetzt und zählt Pro-Nutzer nie mit.</p>
          </>
        ),
      },
      {
        q: 'Funktioniert es mit lokalen HTML-Dateien?',
        a: (
          <>
            <p>
              Ja, sobald Sie es erlauben. Öffnen Sie <code>chrome://extensions</code>, öffnen Sie die Details der Erweiterung und aktivieren Sie „Zugriff auf Datei-URLs zulassen“. Ohne das verweigert Chrome die Aufnahme eines <code>file://</code>-Tabs, und die Erweiterung sagt Ihnen das.
            </p>
          </>
        ),
      },
      {
        q: 'Was passiert auf einer Seite, die endlos scrollt?',
        a: (
          <>
            <p>
              Die Erweiterung entfaltet den Feed zuerst und nimmt dann bis zu 40 Bildschirme auf. Wird diese Grenze erreicht, steht das im Fortschrittstext, statt stillschweigend abzuschneiden.
            </p>
          </>
        ),
      },
      {
        q: 'Welche Sprachen spricht die Oberfläche?',
        a: (
          <>
            <p>
              Englisch, vereinfachtes Chinesisch, traditionelles Chinesisch, Japanisch, Koreanisch, Spanisch, Französisch und Deutsch. Standardmäßig folgt sie der Oberflächensprache von Chrome, und Sie können sie pro Gerät im Sprachmenü der Erweiterung ändern.
            </p>
          </>
        ),
      },
    ],
  },

  pricing: {
    h1: 'Einfache, ehrliche Preise',
    intro:
      'Für immer kostenlos für den Alltag, einschließlich des vollständigen Anmerkungs-Editors. Pro gibt es für Volumen, Element-Aufnahme, PDF-Export und -Zusammenführung sowie OCR und MCP-Zugriff. Keine Testphase, keine Karte für den kostenlosen Tarif, keine Abrechnung pro Bild.',
    plans: [
      {
        tag: 'Kostenlos',
        name: 'Der Alltag',
        amount: FREE_AMOUNT,
        period: 'für immer',
        bullets: [
          'Ganzseite, sichtbarer Bereich und Auswahlbereich',
          'Endlos-Scrollen entfalten',
          'Nachgeladene Bilder vorladen',
          'Breite Seiten, im Raster zusammengesetzt',
          'Anmerkungs-Editor — alle neun Werkzeuge',
          'PNG- und JPG-Ausgabe',
          'Dateinamen-Vorlagen und Unterordner',
          '20 Aufnahmen pro Tag',
        ],
        cta: { label: 'Zu Chrome hinzufügen', to: CHROME_STORE_URL },
      },
      {
        tag: 'Pro monatlich',
        name: 'Kurze Projekte',
        amount: PRICE_AMOUNT.monthly,
        period: '/ Monat',
        bullets: [
          'Alles aus Kostenlos, ohne Tagesgrenze',
          'Ein einzelnes Element per Klick aufnehmen',
          'PDF-Export',
          'Mehrere Aufnahmen zu einem PDF zusammenführen',
          'OCR — Chinesisch und Englisch',
          'MCP-Zugriff für KI-Clients',
          'Kündigung aus der Erweiterung, ohne E-Mail',
        ],
        cta: { label: 'So kaufen Sie', to: '#how-to-buy' },
      },
      {
        tag: 'Pro jährlich · Am häufigsten gewählt',
        name: 'Das ganze Jahr',
        amount: PRICE_AMOUNT.yearly,
        period: '/ Jahr',
        featured: true,
        bullets: [
          'Alles aus Kostenlos, ohne Tagesgrenze',
          'Ein einzelnes Element per Klick aufnehmen',
          'PDF-Export',
          'Mehrere Aufnahmen zu einem PDF zusammenführen',
          'OCR — Chinesisch und Englisch',
          'MCP-Zugriff für KI-Clients',
          `Etwa ${YEARLY_PER_MONTH} pro Monat`,
        ],
        cta: { label: 'So kaufen Sie', to: '#how-to-buy', primary: true },
      },
      {
        tag: 'Pro einmalig',
        name: 'Einmal zahlen',
        amount: PRICE_AMOUNT.lifetime,
        period: 'einmalig',
        bullets: [
          'Alles aus Kostenlos, ohne Tagesgrenze',
          'Ein einzelnes Element per Klick aufnehmen',
          'PDF-Export',
          'Mehrere Aufnahmen zu einem PDF zusammenführen',
          'OCR — Chinesisch und Englisch',
          'MCP-Zugriff für KI-Clients',
          'Keine Verlängerung, kein Ablaufdatum',
        ],
        cta: { label: 'So kaufen Sie', to: '#how-to-buy' },
      },
    ],
    plansNote: (
      <>
        Preise in US-Dollar. Die Zahlung wird von Waffo Pancake als Merchant of Record abgewickelt; anfallende Steuern werden an der Kasse ergänzt. Unsicher, welcher Tarif passt? Die <a href={P('faq')}>FAQ</a> beantwortet direkt, was Pro hinzufügt.
      </>
    ),

    tableTitle: 'Was in welchem Tarif steckt',
    tableSub: 'Eine Tabelle, keine Sternchen.',
    tableHead: ['Funktion', 'Kostenlos', 'Pro'],
    tableRows: [
      { label: 'Ganzseiten-Aufnahme mit automatischem Zusammensetzen', free: 'yes', pro: 'yes' },
      { label: 'Aufnahme des sichtbaren Bereichs', free: 'yes', pro: 'yes' },
      { label: 'Bereich mit der Maus aufziehen', free: 'yes', pro: 'yes' },
      { label: 'Endlos-Scrollen entfalten (bis zu 40 Bildschirme)', free: 'yes', pro: 'yes' },
      { label: 'Nachgeladene Bilder vorladen', free: 'yes', pro: 'yes' },
      { label: 'Fixierte und klebende Elemente genau einmal aufgenommen', free: 'yes', pro: 'yes' },
      { label: 'Breite Seiten gekachelt und wieder zusammengesetzt', free: 'yes', pro: 'yes' },
      {
        label:
          'Anmerkungs-Editor — Rechteck, Ellipse, Pfeil, Stift, Textmarker, Text, Mosaik, Zuschneiden, Auswahl',
        free: 'yes',
        pro: 'yes',
      },
      { label: 'PNG- und JPG-Ausgabe mit Qualitätsregelung', free: 'yes', pro: 'yes' },
      { label: 'Dateinamen-Vorlagen und Download-Unterordner', free: 'yes', pro: 'yes' },
      { label: 'Nach der Aufnahme in die Zwischenablage kopieren', free: 'yes', pro: 'yes' },
      {
        label: (
          <>
            Lokale <code>file://</code>-Seiten
          </>
        ),
        free: 'yes',
        pro: 'yes',
      },
      { label: '8 Oberflächensprachen', free: 'yes', pro: 'yes' },
      { label: 'Aufnahmen pro Tag', free: { text: '20' }, pro: { text: 'Unbegrenzt' } },
      { label: 'Ein einzelnes Element per Klick aufnehmen', free: 'no', pro: 'yes' },
      { label: 'PDF-Export', free: 'no', pro: 'yes' },
      { label: 'Mehrere Aufnahmen zu einem PDF zusammenführen', free: 'no', pro: 'yes' },
      { label: 'OCR — Text aus einem Bild erkennen', free: 'no', pro: 'yes' },
      { label: 'MCP-Zugriff — KI-Clients aufnehmen lassen', free: 'no', pro: 'yes' },
    ],

    buyTitle: 'So läuft der Kauf ab',
    buySub:
      'Der Kauf wird aus der Erweiterung heraus gestartet, damit Pro an das richtige Browserprofil gebunden wird.',
    buySteps: [
      {
        title: 'Das Erweiterungsfenster öffnen',
        body: 'Klicken Sie auf das Symbol in der Symbolleiste. Die Tarif-Schaltflächen stehen unter den Aufnahme-Schaltflächen.',
      },
      {
        title: 'Einen Tarif wählen',
        body: 'Eine gesicherte Waffo-Pancake-Kasse öffnet sich in einem neuen Tab. Zahlen Sie per Karte; anfallende Steuern werden vor der Bestätigung angezeigt.',
      },
      {
        title: 'Zurückkehren — Pro ist schon aktiv',
        body: 'Sie können den Tab schließen. Die Erweiterung holt den Kauf selbst ab, und die Markierung wechselt auf Pro.',
      },
    ],
    buyNote: (
      <>
        Ein Abo und eine Einmal-Lizenz auf derselben Maschine zu besitzen, wird unterstützt: Die Einmal-Lizenz gewinnt immer, und weder Verlängerung noch Kündigung des Abos nehmen sie Ihnen weg. Die Rückerstattungsbedingungen stehen in den <a href={P('terms')}>Nutzungsbedingungen</a>; falls die Kasse selbst klemmt, <a href={P('support')}>sagen Sie uns Bescheid</a> — wir klären die Bestellung mit dem Zahlungsdienstleister.
      </>
    ),

    billingTitle: 'Fragen zur Abrechnung',
    billingFaq: [
      {
        q: 'Kann ich Pro auf mehreren Computern nutzen?',
        a: (
          <>
            <p>
              Eine Lizenz ist an ein Browserprofil gebunden. Um sie umzuziehen — neuer Rechner, Neuinstallation, gelöschtes Profil — öffnen Sie das Erweiterungsfenster und nutzen Sie <strong>Kauf wiederherstellen</strong> mit der E-Mail-Adresse der Zahlung. Das wirkt sofort, und es gibt nichts nachzuzahlen.
            </p>
            <p>
              Die Wiederherstellung verweist das neue Profil auf den ursprünglichen Kauf, sodass beide dieselbe Lizenz bezeichnen, statt sie zu verdoppeln.
            </p>
            <p>
              Eine Lizenz gilt für bis zu fünf Browserprofile gleichzeitig, das Kaufprofil eingerechnet. Die Wiederherstellung auf einem sechsten schlägt nicht fehl: Sie verdrängt das am längsten ungenutzte Profil. Bewahren Sie die E-Mail-Adresse also auf und stellen Sie erneut wieder her, wenn Sie zu diesem Profil zurückkehren.
            </p>
          </>
        ),
      },
      {
        q: 'Wie kündige ich ein Abo?',
        a: (
          <>
            <p>
              Öffnen Sie die Einstellungsseite der Erweiterung und scrollen Sie nach unten. Die Abo-Karte zeigt Ihren aktuellen Tarif, dessen Status und das Ablaufdatum; klicken Sie darauf, öffnet sich die Detailansicht mit der Schaltfläche zum Kündigen — keine E-Mail, kein Portal, kein Ticket.
            </p>
            <p>
              Kündigen beendet die Verlängerung. Pro läuft bis zum Ende des bereits bezahlten Zeitraums weiter, und die Detailansicht nennt das Datum. Anders überlegt? Die Schaltfläche zum Fortsetzen steht auf derselben Seite.
            </p>
          </>
        ),
      },
      {
        q: 'Kann ich zwischen monatlich und jährlich wechseln?',
        a: (
          <>
            <p>
              Nicht direkt: Ein laufendes Abo kann seinen Tarif nicht wechseln. Kündigen Sie es zuerst und schließen Sie dann den gewünschten Tarif neu ab. Die bereits bezahlte Zeit wird dem Zeitraum des neuen Tarifs hinzugerechnet — beim Tarifwechsel gehen Ihnen die gekauften Tage also nie verloren.
            </p>
          </>
        ),
      },
      {
        q: 'Gibt es Erstattungen?',
        a: (
          <>
            <p>
              Ja — schreiben Sie von der beim Kauf verwendeten Adresse an <a href={mailto(S)}>{S}</a> und nennen Sie die Bestellung. Erstattungen werden von Waffo Pancake als Merchant of Record abgewickelt.
            </p>
            <p>
              Ein erstattetes Abo beendet Pro. Eine erstattete Einmal-Lizenz beendet Pro ebenfalls — die Erweiterung fragt den Lizenzserver, die Änderung erreicht also die Maschine und nicht nur die Rechnung.
            </p>
          </>
        ),
      },
      {
        q: 'Gibt es eine Testphase?',
        a: (
          <>
            <p>
              Nein, und der kostenlose Tarif macht sie überflüssig: Alle Aufnahmearten und der gesamte Anmerkungs-Editor sind kostenlos, begrenzt auf 20 Aufnahmen pro Tag. Pro entfernt nur diese Grenze und ergänzt Element-Aufnahme, PDF-Export und -Zusammenführung, OCR und MCP-Zugriff.
            </p>
          </>
        ),
      },
      {
        q: 'Was passiert mit meinen Aufnahmen, wenn ich aufhöre zu zahlen?',
        a: (
          <>
            <p>
              Nichts. Bereits gespeicherte Dateien gehören Ihnen und bleiben, wo Sie sie hingelegt haben; die Erweiterung hat keinen Server, der sie zurückhalten könnte. Auch die Verlaufsliste in der Erweiterung bleibt lesbar. Sie fallen lediglich auf die 20 Aufnahmen pro Tag des kostenlosen Tarifs zurück, und Element-Aufnahme, PDF-Export und -Zusammenführung, OCR und MCP-Zugriff entfallen.
            </p>
          </>
        ),
      },
      {
        q: 'Welche Zahlungsmittel werden akzeptiert?',
        a: (
          <>
            <p>
              Was die Waffo-Pancake-Kasse in Ihrer Region anbietet, in der Regel die gängigen Kredit- und Debitkarten. Die Erweiterung sieht und speichert Ihre Kartendaten nie — die Zahlung findet auf der Waffo-Seite statt, nicht auf unserer.
            </p>
          </>
        ),
      },
    ],
  },

  faq: {
    h1: 'Häufige Fragen',
    intro: (
      <>
        Erst wie die Aufnahmen funktionieren, dann die Lizenzen. Steht die Antwort nicht hier, <a href={P('support')}>schreiben Sie uns</a> — ein Mensch liest die Nachrichten.
      </>
    ),
    groups: [
      {
        title: 'Aufnahmen',
        items: [
          {
            q: 'Warum fehlt eine klebende Kopfzeile in der Mitte meiner Aufnahme?',
            a: (
              <>
                <p>
                  Das ist Absicht, und es ist der Grund, warum eine lange Aufnahme lesbar ist. Eine klebende Navigationsleiste würde sonst auf jedem Bildschirm fotografiert; sie erscheint einmal oben und wird danach ausgeblendet.
                </p>
                <p>
                  Das Ausblenden nutzt <code>visibility</code> statt <code>display: none</code>, weil das Entfernen eines Elements aus dem Layout die Seitenhöhe mitten in der Aufnahme ändern und die Teile in zwei verschiedene Koordinatensysteme legen würde.
                </p>
                <p>
                  Wenn eine Kopfzeile <em>fehlt</em>, die Sie erwartet hätten, macht die Seite sie beim Scrollen wahrscheinlich per CSS klebend. Die Erweiterung prüft Positionen beim Scrollen erneut, schicken Sie uns also die URL.
                </p>
              </>
            ),
          },
          {
            q: 'Warum sind manche Bilder leer?',
            a: (
              <>
                <p>
                  Nachgeladene Bilder waren beim Fotografieren dieses Bildschirms möglicherweise noch nicht dekodiert. Aktivieren Sie in den Einstellungen <strong>Vor der Aufnahme Lazy-Loading-Bilder auslösen und abwarten</strong> — dann scrollt die Erweiterung voraus und wartet auf das Dekodieren jeder Bitmap.
                </p>
                <p>
                  Inhalte hinter einer Anmeldung, einer Cookie-Wand oder einem Klick lassen sich nicht aufnehmen: Die Erweiterung fotografiert, was die Seite tatsächlich darstellt.
                </p>
              </>
            ),
          },
          {
            q: 'Die Seite scrollt endlos. Funktioniert das?',
            a: (
              <>
                <p>
                  Ja. <strong>Seiten mit unendlichem Scrollen vor der Aufnahme ausklappen</strong> ist standardmäßig aktiv: Die Seite wird in Schritten bis nach unten gescrollt, bis kein neuer Inhalt mehr nachkommt, und erst dann beginnt die Aufnahme.
                </p>
                <p>
                  Es gibt eine harte Grenze von 40 Bildschirmen, damit ein wirklich endloser Feed den Browser nicht blockiert. Wird sie erreicht, sagt der Fortschrittstext, dass die Aufnahme gekürzt wurde — abgeschnitten wird nie stillschweigend.
                </p>
              </>
            ),
          },
          {
            q: 'Und eine Seite, die breiter ist als mein Fenster?',
            a: (
              <>
                <p>
                  Breite Tabellen, Kanban-Boards und Diagramme werden im Raster aufgenommen und zeilenweise wieder zusammengesetzt, damit der rechte Rand nicht verloren geht. Die horizontalen Stöße sind hart statt überblendet — auf einer Seite mit senkrechten Linien oder Kartenrändern unsichtbar, bei einem durchgehenden Bild könnten Sie die Naht sehen.
                </p>
                <p>
                  Ist die Seite durch eine Rundung nur wenige Pixel breiter als das Fenster, behandelt die Erweiterung sie als eine Spalte, statt einen Streifen einer zweiten anzuhängen.
                </p>
              </>
            ),
          },
          {
            q: 'Kann ich eine lokale HTML-Datei aufnehmen?',
            a: (
              <>
                <p>
                  Ja, nachdem Sie die Berechtigung erteilt haben. Öffnen Sie <code>chrome://extensions</code>, suchen Sie Page Screenshot Pro, öffnen Sie die Details und aktivieren Sie <strong>Zugriff auf Datei-URLs zulassen</strong>. Sonst verhindert Chrome die Aufnahme eines <code>file://</code>-Tabs, und die Erweiterung sagt Ihnen, dass das der Grund war, statt still zu scheitern.
                </p>
              </>
            ),
          },
          {
            q: 'Funktioniert es in Edge, Brave oder anderen Chromium-Browsern?',
            a: (
              <>
                <p>
                  Die Erweiterung zielt auf Chrome 116 oder neuer. Chromium-basierte Browser, die dieselben Erweiterungs-APIs umsetzen, funktionieren in der Regel, aber Chrome ist das Entwicklungs- und Testziel — der Aufnahmeweg nutzt APIs, deren Verhalten anderswo nicht garantiert identisch ist.
                </p>
              </>
            ),
          },
          {
            q: 'Wohin gehen die Dateien, und kann ich den Namen ändern?',
            a: (
              <>
                <p>
                  Standardmäßig in „Downloads“. In den Einstellungen können Sie eine Dateinamen-Vorlage mit <code>{'{title}'}</code>, <code>{'{host}'}</code>, <code>{'{date}'}</code>, <code>{'{time}'}</code>, <code>{'{width}'}</code> und <code>{'{height}'}</code> festlegen, einen Unterordner wählen, das Standardformat zwischen PNG und JPG umschalten und entscheiden, ob bei jeder Aufnahme ein „Speichern unter“-Dialog erscheint.
                </p>
              </>
            ),
          },
          {
            q: 'Kann ich nur ein einzelnes Element aufnehmen, nicht die ganze Seite?',
            a: (
              <>
                <p>
                  Ja — rechtsklicken Sie das Element und wählen Sie den Aufnahme-Eintrag im Kontextmenü. Die Element-Aufnahme ist eine Pro-Funktion; die anderen drei Aufnahmearten (ganze Seite, sichtbarer Bereich, Bereich mit der Maus aufziehen) sind kostenlos.
                </p>
              </>
            ),
          },
        ],
      },
      {
        title: 'Datenschutz und Daten',
        items: [
          {
            q: 'Werden meine Aufnahmen irgendwohin gesendet?',
            a: (
              <>
                <p>
                  Nein. Aufnahme, Zusammensetzen, Anmerkungen, PDF-Export und OCR laufen alle in Ihrem Browser. Es gibt keine Analytik, keine Telemetrie und keinen Bildserver.
                </p>
                <p>
                  Die Erweiterung geht nur für drei Dinge ins Netz: die optionale Lizenzprüfung (die eine zufällig erzeugte Installations-ID sendet und einen Tarifstatus empfängt), das Öffnen der von Waffo gehosteten Kasse beim Kauf und das Feedback, das Sie selbst absenden. Die Lizenzanfrage enthält kein Bild, keine Seiten-URL und keinen Browserverlauf. Mit abgeschalteter Zahlung stellt die Erweiterung überhaupt keine Netzwerkanfrage, außer Sie senden Feedback oder schalten selbst den MCP-Zugriff ein — und diese Verbindung geht nur an 127.0.0.1 auf Ihrem eigenen Rechner.
                </p>
              </>
            ),
          },
          {
            q: 'Was ist die Installations-ID?',
            a: (
              <>
                <p>
                  Eine zufällige Kennung, die beim ersten Start erzeugt und lokal gespeichert wird. Sie existiert, um eine Lizenz ohne Konto, ohne E-Mail-Anmeldung und ohne Passwort an ein Browserprofil zu binden. Sie wird weder aus Ihrem Rechner noch aus Ihrem Chrome-Profil noch aus Ihrem Surfverhalten abgeleitet.
                </p>
                <p>
                  Das Wiederherstellen eines Kaufs verknüpft eine neue Installations-ID mit der ursprünglichen; mehr wird nicht übertragen.
                </p>
              </>
            ),
          },
          {
            q: 'Sendet OCR mein Bild irgendwohin?',
            a: (
              <>
                <p>
                  Nein. Die OCR-Engine und ihre Sprachdaten sind in der Erweiterung enthalten und laufen lokal in einem abgeschotteten Dokument. Nichts verlässt den Browser, und es funktioniert ohne Netzwerkverbindung.
                </p>
              </>
            ),
          },
          {
            q: 'Was behält der Verlauf der Erweiterung?',
            a: (
              <>
                <p>
                  Die letzten 30 Aufnahmen mit einem Vorschaubild, im lokalen Speicher des Browsers gehalten, damit Sie sie erneut öffnen oder exportieren können. Ältere Einträge werden automatisch entfernt. Sie können die Liste im Erweiterungsfenster leeren, und das Deinstallieren der Erweiterung löscht sie mit dem übrigen Speicher.
                </p>
              </>
            ),
          },
        ],
      },
      {
        title: 'Lizenzen und Abrechnung',
        items: [
          {
            q: 'Warum endet das kostenlose Angebot bei 20 Aufnahmen pro Tag?',
            a: (
              <>
                <p>
                  Das ist eine Obergrenze gegen Aufnahmen mit Endlos-Scrollen — eine Feed-Seite kann mit einem Klick Dutzende Bildschirme erzeugen — und keine Demo-Einschränkung. Alles außer Element-Aufnahme, PDF-Export und -Zusammenführung, OCR und MCP-Zugriff steckt im kostenlosen Tarif, einschließlich des vollständigen Anmerkungs-Editors. Die <a href={P('pricing')}>Preisseite</a> zieht diese Grenze Zeile für Zeile.
                </p>
                <p>
                  Der Zähler wird täglich zurückgesetzt und zählt Pro-Nutzer nie mit. Eine Aufnahme, die scheitert oder die Sie abbrechen, verbraucht keine der 20.
                </p>
              </>
            ),
          },
          {
            q: 'Wie bekomme ich Pro nach einer Neuinstallation oder auf einem neuen Rechner zurück?',
            a: (
              <>
                <p>
                  Öffnen Sie das Erweiterungsfenster und nutzen Sie <strong>Kauf wiederherstellen</strong> mit der E-Mail-Adresse der Zahlung. Es wirkt sofort, und Sie zahlen nicht doppelt.
                </p>
                <p>
                  Aus Sicherheitsgründen ist die Antwort dieselbe, ob diese Adresse einen Kauf hat oder nicht, damit ein Fremder das Formular nicht nutzen kann, um herauszufinden, ob Sie etwas gekauft haben. Erscheint Pro trotzdem nicht, ist die Adresse wahrscheinlich nicht die der Bestellung — schreiben Sie an <a href={mailto(S)}>{S}</a>.
                </p>
              </>
            ),
          },
          {
            q: 'Wie kündige ich ein Abo?',
            a: (
              <>
                <p>
                  Öffnen Sie die Einstellungsseite der Erweiterung und scrollen Sie nach unten. Die Abo-Karte zeigt Ihren aktuellen Tarif, dessen Status und das Ablaufdatum. Klicken Sie darauf, öffnet sich die Detailansicht: dort stehen die Bestellliste und die Schaltfläche zum Kündigen. Es gibt kein Portal zu besuchen und kein Ticket zu öffnen.
                </p>
                <p>
                  Kündigen beendet die Verlängerung; Pro läuft bis zum Ende des bereits bezahlten Zeitraums weiter, und die Detailansicht zeigt dieses Datum. Von derselben Seite aus können Sie vor Ablauf fortsetzen, und wenn Sie später erneut abonnieren, wird die Restzeit dem neuen Zeitraum hinzugerechnet.
                </p>
              </>
            ),
          },
          {
            q: 'Ich habe die Einmal-Lizenz gekauft und zusätzlich ein Abo. Was gilt?',
            a: (
              <>
                <p>
                  Die Einmal-Lizenz gewinnt immer. Verlängerung, Kündigung oder Ablauf eines Abos nehmen eine Einmal-Lizenz nie weg — das wird serverseitig durchgesetzt, nicht nur in der Oberfläche.
                </p>
                <p>
                  Das Erweiterungsfenster sagt Ihnen, welche Sie haben, damit ein Einmal-Käufer und ein Abonnent nicht denselben Bildschirm sehen.
                </p>
              </>
            ),
          },
          {
            q: 'Gibt es Erstattungen?',
            a: (
              <>
                <p>
                  Ja. Schreiben Sie von der beim Kauf verwendeten Adresse an <a href={mailto(S)}>{S}</a> und nennen Sie die Bestellung. Erstattungen werden von Waffo Pancake als Merchant of Record abgewickelt, das Geld kommt also denselben Weg zurück, den es gekommen ist.
                </p>
                <p>
                  Ist die erstattete Bestellung die Einmal-Lizenz, wird Pro entzogen; eine Erstattung auf eine Bestellung berührt eine andere Lizenz, die Sie noch besitzen, nicht.
                </p>
              </>
            ),
          },
          {
            q: 'Was passiert mit meinen Aufnahmen, wenn ich aufhöre zu zahlen?',
            a: (
              <>
                <p>
                  Nichts. Bereits gespeicherte Dateien gehören Ihnen und bleiben, wo Sie sie hingelegt haben; die Verlaufsliste in der Erweiterung bleibt lesbar. Sie fallen auf die 20 Aufnahmen pro Tag des kostenlosen Tarifs zurück, und Element-Aufnahme, PDF-Export und -Zusammenführung, OCR und MCP-Zugriff entfallen.
                </p>
              </>
            ),
          },
        ],
      },
      {
        /* Die einzige Gruppe mit `id`: Die Schaltfläche „vollständige
           Erklärung" auf der MCP-Karte der Erweiterungs-Einstellungen verweist
           auf `/faq/#mcp`. Alle acht Wörterbücher brauchen diese id, sonst
           meldet der shapeDiff in `tests/dict.test.ts` ein fehlendes oder
           überzähliges Feld. */
        id: 'mcp',
        title: 'KI-Clients (MCP)',
        items: [
          {
            q: 'Was ist MCP-Zugriff?',
            a: (
              <>
                <p>
                  Damit kann ein KI-Client — Claude Desktop, Cursor, Claude Code oder jedes andere
                  Werkzeug, das das Model Context Protocol spricht — über diese Erweiterung Aufnahmen
                  machen. Sie bitten im Chat darum, der Client ruft ein Werkzeug auf, und die
                  Erweiterung nimmt den aktiven Tab auf.
                </p>
                <p>
                  Es wird nichts hochgeladen. Client und Erweiterung sprechen über eine lokale
                  Loopback-Verbindung auf <code>127.0.0.1</code>, das Bild geht also von Ihrem Browser
                  direkt an den Client auf derselben Maschine. Weder Konto noch Server dazwischen.
                </p>
              </>
            ),
          },
          {
            q: 'Wie richte ich das ein?',
            a: (
              <>
                <p>Zwei Teile, und beide sind nötig.</p>
                <ul>
                  <li>
                    Aktivieren Sie in der Erweiterung <strong>Einstellungen → AI / MCP access</strong>{' '}
                    und setzen Sie das Häkchen. Die Karte zeigt dann ein Token und einen fertigen
                    JSON-Block.
                  </li>
                  <li>
                    Ihr MCP-Client startet es mit <code>npx -y page-screenshot-mcp</code>; von Hand
                    installieren Sie nichts. Node <strong>20 oder neuer</strong> wird vorausgesetzt.
                  </li>
                </ul>
                <p>
                  Fügen Sie dieses JSON in den Block <code>mcpServers</code> der Konfigurationsdatei
                  des Clients ein und starten Sie ihn neu. Der Statuspunkt auf der Karte wird grün,
                  sobald die Brücke verbunden ist.
                </p>
              </>
            ),
          },
          {
            q: 'Die KI meldet needs_user_gesture. Was nun?',
            a: (
              <>
                <p>
                  Chrome verlangt einen echten Klick, bevor eine Seite aufgenommen werden darf, und
                  ein von der KI ausgelöster Aufruf hat keinen. Klicken Sie einmal auf das Symbol in
                  der Symbolleiste (oder drücken Sie <code>Alt+Shift+D</code>) und lassen Sie die KI
                  erneut versuchen — dann geht es durch.
                </p>
                <p>
                  Das ist eine Browser-Regel, kein Defekt. Sie zu umgehen hieße, Zugriff auf jede
                  besuchte Website zu verlangen, und genau das tut diese Erweiterung bewusst nicht.
                </p>
              </>
            ),
          },
          {
            q: 'Welche Werkzeuge brauchen Pro?',
            a: (
              <>
                <p>
                  <code>psp_status</code> ist kostenlos: Es meldet nur den Verbindungs- und
                  Lizenzstatus, damit die KI Ihnen immer sagen kann, was nicht stimmt. Die übrigen
                  sieben brauchen Pro.
                </p>
                <ul>
                  <li>
                    <code>capture_visible</code>, <code>capture_full_page</code> und{' '}
                    <code>capture_element</code> — die drei Aufnahmearten.
                  </li>
                  <li>
                    <code>ocr_capture</code> und <code>export_pdf</code> — OCR und PDF zu einer
                    Aufnahme.
                  </li>
                  <li>
                    <code>history_list</code> und <code>history_get</code> — die gespeicherten
                    Aufnahmen.
                  </li>
                </ul>
                <p>
                  Aufnahmen laufen durch die normale Verarbeitung der Erweiterung, daher gelten das
                  Tageskontingent, die <code>file://</code>-Berechtigung, das Aufklappen von
                  Endlos-Scrollen und das Vorladen nachgeladener Bilder genau wie beim eigenen Klick.
                </p>
              </>
            ),
          },
        ],
      },
    ],
    stuckTitle: 'Immer noch blockiert?',
    stuckBody:
      'Nennen Sie die URL der Seite (falls öffentlich), Ihre Chrome-Version und das entstandene Bild. Das reicht in der Regel, um das Problem nachzustellen.',
    stuckMail: 'Support anschreiben',
    stuckMore: 'Alle Kontaktwege',
  },

  support: {
    h1: 'Support',
    intro: (
      <>
        Es gibt kein Ticketsystem und keinen Chatbot. Jede Nachricht landet bei <a href={mailto(S)}>{S}</a>, und ein Mensch antwortet, in der Regel innerhalb von zwei Werktagen.
      </>
    ),
    cards: [
      {
        icon: '✉',
        title: 'Schreiben Sie uns',
        body: 'Für alles: ein Fehler, eine Frage zu einer Funktion, eine Lizenz, die nach einer Neuinstallation nicht zurückkam.',
        cta: 'E-Mail-Programm öffnen',
        to: mailto(S),
      },
      {
        icon: '🐞',
        title: 'Fehler melden',
        body: 'Kategorie wählen und schildern, was passiert ist; eine E-Mail-Adresse hinterlassen, wenn Sie eine Antwort möchten. Die URL der Seite (falls öffentlich) und Ihre Chrome-Version reichen in der Regel, um das Problem nachzustellen.',
        cta: 'Feedback senden',
        to: '#feedback',
      },
      {
        icon: '💳',
        title: 'Lizenz oder Erstattung',
        body: 'Schreiben Sie von der beim Kauf verwendeten Adresse und nennen Sie die Bestellung. Erstattungen werden von Waffo Pancake als Merchant of Record abgewickelt.',
        cta: 'Abrechnung kontaktieren',
        to: mailto(S, 'Lizenz oder Erstattung — Page Screenshot Pro'),
      },
    ],
    form: {
      title: 'Feedback senden',
      sub: 'Direkt an den Entwickler — kein Ticketsystem, kein Bot. Dasselbe Formular wie in der Erweiterung.',
      categoryLabel: 'Kategorie',
      categories: {
        bug: 'Fehler / etwas kaputt',
        feature: 'Funktionswunsch',
        purchase: 'Problem mit Kauf oder Lizenz',
        other: 'Sonstiges',
      },
      messageLabel: 'Was ist passiert',
      messagePlaceholder: 'Was Sie erwartet haben, was Sie bekommen haben und die Schritte dorthin. Falls möglich mit Seiten-URL und Chrome-Version.',
      emailLabel: 'Ihre E-Mail (optional)',
      emailHint: 'Leer lassen heißt anonym. Ausgefüllt geht die Antwort dorthin — und sie ist der einzige Weg, eine Lizenz nach einer Neuinstallation wiederzufinden.',
      submit: 'Senden',
      note: 'Die Nachricht geht nur an den Entwickler. Von der aufgenommenen Seite wird nichts mitgesendet.',
    },
    beforeTitle: 'Bevor Sie schreiben',
    beforeSub: 'Zwei Dinge lösen die meisten Meldungen von selbst.',
    before: [
      {
        title: 'Leere Bereiche im Bild',
        body: (
          <>
            Meist nachgeladene Bilder, die noch nicht dekodiert waren. Einstellungen → Aufnahme → <strong>Vor der Aufnahme Lazy-Loading-Bilder auslösen und abwarten</strong> aktivieren. Es ist langsamer, und genau deshalb nicht der einzige Modus.
          </>
        ),
      },
      {
        title: (
          <>
            Eine lokale <code>file://</code>-Seite lässt sich nicht aufnehmen
          </>
        ),
        body: (
          <>
            Chrome blockiert das, bis Sie es erlauben. Öffnen Sie <code>chrome://extensions</code>, öffnen Sie die Details dieser Erweiterung und aktivieren Sie <strong>Zugriff auf Datei-URLs zulassen</strong>. Die Erweiterung zeigt einen direkten Link auf diese Seite, wenn das die Ursache ist.
          </>
        ),
      },
    ],
    beforeNote: (
      <>
        Weitere Antworten auf der <a href={P('faq')}>FAQ-Seite</a>.
      </>
    ),
    selfTitle: 'Die drei häufigsten Anliegen',
    selfSub: 'Auf alle drei gibt es eine klare Antwort, und keines davon ist ein Fehler.',
    self: [
      {
        title: 'Die Aufnahme ist verschoben oder unten abgeschnitten',
        body: (
          <>
            <p>
              Lange Aufnahmen werden Bildschirm für Bildschirm fotografiert und anhand der gemessenen Scrollposition zusammengesetzt. Bewegt sich die Seite während der Aufnahme, sitzen die Nahtstellen falsch. Zwei Dinge bewegen eine Seite von selbst.
            </p>
            <p>
              Das erste ist eine endlos scrollende Seite, die noch Inhalte nachlädt: Schalten Sie in den Einstellungen <strong>Seiten mit unendlichem Scrollen vor der Aufnahme ausklappen</strong> ein — dann ist die Seite vor dem ersten Bild erschöpft und nicht mittendrin. Das zweite ist eine Kopfzeile, die erst nach dem Scrollen zu <code>position: fixed</code> wird: Sobald sie aus dem Dokumentfluss fällt, entfällt ihre Höhe und alles darunter rutscht um genau diesen Betrag nach oben. Die Erweiterung misst diese Verschiebung und korrigiert jedes Kachelbild, aber die Korrektur ist ein Median über Ankerelemente — eine Seite, deren gesamtes Layout von der Scrollposition abhängt, kann sie noch unterlaufen.
            </p>
            <p>
              Passt es trotzdem nicht, nennt die <a href={P('faq')}>FAQ</a> die genauen Bedingungen, unter denen welcher Modus gewinnt; mit URL und Ausgabebild lässt sich das meist nachstellen.
            </p>
          </>
        ),
      },
      {
        title: (
          <>
            Eine lokale <code>file://</code>-Seite lässt sich nicht aufnehmen
          </>
        ),
        body: (
          <>
            <p>
              Das liegt an Chrome, nicht an der Erweiterung. Eine <code>file://</code>-Seite hängt an einer anderen Berechtigung als „die gerade geöffnete Seite lesen“, und Chrome gibt sie erst heraus, wenn Sie sie ausdrücklich erlauben — bei jeder Erweiterung, nicht nur bei dieser.
            </p>
            <p>
              Öffnen Sie <code>chrome://extensions</code>, öffnen Sie die Details dieser Erweiterung und schalten Sie <strong>Zugriff auf Datei-URLs zulassen</strong> ein. Die Erweiterung erkennt genau diesen Zustand und zeigt einen direkten Link auf diese Seite.
            </p>
            <p>
              Achtung: Das ist eine Berechtigung, kein Schalter innerhalb der Erweiterung. Im Popup gibt es keine Einstellung, die sie an Chromes Stelle erteilen könnte. Die <a href={P('faq')}>FAQ</a> listet die übrigen Fälle, die eine Berechtigung statt eines Schalters brauchen.
            </p>
          </>
        ),
      },
      {
        title: 'Ich habe Pro gekauft, ein anderer Rechner zeigt aber die kostenlose Version',
        body: (
          <>
            <p>
              Eine Lizenz hängt am Browserprofil, das bezahlt hat. Ein neuer Rechner, ein frisches Profil oder ein zurückgesetztes Profil starten daher kostenlos. Verloren geht nichts: Öffnen Sie das Popup und nutzen Sie <strong>Kauf wiederherstellen</strong> mit der E-Mail-Adresse, mit der Sie bezahlt haben.
            </p>
            <p>
              Diese Adresse ist der einzige Nachweis — es gibt kein Passwort und keine Kontoseite — bewahren Sie sie also dort auf, wo sie nach einer Neuinstallation noch liegt. Die Wiederherstellung wirkt sofort und berechnet nichts erneut.
            </p>
            <p>
              Erreichen Sie diese Adresse nicht mehr, schreiben Sie von einer beliebigen Adresse an <a href={mailto(S)}>{S}</a> und nennen Sie die Bestellnummer aus der Rechnung; damit lässt sich der Kauf finden. Die übrigen Lizenzfragen stehen auf der <a href={P('pricing')}>Preisseite</a>.
            </p>
          </>
        ),
      },
    ],
    reportTitle: 'Ein Aufnahmeproblem melden',
    reportP1: (
      <>
        Das Formular oben ist der schnellste Weg: Kategorie wählen, schildern, was passiert ist, auf Wunsch eine E-Mail-Adresse ergänzen — die Nachricht geht direkt an den Entwickler. Mit installierter Erweiterung öffnet sich dasselbe Formular auch in ihr: Erweiterungsfenster → <strong>Feedback senden</strong>, oder die Schaltfläche auf der Einstellungsseite. Beides sendet nur, was Sie schreiben — nennen Sie also selbst die Version der Erweiterung und die Seite, auf der Sie waren.
      </>
    ),
    reportP2: 'Ob Formular oder E-Mail — diese vier Angaben ersparen einen Rückfrage-Umlauf:',
    reportList: [
      'Die URL der Seite, falls öffentlich.',
      <>
        Ihre Chrome-Version (aus <code>chrome://version</code>).
      </>,
      'Wo das entstandene Bild falsch ist — das Formular nimmt keine Anhänge an, beschreiben Sie es also (oder schicken Sie uns das Bild per E-Mail).',
      'Ob die Seite einen eigenen Scroll-Container nutzt, etwa einen Dokumenteneditor oder ein Dashboard-Panel.',
    ],
    privacyTitle: 'Datenschutzanfragen',
    privacyBody: (
      <>
        Für Datenauskünfte, Löschungen oder alles, was die Datenschutzerklärung abdeckt, schreiben Sie an <a href={mailto(PRIVACY_EMAIL)}>{PRIVACY_EMAIL}</a> — eine eigene Adresse neben dem Support, damit solche Anfragen nicht zwischen Fehlerberichten untergehen. Die Erklärung selbst steht unter <a href={P('privacy')}>/privacy/</a>.
      </>
    ),
  },

  privacy: {
    h1: 'Datenschutzerklärung',
    effective: 'Gültig ab: 2. November 2026',
    intro: (
      <>
        Page Screenshot Pro („die Erweiterung“) nimmt ganze Seiten auf, versieht sie mit Anmerkungen, exportiert PDFs und führt OCR auf dem Gerät aus. Diese Erklärung beschreibt, was die Erweiterung und ihr Lizenzserver verarbeiten — kurz gesagt: <strong>Ihre Aufnahmen verlassen Ihr Gerät nie</strong>.
      </>
    ),
    sections: [
      {
        title: '1. Was auf Ihrem Gerät bleibt',
        body: (
          <ul>
            <li>
              <strong>Aufnahmen und Screenshots.</strong> Alles, was Sie aufnehmen, wird lokal in Ihrem Browser verarbeitet und gespeichert (Browserspeicher / IndexedDB). Aufgenommene Bilder werden weder an uns noch an Dritte gesendet.
            </li>
            <li>
              <strong>OCR.</strong> Die Texterkennung läuft vollständig offline mit einer eingebetteten OCR-Engine (Tesseract.js) in Ihrem Browser. Die für OCR verwendeten Bilder verlassen Ihr Gerät nie.
            </li>
            <li>
              <strong>Editor und Zwischenablage.</strong> Anmerkungen entstehen lokal. Die Zwischenablage wird nur beschrieben, wenn Sie ausdrücklich eine Kopier-Aktion auslösen.
            </li>
            <li>
              <strong>MCP-Zugriff (Pro, standardmäßig aus).</strong> Wenn Sie ihn einschalten, verbindet sich die Erweiterung als Client mit einem Brückenprozess, den Sie selbst auf <code>127.0.0.1</code> auf Ihrem eigenen Rechner starten, damit ein KI-Client wie Claude Desktop oder Cursor Aufnahmen auslösen kann. Diese Verbindung verlässt Ihren Rechner nie: Sie läuft weder über uns noch über Dritte und verlässt Ihr lokales Netzwerk nicht. Aufnahmedaten wandern nur zwischen zwei Prozessen auf Ihrem eigenen Computer. Solange Sie diesen Schalter nicht einschalten, wird die Verbindung nicht aufgebaut.
            </li>
          </ul>
        ),
      },
      {
        title: '2. Was wir für Ihre Lizenz speichern',
        body: (
          <ul>
            <li>
              <strong>Installations-ID.</strong> Beim ersten Start erzeugt die Erweiterung eine zufällige Kennung (UUID). Sie wird in Ihrem Browser gespeichert (<code>chrome.storage.sync</code>, das sich unter Ihrem eigenen Google-Konto zwischen Ihren Geräten abgleicht, mit lokalem Rückfall). Sie dient nur als Schlüssel für Ihre Pro-Lizenz — sie enthält keine personenbezogenen Daten.
            </li>
            <li>
              <strong>Lizenzstatus.</strong> Ob Pro freigeschaltet ist und welcher Tarif gekauft wurde, wird lokal in Ihrem Browser gespeichert.
            </li>
          </ul>
        ),
      },
      {
        title: '3. Zahlungen',
        body: (
          <>
            <p>
              Zahlungen werden von <strong>Waffo</strong> als Merchant of Record abgewickelt. Die Kasse öffnet die von Waffo gehostete Zahlungsseite in Ihrem Browser — Ihre Kartendaten gehen direkt an Waffo und berühren weder die Erweiterung noch unsere Server. Die Datenschutzerklärung von Waffo finden Sie unter <a href="https://waffo.ai" rel="noopener">waffo.ai</a>.
            </p>
            <p>
              Nach erfolgreicher Zahlung benachrichtigt Waffo unseren Lizenzserver, der festhält: den gekauften Tarif, seinen Status und Zeitraum, Ihre Installations-ID und — allein damit Sie den Kauf später wiederherstellen können — die beim Kauf verwendete E-Mail-Adresse, verknüpft mit dieser ID. Kein Aufnahmeinhalt, kein Seiteninhalt und kein Browserverlauf wird je an den Lizenzserver gesendet.
            </p>
          </>
        ),
      },
      {
        title: '4. Kauf wiederherstellen',
        body: (
          <p>
            Wenn Sie die Erweiterung neu installieren oder auf einen neuen Computer wechseln, können Sie Pro wiederherstellen, indem Sie die beim Kauf verwendete E-Mail-Adresse eingeben. Der Server schlägt die Zuordnung E-Mail → Installations-ID nach und verknüpft Ihre neue ID mit der ursprünglichen Lizenz. Wiederherstellungsanfragen sind mengenbegrenzt; der Server gibt nie preis, ob eine E-Mail-Adresse einen Kauf hat.
          </p>
        ),
      },
      {
        title: '5. Berechtigungen — warum die Erweiterung sie braucht',
        body: (
          <ul>
            <li>
              <code>activeTab</code> / <code>scripting</code> — um den Tab aufzunehmen, den Sie verlangen; Content-Skripte werden nur bei Bedarf injiziert.
            </li>
            <li>
              Host-Zugriff <code>file:///</code> — nur für Aufnahmen lokaler Dateien, und nur wenn Sie in Chrome „Zugriff auf Datei-URLs zulassen“ aktivieren.
            </li>
            <li>
              <code>downloads</code> — um die Bilder und PDFs zu speichern, die Sie exportieren.
            </li>
            <li>
              <code>storage</code> / <code>unlimitedStorage</code> — für Einstellungen, Lizenzstatus und den Aufnahmeverlauf.
            </li>
            <li>
              <code>clipboardWrite</code> — nur wenn Sie eine Kopier-Aktion nutzen.
            </li>
            <li>
              <code>contextMenus</code> — die Einträge im Kontextmenü.
            </li>
            <li>
              <code>notifications</code> — ausschließlich lokale Fehlermeldungen (etwa eine fehlgeschlagene Aufnahme).
            </li>
            <li>
              <code>tabs</code> — um die Rückkehr des Kassen-Tabs zu bemerken, damit eine abgeschlossene Zahlung Pro freischaltet.
            </li>
            <li>
              <code>offscreen</code> — um Bilder in einem unsichtbaren Dokument zusammenzusetzen, statt einen Tab zu öffnen.
            </li>
            <li>
              <code>identity</code> / <code>identity.email</code> — um das E-Mail-Feld der Kassenseite vorzufüllen. Die Adresse wird aus Ihrem Chrome-Konto gelesen und, sobald Sie einmal eine eingegeben haben, im lokalen Speicher dieses Browsers gemerkt, damit die nächste Kasse sie vorausfüllen kann. Außer bei einem von Ihnen gestarteten Kauf oder von Ihnen gesendetem Feedback wird sie nie an unseren Lizenzserver übertragen.
            </li>
          </ul>
        ),
      },
      {
        title: '6. Was wir NICHT tun',
        body: (
          <ul>
            <li>Keine Analytik, keine Telemetrie, kein Werbe-SDK.</li>
            <li>Wir verkaufen, vermieten oder teilen Ihre Daten nicht zu Marketingzwecken mit Dritten.</li>
            <li>
              Die Erweiterung stellt von sich aus keine Netzwerkanfrage, außer den Lizenzprüfungen an unseren Lizenzserver (nur Installations-ID), dem Öffnen der von Waffo gehosteten Kasse, dem Feedback, das Sie absenden, und der lokalen MCP-Verbindung, die Sie selbst einschalten.
            </li>
          </ul>
        ),
      },
      {
        title: '7. Aufbewahrung und Löschung',
        body: (
          <p>
            Lizenzdatensätze werden aufbewahrt, solange Ihr Kauf oder Abo aktiv ist (und entsprechend den steuerlichen und buchhalterischen Pflichten unseres Zahlungsdienstleisters). Das Deinstallieren der Erweiterung löscht alle lokal gespeicherten Daten — Aufnahmen, Einstellungen und Installations-ID. Um Ihren Datensatz auf dem Lizenzserver löschen zu lassen, kontaktieren Sie uns unter der untenstehenden Adresse. Was eine Lizenz umfasst und wie Rückerstattungen laufen, regeln die <a href={P('terms')}>Nutzungsbedingungen</a>, nicht diese Erklärung.
          </p>
        ),
      },
      {
        title: '8. Änderungen',
        body: (
          <p>
            Ändert sich diese Erklärung wesentlich, aktualisieren wir das oben genannte Gültigkeitsdatum und weisen in den Versionshinweisen der Erweiterung darauf hin.
          </p>
        ),
      },
      {
        title: '9. Kontakt',
        body: (
          <p>
            Fragen zu dieser Erklärung: <a href={mailto(PRIVACY_EMAIL)}>{PRIVACY_EMAIL}</a> — eine andere Adresse als der normale Support, damit Datenanfragen nicht zwischen Fehlerberichten untergehen. Alles, was nicht den Datenschutz betrifft, gehört auf die <a href={P('support')}>Support-Seite</a>.
          </p>
        ),
      },
    ],
  },

  terms: {
    h1: 'Nutzungsbedingungen',
    effective: 'Gültig ab: 29. Oktober 2026',
    intro:
      'Diese Bedingungen regeln Ihre Nutzung der Browser-Erweiterung Page Screenshot Pro und des Lizenzservers, der sie trägt. Mit der Installation oder Nutzung der Erweiterung akzeptieren Sie sie. Wenn nicht, deinstallieren Sie sie — damit werden alle lokal gespeicherten Daten gelöscht.',
    sections: [
      {
        title: '1. Umfang der Lizenz',
        body: (
          <>
            <p>
              Wir gewähren Ihnen eine persönliche, nicht ausschließliche und nicht übertragbare Lizenz, die Erweiterung auf Browserprofilen zu installieren und zu nutzen, die Sie kontrollieren. Pro-Funktionen werden pro Browserprofil gewährt, nicht pro Person; eine Lizenz zwischen Profilen umzuziehen geschieht über <strong>Kauf wiederherstellen</strong>, nicht durch Teilen. Eine Lizenz kann gleichzeitig auf höchstens fünf Browserprofilen aktiv sein, das Kaufprofil eingerechnet; eine Wiederherstellung auf einem sechsten verdrängt das am längsten ungenutzte Profil.
            </p>
            <p>
              Sie dürfen die Erweiterung nicht weiterverkaufen, unterlizenzieren, vermieten oder weitergeben oder ohne schriftliche Erlaubnis in ein anderes Produkt einbauen.
            </p>
          </>
        ),
      },
      {
        title: '2. Der kostenlose Tarif',
        body: (
          <>
            <p>
              Der kostenlose Tarif umfasst Ganzseiten-, Sichtbereich- und Auswahlaufnahme, das Entfalten von Endlos-Scrollen, den Umgang mit nachgeladenen Bildern, den vollständigen Anmerkungs-Editor und PNG/JPG-Ausgabe, begrenzt auf <strong>20 Aufnahmen pro Kalendertag</strong>. Grenze, Funktionsaufteilung und enthaltene Funktionen können sich in einer künftigen Version ändern; falls ja, sagen wir es in den Versionshinweisen, statt es stillschweigend zu tun.
            </p>
            <p>
              Pro entfernt die Tagesgrenze und ergänzt Element-Aufnahme, PDF-Export und -Zusammenführung, OCR und MCP-Zugriff. Eine Aufnahme, die scheitert oder die Sie abbrechen, zählt nicht gegen das Tageslimit.
            </p>
          </>
        ),
      },
      {
        title: '3. Käufe, Verlängerungen und Erstattungen',
        body: (
          <>
            <p>
              Kostenpflichtige Tarife werden von <strong>Waffo</strong> als Merchant of Record verkauft und abgewickelt. Waffos Bedingungen gelten für die Zahlungstransaktion selbst; diese Bedingungen gelten für die Lizenz, die die Zahlung kauft.
            </p>
            <ul>
              <li>
                <strong>Abos</strong> verlängern sich automatisch, bis sie gekündigt werden. Sie können jederzeit auf der Einstellungsseite der Erweiterung kündigen — ohne E-Mail, ohne Portal.
              </li>
              <li>
                <strong>Kündigen</strong> beendet die Verlängerung; Pro läuft bis zum Ende des bereits bezahlten Zeitraums weiter.
              </li>
              <li>
                <strong>Ein Tarifwechsel</strong> läuft über Kündigen und neu Abschließen: Ein laufendes Abo kann seinen Tarif nicht direkt wechseln. Die bereits bezahlte Zeit wird dem Zeitraum des neuen Tarifs hinzugerechnet — ein Wechsel kostet Sie also nie die gekauften Tage.
              </li>
              <li>
                <strong>Die Einmal-Lizenz</strong> ist eine Zahlung ohne Verlängerung. Verlängerung, Kündigung oder Ablauf eines Abos im selben Profil berühren sie nicht.
              </li>
              <li>
                <strong>Erstattungen</strong> sind auf Anfrage möglich — schreiben Sie von der beim Kauf verwendeten Adresse an <a href={mailto(S)}>{S}</a>. Eine Erstattung beendet die Lizenz, die sie bezahlt hat.
              </li>
            </ul>
            <p>
              Preise werden in US-Dollar angezeigt und können sich ändern. Eine Preisänderung gilt nie rückwirkend für einen bereits bezahlten Zeitraum.
            </p>
          </>
        ),
      },
      {
        title: '4. Ihre Verantwortung',
        body: (
          <>
            <p>
              Die Erweiterung nimmt auf, was auf dem Bildschirm steht. Das heißt, der Inhalt Ihrer Aufnahme liegt in Ihrer Verantwortung, insbesondere:
            </p>
            <ul>
              <li>
                <strong>Urheberrecht und andere Rechte.</strong> Eine Seite aufzunehmen ist keine Lizenz, sie zu veröffentlichen. Wenn Sie eine Aufnahme teilen oder veröffentlichen, stellen Sie sicher, dass Sie das dürfen.
              </li>
              <li>
                <strong>Vertrauliche und personenbezogene Informationen.</strong> Eine Aufnahme kann Namen, Adressen, Kontonummern oder private Nachrichten enthalten. Die Werkzeuge Mosaik und Zuschneiden des Anmerkungs-Editors existieren genau dafür — nutzen Sie sie vor dem Teilen.
              </li>
              <li>
                <strong>Die Bedingungen der Seiten, die Sie aufnehmen.</strong> Manche Dienste verbieten automatisiertes oder geskriptetes Aufnehmen ihrer Seiten. Das fällt in Ihre Beziehung zu ihnen.
              </li>
            </ul>
          </>
        ),
      },
      {
        title: '5. Zulässige Nutzung',
        body: (
          <p>
            Sie dürfen die Erweiterung nicht nutzen, um Inhalte aufzunehmen, auf die Sie keinen rechtmäßigen Zugriff haben, um Paywalls oder Zugangskontrollen zu umgehen, oder auf eine Weise, die geltendes Recht verletzt. Wir können eine Lizenz sperren, die durch Betrug oder eine rückabgewickelte Zahlung erlangt wurde.
          </p>
        ),
      },
      {
        title: '6. Was die Erweiterung nicht verspricht',
        body: (
          <>
            <p>
              Eine Aufnahme ist das Foto einer Darstellung, und manche Seiten sind dafür feindlich. Insbesondere:
            </p>
            <ul>
              <li>
                <strong>Inhalte hinter einer Anmeldung, einem Klick oder einer Einwilligungswand</strong> werden nicht aufgenommen, weil die Erweiterung fotografiert, was die Seite tatsächlich darstellt.
              </li>
              <li>
                <strong>Seiten mit ungewöhnlichen Scroll-Containern</strong> — Dokumenteneditoren, Dashboards mit inneren Bereichen — werden heuristisch behandelt. Die Erweiterung misst den Scroll-Container und korrigiert verlagerte Inhalte, aber eine Seite kann immer so gebaut sein, dass sie sie falsch liest.
              </li>
              <li>
                <strong>Sehr lange Feeds</strong> sind auf 40 Bildschirme pro Aufnahme begrenzt. Der Fortschrittstext sagt, wann die Grenze erreicht wurde.
              </li>
              <li>
                <strong>Horizontale Stöße</strong> auf einer zugleich sehr breiten und durchgehenden Seite können als harte Kante sichtbar sein. Das ist eine dokumentierte Grenze, kein Mangel, den wir verstecken.
              </li>
              <li>
                <strong>Die OCR-Genauigkeit</strong> hängt vom Bild ab. Text mit etwa 6 Pixeln Höhe oder weniger wird nicht zuverlässig erkannt.
              </li>
            </ul>
          </>
        ),
      },
      {
        title: '7. Verfügbarkeit und Änderungen',
        body: (
          <>
            <p>
              Die Erweiterung läuft lokal und braucht keinen Server, ein Serverausfall hindert Sie also nicht am Aufnehmen. Der Lizenzserver dient Käufen, dem Wiederherstellen eines Kaufs und der Prüfung des Abo-Status; ist er nicht erreichbar, funktioniert eine bestehende lokale Lizenz weiter.
            </p>
            <p>
              Wir können Funktionen aktualisieren, ändern oder einstellen. Stellen wir eine Funktion ein, für die Sie bezahlt haben, bieten wir einen Ausgleich im Verhältnis zum verbleibenden bezahlten Zeitraum an.
            </p>
          </>
        ),
      },
      {
        title: '8. Gewährleistungsausschluss',
        body: (
          <p>
            Die Erweiterung wird „wie besehen“ bereitgestellt, ohne Gewährleistung jeglicher Art, ausdrücklich oder stillschweigend, einschließlich der Eignung für einen bestimmten Zweck. Sie ist ein Werkzeug, keine Garantie: Prüfen Sie eine Aufnahme auf Vollständigkeit, bevor Sie sich für etwas Wichtiges darauf verlassen.
          </p>
        ),
      },
      {
        title: '9. Haftungsbeschränkung',
        body: (
          <>
            <p>
              Soweit gesetzlich zulässig, ist unsere Gesamthaftung aus oder im Zusammenhang mit der Erweiterung auf den Betrag begrenzt, den Sie in den zwölf Monaten vor dem Anspruch dafür gezahlt haben. Wir haften nicht für mittelbare Schäden oder Folgeschäden — einschließlich Datenverlust, entgangenem Gewinn oder einer Aufnahme, die etwas nicht festgehalten hat, das Sie brauchten.
            </p>
            <p>Nichts in diesen Bedingungen schließt eine Haftung aus, die gesetzlich nicht ausgeschlossen werden kann.</p>
          </>
        ),
      },
      {
        title: '10. Datenschutz',
        body: (
          <p>
            Was die Erweiterung speichert und was sie nie überträgt, steht in der <a href={P('privacy')}>Datenschutzerklärung</a>, die Teil dieser Bedingungen ist.
          </p>
        ),
      },
      {
        title: '11. Beendigung',
        body: (
          <p>
            Sie können jederzeit beenden, indem Sie die Erweiterung deinstallieren. Wir können eine Lizenz bei einem wesentlichen Verstoß gegen Abschnitt 4 oder 5 beenden. Bei Beendigung gelten die Abschnitte 8, 9 und 12 fort.
          </p>
        ),
      },
      {
        title: '12. Anwendbares Recht und Kontakt',
        body: (
          <p>
            Diese Bedingungen unterliegen dem Recht am Sitz des Merchant of Record, ohne Rücksicht auf Kollisionsnormen. Fragen zu diesen Bedingungen: <a href={mailto(S)}>{S}</a>. Alles, was die Erweiterung selbst betrifft, beantwortet die <a href={P('support')}>Support-Seite</a> schneller.
          </p>
        ),
      },
    ],
  },

  notFound: {
    title: 'Seite nicht gefunden',
    body: 'Diese Seite gibt es nicht. Vielleicht wurde sie verschoben, oder im Link ist ein Tippfehler.',
    cta: 'Zurück zur Startseite',
  },
};

export default de;
