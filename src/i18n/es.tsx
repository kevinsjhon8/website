import { FREE_AMOUNT, PRICE_AMOUNT, YEARLY_PER_MONTH } from '../content/prices';
import { CHROME_STORE_URL, PRIVACY_EMAIL, SUPPORT_EMAIL, mailto } from '../content/site';
import type { Dict } from './dict';
import { pathFor } from './paths';

/* 西班牙语文案。
 *
 * 键集、数组长度、嵌套层级都必须与 en.tsx 逐项一致：每份字典都标注成
 * Dict，漏一个字段是编译错误，但 TypeScript 数不了数组长度 ——
 * en 的 FAQ 有 18 条、西语只写 17 条照样编译通过，页面上少一题而没有任何
 * 检查会红。tests/dict.test.ts 递归比对形状就是补这一刀。
 *
 * 站内链接一律走 pathFor('es', …)（也就是下面的 P()），不写字面量
 * `/es/pricing/`。从 en.tsx 复制一段句子过来时若忘了改前缀，链接会把人
 * 留在英文站；用同一个函数拼就没有这个机会。
 *
 * 正文里带 `.tsx` 后缀，是因为有 <strong>/<code>/<a> 这些行内标签。
 * 价格数字来自 content/prices.ts，绝不在这里写死。
 *
 * **西班牙语句子不要在源码里折行。** JSX 会把「换行 + 缩进」折成一个空格，
 * 于是「cabecera fija\ncapturada una vez」会渲染成「cabecera fija capturada
 * una vez」——英文看着没问题，西语里就是句子中间多了一个空格。所以下面每个
 * 西语文本段都写在**一行**里（行可以很长），只在标签外换行。
 *
 * 代码与占位符照抄英文：`file://`、`chrome://extensions`、`img.decode()`、
 * `{title}` 这类模板变量、`psp_pro=success` 都是字面量，不翻译。 */

const S = SUPPORT_EMAIL;
const P = (page: Parameters<typeof pathFor>[1]) => pathFor('es', page);

