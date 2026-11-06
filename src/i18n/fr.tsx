import { FREE_AMOUNT, PRICE_AMOUNT, YEARLY_PER_MONTH } from '../content/prices';
import { CHROME_STORE_URL, PRIVACY_EMAIL, SUPPORT_EMAIL, mailto } from '../content/site';
import type { Dict } from './dict';
import { pathFor } from './paths';

/* 法语文案。
 *
 * 结构、键名、数组长度与 en.tsx 完全一致（`Dict` 只保证键齐全，数不了数组
 * 长度；漏一条问答在页面上就是少一行，编译不报错——所以 tests/dict.test.ts
 * 会递归比对八份字典的形状）。
 *
 * 站内链接走 `P()`，金额走 prices.ts 的常量，地址走 site.ts。这三样都不在
 * 这份文件里出现字面量，否则改一次要改八处。
 *
 * **法语文句不要在源码里折行。** JSX 会把「换行 + 缩进」折成一个空格，而
 * 法语里标点前的空格是语法的一部分（`vous` 与 `:` 之间、`«` 与词之间），
 * 折行插进去的空格会落在句子中间。所以每个文本段写成一行，只在标签外换行。
 */

const S = SUPPORT_EMAIL;
const P = (page: Parameters<typeof pathFor>[1]) => pathFor('fr', page);

const fr: Dict = {
  meta: {
    '': {
      title: 'Page Screenshot Pro — captures pleine page sans raccords',
      description:
        'Captures d’écran pleine page sur Chrome : défilement infini, images différées, tableaux larges et en-têtes fixes en une image. Annotations, PDF et OCR.',
      ogDescription:
        'Capturez une page entière en une seule image. Annotations, export PDF et OCR. Tout se passe sur votre appareil.',
    },
    pricing: {
      title: 'Tarifs — gratuit et formules Pro · Page Screenshot Pro',
      description: `Gratuit : 20 captures/jour et l’éditeur d’annotations. Pro ajoute capture d’élément, export et fusion PDF, OCR, accès MCP — ${PRICE_AMOUNT.monthly}/mois, ${PRICE_AMOUNT.yearly}/an ou ${PRICE_AMOUNT.lifetime} à vie.`,
      ogDescription:
        'Gratuit avec 20 captures par jour et tout l’éditeur d’annotations. Pro ajoute la capture d’élément, l’export PDF, la fusion PDF, l’OCR et l’accès MCP.',
    },
    faq: {
      title: 'Questions fréquentes — pages longues · Page Screenshot Pro',
      description:
        'Pages longues, défilement infini, images différées, fichiers locaux file://, confidentialité, licences, restaurer un achat et captures par MCP.',
      ogDescription:
        'Réponses sur les pages longues, le défilement infini, les fichiers locaux, la confidentialité, les licences et l’accès MCP.',
    },
    support: {
      title: 'Assistance — bugs et remboursements · Page Screenshot Pro',
      description:
        'Assistance par e-mail pour Page Screenshot Pro : bogues, problèmes de capture, licence et remboursement. Une vraie personne répond sous deux jours ouvrés.',
      ogDescription: 'Signalements de bogues, problèmes de capture, questions de licence et de remboursement.',
    },
    privacy: {
      title: 'Confidentialité — ce qui reste local · Page Screenshot Pro',
      description:
        'Ce que Page Screenshot Pro stocke et n’envoie jamais : captures, annotations et OCR restent locaux. Seules requêtes : licence, paiement Waffo, vos retours.',
      ogDescription:
        'Captures, annotations et OCR restent sur votre appareil. Les seules requêtes réseau sont la vérification facultative de licence, l’ouverture du paiement hébergé par Waffo lors d’un achat et les retours que vous choisissez d’envoyer. L’accès MCP local, via 127.0.0.1, ne quitte jamais votre machine.',
    },
    terms: {
      title: 'CGU — licences et remboursements · Page Screenshot Pro',
      description:
        'Conditions de l’extension Page Screenshot Pro et de son serveur de licences : portée, offre gratuite, achats, remboursements, usage acceptable et limites.',
      ogDescription: 'Portée de la licence, offre gratuite, achats et remboursements, et limites.',
    },
  },
  notFoundMeta: {
    title: 'Page introuvable — Page Screenshot Pro',
    description: 'Cette page n’existe pas. Revenez à la page d’accueil.',
  },

  nav: {
    features: 'Fonctions',
    pricing: 'Tarifs',
    faq: 'FAQ',
    support: 'Assistance',
    cta: 'Installer',
    langLabel: 'Langue',
    ariaLabel: 'Principale',
  },

  footer: {
    tagline: 'Captures longues, annotations, PDF et OCR — tout est traité dans votre navigateur.',
    colProduct: 'Produit',
    colSupport: 'Assistance',
    colLegal: 'Mentions légales',
    help: 'Aide et contact',
    privacy: 'Politique de confidentialité',
    terms: 'Conditions d’utilisation',
    copyright: '© 2026 Page Screenshot Pro',
    stayLocal: 'Vos captures restent sur votre appareil.',
    ariaLabel: 'Pied de page',
  },

  home: {
    eyebrowStrong: 'Fonctionne entièrement sur votre appareil',
    eyebrowRest: 'Chrome 116+ ·',
    heroTitleLead: 'Captures pleine page',
    heroTitleAccent: 'qui s’alignent vraiment',
    lead: (
      <>
        Page Screenshot Pro est une extension Chrome de capture d’écran : elle photographie une page entière en une seule image — fils à défilement infini, images chargées à la demande, tableaux larges et navigation fixe compris. <strong>Rien n’est envoyé.</strong> Pas de compte, aucun serveur pour vos images, pas de file d’attente.
      </>
    ),
    ctaPrimary: 'Ajouter à Chrome',
    ctaGhost: 'Voir les offres',
    trust: ['Offre gratuite, sans carte', 'Fonctionne hors ligne', 'Annotations gratuites', '8 langues d’interface'],
    shotUrl: 'exemple.com/un-article-vraiment-long',
    shotSticky: 'en-tête fixe — capturé une seule fois',
    shotSeam: 'raccord corrigé à ±16 px',

    figures: {
      stitch: {
        alt: 'Schéma : une longue page capturée en six fragments sur trois lignes et deux colonnes, avec des pointillés qui marquent les raccords horizontaux et verticaux et une flèche indiquant que la capture descend une colonne avant de passer à la suivante.',
        caption:
          'La page est photographiée écran par écran, puis les morceaux sont assemblés ; les pointillés marquent la jonction de deux captures.',
      },
      editor: {
        alt: 'Schéma : une capture dans l’éditeur d’annotations, avec une barre de neuf outils au-dessus et un rectangle, une ellipse, une flèche, un tracé à main levée et un bloc mosaïque dessinés par-dessus.',
        caption:
          'Neuf outils, tous gratuits : rectangle, ellipse, flèche, stylo, surlignage, texte, mosaïque, recadrage, sélection.',
      },
      local: {
        alt: 'Schéma : une fenêtre de navigateur à gauche et un disque local à droite, reliés au centre par un bouclier muni d’un cadenas ; un nuage au-dessus est barré.',
        caption:
          'La capture, l’édition et l’export se font sur votre machine. Pas de cloud, pas d’envoi, pas de compte.',
      },
    },

    featuresTitle: 'Ce qu’il fait bien',
    featuresSub:
      'C’est là qu’une extension de capture d’écran générique s’arrête : voici ce qui rend une capture longue — la page entière en une seule image — lisible au lieu d’un empilement d’en-têtes répétés et d’images à moitié dessinées. Une capture d’écran est facile ; une capture qu’on peut lire, beaucoup moins.',
    features: [
      {
        icon: '↕',
        title: 'Pages à défilement infini',
        body: (
          <>
            Le fil est chargé en entier avant la capture, au lieu de s’arrêter au premier écran. Une capture avec défilement d’un fil sans fin est prise d’un bout à l’autre, pas seulement sur le premier écran. Les fils très longs sont plafonnés à 40 écrans, et l’extension vous dit quand elle a coupé.
          </>
        ),
      },
      {
        icon: '🖼',
        title: 'Images chargées à la demande',
        body: (
          <>
            L’extension défile à l’avance et attend <code>img.decode()</code>, pour que chaque bitmap soit réellement peint et non un rectangle gris.
          </>
        ),
      },
      {
        icon: '↔',
        title: 'Pages plus larges que la fenêtre',
        body: (
          <>
            Tableaux larges, tableaux kanban et schémas sont capturés en grille puis réassemblés, sans perdre le bord droit.
          </>
        ),
      },
      {
        icon: '🧩',
        title: 'Recousu comme une seule page',
        body: (
          <>
            La navigation reste sur le premier écran et les éléments fixes ou collants sont masqués sur tous les suivants — y compris à l’intérieur des composants web ; les écrans adjacents sont en plus comparés et alignés à ±16 px près. Rien ne se répète, rien ne saute.
          </>
        ),
      },
      {
        icon: '🤖',
        title: 'Des captures pour les clients IA',
        body: (
          <>
            Claude Desktop, Cursor et d’autres clients MCP peuvent demander à l’extension de capturer la zone visible, un seul élément ou une page entière, et d’en relire le texte par OCR. Le relais tourne sur <code>127.0.0.1</code>, sur votre propre machine.
          </>
        ),
      },
      {
        icon: '🔒',
        title: 'Traitement sur votre appareil',
        body: (
          <>
            Captures, annotations et OCR ne quittent jamais le navigateur. L’extension ne se connecte au réseau que pour trois choses : la vérification facultative de licence, l’ouverture du paiement hébergé par Waffo, et les retours que vous envoyez vous-même. L’accès MCP est une quatrième voie, mais elle ne quitte jamais votre machine — voir la politique de confidentialité.
          </>
        ),
      },
    ],

    aboutTitle: 'À propos de Page Screenshot Pro',
    aboutP1: (
      <>
        Page Screenshot Pro est une extension Chrome pour capturer les pages que le navigateur ne capture pas tout seul. Elle fait défiler la page, photographie chaque écran et assemble les morceaux en une seule image — en corrigeant les deux choses qui font paraître un assemblage naïf cassé : la navigation fixe qui se répète d’un bout à l’autre, et le contenu qui se décale quand cette navigation quitte la mise en page.
      </>
    ),
    aboutP2: (
      <>
        Tout ce qui vient après la capture est là aussi : un éditeur d’annotations à neuf outils (rectangle, ellipse, flèche, stylo, surligneur, texte, mosaïque, recadrage, sélection), l’export PDF et l’OCR pour le chinois et l’anglais. Les pages locales en <code>file://</code> fonctionnent également, une fois « Autoriser l’accès aux URL de fichier » activé.
      </>
    ),

    compareTitle: 'Gratuit et Pro',
    compareSub:
      'Tout l’éditeur d’annotations est gratuit. Pro, c’est le volume, plus la capture d’élément, l’export et la fusion PDF, l’OCR et l’accès MCP.',
    compareHead: ['Fonction', 'Gratuit', 'Pro'],
    compareRows: [
      { label: 'Capture pleine page avec assemblage', free: 'yes', pro: 'yes' },
      { label: 'Capture de la zone visible', free: 'yes', pro: 'yes' },
      { label: 'Sélection d’une région à la souris', free: 'yes', pro: 'yes' },
      { label: 'Dépliage du défilement infini', free: 'yes', pro: 'yes' },
      { label: 'Préchargement des images différées', free: 'yes', pro: 'yes' },
      { label: 'Éditeur d’annotations, les neuf outils', free: 'yes', pro: 'yes' },
      { label: 'Sortie PNG et JPG, modèles de nom, sous-dossiers', free: 'yes', pro: 'yes' },
      { label: 'Captures par jour', free: { text: '20' }, pro: { text: 'Illimité' } },
      { label: 'Capture d’un seul élément au clic', free: 'no', pro: 'yes' },
      { label: 'Export PDF', free: 'no', pro: 'yes' },
      { label: 'Fusionner plusieurs captures en un PDF', free: 'no', pro: 'yes' },
      { label: 'OCR — extraire le texte, chinois et anglais', free: 'no', pro: 'yes' },
      { label: 'Accès MCP — laisser les clients IA capturer', free: 'no', pro: 'yes' },
    ],
    compareNote: (
      <>
        Les tarifs et le détail des offres sont sur la <a href={P('pricing')}>page des tarifs</a>.
      </>
    ),

    whyTitle: 'Pourquoi ne pas utiliser la capture intégrée du navigateur ?',
    whyP1: (
      <>
        Les DevTools de Chrome savent prendre une capture de toute la page, et pour un article simple cela suffit. Ils ne déplient pas les fils à défilement infini, n’attendent pas les images différées, et la navigation collante se répète sur toute l’image — ce qui est précisément l’allure d’un fil ou d’un tableau de bord.
      </>
    ),
    whyP2: (
      <>
        Ils ne savent pas non plus annoter, ni exporter en PDF, ni lire le texte d’une image. C’est ce que cette extension ajoute, et la moitié annotation est gratuite. C’est cet ensemble qui sépare une extension de capture d’écran d’un simple raccourci clavier.
      </>
    ),

    howTitle: 'Trois étapes',
    howSteps: [
      {
        title: 'Ouvrez une page longue',
        body: 'Articles, fils d’actualité et notes de version fonctionnent tous. C’est sur les pages longues que la différence se voit.',
      },
      {
        title: 'Cliquez sur l’icône de la barre d’outils, ou appuyez sur Alt+Maj+D',
        body: 'Alt+Maj+V ne prend que la zone visible. Les deux raccourcis sont modifiables dans la page des raccourcis clavier de Chrome.',
      },
      {
        title: 'Le fichier arrive dans Téléchargements',
        body: (
          <>
            Nommé selon votre modèle — par défaut <code>{'{title} - {date} {time}.png'}</code>. L’éditeur s’ouvre si vous l’avez demandé.
          </>
        ),
      },
    ],

    whoTitle: 'À qui cela sert',
    who: [
      {
        title: 'Signalements de bogues et assurance qualité',
        body: 'Capturez toute la mise en page cassée en une image, puis entourez le défaut et masquez le nom du compte à la mosaïque.',
      },
      {
        title: 'Documentation et tutoriels',
        body: 'Des guides pas à pas avec flèches et surlignages numérotés, exportés en un PNG ou un PDF.',
      },
      {
        title: 'Revue de design et de contenu',
        body: 'Les tableaux et planches larges reviennent intacts, donc un commentaire de revue peut pointer un pixel au lieu de le décrire.',
      },
      {
        title: 'Recherche et archivage',
        body: 'Gardez une copie lisible d’une page avant qu’elle ne change. Avec l’OCR, le texte de l’image redevient cherchable.',
      },
    ],

    installTitle: 'Obtenir Page Screenshot Pro',
    installSub: 'Chrome 116 ou plus récent, sous Windows, macOS ou Linux.',
    installBody: (
      <>
        Page Screenshot Pro est désormais sur le Chrome Web Store. Installez-la depuis sa fiche
        et Chrome la tiendra à jour : pas de téléchargement manuel, pas d’installation manuelle.
      </>
    ),
    installStore: 'Ajouter à Chrome',
    installMore: 'Autres moyens de l’obtenir',

    plansTitle: 'Offres',
    plansSub:
      'Gratuit pour toujours. Pro si vous avez besoin de volume, de capture d’élément, d’export et de fusion PDF, d’OCR ou d’accès MCP. Facturé en dollars américains par Waffo Pancake, notre marchand de référence.',
    plans: [
      {
        tag: 'Gratuit',
        name: 'Capture du quotidien',
        amount: FREE_AMOUNT,
        period: 'pour toujours',
        bullets: [
          'Capture pleine page, zone visible et région',
          'Défilement infini et images différées gérés',
          'Tout l’éditeur d’annotations',
          'Sortie PNG et JPG',
          'Jusqu’à 20 captures par jour',
        ],
        cta: { label: 'Ajouter à Chrome', to: CHROME_STORE_URL },
      },
      {
        tag: 'Pro mensuel',
        name: 'Projets courts',
        amount: PRICE_AMOUNT.monthly,
        period: '/ mois',
        bullets: [
          'Tout le gratuit, sans limite',
          'Capture d’élément',
          'Export PDF et fusion PDF',
          'OCR, chinois et anglais',
          'Accès MCP pour les clients IA',
          'Résiliable à tout moment',
        ],
        cta: { label: 'Comparer les offres', to: 'pricing' },
      },
      {
        tag: 'Pro annuel · Le plus choisi',
        name: 'Toute l’année',
        amount: PRICE_AMOUNT.yearly,
        period: '/ an',
        featured: true,
        bullets: [
          'Tout le gratuit, sans limite',
          'Capture d’élément',
          'Export PDF et fusion PDF',
          'OCR, chinois et anglais',
          'Accès MCP pour les clients IA',
          `Revient à environ ${YEARLY_PER_MONTH} par mois`,
        ],
        cta: { label: 'Voir comment acheter', to: 'pricing', primary: true },
      },
      {
        tag: 'Pro à vie',
        name: 'Payer une fois',
        amount: PRICE_AMOUNT.lifetime,
        period: 'une fois',
        bullets: [
          'Tout le gratuit, sans limite',
          'Capture d’élément',
          'Export PDF et fusion PDF',
          'OCR, chinois et anglais',
          'Accès MCP pour les clients IA',
          'Aucun renouvellement, jamais',
        ],
        cta: { label: 'Comparer les offres', to: 'pricing' },
      },
    ],
    plansNote: (
      <>
        Pro est lié au profil de navigateur dans lequel il a été acheté. Vous avez changé d’ordinateur ou réinstallé ? Restaurez-le avec l’e-mail utilisé pour le paiement — depuis l’extension, sans ticket d’assistance. Une licence reste active sur cinq profils à la fois au maximum.
      </>
    ),

    faqTitle: 'Questions',
    faqSub: (
      <>
        Les cinq qui reviennent le plus. Les autres sont sur la <a href={P('faq')}>page FAQ</a>.
      </>
    ),
    faq: [
      {
        q: 'Mes captures sont-elles envoyées quelque part ?',
        a: (
          <>
            <p>
              Non. La capture, l’assemblage, les annotations, l’export PDF et l’OCR s’exécutent tous dans votre navigateur. L’extension n’a ni mesure d’audience ni serveur pour les images.
            </p>
            <p>
              Elle ne se connecte au réseau que pour trois choses : la vérification facultative de licence (qui envoie un identifiant d’installation et rien d’autre), l’ouverture du paiement hébergé par Waffo lors d’un achat, et les retours que vous envoyez vous-même. Par ailleurs, si vous activez vous-même l’accès MCP, l’extension se connecte à 127.0.0.1 sur votre machine, et cette connexion ne quitte pas votre appareil.
            </p>
          </>
        ),
      },
      {
        q: 'Pourquoi l’offre gratuite s’arrête-t-elle à 20 captures par jour ?',
        a: (
          <>
            <p>
              C’est un plafond contre les captures à défilement emballé, pas une limite de démonstration. Toutes les fonctions sauf la capture d’élément, l’export et la fusion PDF, l’OCR et l’accès MCP sont disponibles dans l’offre gratuite, y compris tout l’éditeur d’annotations.
            </p>
            <p>Le compteur se remet à zéro chaque jour et ne compte jamais les utilisateurs Pro.</p>
          </>
        ),
      },
      {
        q: 'Cela fonctionne-t-il sur des fichiers HTML locaux ?',
        a: (
          <>
            <p>
              Oui, une fois autorisé. Dans <code>chrome://extensions</code>, ouvrez les détails de l’extension et activez « Autoriser l’accès aux URL de fichier ». Sinon Chrome refuse de photographier un onglet <code>file://</code>, et l’extension vous le dira.
            </p>
          </>
        ),
      },
      {
        q: 'Que se passe-t-il sur une page qui défile sans fin ?',
        a: (
          <>
            <p>
              L’extension déplie d’abord le fil, puis capture jusqu’à 40 écrans. Si elle atteint ce plafond, elle le dit dans le texte de progression au lieu de tronquer en silence.
            </p>
          </>
        ),
      },
      {
        q: 'Quelles langues parle l’interface ?',
        a: (
          <>
            <p>
              Anglais, chinois simplifié, chinois traditionnel, japonais, coréen, espagnol, français et allemand. Elle suit par défaut la langue de l’interface de Chrome, et vous pouvez la changer appareil par appareil depuis le menu de langue de l’extension.
            </p>
          </>
        ),
      },
    ],
  },

  pricing: {
    h1: 'Des tarifs simples et honnêtes',
    intro:
      'Gratuit pour toujours pour la capture du quotidien, tout l’éditeur d’annotations compris. Pro, c’est le volume, plus la capture d’élément, l’export et la fusion PDF, l’OCR et l’accès MCP. Pas d’essai, pas de carte bancaire sur l’offre gratuite, pas de facturation à l’image.',
    plans: [
      {
        tag: 'Gratuit',
        name: 'Capture du quotidien',
        amount: FREE_AMOUNT,
        period: 'pour toujours',
        bullets: [
          'Capture pleine page, zone visible et région',
          'Dépliage du défilement infini',
          'Préchargement des images différées',
          'Pages larges, assemblées en grille',
          'Éditeur d’annotations — les neuf outils',
          'Sortie PNG et JPG',
          'Modèles de nom de fichier et sous-dossiers',
          '20 captures par jour',
        ],
        cta: { label: 'Ajouter à Chrome', to: CHROME_STORE_URL },
      },
      {
        tag: 'Pro mensuel',
        name: 'Projets courts',
        amount: PRICE_AMOUNT.monthly,
        period: '/ mois',
        bullets: [
          'Tout le gratuit, sans le plafond quotidien',
          'Cliquez pour capturer un seul élément',
          'Export PDF',
          'Fusionner plusieurs captures en un PDF',
          'OCR — chinois et anglais',
          'Accès MCP pour les clients IA',
          'Résiliation depuis l’extension, sans e-mail',
        ],
        cta: { label: 'Comment acheter', to: '#how-to-buy' },
      },
      {
        tag: 'Pro annuel · Le plus choisi',
        name: 'Toute l’année',
        amount: PRICE_AMOUNT.yearly,
        period: '/ an',
        featured: true,
        bullets: [
          'Tout le gratuit, sans le plafond quotidien',
          'Cliquez pour capturer un seul élément',
          'Export PDF',
          'Fusionner plusieurs captures en un PDF',
          'OCR — chinois et anglais',
          'Accès MCP pour les clients IA',
          `Environ ${YEARLY_PER_MONTH} par mois`,
        ],
        cta: { label: 'Comment acheter', to: '#how-to-buy', primary: true },
      },
      {
        tag: 'Pro à vie',
        name: 'Payer une fois',
        amount: PRICE_AMOUNT.lifetime,
        period: 'une fois',
        bullets: [
          'Tout le gratuit, sans le plafond quotidien',
          'Cliquez pour capturer un seul élément',
          'Export PDF',
          'Fusionner plusieurs captures en un PDF',
          'OCR — chinois et anglais',
          'Accès MCP pour les clients IA',
          'Aucun renouvellement, aucune expiration',
        ],
        cta: { label: 'Comment acheter', to: '#how-to-buy' },
      },
    ],
    plansNote: (
      <>
        Prix en dollars américains. Le paiement est traité par Waffo Pancake en tant que marchand de référence ; les taxes locales sont ajoutées au paiement lorsqu’elles s’appliquent. Vous hésitez entre les formules ? La <a href={P('faq')}>FAQ</a> répond directement à « qu’ajoute Pro ».
      </>
    ),

    tableTitle: 'Ce que contient chaque offre',
    tableSub: 'Un seul tableau, aucun astérisque.',
    tableHead: ['Fonction', 'Gratuit', 'Pro'],
    tableRows: [
      { label: 'Capture pleine page avec assemblage automatique', free: 'yes', pro: 'yes' },
      { label: 'Capture de la zone visible', free: 'yes', pro: 'yes' },
      { label: 'Sélection d’une région à la souris', free: 'yes', pro: 'yes' },
      { label: 'Dépliage du défilement infini (jusqu’à 40 écrans)', free: 'yes', pro: 'yes' },
      { label: 'Préchargement des images différées', free: 'yes', pro: 'yes' },
      { label: 'Éléments fixes et collants capturés une seule fois', free: 'yes', pro: 'yes' },
      { label: 'Pages larges découpées et réassemblées', free: 'yes', pro: 'yes' },
      {
        label:
          'Éditeur d’annotations — rectangle, ellipse, flèche, stylo, surligneur, texte, mosaïque, recadrage, sélection',
        free: 'yes',
        pro: 'yes',
      },
      { label: 'Sortie PNG et JPG avec réglage de qualité', free: 'yes', pro: 'yes' },
      { label: 'Modèles de nom de fichier et sous-dossiers de téléchargement', free: 'yes', pro: 'yes' },
      { label: 'Copie dans le presse-papiers après capture', free: 'yes', pro: 'yes' },
      {
        label: (
          <>
            Pages locales en <code>file://</code>
          </>
        ),
        free: 'yes',
        pro: 'yes',
      },
      { label: '8 langues d’interface', free: 'yes', pro: 'yes' },
      { label: 'Captures par jour', free: { text: '20' }, pro: { text: 'Illimité' } },
      { label: 'Capture d’un seul élément au clic', free: 'no', pro: 'yes' },
      { label: 'Export PDF', free: 'no', pro: 'yes' },
      { label: 'Fusionner plusieurs captures en un PDF', free: 'no', pro: 'yes' },
      { label: 'OCR — extraire le texte d’une image', free: 'no', pro: 'yes' },
      { label: 'Accès MCP — laisser les clients IA capturer', free: 'no', pro: 'yes' },
    ],

    buyTitle: 'Comment se passe l’achat',
    buySub:
      'Le paiement démarre depuis l’extension, pour que Pro soit rattaché au bon profil de navigateur.',
    buySteps: [
      {
        title: 'Ouvrez la fenêtre de l’extension',
        body: 'Cliquez sur l’icône de la barre d’outils. Les boutons d’offre se trouvent sous les boutons de capture.',
      },
      {
        title: 'Choisissez une offre',
        body: 'Un paiement sécurisé Waffo Pancake s’ouvre dans un nouvel onglet. Payez par carte ; les taxes locales sont affichées avant confirmation.',
      },
      {
        title: 'Revenez — Pro est déjà actif',
        body: 'Vous pouvez fermer l’onglet. L’extension récupère l’achat d’elle-même et le badge passe à Pro.',
      },
    ],
    buyNote: (
      <>
        Acheter un abonnement et une licence à vie sur la même machine est pris en charge : la licence à vie l’emporte toujours, et un renouvellement ou une résiliation d’abonnement ne la retire jamais. Les conditions de remboursement figurent dans les <a href={P('terms')}>conditions d’utilisation</a> ; si le paiement lui-même se comporte mal, <a href={P('support')}>dites-le-nous</a> et nous réglerons la commande avec le prestataire.
      </>
    ),

    billingTitle: 'Questions de facturation',
    billingFaq: [
      {
        q: 'Puis-je utiliser Pro sur plusieurs ordinateurs ?',
        a: (
          <>
            <p>
              Une licence est liée à un seul profil de navigateur. Pour la déplacer — nouvelle machine, réinstallation, profil effacé — ouvrez la fenêtre de l’extension et utilisez <strong>Restaurer l’achat</strong> avec l’e-mail du paiement. Cela prend effet immédiatement et il n’y a rien à repayer.
            </p>
            <p>
              La restauration pointe le nouveau profil vers l’achat d’origine, de sorte que les deux désignent la même licence au lieu de la dupliquer.
            </p>
            <p>
              Une licence couvre jusqu’à cinq profils de navigateur à la fois, profil d’achat compris. Restaurer sur un sixième n’échoue pas : cela écarte le profil le moins récemment utilisé. Gardez donc l’e-mail et restaurez de nouveau si vous revenez à ce profil.
            </p>
          </>
        ),
      },
      {
        q: 'Comment résilier un abonnement ?',
        a: (
          <>
            <p>
              Ouvrez la page Paramètres de l’extension et descendez en bas. La carte d’abonnement affiche votre offre actuelle, son état et la date d’expiration ; cliquez dessus pour ouvrir l’écran de détails, où se trouve le bouton de résiliation — pas d’e-mail, pas de portail, pas de ticket.
            </p>
            <p>
              Résilier arrête le renouvellement. Pro continue de fonctionner jusqu’à la fin de la période déjà payée, et l’écran de détails indique la date. Vous avez changé d’avis avant ? Le bouton pour reprendre est sur ce même écran.
            </p>
          </>
        ),
      },
      {
        q: 'Puis-je passer du mensuel à l’annuel ?',
        a: (
          <>
            <p>
              Pas sur place : un abonnement en cours ne peut pas changer d’offre. Résiliez-le d’abord, puis abonnez-vous à l’offre voulue. Le temps déjà payé s’ajoute à la période de la nouvelle offre, donc changer d’offre ne vous fait jamais perdre les jours achetés.
            </p>
          </>
        ),
      },
      {
        q: 'Proposez-vous des remboursements ?',
        a: (
          <>
            <p>
              Oui — écrivez à <a href={mailto(S)}>{S}</a> depuis l’adresse utilisée pour le paiement, en précisant de quelle commande il s’agit. Les remboursements sont traités par Waffo Pancake, notre marchand de référence.
            </p>
            <p>
              Un abonnement remboursé arrête Pro. Une licence à vie remboursée arrête aussi Pro — l’extension interroge le serveur de licences, donc le changement atteint la machine et pas seulement la facture.
            </p>
          </>
        ),
      },
      {
        q: 'Y a-t-il un essai ?',
        a: (
          <>
            <p>
              Non, et l’offre gratuite le rend inutile : tous les modes de capture et tout l’éditeur d’annotations sont gratuits, plafonnés à 20 captures par jour. Pro sert uniquement à retirer ce plafond et à ajouter la capture d’élément, l’export et la fusion PDF, l’OCR et l’accès MCP.
            </p>
          </>
        ),
      },
      {
        q: 'Qu’arrive-t-il à mes captures si j’arrête de payer ?',
        a: (
          <>
            <p>
              Rien. Les fichiers déjà enregistrés vous appartiennent et restent où vous les avez mis ; l’extension n’a aucun serveur qui pourrait les détenir. La liste d’historique dans l’extension reste lisible elle aussi. Vous revenez simplement aux 20 captures par jour de l’offre gratuite, et la capture d’élément, l’export et la fusion PDF, l’OCR et l’accès MCP disparaissent.
            </p>
          </>
        ),
      },
      {
        q: 'Quels moyens de paiement sont acceptés ?',
        a: (
          <>
            <p>
              Ce que le paiement Waffo Pancake propose dans votre région, généralement les principales cartes de crédit et de débit. L’extension elle-même ne voit ni ne stocke jamais vos données de carte — le paiement se déroule sur la page de Waffo, pas sur la nôtre.
            </p>
          </>
        ),
      },
    ],
  },

  faq: {
    h1: 'Questions fréquentes',
    intro: (
      <>
        D’abord le comportement des captures, ensuite les licences. Si la réponse n’est pas ici, <a href={P('support')}>écrivez-nous</a> — une vraie personne lit les messages.
      </>
    ),
    groups: [
      {
        title: 'Captures',
        items: [
          {
            q: 'Pourquoi un en-tête collant manque-t-il au milieu de ma capture ?',
            a: (
              <>
                <p>
                  C’est volontaire, et c’est ce qui rend une capture longue lisible. Une barre de navigation collante serait sinon photographiée sur chaque écran ; elle apparaît donc une fois en haut et est masquée partout ensuite.
                </p>
                <p>
                  Le masquage utilise <code>visibility</code> plutôt que <code>display: none</code>, parce que retirer un élément de la mise en page changerait la hauteur de la page en cours de capture et placerait les morceaux dans deux systèmes de coordonnées différents.
                </p>
                <p>
                  Si un en-tête que vous attendiez à voir <em>manque</em>, la page le rend probablement collant en CSS au défilement. L’extension revérifie les positions en défilant, donc envoyez-nous l’URL.
                </p>
              </>
            ),
          },
          {
            q: 'Pourquoi certaines images sont-elles vides ?',
            a: (
              <>
                <p>
                  Les images chargées à la demande n’ont peut-être pas fini de se décoder quand cet écran a été photographié. Activez <strong>Déclencher et attendre les images différées avant la capture</strong> dans les Paramètres — l’extension défile alors à l’avance et attend le décodage de chaque bitmap.
                </p>
                <p>
                  Le contenu derrière une connexion, un mur de cookies ou un clic ne peut pas être capturé : l’extension photographie ce que la page rend réellement.
                </p>
              </>
            ),
          },
          {
            q: 'La page défile sans fin. Est-ce que ça marche ?',
            a: (
              <>
                <p>
                  Oui. <strong>Déplier les pages à défilement infini avant la capture</strong> est actif par défaut : la page est défilée jusqu’en bas par paliers jusqu’à ce qu’aucun nouveau contenu n’arrive, et la capture ne commence qu’ensuite.
                </p>
                <p>
                  Il y a un plafond dur de 40 écrans pour qu’un fil réellement sans fin ne bloque pas le navigateur. Quand le plafond est atteint, le texte de progression indique que la capture a été écourtée — elle ne tronque jamais en silence.
                </p>
              </>
            ),
          },
          {
            q: 'Et une page plus large que ma fenêtre ?',
            a: (
              <>
                <p>
                  Tableaux larges, tableaux kanban et schémas sont capturés en grille puis réassemblés ligne par ligne, pour que le bord droit ne soit pas perdu. Les raccords horizontaux sont nets plutôt que fondus — sur une page avec des filets verticaux ou des bordures de cartes c’est invisible ; sur une seule image continue, vous pourriez voir la jointure.
                </p>
                <p>
                  Si la page n’est que de quelques pixels plus large que la fenêtre à cause d’un arrondi, l’extension la traite comme une seule colonne plutôt que d’ajouter un lambeau de seconde.
                </p>
              </>
            ),
          },
          {
            q: 'Puis-je capturer un fichier HTML local ?',
            a: (
              <>
                <p>
                  Oui, après avoir accordé l’autorisation. Ouvrez <code>chrome://extensions</code>, trouvez Page Screenshot Pro, ouvrez ses détails et activez <strong>Autoriser l’accès aux URL de fichier</strong>. Sinon Chrome empêche de photographier un onglet <code>file://</code>, et l’extension vous dira que c’est ce qui s’est passé au lieu d’échouer en silence.
                </p>
              </>
            ),
          },
          {
            q: 'Cela fonctionne-t-il dans Edge, Brave ou d’autres navigateurs Chromium ?',
            a: (
              <>
                <p>
                  L’extension cible Chrome 116 et plus récent. Les navigateurs basés sur Chromium qui implémentent les mêmes API d’extension fonctionnent généralement, mais Chrome est la cible de développement et de test — le chemin de capture utilise des API dont le comportement identique n’est pas garanti ailleurs.
                </p>
              </>
            ),
          },
          {
            q: 'Où vont les fichiers, et puis-je changer le nom ?',
            a: (
              <>
                <p>
                  Dans Téléchargements, par défaut. Dans les Paramètres, vous pouvez définir un modèle de nom de fichier avec <code>{'{title}'}</code>, <code>{'{host}'}</code>, <code>{'{date}'}</code>, <code>{'{time}'}</code>, <code>{'{width}'}</code> et <code>{'{height}'}</code>, choisir un sous-dossier, basculer le format par défaut entre PNG et JPG, et décider si la boîte « Enregistrer sous » apparaît à chaque fois.
                </p>
              </>
            ),
          },
          {
            q: 'Puis-je capturer un seul élément, sans toute la page ?',
            a: (
              <>
                <p>
                  Oui — faites un clic droit sur l’élément et choisissez l’entrée de capture dans le menu contextuel. La capture d’élément est une fonction Pro ; les trois autres modes de capture (page entière, zone visible, sélection d’une région à la souris) sont gratuits.
                </p>
              </>
            ),
          },
        ],
      },
      {
        title: 'Confidentialité et données',
        items: [
          {
            q: 'Mes captures sont-elles envoyées quelque part ?',
            a: (
              <>
                <p>
                  Non. Capture, assemblage, annotations, export PDF et OCR s’exécutent tous dans votre navigateur. Il n’y a ni mesure d’audience, ni télémétrie, ni serveur d’images.
                </p>
                <p>
                  L’extension ne se connecte au réseau que pour trois choses : la vérification facultative de licence (qui envoie un identifiant d’installation généré aléatoirement et reçoit un statut d’offre), l’ouverture du paiement hébergé par Waffo lors d’un achat, et les retours que vous envoyez vous-même. La requête de licence ne contient aucune image, aucune URL de page et aucun historique de navigation. Paiement désactivé, l’extension n’émet aucune requête réseau du tout, sauf si vous envoyez des retours ou activez vous-même l’accès MCP — et cette connexion-là ne va que vers 127.0.0.1, sur votre propre machine.
                </p>
              </>
            ),
          },
          {
            q: 'Qu’est-ce que l’identifiant d’installation ?',
            a: (
              <>
                <p>
                  Un identifiant aléatoire créé au premier lancement et stocké localement. Il existe pour rattacher une licence à un profil de navigateur sans compte, sans connexion par e-mail et sans mot de passe. Il n’est dérivé ni de votre machine, ni de votre profil Chrome, ni de votre navigation.
                </p>
                <p>
                  Restaurer un achat relie un nouvel identifiant d’installation à l’original ; rien d’autre n’est envoyé.
                </p>
              </>
            ),
          },
          {
            q: 'L’OCR envoie-t-il mon image quelque part ?',
            a: (
              <>
                <p>
                  Non. Le moteur d’OCR et ses données de langue sont embarqués dans l’extension et s’exécutent localement dans un document isolé. Rien ne quitte le navigateur, et cela fonctionne sans connexion réseau.
                </p>
              </>
            ),
          },
          {
            q: 'Que garde l’historique de l’extension ?',
            a: (
              <>
                <p>
                  Les 30 dernières captures, avec une vignette, conservées dans le stockage local du navigateur pour que vous puissiez les rouvrir ou les réexporter. Les entrées plus anciennes sont supprimées automatiquement. Vous pouvez vider la liste depuis la fenêtre de l’extension, et désinstaller l’extension la supprime avec le reste de son stockage.
                </p>
              </>
            ),
          },
        ],
      },
      {
        title: 'Licences et facturation',
        items: [
          {
            q: 'Pourquoi l’offre gratuite s’arrête-t-elle à 20 captures par jour ?',
            a: (
              <>
                <p>
                  C’est un plafond contre les captures à défilement emballé — une page à fil sans fin peut produire des dizaines d’écrans en un clic — et non une limitation de démonstration. Tout sauf la capture d’élément, l’export et la fusion PDF, l’OCR et l’accès MCP est dans l’offre gratuite, y compris tout l’éditeur d’annotations. La <a href={P('pricing')}>page des tarifs</a> trace cette frontière ligne par ligne.
                </p>
                <p>
                  Le compteur se remet à zéro chaque jour et ne compte jamais les utilisateurs Pro. Une capture qui échoue ou que vous annulez ne consomme pas l’une des 20.
                </p>
              </>
            ),
          },
          {
            q: 'Comment récupérer Pro après une réinstallation, ou sur un nouvel ordinateur ?',
            a: (
              <>
                <p>
                  Ouvrez la fenêtre de l’extension et utilisez <strong>Restaurer l’achat</strong> avec l’e-mail du paiement. Cela prend effet immédiatement et vous ne payez pas deux fois.
                </p>
                <p>
                  Par sécurité, la réponse est la même que cet e-mail ait un achat ou non, pour qu’un inconnu ne puisse pas utiliser le formulaire pour savoir si vous avez acheté quelque chose. Si Pro n’apparaît pas, l’e-mail n’est probablement pas celui de la commande — écrivez à <a href={mailto(S)}>{S}</a>.
                </p>
              </>
            ),
          },
          {
            q: 'Comment résilier un abonnement ?',
            a: (
              <>
                <p>
                  Ouvrez la page Paramètres de l’extension et descendez en bas. La carte d’abonnement affiche votre offre actuelle, son état et la date d’expiration. Cliquez dessus pour ouvrir l’écran de détails : la liste des commandes et le bouton de résiliation s’y trouvent. Il n’y a ni portail à visiter ni ticket à ouvrir.
                </p>
                <p>
                  Résilier arrête le renouvellement ; Pro continue de fonctionner jusqu’à la fin de la période déjà payée, et l’écran de détails affiche cette date. Vous pouvez reprendre depuis ce même écran avant l’expiration, et si vous vous réabonnez plus tard, le temps restant s’ajoute à la nouvelle période.
                </p>
              </>
            ),
          },
          {
            q: 'J’ai acheté la licence à vie et j’ai aussi un abonnement. Lequel l’emporte ?',
            a: (
              <>
                <p>
                  La licence à vie l’emporte toujours. Un renouvellement, une résiliation ou une expiration d’abonnement ne retire jamais une licence à vie — c’est appliqué côté serveur, pas seulement dans l’interface.
                </p>
                <p>
                  La fenêtre de l’extension indique laquelle vous avez, pour qu’un détenteur de licence à vie et un abonné ne voient pas le même écran.
                </p>
              </>
            ),
          },
          {
            q: 'Proposez-vous des remboursements ?',
            a: (
              <>
                <p>
                  Oui. Écrivez à <a href={mailto(S)}>{S}</a> depuis l’adresse utilisée pour le paiement en précisant de quelle commande il s’agit. Les remboursements sont traités par Waffo Pancake, notre marchand de référence, donc l’argent revient par le même chemin qu’il est parti.
                </p>
                <p>
                  Si la commande remboursée est la licence à vie, Pro est révoqué ; un remboursement sur une commande ne touche pas une autre licence que vous possédez encore.
                </p>
              </>
            ),
          },
          {
            q: 'Qu’arrive-t-il à mes captures si j’arrête de payer ?',
            a: (
              <>
                <p>
                  Rien. Les fichiers déjà enregistrés vous appartiennent et restent où vous les avez mis ; la liste d’historique dans l’extension reste lisible. Vous revenez aux 20 captures par jour de l’offre gratuite, et la capture d’élément, l’export et la fusion PDF, l’OCR et l’accès MCP cessent d’être disponibles.
                </p>
              </>
            ),
          },
        ],
      },
      {
        /* Le seul groupe qui porte un `id` : le bouton « explication complète »
           de la carte MCP des réglages de l'extension pointe vers
           `/faq/#mcp`. Les huit dictionnaires doivent le porter, sinon le
           shapeDiff de `tests/dict.test.ts` le signale comme champ manquant ou
           en trop. */
        id: 'mcp',
        title: 'Clients IA (MCP)',
        items: [
          {
            q: 'Qu’est-ce que l’accès MCP ?',
            a: (
              <>
                <p>
                  Il permet à un client IA — Claude Desktop, Cursor, Claude Code ou tout autre outil
                  qui parle le Model Context Protocol — de prendre des captures via cette extension.
                  Vous le demandez dans la conversation, le client appelle un outil et l’extension
                  capture l’onglet actif.
                </p>
                <p>
                  Rien n’est envoyé. Le client et l’extension communiquent par une socket de boucle
                  locale sur <code>127.0.0.1</code> : l’image passe de votre navigateur au client sur
                  la même machine. Ni compte ni serveur entre les deux.
                </p>
              </>
            ),
          },
          {
            q: 'Comment le configurer ?',
            a: (
              <>
                <p>Deux pièces, et il faut les deux.</p>
                <ul>
                  <li>
                    Activez <strong>Réglages → AI / MCP access</strong> dans l’extension et cochez la
                    case. La carte affiche alors un jeton et un bloc JSON prêt à l’emploi.
                  </li>
                  <li>
                    Votre client MCP l’exécute avec <code>npx -y page-screenshot-mcp</code> ; vous ne
                    l’installez pas à la main. Node <strong>20 ou plus récent</strong> est requis.
                  </li>
                </ul>
                <p>
                  Collez ce JSON dans le bloc <code>mcpServers</code> du fichier de configuration du
                  client, puis redémarrez-le. Le point d’état de la carte passe au vert dès que le
                  pont se connecte.
                </p>
              </>
            ),
          },
          {
            q: 'L’IA répond needs_user_gesture. Que faire ?',
            a: (
              <>
                <p>
                  Chrome exige un vrai clic avant de capturer une page, et un appel lancé par l’IA
                  n’en a pas. Cliquez une fois sur l’icône de la barre d’outils (ou appuyez sur{' '}
                  <code>Alt+Shift+D</code>), puis laissez l’IA réessayer : cela passera.
                </p>
                <p>
                  C’est une règle du navigateur, pas un défaut. La contourner demanderait l’accès à
                  tous les sites que vous visitez, ce que cette extension ne fait délibérément pas.
                </p>
              </>
            ),
          },
          {
            q: 'Quels outils demandent Pro ?',
            a: (
              <>
                <p>
                  <code>psp_status</code> est gratuit : il ne rapporte que l’état de la connexion et
                  de la licence, si bien que l’IA peut toujours vous dire ce qui cloche. Les sept
                  autres demandent Pro.
                </p>
                <ul>
                  <li>
                    <code>capture_visible</code>, <code>capture_full_page</code> et{' '}
                    <code>capture_element</code> : les trois modes de capture.
                  </li>
                  <li>
                    <code>ocr_capture</code> et <code>export_pdf</code> : OCR et PDF sur une capture.
                  </li>
                  <li>
                    <code>history_list</code> et <code>history_get</code> : les captures
                    enregistrées.
                  </li>
                </ul>
                <p>
                  Les captures passent par le circuit habituel de l’extension : le quota quotidien,
                  l’autorisation <code>file://</code>, le dépliage du défilement infini et le
                  préchargement des images différées s’appliquent exactement comme quand vous
                  cliquez.
                </p>
              </>
            ),
          },
        ],
      },
    ],
    stuckTitle: 'Toujours bloqué ?',
    stuckBody:
      'Indiquez l’URL de la page (si elle est publique), votre version de Chrome et l’image obtenue. C’est généralement suffisant pour reproduire le problème.',
    stuckMail: 'Écrire à l’assistance',
    stuckMore: 'Toutes les options de contact',
  },

  support: {
    h1: 'Assistance',
    intro: (
      <>
        Il n’y a ni système de tickets ni robot conversationnel. Chaque message arrive à <a href={mailto(S)}>{S}</a> et une vraie personne y répond, généralement sous deux jours ouvrés.
      </>
    ),
    cards: [
      {
        icon: '✉',
        title: 'Écrivez-nous',
        body: 'Pour tout : un bogue, une question sur une fonction, une licence qui n’est pas revenue après une réinstallation.',
        cta: 'Ouvrir votre messagerie',
        to: mailto(S),
      },
      {
        icon: '🐞',
        title: 'Signaler un bogue',
        body: 'Choisissez une catégorie et racontez ce qui s’est passé ; laissez un e-mail si vous voulez une réponse. L’URL de la page (si elle est publique) et votre version de Chrome suffisent généralement à reproduire le problème.',
        cta: 'Envoyer un avis',
        to: '#feedback',
      },
      {
        icon: '💳',
        title: 'Licence ou remboursement',
        body: 'Écrivez depuis l’adresse utilisée pour le paiement en précisant de quelle commande il s’agit. Les remboursements sont traités par Waffo Pancake, notre marchand de référence.',
        cta: 'Contacter la facturation',
        to: mailto(S, 'Licence ou remboursement — Page Screenshot Pro'),
      },
    ],
    form: {
      title: 'Envoyer un avis',
      sub: 'Directement au développeur : ni système de tickets, ni robot. C’est le même formulaire que dans l’extension.',
      categoryLabel: 'Catégorie',
      categories: {
        bug: 'Bug / quelque chose ne va pas',
        feature: 'Suggestion de fonctionnalité',
        purchase: 'Problème d’achat ou de licence',
        other: 'Autre',
      },
      messageLabel: 'Ce qui s’est passé',
      messagePlaceholder: 'Ce que vous attendiez, ce que vous avez obtenu, et les étapes qui y mènent. Si possible, l’URL de la page et votre version de Chrome.',
      emailLabel: 'Votre e-mail (facultatif)',
      emailHint: 'Laissez vide pour rester anonyme. Renseigné, la réponse part là — c’est aussi le seul moyen de récupérer une licence après une réinstallation.',
      submit: 'Envoyer',
      note: 'Le message ne va qu’au développeur. Rien de la page capturée n’est envoyé.',
    },
    beforeTitle: 'Avant d’écrire',
    beforeSub: 'Deux choses résolvent la plupart des signalements à elles seules.',
    before: [
      {
        title: 'Zones vides dans l’image',
        body: (
          <>
            Le plus souvent des images chargées à la demande qui n’étaient pas encore décodées. Paramètres → Capture → activez <strong>Déclencher et attendre les images différées avant la capture</strong>. C’est plus lent, et c’est pourquoi ce n’est pas le mode unique.
          </>
        ),
      },
      {
        title: (
          <>
            Une page locale en <code>file://</code> ne se capture pas
          </>
        ),
        body: (
          <>
            Chrome la bloque tant que vous ne l’autorisez pas. Ouvrez <code>chrome://extensions</code>, ouvrez les détails de cette extension et activez <strong>Autoriser l’accès aux URL de fichier</strong>. L’extension affiche un lien direct vers cette page quand c’est la cause.
          </>
        ),
      },
    ],
    beforeNote: (
      <>
        D’autres réponses sur la <a href={P('faq')}>page FAQ</a>.
      </>
    ),
    selfTitle: 'Les trois questions qu’on nous écrit le plus',
    selfSub: 'Chacune a une réponse claire, et aucune n’est un bug.',
    self: [
      {
        title: 'La capture est décalée, ou il manque le bas',
        body: (
          <>
            <p>
              Les captures longues sont photographiées écran par écran puis assemblées d’après la position de défilement mesurée. Si la page bouge pendant la capture, les jonctions tombent au mauvais endroit. Deux choses font bouger une page d’elles-mêmes.
            </p>
            <p>
              La première est un fil à défilement infini qui charge encore du contenu : activez <strong>Dérouler les pages à défilement infini avant la capture</strong> dans les paramètres, et il sera épuisé avant la première image plutôt qu’en cours de route. La seconde est un en-tête qui ne passe en <code>position: fixed</code> qu’après défilement : en sortant du flux, il libère la hauteur qu’il occupait et tout ce qui suit remonte d’autant. L’extension mesure ce décalage et corrige chaque fragment, mais la correction est une médiane sur des éléments d’ancrage : une page dont toute la mise en page dépend du défilement peut encore y échapper.
            </p>
            <p>
              Si le résultat reste faux, la <a href={P('faq')}>FAQ</a> détaille les conditions exactes dans lesquelles chaque mode l’emporte ; nous envoyer l’URL avec l’image de sortie suffit généralement à reproduire.
            </p>
          </>
        ),
      },
      {
        title: (
          <>
            Une page locale <code>file://</code> ne se capture pas
          </>
        ),
        body: (
          <>
            <p>
              C’est Chrome, pas l’extension. Une page <code>file://</code> relève d’une autorisation distincte de « lire la page où vous êtes », et Chrome ne la cède pas avant que vous l’accordiez explicitement — à toutes les extensions, pas seulement à celle-ci.
            </p>
            <p>
              Ouvrez <code>chrome://extensions</code>, ouvrez les détails de cette extension et activez <strong>Autoriser l’accès aux URL de fichiers</strong>. L’extension reconnaît précisément cet état et affiche un lien direct vers cette page.
            </p>
            <p>
              Attention : c’est une autorisation, pas un interrupteur dans l’extension. Aucun réglage du panneau ne peut l’accorder à la place de Chrome. La <a href={P('faq')}>FAQ</a> liste les autres cas qui demandent une autorisation plutôt qu’un interrupteur.
            </p>
          </>
        ),
      },
      {
        title: 'J’ai acheté Pro, mais un autre ordinateur affiche la version gratuite',
        body: (
          <>
            <p>
              Une licence est rattachée au profil de navigateur qui a payé : un nouvel ordinateur, un profil neuf ou un profil réinitialisé repartent donc en version gratuite. Rien n’est perdu : ouvrez le panneau et utilisez <strong>Restaurer l’achat</strong> avec l’adresse e-mail qui a servi au paiement.
            </p>
            <p>
              Cette adresse est la seule accréditation — il n’y a ni mot de passe ni page de compte — alors gardez-la dans un endroit encore accessible après une réinstallation. La restauration prend effet immédiatement et ne facture rien de plus.
            </p>
            <p>
              Si cette adresse ne vous est plus accessible, écrivez depuis n’importe quelle adresse à <a href={mailto(S)}>{S}</a> en indiquant le numéro de commande du reçu ; cela suffit à retrouver l’achat. Le reste des questions de licence se trouve sur la <a href={P('pricing')}>page des tarifs</a>.
            </p>
          </>
        ),
      },
    ],
    reportTitle: 'Signaler un problème de capture',
    reportP1: (
      <>
        Le formulaire ci-dessus est la voie la plus rapide : vous choisissez une catégorie, racontez ce qui s’est passé, ajoutez un e-mail si vous voulez une réponse, et le message arrive directement au développeur. Si l’extension est installée, le même formulaire s’ouvre aussi en son sein : fenêtre de l’extension → <strong>Envoyer un avis</strong>, ou le bouton de la page Paramètres. Dans les deux cas, seul ce que vous écrivez est envoyé : indiquez donc vous-même la version de l’extension et la page où vous étiez.
      </>
    ),
    reportP2: 'Formulaire ou e-mail, ces quatre détails évitent un aller-retour :',
    reportList: [
      'L’URL de la page, si elle est publique.',
      <>
        Votre version de Chrome (depuis <code>chrome://version</code>).
      </>,
      'Où l’image obtenue est fautive — le formulaire n’accepte pas de pièce jointe, décrivez-le (ou envoyez-nous l’image par e-mail).',
      'Si la page utilise son propre conteneur de défilement, comme un éditeur de document ou un panneau de tableau de bord.',
    ],
    privacyTitle: 'Questions de confidentialité',
    privacyBody: (
      <>
        Pour les demandes de données, les suppressions ou tout ce que couvre la politique de confidentialité, écrivez à <a href={mailto(PRIVACY_EMAIL)}>{PRIVACY_EMAIL}</a> — une adresse distincte de l’assistance, pour que ces demandes ne se mélangent pas aux signalements de bogues. La politique elle-même est à <a href={P('privacy')}>/privacy/</a>.
      </>
    ),
  },

  privacy: {
    h1: 'Politique de confidentialité',
    effective: 'Date d’entrée en vigueur : 2 novembre 2026',
    intro: (
      <>
        Page Screenshot Pro (« l’extension ») capture des pages entières, les annote, exporte des PDF et exécute un OCR sur l’appareil. Cette politique explique ce que l’extension et son serveur de licences traitent — en bref : <strong>vos captures ne quittent jamais votre appareil</strong>.
      </>
    ),
    sections: [
      {
        title: '1. Ce qui reste sur votre appareil',
        body: (
          <ul>
            <li>
              <strong>Captures et copies d’écran.</strong> Tout ce que vous capturez est traité et stocké localement dans votre navigateur (stockage du navigateur / IndexedDB). Les images capturées ne nous sont jamais envoyées, ni à un tiers.
            </li>
            <li>
              <strong>OCR.</strong> La reconnaissance de texte s’exécute entièrement hors ligne, avec un moteur d’OCR embarqué (Tesseract.js) dans votre navigateur. Les images utilisées pour l’OCR ne quittent jamais votre appareil.
            </li>
            <li>
              <strong>Éditeur et presse-papiers.</strong> Les annotations se font localement. Le presse-papiers n’est écrit que lorsque vous cliquez explicitement sur une action de copie.
            </li>
            <li>
              <strong>Accès MCP (Pro, désactivé par défaut).</strong> Lorsque vous l’activez, l’extension se comporte en client et se connecte à un processus pont que vous lancez vous-même sur <code>127.0.0.1</code>, sur votre propre machine, afin qu’un client d’IA comme Claude Desktop ou Cursor puisse piloter des captures. Cette connexion ne quitte jamais votre machine : elle ne passe ni par nous ni par un tiers, et ne sort pas de votre réseau local. Les données de capture ne circulent qu’entre deux processus de votre ordinateur. Tant que vous n’activez pas ce commutateur, la connexion n’est pas établie.
            </li>
          </ul>
        ),
      },
      {
        title: '2. Ce que nous stockons pour gérer votre licence',
        body: (
          <ul>
            <li>
              <strong>Identifiant d’installation.</strong> Au premier lancement, l’extension génère un identifiant aléatoire (UUID). Il est stocké dans votre navigateur (<code>chrome.storage.sync</code>, qui se synchronise entre vos appareils sous votre propre compte Google, avec un repli local). Il ne sert que de clé à votre licence Pro — il ne contient aucune information personnelle.
            </li>
            <li>
              <strong>État de la licence.</strong> Le fait que Pro soit débloqué et l’offre achetée sont stockés localement dans votre navigateur.
            </li>
          </ul>
        ),
      },
      {
        title: '3. Paiements',
        body: (
          <>
            <p>
              Les paiements sont traités par <strong>Waffo</strong>, notre marchand de référence. Le paiement ouvre la page de paiement hébergée par Waffo dans votre navigateur — vos données de carte vont directement à Waffo et ne touchent jamais l’extension ni nos serveurs. Voir <a href="https://waffo.ai" rel="noopener">waffo.ai</a> pour la politique de confidentialité de Waffo.
            </p>
            <p>
              Après un paiement réussi, Waffo notifie notre serveur de licences, qui enregistre : l’offre achetée, son statut et sa période, votre identifiant d’installation et — uniquement pour permettre « restaurer l’achat » — l’adresse e-mail utilisée pour le paiement, associée à cet identifiant. Aucun contenu de capture, aucun historique de navigation et aucun contenu de page n’est jamais envoyé au serveur de licences.
            </p>
          </>
        ),
      },
      {
        title: '4. Restaurer l’achat',
        body: (
          <p>
            Si vous réinstallez l’extension ou passez à un nouvel ordinateur, vous pouvez restaurer Pro en saisissant l’e-mail utilisé pour le paiement. Le serveur consulte la correspondance e-mail → identifiant d’installation et relie votre nouvel identifiant à la licence d’origine. Les demandes de restauration sont limitées en débit ; le serveur ne révèle jamais si une adresse e-mail a un achat.
          </p>
        ),
      },
      {
        title: '5. Autorisations — pourquoi l’extension les demande',
        body: (
          <ul>
            <li>
              <code>activeTab</code> / <code>scripting</code> — pour capturer l’onglet que vous demandez ; les scripts de contenu ne sont injectés qu’à la demande.
            </li>
            <li>
              Accès à l’hôte <code>file:///</code> — uniquement pour les captures de fichiers locaux, et seulement si vous activez « Autoriser l’accès aux URL de fichier » dans Chrome.
            </li>
            <li>
              <code>downloads</code> — pour enregistrer les images et les PDF que vous exportez.
            </li>
            <li>
              <code>storage</code> / <code>unlimitedStorage</code> — pour les paramètres, l’état de la licence et l’historique des captures.
            </li>
            <li>
              <code>clipboardWrite</code> — uniquement lorsque vous utilisez une action de copie.
            </li>
            <li>
              <code>contextMenus</code> — les entrées du menu contextuel.
            </li>
            <li>
              <code>notifications</code> — alertes d’erreur locales uniquement (par exemple, un échec de capture).
            </li>
            <li>
              <code>tabs</code> — pour remarquer le retour de l’onglet de paiement, afin qu’un paiement terminé débloque Pro.
            </li>
            <li>
              <code>offscreen</code> — pour assembler les images dans un document invisible au lieu d’ouvrir un onglet.
            </li>
            <li>
              <code>identity</code> / <code>identity.email</code> — pour préremplir le champ e-mail de la page de paiement. L’adresse est lue depuis votre compte Chrome et, une fois que vous en avez saisi une, mémorisée dans le stockage local de ce navigateur pour préremplir le paiement suivant. Elle n’est jamais envoyée à notre serveur de licences en dehors d’un achat que vous lancez ou de retours que vous envoyez.
            </li>
          </ul>
        ),
      },
      {
        title: '6. Ce que nous ne faisons PAS',
        body: (
          <ul>
            <li>Aucune mesure d’audience, aucune télémétrie, aucun SDK publicitaire.</li>
            <li>Nous ne vendons, ne louons ni ne partageons vos données avec des tiers à des fins marketing.</li>
            <li>
              L’extension n’émet aucune requête réseau d’elle-même, hormis les vérifications de licence vers notre serveur de licences (identifiant d’installation seulement), l’ouverture du paiement hébergé par Waffo, les retours que vous envoyez et la connexion MCP locale que vous activez vous-même.
            </li>
          </ul>
        ),
      },
      {
        title: '7. Conservation et suppression des données',
        body: (
          <p>
            Les enregistrements de licence sont conservés tant que votre achat ou abonnement est actif (et selon les obligations fiscales et comptables de notre prestataire de paiement). Désinstaller l’extension supprime toutes les données stockées localement — captures, paramètres et identifiant d’installation. Pour supprimer votre enregistrement côté serveur de licences, contactez-nous à l’adresse ci-dessous. Ce qu’une licence couvre et le fonctionnement des remboursements relèvent des <a href={P('terms')}>conditions d’utilisation</a>, pas de cette politique.
          </p>
        ),
      },
      {
        title: '8. Modifications',
        body: (
          <p>
            Si cette politique change de façon substantielle, nous mettrons à jour la date d’entrée en vigueur ci-dessus et signalerons le changement dans les notes de version de l’extension.
          </p>
        ),
      },
      {
        title: '9. Contact',
        body: (
          <p>
            Questions sur cette politique : <a href={mailto(PRIVACY_EMAIL)}>{PRIVACY_EMAIL}</a> — une adresse distincte du support ordinaire, pour que les demandes de données ne se mélangent pas aux rapports de bugs. Tout ce qui ne concerne pas la vie privée va sur la <a href={P('support')}>page d’assistance</a>.
          </p>
        ),
      },
    ],
  },

  terms: {
    h1: 'Conditions d’utilisation',
    effective: 'Date d’entrée en vigueur : 29 octobre 2026',
    intro:
      'Ces conditions encadrent votre utilisation de l’extension de navigateur Page Screenshot Pro et du serveur de licences qui la sous-tend. En installant ou en utilisant l’extension, vous les acceptez. Sinon, désinstallez-la — cela supprime tout ce qu’elle a stocké localement.',
    sections: [
      {
        title: '1. Étendue de la licence',
        body: (
          <>
            <p>
              Nous vous concédons une licence personnelle, non exclusive et non transférable pour installer et utiliser l’extension sur les profils de navigateur que vous contrôlez. Les fonctions Pro sont concédées par profil de navigateur, et non par personne ; déplacer une licence entre profils se fait avec <strong>Restaurer l’achat</strong>, et non en la partageant. Une licence peut être active sur cinq profils de navigateur à la fois au maximum, profil d’achat compris ; une restauration sur un sixième écarte le profil le moins récemment utilisé.
            </p>
            <p>
              Vous ne pouvez pas revendre, sous-licencier, louer ou redistribuer l’extension, ni l’intégrer à un autre produit, sans autorisation écrite.
            </p>
          </>
        ),
      },
      {
        title: '2. L’offre gratuite',
        body: (
          <>
            <p>
              L’offre gratuite comprend la capture pleine page, de la zone visible et d’une région, le dépliage du défilement infini, la gestion des images différées, l’éditeur d’annotations complet et la sortie PNG/JPG, plafonnés à <strong>20 captures par jour calendaire</strong>. Le plafond, la répartition des fonctions et les fonctions incluses peuvent changer dans une version future ; le cas échéant, nous le dirons dans les notes de version plutôt que de les modifier en silence.
            </p>
            <p>
              Pro retire le plafond quotidien et ajoute la capture d’élément, l’export PDF, la fusion PDF, l’OCR et l’accès MCP. Une capture qui échoue ou que vous annulez ne compte pas dans la limite quotidienne.
            </p>
          </>
        ),
      },
      {
        title: '3. Achats, renouvellements et remboursements',
        body: (
          <>
            <p>
              Les offres payantes sont vendues et traitées par <strong>Waffo</strong> en tant que marchand de référence. Les conditions de Waffo s’appliquent à la transaction de paiement elle-même ; les présentes conditions régissent la licence que le paiement achète.
            </p>
            <ul>
              <li>
                <strong>Les abonnements</strong> se renouvellent automatiquement jusqu’à résiliation. Vous pouvez résilier à tout moment depuis la page Paramètres de l’extension — sans e-mail, sans portail.
              </li>
              <li>
                <strong>Résilier</strong> arrête le renouvellement ; Pro continue de fonctionner jusqu’à la fin de la période déjà payée.
              </li>
              <li>
                <strong>Changer d’offre</strong> se fait en résiliant puis en se réabonnant : un abonnement en cours ne peut pas changer d’offre sur place. Le temps déjà payé s’ajoute à la période de la nouvelle offre, donc un changement ne vous coûte jamais les jours achetés.
              </li>
              <li>
                <strong>La licence à vie</strong> est un paiement unique sans renouvellement. Elle n’est pas affectée par le renouvellement, la résiliation ou l’expiration d’un abonnement sur le même profil.
              </li>
              <li>
                <strong>Les remboursements</strong> sont possibles sur demande — écrivez à <a href={mailto(S)}>{S}</a> depuis l’adresse utilisée pour le paiement. Un remboursement met fin à la licence qu’il a payée.
              </li>
            </ul>
            <p>
              Les prix sont affichés en dollars américains et peuvent changer. Un changement de prix ne s’applique jamais rétroactivement à une période déjà payée.
            </p>
          </>
        ),
      },
      {
        title: '4. Vos responsabilités',
        body: (
          <>
            <p>
              L’extension capture ce qui est à l’écran. Cela signifie que le contenu de votre capture est de votre responsabilité, notamment :
            </p>
            <ul>
              <li>
                <strong>Le droit d’auteur et les autres droits.</strong> Capturer une page n’est pas une licence pour la republier. Si vous partagez ou publiez une capture, assurez-vous d’en avoir le droit.
              </li>
              <li>
                <strong>Les informations confidentielles et personnelles.</strong> Une capture peut contenir des noms, des adresses, des numéros de compte ou des messages privés. Les outils mosaïque et recadrage de l’éditeur d’annotations existent exactement pour cela ; utilisez-les avant de partager.
              </li>
              <li>
                <strong>Les conditions des sites que vous capturez.</strong> Certains services interdisent la capture automatisée ou scriptée de leurs pages. Cela relève de votre relation avec eux.
              </li>
            </ul>
          </>
        ),
      },
      {
        title: '5. Usage acceptable',
        body: (
          <p>
            Vous ne pouvez pas utiliser l’extension pour capturer un contenu auquel vous n’avez pas légalement accès, pour contourner un paywall ou un contrôle d’accès, ni d’une manière qui enfreint la loi applicable. Nous pouvons suspendre une licence obtenue par fraude ou par un paiement annulé.
          </p>
        ),
      },
      {
        title: '6. Ce que l’extension ne promet pas',
        body: (
          <>
            <p>
              Une capture est la photographie d’un rendu, et certaines pages y sont hostiles. En particulier :
            </p>
            <ul>
              <li>
                <strong>Le contenu derrière une connexion, un clic ou un mur de consentement</strong> n’est pas capturé, parce que l’extension photographie ce que la page rend réellement.
              </li>
              <li>
                <strong>Les pages à conteneur de défilement inhabituel</strong> — éditeurs de documents, tableaux de bord à volets internes — sont traitées de façon heuristique. L’extension mesure le conteneur de défilement et corrige le contenu qui se décale, mais une page peut toujours être construite d’une manière qu’elle lit mal.
              </li>
              <li>
                <strong>Les fils très longs</strong> sont plafonnés à 40 écrans par capture. Le texte de progression indique quand le plafond a été atteint.
              </li>
              <li>
                <strong>Les raccords horizontaux</strong> sur une page à la fois très large et continue peuvent apparaître comme une arête nette. C’est une limite documentée, pas un défaut que nous cachons.
              </li>
              <li>
                <strong>La précision de l’OCR</strong> dépend de l’image. Un texte d’environ 6 pixels de haut ou moins ne sera pas reconnu de façon fiable.
              </li>
            </ul>
          </>
        ),
      },
      {
        title: '7. Disponibilité et modifications',
        body: (
          <>
            <p>
              L’extension s’exécute localement et n’a besoin d’aucun serveur, donc une panne de serveur ne vous empêche pas de capturer. Le serveur de licences sert aux achats, à la restauration d’un achat et à la vérification du statut d’abonnement ; s’il est injoignable, une licence locale existante continue de fonctionner.
            </p>
            <p>
              Nous pouvons mettre à jour, modifier ou arrêter des fonctions. Si nous arrêtons une fonction que vous avez payée, nous proposerons un dédommagement proportionné à ce qu’il reste de votre période payée.
            </p>
          </>
        ),
      },
      {
        title: '8. Exclusion de garantie',
        body: (
          <p>
            L’extension est fournie « en l’état », sans garantie d’aucune sorte, expresse ou implicite, y compris l’adéquation à un usage particulier. C’est un outil, pas une garantie : vérifiez qu’une capture est complète avant de vous y fier pour quoi que ce soit d’important.
          </p>
        ),
      },
      {
        title: '9. Limitation de responsabilité',
        body: (
          <>
            <p>
              Dans la mesure permise par la loi, notre responsabilité totale découlant de l’extension ou s’y rapportant est limitée au montant que vous avez payé pour elle dans les douze mois précédant la réclamation. Nous ne sommes pas responsables des pertes indirectes ou consécutives — y compris la perte de données, la perte de bénéfices, ou une capture qui n’a pas photographié quelque chose dont vous aviez besoin.
            </p>
            <p>Rien dans ces conditions n’exclut une responsabilité qui ne peut être exclue par la loi.</p>
          </>
        ),
      },
      {
        title: '10. Confidentialité',
        body: (
          <p>
            Ce que l’extension stocke et ce qu’elle n’envoie jamais est décrit dans la <a href={P('privacy')}>politique de confidentialité</a>, qui fait partie de ces conditions.
          </p>
        ),
      },
      {
        title: '11. Résiliation',
        body: (
          <p>
            Vous pouvez arrêter à tout moment en désinstallant l’extension. Nous pouvons résilier une licence en cas de manquement substantiel aux sections 4 ou 5. En cas de résiliation, les sections 8, 9 et 12 survivent.
          </p>
        ),
      },
      {
        title: '12. Droit applicable et contact',
        body: (
          <p>
            Ces conditions sont régies par le droit applicable au siège d’activité du marchand de référence, sans égard aux règles de conflit de lois. Questions sur ces conditions : <a href={mailto(S)}>{S}</a>. Pour tout ce qui concerne l’extension plutôt que ces conditions, la <a href={P('support')}>page d’assistance</a> répond plus vite.
          </p>
        ),
      },
    ],
  },

  notFound: {
    title: 'Page introuvable',
    body: 'Cette page n’existe pas. Elle a peut-être été déplacée, ou le lien contient une faute de frappe.',
    cta: 'Retour à la page d’accueil',
  },
};

export default fr;