const es: Dict = {
  meta: {
    '': {
      title: 'Page Screenshot Pro — capturas de página completa alineadas',
      description:
        'Capturas de pantalla de página completa en Chrome: scroll infinito, imágenes diferidas, tablas anchas y cabeceras fijas en una imagen. Anotaciones, PDF y OCR.',
      ogDescription: 'Captura una página entera en una sola imagen. Anotaciones, exportación a PDF y OCR. Todo se ejecuta en tu dispositivo.',
    },
    pricing: {
      title: 'Precios — gratis y planes Pro · Page Screenshot Pro',
      description: `Gratis: 20 capturas/día y el editor de anotaciones. Pro añade captura de elementos, PDF y fusión, OCR y acceso MCP: ${PRICE_AMOUNT.monthly} al mes, ${PRICE_AMOUNT.yearly} al año o ${PRICE_AMOUNT.lifetime} una vez.`,
      ogDescription: 'Gratis con 20 capturas al día y todo el editor de anotaciones. Pro añade captura de elementos, exportación y combinación de PDF, OCR y acceso MCP.',
    },
    faq: {
      title: 'Preguntas frecuentes — páginas largas · Page Screenshot Pro',
      description:
        'Páginas largas, scroll infinito, imágenes diferidas, archivos locales file://, privacidad, licencias, restaurar compras y capturas por MCP.',
      ogDescription:
        'Respuestas sobre páginas largas, scroll infinito, archivos locales, privacidad, licencias y acceso MCP.',
    },
    support: {
      title: 'Soporte — errores y reembolsos · Page Screenshot Pro',
      description:
        'Soporte por correo para Page Screenshot Pro: errores, problemas de captura, licencias y reembolsos. Una persona real responde en unos dos días laborables.',
      ogDescription: 'Informes de errores, problemas de captura, dudas sobre licencias y reembolsos.',
    },
    privacy: {
      title: 'Política de privacidad — datos locales · Page Screenshot Pro',
      description:
        'Qué guarda Page Screenshot Pro y qué no envía: capturas, anotaciones y OCR se quedan en tu dispositivo. Solo se piden licencia, pago de Waffo y tus comentarios.',
      ogDescription: 'Las capturas, las anotaciones y el OCR se quedan en tu dispositivo. Las únicas peticiones de red son la comprobación opcional de licencia, la apertura de la página de pago alojada por Waffo cuando compras y los comentarios que decidas enviar. El acceso MCP local, vía 127.0.0.1, nunca sale de tu equipo.',
    },
    terms: {
      title: 'Términos del servicio — licencias · Page Screenshot Pro',
      description:
        'Términos de uso de la extensión Page Screenshot Pro y su servidor de licencias: alcance, plan gratuito, compras y reembolsos, uso aceptable y limitaciones.',
      ogDescription: 'Alcance de la licencia, el plan gratuito, compras y reembolsos, y limitaciones.',
    },
  },
  notFoundMeta: {
    title: 'Página no encontrada — Page Screenshot Pro',
    description: 'Esa página no existe. Vuelve a la página de inicio.',
  },

  nav: {
    features: 'Funciones',
    pricing: 'Precios',
    faq: 'Preguntas',
    support: 'Soporte',
    cta: 'Instalar',
    langLabel: 'Idioma',
    ariaLabel: 'Principal',
  },

  footer: {
    tagline: 'Capturas largas, anotaciones, PDF y OCR: todo se procesa dentro de tu navegador.',
    colProduct: 'Producto',
    colSupport: 'Soporte',
    colLegal: 'Legal',
    help: 'Ayuda y contacto',
    privacy: 'Política de privacidad',
    terms: 'Términos del servicio',
    copyright: '© 2026 Page Screenshot Pro',
    stayLocal: 'Las capturas se quedan en tu dispositivo.',
    ariaLabel: 'Pie de página',
  },

  home: {
    eyebrowStrong: 'Se ejecuta por completo en tu dispositivo',
    eyebrowRest: 'Chrome 116+ ·',
    heroTitleLead: 'Capturas de página completa',
    heroTitleAccent: 'que de verdad encajan',
    lead: (
      <>
        Page Screenshot Pro es una extensión de Chrome para capturas de pantalla: toma una página entera en una sola imagen, con feeds de scroll infinito, imágenes de carga diferida, tablas anchas y navegación fija incluidos. <strong>No se sube nada.</strong> Sin cuenta, sin servidor para tus imágenes, sin colas.
      </>
    ),
    ctaPrimary: 'Añadir a Chrome',
    ctaGhost: 'Ver planes',
    trust: ['Plan gratuito, sin tarjeta', 'Funciona sin conexión', 'Anotaciones gratis', '8 idiomas de interfaz'],
    shotUrl: 'example.com/a-really-long-article',
    shotSticky: 'cabecera fija — capturada una vez',
    shotSeam: 'costura corregida ±16 px',

    figures: {
      stitch: {
        alt: 'Esquema: una página larga capturada en seis fragmentos de tres filas por dos columnas, con líneas discontinuas que marcan las costuras horizontales y verticales y una flecha que indica que la captura baja por una columna antes de pasar a la siguiente.',
        caption:
          'La página se fotografía pantalla a pantalla y luego las piezas se empalman; las líneas discontinuas son donde se encuentran dos capturas.',
      },
      editor: {
        alt: 'Esquema: una captura dentro del editor de anotaciones, con una barra de nueve herramientas arriba y un rectángulo, una elipse, una flecha, un trazo a mano alzada y un bloque de mosaico dibujados encima.',
        caption:
          'Nueve herramientas, todas gratis: rectángulo, elipse, flecha, lápiz, resaltado, texto, mosaico, recorte y selección.',
      },
      local: {
        alt: 'Esquema: una ventana de navegador a la izquierda y un disco local a la derecha, unidos por un escudo con candado en el centro; una nube por encima está tachada.',
        caption:
          'Capturar, editar y exportar ocurren en tu equipo. Sin nube, sin subidas y sin cuenta.',
      },
    },

    featuresTitle: 'Lo que hace bien',
    featuresSub:
      'En esto se distingue de una extensión de capturas de pantalla genérica: son las piezas que hacen legible una captura de página completa en lugar de un montón de cabeceras repetidas e imágenes a medio dibujar. Una captura de pantalla es fácil; una que se pueda leer, no.',
    features: [
      {
        icon: '↕',
        title: 'Páginas con scroll infinito',
        body: (
          <>
            Carga el feed entero antes de capturar, en lugar de detenerse en la primera pantalla. Una captura con desplazamiento de un feed sin fin se toma completa, no solo la primera pantalla. Los feeds largos se limitan a 40 pantallas, y la extensión te avisa cuando ha tenido que recortar.
          </>
        ),
      },
      {
        icon: '🖼',
        title: 'Imágenes de carga diferida',
        body: (
          <>
            Se desplaza por delante y espera a <code>img.decode()</code>, así que cada mapa de bits está realmente pintado y no es un marcador gris.
          </>
        ),
      },
      {
        icon: '↔',
        title: 'Páginas más anchas que la ventana',
        body: (
          <>
            Las tablas anchas, los tableros kanban y los diagramas se capturan como una cuadrícula y se vuelven a montar sin perder el borde derecho.
          </>
        ),
      },
      {
        icon: '🧩',
        title: 'Cosiendo como una sola página',
        body: (
          <>
            La navegación se queda en la primera pantalla y los elementos fijos o sticky se ocultan en las siguientes, incluso dentro de componentes web; además, las pantallas adyacentes se comparan y se alinean con un margen de ±16 px. Nada se repite y nada salta.
          </>
        ),
      },
      {
        icon: '🤖',
        title: 'Capturas para clientes de IA',
        body: (
          <>
            Claude Desktop, Cursor y otros clientes MCP pueden pedir a la extensión que capture el área visible, un solo elemento o una página completa, y leer el texto con OCR. El puente se ejecuta en <code>127.0.0.1</code>, en su propio ordenador.
          </>
        ),
      },
      {
        icon: '🔒',
        title: 'Procesado en tu dispositivo',
        body: (
          <>
            Las capturas, las anotaciones y el OCR no salen nunca del navegador. La extensión solo se conecta a la red por tres motivos: la comprobación opcional de licencia, abrir la página de pago alojada por Waffo y los comentarios que tú envíes. El acceso MCP es una cuarta vía, pero nunca sale de tu equipo — consulta la política de privacidad.
          </>
        ),
      },
    ],

    aboutTitle: 'Acerca de Page Screenshot Pro',
    aboutP1: (
      <>
        Page Screenshot Pro es una extensión de Chrome para capturar páginas que el navegador no captura por sí solo. Desplaza la página, fotografía cada pantalla y une las piezas en una sola imagen, corrigiendo los dos problemas que hacen que una unión improvisada parezca rota: la interfaz fija que se repite a lo largo de la página y el contenido que se desplaza cuando esa interfaz sale del flujo.
      </>
    ),
    aboutP2: (
      <>
        Todo lo que viene después de la captura también está aquí: un editor de anotaciones con nueve herramientas (rectángulo, elipse, flecha, lápiz, resaltado, texto, mosaico, recorte y selección), exportación a PDF y OCR para chino e inglés. Las páginas locales <code>file://</code> también funcionan, en cuanto marcas «Permitir el acceso a URL de archivos».
      </>
    ),

    compareTitle: 'Gratis y Pro',
    compareSub:
      'Todo el editor de anotaciones es gratis. Pro va de volumen y añade captura de elementos, exportación y combinación de PDF, OCR y acceso MCP.',
    compareHead: ['Capacidad', 'Gratis', 'Pro'],
    compareRows: [
      { label: 'Captura de página completa con unión automática de los fragmentos', free: 'yes', pro: 'yes' },
      { label: 'Captura del área visible', free: 'yes', pro: 'yes' },
      { label: 'Región seleccionada arrastrando', free: 'yes', pro: 'yes' },
      { label: 'Expansión del scroll infinito', free: 'yes', pro: 'yes' },
      { label: 'Precarga de imágenes de carga diferida', free: 'yes', pro: 'yes' },
      { label: 'Editor de anotaciones, las nueve herramientas', free: 'yes', pro: 'yes' },
      { label: 'Salida PNG y JPG, plantillas de nombre y subcarpetas', free: 'yes', pro: 'yes' },
      { label: 'Capturas al día', free: { text: '20' }, pro: { text: 'Ilimitadas' } },
      { label: 'Capturar un solo elemento con un clic', free: 'no', pro: 'yes' },
      { label: 'Exportación a PDF', free: 'no', pro: 'yes' },
      { label: 'Combinar varias capturas en un solo PDF', free: 'no', pro: 'yes' },
      { label: 'OCR: extraer texto, chino e inglés', free: 'no', pro: 'yes' },
      { label: 'Acceso MCP: que clientes de IA capturen', free: 'no', pro: 'yes' },
    ],
    compareNote: (
      <>
        Los precios y lo que incluye cada plan están en la <a href={P('pricing')}>página de precios</a>.
      </>
    ),

    whyTitle: '¿Por qué no usar la captura que ya trae el navegador?',
    whyP1: (
      <>
        Chrome DevTools puede hacer una captura de página completa, y para un artículo corriente sirve. Pero no expande feeds con scroll infinito, no espera a las imágenes de carga diferida y repite la navegación fija a lo largo de toda la imagen, que es justo el aspecto que tienen un feed o un cuadro de mando.
      </>
    ),
    whyP2: (
      <>
        Tampoco permite anotar, ni exportar a PDF, ni extraer texto de una imagen. Eso es lo que añade esta extensión, y la parte de anotaciones es gratis. Ese conjunto es lo que distingue una extensión de capturas de pantalla de un atajo de teclado.
      </>
    ),

    howTitle: 'Tres pasos',
    howSteps: [
      {
        title: 'Abre una página larga',
        body: 'Sirven artículos, feeds y notas de versión. En las páginas largas es donde se nota la diferencia.',
      },
      {
        title: 'Pulsa el icono de la barra de herramientas, o Alt+Shift+D',
        body: 'Alt+Shift+V captura solo el área visible. Los dos atajos se pueden reasignar en la página de atajos de teclado de Chrome.',
      },
      {
        title: 'El archivo acaba en Descargas',
        body: (
          <>
            Con el nombre de tu plantilla: por defecto <code>{'{title} - {date} {time}.png'}</code>. El editor se abre si se lo has pedido.
          </>
        ),
      },
    ],

    whoTitle: 'Para quién es',
    who: [
      {
        title: 'Informes de errores y QA',
        body: 'Reúne en una sola imagen todo el diseño roto, y luego rodea el defecto y tapa con mosaico el nombre de la cuenta.',
      },
      {
        title: 'Documentación y tutoriales',
        body: 'Guías largas paso a paso con flechas y resaltados numerados, exportadas como un PNG o un PDF.',
      },
      {
        title: 'Revisión de diseño y contenido',
        body: 'Los tableros y las tablas anchas vuelven intactos, así que un comentario de revisión puede señalar un píxel en lugar de describirlo.',
      },
      {
        title: 'Investigación y archivo',
        body: 'Guarda una copia legible de una página antes de que cambie. Con el OCR, el texto que hay dentro de la imagen vuelve a poder buscarse.',
      },
    ],

    installTitle: 'Consigue Page Screenshot Pro',
    installSub: 'Chrome 116 o posterior, en Windows, macOS o Linux.',
    installBody: (
      <>
        Page Screenshot Pro ya está en Chrome Web Store. Instálala desde su ficha y Chrome la
        mantendrá actualizada: sin descargas manuales y sin instalación local.
      </>
    ),
    installStore: 'Añadir a Chrome',
    installMore: 'Otras formas de conseguirlo',

    plansTitle: 'Planes',
    plansSub:
      'Gratis para siempre. Pro si necesitas volumen, captura de elementos, exportación y combinación de PDF, OCR o acceso MCP. Facturado en dólares estadounidenses por Waffo Pancake, nuestro comerciante responsable.',
    plans: [
      {
        tag: 'Gratis',
        name: 'Captura del día a día',
        amount: FREE_AMOUNT,
        period: 'para siempre',
        bullets: [
          'Captura de página completa, área visible y región',
          'Gestión del scroll infinito y de la carga diferida',
          'Todo el editor de anotaciones',
          'Salida en PNG y JPG',
          'Hasta 20 capturas al día',
        ],
        cta: { label: 'Añadir a Chrome', to: CHROME_STORE_URL },
      },
      {
        tag: 'Pro mensual',
        name: 'Proyectos cortos',
        amount: PRICE_AMOUNT.monthly,
        period: '/ mes',
        bullets: [
          'Todo lo de Gratis, sin límite',
          'Captura de elementos',
          'Exportación a PDF y combinación de PDF',
          'OCR, chino e inglés',
          'Acceso MCP para clientes de IA',
          'Cancela cuando quieras',
        ],
        cta: { label: 'Comparar planes', to: 'pricing' },
      },
      {
        tag: 'Pro anual · El más popular',
        name: 'Todo el año',
        amount: PRICE_AMOUNT.yearly,
        period: '/ año',
        featured: true,
        bullets: [
          'Todo lo de Gratis, sin límite',
          'Captura de elementos',
          'Exportación a PDF y combinación de PDF',
          'OCR, chino e inglés',
          'Acceso MCP para clientes de IA',
          `Sale a unos ${YEARLY_PER_MONTH} al mes`,
        ],
        cta: { label: 'Ver cómo comprar', to: 'pricing', primary: true },
      },
      {
        tag: 'Pro de por vida',
        name: 'Paga una vez',
        amount: PRICE_AMOUNT.lifetime,
        period: 'una sola vez',
        bullets: [
          'Todo lo de Gratis, sin límite',
          'Captura de elementos',
          'Exportación a PDF y combinación de PDF',
          'OCR, chino e inglés',
          'Acceso MCP para clientes de IA',
          'Sin renovaciones, nunca',
        ],
        cta: { label: 'Comparar planes', to: 'pricing' },
      },
    ],
    plansNote: (
      <>
        Pro queda vinculado al perfil de navegador en el que se compró. ¿Has cambiado de equipo o lo has reinstalado? Restáuralo con el correo con el que pagaste, desde la propia extensión y sin abrir ningún ticket de soporte. Una licencia se mantiene activa en hasta cinco perfiles a la vez.
      </>
    ),

    faqTitle: 'Preguntas',
    faqSub: (
      <>
        Las cinco más habituales. El resto están en la <a href={P('faq')}>página de preguntas frecuentes</a>.
      </>
    ),
    faq: [
      {
        q: '¿Mis capturas se suben a algún sitio?',
        a: (
          <>
            <p>
              No. La captura, la unión de fragmentos, las anotaciones, la exportación a PDF y el OCR se ejecutan dentro de tu navegador. La extensión no tiene analíticas ni ningún servidor para imágenes.
            </p>
            <p>
              Solo se conecta a la red por tres motivos: la comprobación opcional de licencia (que envía un identificador de instalación y nada más), abrir la página de pago alojada por Waffo al comprar y los comentarios que tú envíes. Además, si activas tú mismo el acceso MCP, la extensión se conecta a 127.0.0.1 en tu equipo, y esa conexión no sale de tu dispositivo.
            </p>
          </>
        ),
      },
      {
        q: '¿Por qué el plan gratuito se queda en 20 capturas al día?',
        a: (
          <>
            <p>
              Es un techo pensado para las capturas de scroll desbocadas, no un límite de demostración. Todas las funciones salvo la captura de elementos, la exportación y combinación de PDF, el OCR y el acceso MCP están disponibles en el plan gratuito, incluido todo el editor de anotaciones.
            </p>
            <p>El contador se reinicia cada día y nunca cuenta a los usuarios de Pro.</p>
          </>
        ),
      },
      {
        q: '¿Funciona con archivos HTML locales?',
        a: (
          <>
            <p>
              Sí, en cuanto lo permitas. En <code>chrome://extensions</code>, abre los detalles de la extensión y activa «Permitir el acceso a URL de archivos». Si no lo haces, Chrome se negará a fotografiar una pestaña <code>file://</code> y la extensión te lo dirá.
            </p>
          </>
        ),
      },
      {
        q: '¿Qué pasa en una página que se desplaza sin fin?',
        a: (
          <>
            <p>
              La extensión expande primero el feed y después captura hasta 40 pantallas. Si llega a ese tope lo dice en el texto de progreso, en lugar de truncar en silencio.
            </p>
          </>
        ),
      },
      {
        q: '¿Qué idiomas habla la interfaz?',
        a: (
          <>
            <p>
              Inglés, chino simplificado, chino tradicional, japonés, coreano, español, francés y alemán. De forma predeterminada sigue el idioma de la interfaz de Chrome, y puedes cambiarlo en cada equipo desde el propio menú de idioma de la extensión.
            </p>
          </>
        ),
      },
    ],
  },

  pricing: {
    h1: 'Precios simples y honestos',
    intro:
      'Gratis para siempre para la captura del día a día, incluido todo el editor de anotaciones. Pro es para volumen, captura de elementos, exportación y combinación de PDF, OCR y acceso MCP. Sin pruebas, sin tarjeta en el plan gratuito, sin cobro por imagen.',
    plans: [
      {
        tag: 'Gratis',
        name: 'Captura del día a día',
        amount: FREE_AMOUNT,
        period: 'para siempre',
        bullets: [
          'Captura de página completa, área visible y región',
          'Expansión del scroll infinito',
          'Precarga de imágenes de carga diferida',
          'Páginas anchas, unidas en una cuadrícula',
          'Editor de anotaciones: las nueve herramientas',
          'Salida en PNG y JPG',
          'Plantillas de nombre de archivo y subcarpetas',
          '20 capturas al día',
        ],
        cta: { label: 'Añadir a Chrome', to: CHROME_STORE_URL },
      },
      {
        tag: 'Pro mensual',
        name: 'Proyectos cortos',
        amount: PRICE_AMOUNT.monthly,
        period: '/ mes',
        bullets: [
          'Todo lo de Gratis, sin el tope diario',
          'Capturar un solo elemento con un clic',
          'Exportación a PDF',
          'Combinar varias capturas en un solo PDF',
          'OCR: chino e inglés',
          'Acceso MCP para clientes de IA',
          'Cancelación desde la extensión, sin correos',
        ],
        cta: { label: 'Cómo comprar', to: '#how-to-buy' },
      },
      {
        tag: 'Pro anual · El más popular',
        name: 'Todo el año',
        amount: PRICE_AMOUNT.yearly,
        period: '/ año',
        featured: true,
        bullets: [
          'Todo lo de Gratis, sin el tope diario',
          'Capturar un solo elemento con un clic',
          'Exportación a PDF',
          'Combinar varias capturas en un solo PDF',
          'OCR: chino e inglés',
          'Acceso MCP para clientes de IA',
          `Unos ${YEARLY_PER_MONTH} al mes`,
        ],
        cta: { label: 'Cómo comprar', to: '#how-to-buy', primary: true },
      },
      {
        tag: 'Pro de por vida',
        name: 'Paga una vez',
        amount: PRICE_AMOUNT.lifetime,
        period: 'una sola vez',
        bullets: [
          'Todo lo de Gratis, sin el tope diario',
          'Capturar un solo elemento con un clic',
          'Exportación a PDF',
          'Combinar varias capturas en un solo PDF',
          'OCR: chino e inglés',
          'Acceso MCP para clientes de IA',
          'Sin renovación y sin caducidad',
        ],
        cta: { label: 'Cómo comprar', to: '#how-to-buy' },
      },
    ],
    plansNote: (
      <>
        Precios en dólares estadounidenses. El pago lo gestiona Waffo Pancake como comerciante responsable; los impuestos locales se añaden al pagar cuando corresponden. ¿No sabes qué plan te conviene? En las <a href={P('faq')}>preguntas frecuentes</a> está la respuesta directa a «qué añade Pro».
      </>
    ),

    tableTitle: 'Qué incluye cada plan',
    tableSub: 'Una tabla, sin asteriscos.',
    tableHead: ['Función', 'Gratis', 'Pro'],
    tableRows: [
      { label: 'Captura de página completa con unión automática de los fragmentos', free: 'yes', pro: 'yes' },
      { label: 'Captura del área visible', free: 'yes', pro: 'yes' },
      { label: 'Región seleccionada arrastrando', free: 'yes', pro: 'yes' },
      { label: 'Expansión del scroll infinito (hasta 40 pantallas)', free: 'yes', pro: 'yes' },
      { label: 'Precarga de imágenes de carga diferida', free: 'yes', pro: 'yes' },
      { label: 'Elementos fijos y sticky capturados una sola vez', free: 'yes', pro: 'yes' },
      { label: 'Páginas anchas troceadas en celdas y vueltas a montar', free: 'yes', pro: 'yes' },
      {
        label:
          'Editor de anotaciones: rectángulo, elipse, flecha, lápiz, resaltado, texto, mosaico, recorte y selección',
        free: 'yes',
        pro: 'yes',
      },
      { label: 'Salida PNG y JPG con control de calidad', free: 'yes', pro: 'yes' },
      { label: 'Plantillas de nombre de archivo y subcarpetas de descarga', free: 'yes', pro: 'yes' },
      { label: 'Copiar al portapapeles tras la captura', free: 'yes', pro: 'yes' },
      {
        label: (
          <>
            Páginas locales <code>file://</code>
          </>
        ),
        free: 'yes',
        pro: 'yes',
      },
      { label: '8 idiomas de interfaz', free: 'yes', pro: 'yes' },
      { label: 'Capturas al día', free: { text: '20' }, pro: { text: 'Ilimitadas' } },
      { label: 'Capturar un solo elemento con un clic', free: 'no', pro: 'yes' },
      { label: 'Exportación a PDF', free: 'no', pro: 'yes' },
      { label: 'Combinar varias capturas en un solo PDF', free: 'no', pro: 'yes' },
      { label: 'OCR: extraer texto de una imagen', free: 'no', pro: 'yes' },
      { label: 'Acceso MCP: que clientes de IA capturen', free: 'no', pro: 'yes' },
    ],

    buyTitle: 'Cómo funciona la compra',
    buySub:
      'El pago se inicia desde la extensión, para que Pro quede vinculado al perfil de navegador correcto.',
    buySteps: [
      {
        title: 'Abre la ventana de la extensión',
        body: 'Pulsa el icono de la barra de herramientas. Los botones de los planes están debajo de los de captura.',
      },
      {
        title: 'Elige un plan',
        body: 'Se abre en una pestaña nueva la página de pago segura de Waffo Pancake. Paga con tarjeta; los impuestos locales se muestran antes de confirmar.',
      },
      {
        title: 'Vuelve: Pro ya está activo',
        body: 'Puedes cerrar la pestaña sin problema: la extensión recoge la compra por su cuenta y la insignia pasa a Pro.',
      },
    ],
    buyNote: (
      <>
        Se puede tener una suscripción y una licencia de por vida en la misma máquina: la licencia de por vida siempre prevalece, y ni la renovación ni la cancelación de una suscripción te la quitan. Las condiciones de reembolso están en los <a href={P('terms')}>términos del servicio</a>; si el propio proceso de pago falla, <a href={P('support')}>avísanos</a> y lo resolveremos con la pasarela.
      </>
    ),

    billingTitle: 'Dudas de facturación',
    billingFaq: [
      {
        q: '¿Puedo usar Pro en más de un equipo?',
        a: (
          <>
            <p>
              Una licencia está vinculada a un perfil de navegador. Para moverla —un equipo nuevo, una reinstalación, un perfil borrado— abre la ventana de la extensión y usa <strong>Restaurar compra</strong> con el correo con el que pagaste. Surte efecto de inmediato y no hay que volver a pagar.
            </p>
            <p>
              Restaurar apunta el perfil nuevo a la compra original, de modo que ambos comparten la misma licencia en vez de duplicarla.
            </p>
            <p>
              Una licencia cubre hasta cinco perfiles de navegador a la vez, contando el perfil en el que se compró. Restaurar en un sexto perfil no falla: desplaza de la licencia el que llevaba más tiempo sin usarse, así que guarda el correo y vuelve a restaurar si regresas a ese perfil.
            </p>
          </>
        ),
      },
      {
        q: '¿Cómo cancelo una suscripción?',
        a: (
          <>
            <p>
              Abre la página de ajustes de la extensión y baja hasta el final. La tarjeta de suscripción muestra tu plan actual, su estado y la fecha de vencimiento; haz clic en ella para abrir la pantalla de detalles, donde está el botón de cancelación: sin correos, sin portales y sin abrir un ticket.
            </p>
            <p>
              Cancelar detiene la renovación. Pro sigue funcionando hasta el final del periodo que ya has pagado, y la pantalla de detalles indica la fecha. ¿Has cambiado de idea antes de esa fecha? El botón para reanudarla está en esa misma pantalla.
            </p>
          </>
        ),
      },
      {
        q: '¿Puedo cambiar entre mensual y anual?',
        a: (
          <>
            <p>
              No sobre la marcha: una suscripción activa no puede cambiar de plan. Cancélala primero y luego suscríbete al plan que quieras. El tiempo que ya has pagado se suma al periodo del plan nuevo, así que cambiar de plan nunca te hace perder los días que compraste.
            </p>
          </>
        ),
      },
      {
        q: '¿Ofrecéis reembolsos?',
        a: (
          <>
            <p>
              Sí: escribe a <a href={mailto(S)}>{S}</a> desde la dirección con la que pagaste e indica de qué pedido se trata. Los reembolsos los procesa Waffo Pancake, nuestro comerciante responsable.
            </p>
            <p>
              Una suscripción reembolsada detiene Pro. Una licencia de por vida reembolsada también detiene Pro: la extensión consulta al servidor de licencias, así que el cambio llega al equipo y no solo a la factura.
            </p>
          </>
        ),
      },
      {
        q: '¿Hay periodo de prueba?',
        a: (
          <>
            <p>
              No, y el plan gratuito hace innecesario uno: todos los modos de captura y el editor de anotaciones completo son gratis, con un tope de 20 capturas al día. Pro consiste en quitar ese tope y añadir la captura de elementos, la exportación y combinación de PDF, el OCR y el acceso MCP.
            </p>
          </>
        ),
      },
      {
        q: '¿Qué pasa con mis capturas si dejo de pagar?',
        a: (
          <>
            <p>
              Nada. Los archivos ya guardados son tuyos y se quedan donde los pusiste; la extensión no tiene ningún servidor que pueda retenerlos. La lista de historial dentro de la extensión también sigue siendo legible. Simplemente vuelves a las 20 capturas al día del plan gratuito, y desaparecen la exportación y combinación de PDF, el OCR, el acceso MCP y la captura de elementos.
            </p>
          </>
        ),
      },
      {
        q: '¿Qué métodos de pago se aceptan?',
        a: (
          <>
            <p>
              Los que ofrezca la página de pago de Waffo Pancake en tu región, normalmente las principales tarjetas de crédito y débito. La extensión nunca ve ni guarda los datos de tu tarjeta: el pago se hace en la página de Waffo, no en la nuestra.
            </p>
          </>
        ),
      },
    ],
  },

  faq: {
    h1: 'Preguntas frecuentes',
    intro: (
      <>
        Primero el comportamiento de la captura, después las licencias. Si la respuesta no está aquí, <a href={P('support')}>escríbenos</a>: lo lee una persona real.
      </>
    ),
    groups: [
      {
        title: 'Capturar',
        items: [
          {
            q: '¿Por qué falta una cabecera sticky en mitad de mi captura?',
            a: (
              <>
                <p>
                  Es deliberado, y es lo que más contribuye a que una captura larga se lea bien. Una barra de navegación sticky se fotografiaría en todas y cada una de las pantallas, así que aparece una vez arriba y se oculta en las siguientes.
                </p>
                <p>
                  Para ocultarlos se usa <code>visibility</code> y no <code>display: none</code>, porque sacar un elemento del flujo cambiaría la altura de la página a mitad de la captura y dejaría los fragmentos en dos sistemas de coordenadas distintos.
                </p>
                <p>
                  Si lo que falta es una cabecera que esperabas conservar, probablemente la página la vuelve sticky por CSS al desplazarse. La extensión vuelve a comprobar las posiciones mientras se desplaza, así que envíanos la URL.
                </p>
              </>
            ),
          },
          {
            q: '¿Por qué salen algunas imágenes en blanco?',
            a: (
              <>
                <p>
                  Puede que las imágenes de carga diferida no hubieran terminado de decodificarse cuando se fotografió esa pantalla. Activa <strong>Activar y esperar las imágenes de carga diferida antes de capturar</strong> en los ajustes: la extensión se desplaza por delante y espera a que cada mapa de bits esté decodificado.
                </p>
                <p>
                  El contenido que queda detrás de un inicio de sesión, de un aviso de cookies o de un clic no tiene arreglo: la extensión fotografía lo que la página dibuja de verdad.
                </p>
              </>
            ),
          },
          {
            q: 'La página se desplaza sin fin. ¿Funciona?',
            a: (
              <>
                <p>
                  Sí. <strong>Expandir las páginas de scroll infinito antes de capturar</strong> viene activado de forma predeterminada: la página baja por tramos hasta que deja de llegar contenido nuevo, y solo entonces empieza la captura.
                </p>
                <p>
                  Hay un tope estricto de 40 pantallas para que un feed de verdad interminable no cuelgue el navegador. Al alcanzarlo, el texto de progreso avisa de que la captura se ha cortado: nunca trunca en silencio.
                </p>
              </>
            ),
          },
          {
            q: '¿Y una página más ancha que mi ventana?',
            a: (
              <>
                <p>
                  Las tablas anchas, los tableros kanban y los diagramas se capturan como una cuadrícula y se vuelven a montar fila a fila, así que no se pierde el borde derecho. Las costuras horizontales tienen el borde nítido, sin difuminar: en una página con líneas verticales o bordes de tarjetas no se notan; a través de un mapa de bits continuo puede que veas la unión.
                </p>
                <p>
                  Si la página solo es unos píxeles más ancha que la ventana por un redondeo, la extensión la trata como una sola columna en lugar de añadir una franja diminuta de una segunda.
                </p>
              </>
            ),
          },
          {
            q: '¿Puedo capturar un archivo HTML local?',
            a: (
              <>
                <p>
                  Sí, después de conceder el permiso. Abre <code>chrome://extensions</code>, busca Page Screenshot Pro, abre sus detalles y activa <strong>Permitir el acceso a URL de archivos</strong>. Si no lo haces, Chrome impide fotografiar una pestaña <code>file://</code> y la extensión te dirá que eso es lo que ha pasado en lugar de fallar en silencio.
                </p>
              </>
            ),
          },
          {
            q: '¿Funciona en Edge, Brave u otros navegadores Chromium?',
            a: (
              <>
                <p>
                  Está pensada para Chrome 116 y posteriores. Los navegadores basados en Chromium que implementan las mismas API de extensiones suelen funcionar, pero Chrome es el navegador con el que se desarrolla y se prueba: la ruta de captura usa API que no están garantizadas en otros.
                </p>
              </>
            ),
          },
          {
            q: '¿Dónde van los archivos y puedo cambiar el nombre?',
            a: (
              <>
                <p>
                  Van a Descargas, de forma predeterminada. En los ajustes puedes definir una plantilla de nombre con <code>{'{title}'}</code>, <code>{'{host}'}</code>, <code>{'{date}'}</code>, <code>{'{time}'}</code>, <code>{'{width}'}</code> y <code>{'{height}'}</code>, elegir una subcarpeta, cambiar el formato predeterminado entre PNG y JPG y decidir si el diálogo Guardar como aparece cada vez.
                </p>
              </>
            ),
          },
          {
            q: '¿Puedo capturar solo un elemento, sin toda la página?',
            a: (
              <>
                <p>
                  Sí: haz clic con el botón derecho en el elemento y elige la entrada de captura de elementos del menú contextual. La captura de elementos es una función de Pro; los otros tres modos (página completa, área visible y región seleccionada arrastrando) son gratis.
                </p>
              </>
            ),
          },
        ],
      },
      {
        title: 'Privacidad y datos',
        items: [
          {
            q: '¿Mis capturas se suben a algún sitio?',
            a: (
              <>
                <p>
                  No. La captura, la unión de fragmentos, las anotaciones, la exportación a PDF y el OCR se ejecutan dentro de tu navegador. No hay analíticas, ni telemetría, ni servidor de imágenes.
                </p>
                <p>
                  La extensión solo se conecta a la red por tres motivos: la comprobación opcional de licencia (que envía un identificador de instalación generado al azar y recibe el estado del plan), abrir la página de pago alojada por Waffo al comprar y los comentarios que tú envíes. La petición de licencia no contiene ninguna imagen, ni la URL de la página, ni historial de navegación. Con el pago desactivado, la extensión no hace ninguna petición de red salvo que envíes comentarios o actives tú mismo el acceso MCP — y esa conexión solo va a 127.0.0.1, en tu propio equipo.
                </p>
              </>
            ),
          },
          {
            q: '¿Qué es el identificador de instalación?',
            a: (
              <>
                <p>
                  Un identificador aleatorio que se crea en el primer arranque y se guarda localmente. Existe para que una licencia pueda vincularse a un perfil de navegador sin cuenta, sin inicio de sesión por correo y sin contraseña. No se deriva de tu equipo, ni de tu perfil de Chrome, ni de tu navegación.
                </p>
                <p>
                  Restaurar una compra vincula un identificador de instalación nuevo con el original; no se envía nada más.
                </p>
              </>
            ),
          },
          {
            q: '¿El OCR envía mi imagen a algún sitio?',
            a: (
              <>
                <p>
                  No. El motor de OCR y sus datos de idioma van dentro de la extensión y se ejecutan localmente en un documento aislado. Nada sale del navegador, y funciona sin conexión a la red.
                </p>
              </>
            ),
          },
          {
            q: '¿Qué se guarda en el historial de la extensión?',
            a: (
              <>
                <p>
                  Las últimas 30 capturas, con una miniatura, guardadas en el almacenamiento local del navegador para que puedas volver a abrirlas o exportarlas. Las entradas más antiguas se van borrando solas. Puedes vaciar la lista desde la ventana de la extensión, y desinstalarla la borra junto con el resto de su almacenamiento.
                </p>
              </>
            ),
          },
        ],
      },
      {
        title: 'Licencias y facturación',
        items: [
          {
            q: '¿Por qué el plan gratuito se queda en 20 capturas al día?',
            a: (
              <>
                <p>
                  Es un techo contra las capturas de scroll desbocadas —una página con un feed interminable puede producir decenas de pantallas con un solo clic— y no una limitación de demostración. Todo salvo la captura de elementos, la exportación y combinación de PDF, el OCR y el acceso MCP está en el plan gratuito, incluido el editor de anotaciones completo. La <a href={P('pricing')}>página de precios</a> traza esa frontera línea por línea.
                </p>
                <p>
                  El contador se reinicia cada día y nunca cuenta a los usuarios de Pro. Una captura que falla o que cancelas no consume ninguna de las 20.
                </p>
              </>
            ),
          },
          {
            q: '¿Cómo recupero Pro tras reinstalar, o en un equipo nuevo?',
            a: (
              <>
                <p>
                  Abre la ventana de la extensión y usa <strong>Restaurar compra</strong> con el correo con el que pagaste. Surte efecto de inmediato y no vuelves a pagar.
                </p>
                <p>
                  Por seguridad, la respuesta es la misma haya o no una compra con ese correo, así que un desconocido no puede usar el formulario para averiguar si has comprado algo. Si Pro no aparece, probablemente el correo no sea el del pedido: escribe a <a href={mailto(S)}>{S}</a>.
                </p>
              </>
            ),
          },
          {
            q: '¿Cómo cancelo una suscripción?',
            a: (
              <>
                <p>
                  Abre la página de ajustes de la extensión y baja hasta el final. La tarjeta de suscripción muestra tu plan actual, su estado y la fecha de vencimiento. Haz clic en ella para abrir la pantalla de detalles: allí están la lista de pedidos y el botón de cancelación. No hay ningún portal que visitar ni ningún ticket que abrir.
                </p>
                <p>
                  Cancelar detiene la renovación; Pro sigue funcionando hasta el final del periodo que ya has pagado, y la pantalla de detalles muestra esa fecha. Puedes reanudarla desde esa misma pantalla antes de que caduque, y si vuelves a suscribirte más adelante, el tiempo restante se suma al nuevo periodo.
                </p>
              </>
            ),
          },
          {
            q: 'He comprado la licencia de por vida y además tengo una suscripción. ¿Cuál manda?',
            a: (
              <>
                <p>
                  La licencia de por vida prevalece siempre. Una renovación, una cancelación o la caducidad de una suscripción nunca retiran una licencia de por vida: eso se aplica en el servidor, no solo en la interfaz.
                </p>
                <p>
                  La ventana de la extensión dice cuál tienes, así que quien tiene la de por vida y quien está suscrito no ven la misma pantalla.
                </p>
              </>
            ),
          },
          {
            q: '¿Ofrecéis reembolsos?',
            a: (
              <>
                <p>
                  Sí. Escribe a <a href={mailto(S)}>{S}</a> desde la dirección con la que pagaste e indica de qué pedido se trata. Los reembolsos los procesa Waffo Pancake, nuestro comerciante responsable, así que el dinero vuelve por el mismo camino por el que salió.
                </p>
                <p>
                  Si el pedido reembolsado es la licencia de por vida, Pro se revoca; el reembolso de un pedido no afecta a otra licencia que sigas teniendo.
                </p>
              </>
            ),
          },
          {
            q: '¿Qué pasa con mis capturas si dejo de pagar?',
            a: (
              <>
                <p>
                  Nada. Los archivos ya guardados son tuyos y se quedan donde los pusiste; la lista de historial dentro de la extensión sigue siendo legible. Vuelves a las 20 capturas al día del plan gratuito, y la exportación y combinación de PDF, el OCR, el acceso MCP y la captura de elementos dejan de estar disponibles.
                </p>
              </>
            ),
          },
        ],
      },
      {
        /* El único grupo con `id`: el botón «explicación completa» de la tarjeta
           MCP de los ajustes de la extensión apunta a `/faq/#mcp`. Los ocho
           diccionarios deben llevar este id o el shapeDiff de
           `tests/dict.test.ts` lo reporta como campo que falta o que sobra. */
        id: 'mcp',
        title: 'Clientes de IA (MCP)',
        items: [
          {
            q: '¿Qué es el acceso MCP?',
            a: (
              <>
                <p>
                  Permite que un cliente de IA —Claude Desktop, Cursor, Claude Code o cualquier otra
                  herramienta que hable el Model Context Protocol— haga capturas a través de esta
                  extensión. Lo pides en el chat, el cliente llama a una herramienta y la extensión
                  captura la pestaña activa.
                </p>
                <p>
                  No se sube nada. El cliente y la extensión hablan por un socket de bucle local en{' '}
                  <code>127.0.0.1</code>, así que la imagen va de tu navegador al cliente en la misma
                  máquina. No hay cuenta ni servidor de por medio.
                </p>
              </>
            ),
          },
          {
            q: '¿Cómo se configura?',
            a: (
              <>
                <p>Dos piezas, y necesitas las dos.</p>
                <ul>
                  <li>
                    Activa <strong>Ajustes → AI / MCP access</strong> en la extensión y marca la
                    casilla. La tarjeta muestra entonces un token y un bloque JSON listo para usar.
                  </li>
                  <li>
                    Tu cliente MCP lo ejecuta con <code>npx -y page-screenshot-mcp</code>; no lo
                    instalas a mano. Hace falta Node <strong>20 o superior</strong>.
                  </li>
                </ul>
                <p>
                  Pega ese JSON en el bloque <code>mcpServers</code> del archivo de configuración del
                  cliente y reinícialo. El punto de estado de la tarjeta se pone verde en cuanto el
                  puente se conecta.
                </p>
              </>
            ),
          },
          {
            q: 'La IA responde needs_user_gesture. ¿Qué hago?',
            a: (
              <>
                <p>
                  Chrome exige un clic real antes de capturar una página, y una llamada iniciada por
                  la IA no tiene ninguno detrás. Haz clic una vez en el icono de la barra de
                  herramientas (o pulsa <code>Alt+Shift+D</code>) y deja que la IA lo reintente:
                  funcionará.
                </p>
                <p>
                  Es una regla del navegador, no un fallo. Saltársela exigiría pedir acceso a todos
                  los sitios que visitas, y esta extensión deliberadamente no lo hace.
                </p>
              </>
            ),
          },
          {
            q: '¿Qué herramientas requieren Pro?',
            a: (
              <>
                <p>
                  <code>psp_status</code> es gratis: solo informa del estado de la conexión y de la
                  licencia, así que la IA siempre puede decirte qué va mal. Las otras siete requieren
                  Pro.
                </p>
                <ul>
                  <li>
                    <code>capture_visible</code>, <code>capture_full_page</code> y{' '}
                    <code>capture_element</code>: los tres modos de captura.
                  </li>
                  <li>
                    <code>ocr_capture</code> y <code>export_pdf</code>: OCR y PDF sobre una captura.
                  </li>
                  <li>
                    <code>history_list</code> y <code>history_get</code>: las capturas guardadas.
                  </li>
                </ul>
                <p>
                  Las capturas pasan por el proceso normal de la extensión, así que el cupo diario,
                  el permiso de <code>file://</code>, la expansión del scroll infinito y la precarga
                  de imágenes diferidas se aplican igual que cuando haces clic tú.
                </p>
              </>
            ),
          },
        ],
      },
    ],
    stuckTitle: '¿Sigues atascado?',
    stuckBody:
      'Incluye la URL de la página (si es pública), tu versión de Chrome y la imagen de salida: normalmente basta para reproducir el problema.',
    stuckMail: 'Escribir a soporte',
    stuckMore: 'Todas las formas de contacto',
  },

  support: {
    h1: 'Soporte',
    intro: (
      <>
        No hay sistema de tickets ni chatbot. Todo mensaje va a <a href={mailto(S)}>{S}</a> y lo responde una persona real, normalmente en dos días laborables.
      </>
    ),
    cards: [
      {
        icon: '✉',
        title: 'Escríbenos',
        body: 'Para lo que sea: un error, una duda sobre una función, una licencia que no volvió a aparecer tras reinstalar.',
        cta: 'Abrir tu correo',
        to: mailto(S),
      },
      {
        icon: '🐞',
        title: 'Informar de un error',
        body: 'Elige una categoría y cuenta qué pasó; deja un correo si quieres respuesta. Con la URL de la página (si es pública) y tu versión de Chrome suele bastar para reproducir el problema.',
        cta: 'Enviar comentarios',
        to: '#feedback',
      },
      {
        icon: '💳',
        title: 'Licencia o reembolso',
        body: 'Escribe desde la dirección con la que pagaste e indica de qué pedido se trata. Los reembolsos los gestiona Waffo Pancake, nuestro comerciante responsable.',
        cta: 'Contactar con facturación',
        to: mailto(S, 'Licencia o reembolso — Page Screenshot Pro'),
      },
    ],
    form: {
      title: 'Enviar comentarios',
      sub: 'Llega directamente al desarrollador: sin sistema de tickets ni bots. Es el mismo formulario que hay dentro de la extensión.',
      categoryLabel: 'Categoría',
      categories: {
        bug: 'Error / algo no funciona',
        feature: 'Sugerencia de función',
        purchase: 'Problema de compra o licencia',
        other: 'Otro',
      },
      messageLabel: 'Qué pasó',
      messagePlaceholder: 'Qué esperabas, qué obtuviste y los pasos que te llevaron ahí. Si puedes, incluye la URL de la página y tu versión de Chrome.',
      emailLabel: 'Tu correo (opcional)',
      emailHint: 'Déjalo vacío para seguir en el anonimato. Si lo rellenas, la respuesta va allí; también es la única forma de recuperar la licencia tras reinstalar.',
      submit: 'Enviar',
      note: 'El mensaje solo lo recibe el desarrollador. No se envía nada de la página que estabas capturando.',
    },
    beforeTitle: 'Antes de escribir',
    beforeSub: 'Dos cosas resuelven por sí solas la mayoría de los avisos.',
    before: [
      {
        title: 'Zonas en blanco en la imagen',
        body: (
          <>
            Normalmente son imágenes de carga diferida que aún no se habían decodificado. En Ajustes → Captura, activa <strong>Activar y esperar las imágenes de carga diferida antes de capturar</strong>. Es más lento, y por eso no es el único modo.
          </>
        ),
      },
      {
        title: (
          <>
            Una página local <code>file://</code> no se captura
          </>
        ),
        body: (
          <>
            Chrome la bloquea hasta que lo permitas. Abre <code>chrome://extensions</code>, entra en los detalles de esta extensión y activa <strong>Permitir el acceso a URL de archivos</strong>. Cuando esa es la causa, la extensión muestra un enlace directo a esa página.
          </>
        ),
      },
    ],
    beforeNote: (
      <>
        Más respuestas en la <a href={P('faq')}>página de preguntas frecuentes</a>.
      </>
    ),
    selfTitle: 'Las tres cosas por las que más nos escriben',
    selfSub: 'Las tres tienen una respuesta clara, y ninguna es un error.',
    self: [
      {
        title: 'La captura sale desalineada o le falta el final',
        body: (
          <>
            <p>
              Las capturas largas se fotografían pantalla a pantalla y se unen según la posición de desplazamiento medida, así que si la página se mueve mientras se captura, las juntas caen donde no toca. Hay dos cosas que mueven la página por su cuenta.
            </p>
            <p>
              La primera es un feed infinito que sigue cargando contenido: activa <strong>Expandir las páginas de scroll infinito antes de capturar</strong> en Ajustes y se agotará antes de la primera captura, no a mitad de la serie. La segunda es una cabecera que solo pasa a <code>position: fixed</code> después de desplazarte: al salir del flujo del documento desaparece la altura que ocupaba y todo lo de abajo sube esa misma distancia. La extensión mide ese desplazamiento y corrige cada fragmento, pero la corrección es una mediana sobre elementos de referencia, así que una página cuyo diseño entero dependa de la posición de desplazamiento todavía puede burlarla.
            </p>
            <p>
              Si aun así no cuadra, en las <a href={P('faq')}>preguntas frecuentes</a> están las condiciones exactas en las que gana cada modo; enviarnos la URL junto con la imagen suele bastar para reproducir el problema.
            </p>
          </>
        ),
      },
      {
        title: (
          <>
            Una página local <code>file://</code> no se captura
          </>
        ),
        body: (
          <>
            <p>
              Esto es cosa de Chrome, no de la extensión. Una página <code>file://</code> depende de un permiso distinto del de «leer la página en la que estás», y Chrome no lo concede hasta que lo das explícitamente: a todas las extensiones, no solo a esta.
            </p>
            <p>
              Abre <code>chrome://extensions</code>, entra en los detalles de esta extensión y activa <strong>Permitir el acceso a URL de archivos</strong>. La extensión detecta exactamente ese estado y muestra un enlace directo a esa página.
            </p>
            <p>
              Ojo: es un permiso, no un interruptor dentro de la extensión. En la ventana de la extensión no hay ningún ajuste que pueda concederlo en nombre de Chrome. En las <a href={P('faq')}>preguntas frecuentes</a> se enumeran las demás cosas que necesitan un permiso y no un interruptor.
            </p>
          </>
        ),
      },
      {
        title: 'Compré Pro, pero en otro equipo aparece la versión gratuita',
        body: (
          <>
            <p>
              La licencia va unida al perfil del navegador con el que se pagó, así que un equipo nuevo, un perfil nuevo o uno reinstalado empiezan en la versión gratuita. No se ha perdido nada: abre la ventana de la extensión y usa <strong>Restaurar compra</strong> con el correo con el que pagaste.
            </p>
            <p>
              Ese correo es la única credencial —no hay contraseña ni página de cuenta—, así que guárdalo donde puedas seguir accediendo a él tras una reinstalación. Restaurar surte efecto de inmediato y no vuelve a cobrarte.
            </p>
            <p>
              Si ya no tienes acceso a ese correo, escribe desde cualquier dirección a <a href={mailto(S)}>{S}</a> e incluye el número de pedido del recibo; con eso basta para encontrar la compra. El resto de dudas sobre licencias están en la <a href={P('pricing')}>página de precios</a>.
            </p>
          </>
        ),
      },
    ],
    reportTitle: 'Informar de un problema de captura',
    reportP1: (
      <>
        El formulario de arriba es la vía más rápida: eliges una categoría, cuentas qué pasó, añades un correo si quieres respuesta y llega directamente al desarrollador. Si tienes la extensión instalada, el mismo formulario se abre dentro de ella: ventana de la extensión → <strong>Enviar comentarios</strong>, o el botón de la página de ajustes. En ambos casos solo se envía lo que escribes, así que indica tú la versión de la extensión y la página en la que estabas.
      </>
    ),
    reportP2: 'Da igual el formulario o el correo: estos cuatro datos te ahorran una ida y vuelta:',
    reportList: [
      'La URL de la página, si es pública.',
      <>
        Tu versión de Chrome (la ves en <code>chrome://version</code>).
      </>,
      'Dónde falla la imagen de salida: el formulario no admite adjuntos, así que descríbelo (o envíanos la imagen por correo).',
      'Si la página usa su propio contenedor de scroll, como un editor de documentos o el panel de un cuadro de mando.',
    ],
    privacyTitle: 'Dudas de privacidad',
    privacyBody: (
      <>
        Para solicitudes de datos, de borrado o cualquier otra cosa que cubra la política de privacidad, escribe a <a href={mailto(PRIVACY_EMAIL)}>{PRIVACY_EMAIL}</a>, una dirección distinta de la de soporte, para que esas solicitudes no se mezclen con los informes de errores. La política en sí está en <a href={P('privacy')}>la página de privacidad</a>.
      </>
    ),
  },

  privacy: {
    h1: 'Política de privacidad',
    effective: 'Fecha de entrada en vigor: 2 de noviembre de 2026',
    intro: (
      <>
        Page Screenshot Pro («la extensión») captura páginas completas, las anota, exporta PDF y ejecuta OCR en el propio dispositivo. Esta política explica qué tratan la extensión y su servidor de licencias; en resumen: <strong>tus capturas nunca salen de tu dispositivo</strong>.
      </>
    ),
    sections: [
      {
        title: '1. Qué se queda en tu dispositivo',
        body: (
          <ul>
            <li>
              <strong>Capturas.</strong> Todo lo que capturas se procesa y se guarda localmente en tu navegador (almacenamiento del navegador e IndexedDB). Las imágenes capturadas nunca se nos envían a nosotros ni a ningún tercero.
            </li>
            <li>
              <strong>OCR.</strong> El reconocimiento de texto se ejecuta por completo sin conexión, con un motor de OCR incluido (Tesseract.js) dentro de tu navegador. Las imágenes usadas para el OCR nunca salen de tu dispositivo.
            </li>
            <li>
              <strong>Editor y portapapeles.</strong> Las anotaciones se hacen localmente. Solo se escribe en el portapapeles cuando pulsas expresamente una acción de copiar.
            </li>
            <li>
              <strong>Acceso MCP (Pro, desactivado por defecto).</strong> Cuando lo activas, la extensión actúa como cliente y se conecta a un proceso puente que tú mismo inicias en <code>127.0.0.1</code> en tu propio equipo, para que un cliente de IA como Claude Desktop o Cursor pueda ordenar capturas. Esa conexión nunca sale de tu equipo: no pasa por nosotros ni por ningún tercero, y no abandona tu red local. Los datos de captura solo viajan entre dos procesos de tu propio ordenador. Mientras no actives ese interruptor, la conexión no se establece.
            </li>
          </ul>
        ),
      },
      {
        title: '2. Qué guardamos para gestionar tu licencia',
        body: (
          <ul>
            <li>
              <strong>Identificador de instalación.</strong> En el primer arranque la extensión genera un identificador aleatorio (UUID). Se guarda en tu navegador (<code>chrome.storage.sync</code>, que se sincroniza entre tus dispositivos con tu propia cuenta de Google, con una copia local de respaldo). Se usa solo como clave de tu licencia Pro: no contiene ningún dato personal.
            </li>
            <li>
              <strong>Estado de la licencia.</strong> Si Pro está desbloqueado y qué plan has comprado se guardan localmente en tu navegador.
            </li>
          </ul>
        ),
      },
      {
        title: '3. Pagos',
        body: (
          <>
            <p>
              Los pagos los procesa <strong>Waffo</strong>, nuestro comerciante responsable. Al pagar se abre en tu navegador la página de pago alojada por Waffo: los datos de tu tarjeta van directamente a Waffo y nunca pasan por la extensión ni por nuestros servidores. Consulta <a href="https://waffo.ai" rel="noopener">waffo.ai</a> para ver la política de privacidad de Waffo.
            </p>
            <p>
              Tras un pago correcto, Waffo notifica a nuestro servidor de licencias, que registra: el plan comprado, su estado y su periodo, tu identificador de instalación y, solo para que puedas restaurar la compra más adelante, la dirección de correo con la que pagaste, asociada a ese identificador de instalación. Nunca se envía al servidor de licencias ningún contenido de capturas, historial de navegación ni contenido de páginas.
            </p>
          </>
        ),
      },
      {
        title: '4. Restaurar compra',
        body: (
          <p>
            Si reinstalas la extensión o te cambias de equipo, puedes restaurar Pro introduciendo el correo con el que pagaste. El servidor consulta la correspondencia correo → identificador de instalación y vincula tu identificador de instalación nuevo con la licencia original. Las solicitudes de restauración tienen límite de frecuencia; el servidor nunca revela si un correo tiene una compra.
          </p>
        ),
      },
      {
        title: '5. Permisos: por qué la extensión los pide',
        body: (
          <ul>
            <li>
              <code>activeTab</code> / <code>scripting</code>: para capturar la pestaña que le pides; los scripts de contenido se inyectan solo cuando hacen falta.
            </li>
            <li>
              Acceso al host <code>file:///</code>: solo para capturas de archivos locales, y solo si activas «Permitir el acceso a URL de archivos» en Chrome.
            </li>
            <li>
              <code>downloads</code>: para guardar las imágenes y los PDF que exportas.
            </li>
            <li>
              <code>storage</code> / <code>unlimitedStorage</code>: para los ajustes, el estado de la licencia y el historial de capturas.
            </li>
            <li>
              <code>clipboardWrite</code>: solo cuando usas una acción de copiar.
            </li>
            <li>
              <code>contextMenus</code>: las entradas del menú contextual.
            </li>
            <li>
              <code>notifications</code>: solo avisos de error locales (por ejemplo, un fallo de captura).
            </li>
            <li>
              <code>tabs</code>: para detectar cuándo vuelve la pestaña de pago, de modo que una compra completada desbloquee Pro.
            </li>
            <li>
              <code>offscreen</code>: para unir imágenes en un documento invisible en lugar de abrir una pestaña.
            </li>
            <li>
              <code>identity</code> / <code>identity.email</code>: para rellenar de antemano el campo de correo de la página de pago. La dirección se lee de tu cuenta de Chrome y, una vez que has escrito una, se recuerda en el almacenamiento local de este navegador para poder rellenarla la próxima vez. Nunca se envía a nuestro servidor de licencias salvo en una compra que inicies o en unos comentarios que envíes.
            </li>
          </ul>
        ),
      },
      {
        title: '6. Qué NO hacemos',
        body: (
          <ul>
            <li>Sin analíticas, sin telemetría, sin SDK de publicidad.</li>
            <li>No vendemos, alquilamos ni compartimos tus datos con terceros con fines de marketing.</li>
            <li>
              La extensión no hace ninguna petición de red propia salvo las comprobaciones de licencia contra nuestro servidor de licencias (solo el identificador de instalación), la apertura de la página de pago alojada por Waffo, los comentarios que envíes tú y la conexión MCP local que actives tú.
            </li>
          </ul>
        ),
      },
      {
        title: '7. Conservación y eliminación de datos',
        body: (
          <p>
            Los registros de licencia se conservan mientras tu compra o suscripción esté activa (y según lo que exija la normativa fiscal y contable a nuestro procesador de pagos). Desinstalar la extensión borra todos los datos guardados localmente: capturas, ajustes e identificador de instalación. Para borrar tu registro del servidor de licencias, escríbenos a la dirección de abajo. Qué incluye una licencia y cómo funcionan los reembolsos son materia de los <a href={P('terms')}>términos del servicio</a>, no de esta política.
          </p>
        ),
      },
      {
        title: '8. Cambios',
        body: (
          <p>
            Si esta política cambia de forma sustancial, actualizaremos la fecha de entrada en vigor de arriba y lo indicaremos en las notas de versión de la extensión.
          </p>
        ),
      },
      {
        title: '9. Contacto',
        body: (
          <p>
            Dudas sobre esta política: <a href={mailto(PRIVACY_EMAIL)}>{PRIVACY_EMAIL}</a> — una dirección distinta del soporte habitual, para que las solicitudes de datos no se mezclen con los informes de errores. Todo lo que no sea privacidad va a la <a href={P('support')}>página de soporte</a>.
          </p>
        ),
      },
    ],
  },

  terms: {
    h1: 'Términos del servicio',
    effective: 'Fecha de entrada en vigor: 29 de octubre de 2026',
    intro:
      'Estos términos cubren tu uso de la extensión de navegador Page Screenshot Pro y del servidor de licencias que hay detrás. Al instalar o usar la extensión los aceptas. Si no los aceptas, desinstálala: eso elimina todo lo que guardó localmente.',
    sections: [
      {
        title: '1. Alcance de la licencia',
        body: (
          <>
            <p>
              Te concedemos una licencia personal, no exclusiva e intransferible para instalar y usar la extensión en los perfiles de navegador que controles. Las funciones Pro se licencian por perfil de navegador, no por persona; mover una licencia entre perfiles se hace con <strong>Restaurar compra</strong>, no compartiéndola. Una licencia puede estar activa en hasta cinco perfiles de navegador a la vez, contando el perfil en el que se compró; restaurar en un sexto perfil desplaza el que llevaba más tiempo sin usarse.
            </p>
            <p>
              No puedes revender, sublicenciar, alquilar ni redistribuir la extensión, ni integrarla en otro producto, sin permiso por escrito.
            </p>
          </>
        ),
      },
      {
        title: '2. El plan gratuito',
        body: (
          <>
            <p>
              El plan gratuito incluye captura de página completa, de área visible y de región, expansión del scroll infinito, gestión de las imágenes de carga diferida, el editor de anotaciones completo y salida en PNG y JPG, con un tope de <strong>20 capturas por día natural</strong>. El tope, el reparto entre Gratis y Pro y las funciones incluidas pueden cambiar en una versión futura; cuando cambien, lo diremos en las notas de versión en lugar de cambiarlos en silencio.
            </p>
            <p>
              Pro quita el tope diario y añade captura de elementos, exportación y combinación de PDF, OCR y acceso MCP. Una captura que falla o que cancelas no cuenta contra el límite diario.
            </p>
          </>
        ),
      },
      {
        title: '3. Compras, renovaciones y reembolsos',
        body: (
          <>
            <p>
              Los planes de pago los vende y los procesa <strong>Waffo</strong> como comerciante responsable. A la transacción de pago en sí le aplican los términos de Waffo; estos términos rigen la licencia que compras con ese pago.
            </p>
            <ul>
              <li>
                <strong>Suscripciones</strong>: se renuevan automáticamente hasta que se cancelan. Puedes cancelar en cualquier momento desde la página de ajustes de la extensión: sin correos ni portales.
              </li>
              <li>
                <strong>Cancelar</strong> detiene la renovación; Pro sigue funcionando hasta el final del periodo ya pagado.
              </li>
              <li>
                <strong>Cambiar de plan</strong> se hace cancelando y volviendo a suscribirse: una suscripción en curso no puede cambiar de plan sobre la marcha. El tiempo ya pagado se suma al periodo del plan nuevo, así que un cambio nunca te cuesta los días que compraste.
              </li>
              <li>
                <strong>De por vida</strong> es un pago único sin renovación. No le afecta una renovación, una cancelación ni la caducidad de una suscripción en el mismo perfil.
              </li>
              <li>
                <strong>Reembolsos</strong>: disponibles a petición. Escribe a <a href={mailto(S)}>{S}</a> desde la dirección con la que pagaste. Un reembolso anula la licencia que ese pago activó.
              </li>
            </ul>
            <p>
              Los precios se muestran en dólares estadounidenses y pueden cambiar. Un cambio de precio nunca se aplica de forma retroactiva a un periodo que ya has pagado.
            </p>
          </>
        ),
      },
      {
        title: '4. Tus responsabilidades',
        body: (
          <>
            <p>
              La extensión captura lo que hay en pantalla. Eso significa que el contenido de tu captura es responsabilidad tuya, incluyendo:
            </p>
            <ul>
              <li>
                <strong>Derechos de autor y otros derechos.</strong> Capturar una página no es una licencia para volver a publicarla. Si compartes o publicas una captura, asegúrate de que tienes derecho a hacerlo.
              </li>
              <li>
                <strong>Información confidencial y personal.</strong> Una captura puede contener nombres, direcciones, números de cuenta o mensajes privados. Las herramientas de mosaico y recorte del editor de anotaciones existen justo para esto; úsalas antes de compartir.
              </li>
              <li>
                <strong>Los términos de los sitios que capturas.</strong> Algunos servicios prohíben la captura automatizada o por script de sus páginas. Es un asunto entre tú y el sitio.
              </li>
            </ul>
          </>
        ),
      },
      {
        title: '5. Uso aceptable',
        body: (
          <p>
            No puedes usar la extensión para capturar contenido al que no tengas acceso legítimo, para eludir un muro de pago o un control de acceso, ni de ninguna forma que infrinja la ley aplicable. Podemos suspender una licencia obtenida mediante fraude o un pago revertido.
          </p>
        ),
      },
      {
        title: '6. Qué no promete la extensión',
        body: (
          <>
            <p>
              Una captura es una fotografía de un renderizado, y algunas páginas son hostiles a eso. En concreto:
            </p>
            <ul>
              <li>
                <strong>El contenido detrás de un inicio de sesión, un clic o un muro de consentimiento</strong> no se captura, porque la extensión fotografía lo que la página dibuja realmente.
              </li>
              <li>
                <strong>Las páginas con contenedores de scroll poco habituales</strong> —editores de documentos, cuadros de mando con sus propios paneles— se tratan de forma heurística. La extensión mide el contenedor de scroll y corrige el contenido que se desplaza, pero una página siempre puede construirse de una forma que la lleve a equivocarse.
              </li>
              <li>
                <strong>Los feeds muy largos</strong> se limitan a 40 pantallas por captura. El texto de progreso avisa cuando se alcanza el tope.
              </li>
              <li>
                <strong>Las costuras horizontales</strong> de una página que sea a la vez muy ancha y continua pueden verse como un borde duro. Es una limitación documentada, no un defecto que estemos escondiendo.
              </li>
              <li>
                <strong>La precisión del OCR</strong> depende de la imagen. El texto de menos de unos 6 píxeles de alto no se reconocerá de forma fiable.
              </li>
            </ul>
          </>
        ),
      },
      {
        title: '7. Disponibilidad y cambios',
        body: (
          <>
            <p>
              La extensión se ejecuta localmente y no necesita servidor, así que una caída del servidor no te impide capturar. El servidor de licencias se usa para las compras, para restaurar una compra y para consultar el estado de la suscripción; si no está accesible, una licencia local existente sigue funcionando.
            </p>
            <p>
              Podemos actualizar, cambiar o retirar funciones. Si retiramos una función que has pagado, ofreceremos una compensación proporcional a lo que reste de tu periodo pagado.
            </p>
          </>
        ),
      },
      {
        title: '8. Exención de garantías',
        body: (
          <p>
            La extensión se ofrece «tal cual», sin garantías de ningún tipo, expresas o implícitas, incluida la idoneidad para un fin concreto. Es una herramienta, no una garantía: comprueba que una captura está completa antes de confiar en ella para algo importante.
          </p>
        ),
      },
      {
        title: '9. Limitación de responsabilidad',
        body: (
          <>
            <p>
              En la medida en que lo permita la ley, nuestra responsabilidad total derivada de la extensión o relacionada con ella se limita a la cantidad que hayas pagado por ella en los doce meses anteriores a la reclamación. No respondemos de pérdidas indirectas ni consecuentes, incluidas la pérdida de datos, la pérdida de beneficios o una captura a la que le faltaba algo que necesitabas.
            </p>
            <p>Nada en estos términos excluye responsabilidades que la ley no permita excluir.</p>
          </>
        ),
      },
      {
        title: '10. Privacidad',
        body: (
          <p>
            Lo que la extensión guarda y lo que nunca envía se describe en la <a href={P('privacy')}>política de privacidad</a>, que forma parte de estos términos.
          </p>
        ),
      },
      {
        title: '11. Terminación',
        body: (
          <p>
            Puedes parar cuando quieras desinstalando la extensión. Podemos rescindir una licencia por un incumplimiento sustancial de la sección 4 o de la 5. Al terminar, las secciones 8, 9 y 12 siguen vigentes.
          </p>
        ),
      },
      {
        title: '12. Legislación aplicable y contacto',
        body: (
          <p>
            Estos términos se rigen por la legislación aplicable en el domicilio social del comerciante responsable, sin atender a las normas de conflicto de leyes. Dudas sobre estos términos: <a href={mailto(S)}>{S}</a>. Para todo lo relacionado con la extensión y no con estas condiciones, la <a href={P('support')}>página de soporte</a> responde antes.
          </p>
        ),
      },
    ],
  },

  notFound: {
    title: 'Página no encontrada',
    body: 'Esa página no existe. Puede que se haya movido o que el enlace tenga una errata.',
    cta: 'Volver a la página de inicio',
  },
};

export default es;
