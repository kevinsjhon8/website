#!/usr/bin/env node
/* 官网插图与图标生成器：SVG → WebP / PNG。
 *
 * 为什么不用截图：这台机器上的 headless Chrome 不带 --no-sandbox 会直接 core dump，
 * 而 --no-sandbox 又被安全策略拒绝，所以「打开插件点一遍、截图」这条路走不通。
 * 这里改成用 sharp（librsvg）把一段手写 SVG 光栅化。
 *
 * 为什么插图里一个字母都没有：官网有八种语言，位图里的文字没法翻译，
 * 一张写着英文的图放到 /zh-cn/ 上就是错的。所以插图只画几何形状，
 * 所有说明文字走 <img alt> 和 <figcaption>，由 src/i18n/*.tsx 提供。
 *
 * 用法：
 *   node scripts/gen-site-images.mjs          # 重新生成全部
 *   node scripts/gen-site-images.mjs --check  # 只校验产物是否存在
 *
 * 产物（都已提交，构建时不需要 sharp）：
 *   public/images/*.webp  首页三张插图
 *   public/favicon16.png  标签页图标
 *   public/favicon48.png  标签页图标（也当正文图用在导航/页脚）
 *   public/apple-touch-icon.png  iOS「添加到主屏幕」
 *   public/icon192.png / icon512.png  site.webmanifest 的图标
 *   public/icon512-maskable.png     manifest 的 maskable 图标（满幅方图）
 *
 * sharp 目前是 node_modules/miniflare 的传递依赖，没有写进任何 package.json。
 * 如果哪天它没了，这个脚本会明确报错而不是悄悄跳过；生成好的位图已经入库，
 * 所以 npm run build 永远不会依赖它。
 */

import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public/images');
const PUBLIC_DIR = join(ROOT, 'public');

/* 与 public/styles.css 的 :root 变量保持一致 —— 图里和页面上的深蓝必须同一个色。 */
const C = {
  bg: '#050a14',
  bgDeep: '#02060e',
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  accent: '#a855f7',
  text: '#f8fafc',
  muted: '#94a3b8',
  muted2: '#64748b',
  glass: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
  ok: '#34d399',
};

const W = 1200;
const H = 750;

/** 所有插图共用的底：深蓝底 + 两团径向光晕。 */
function backdrop(id) {
  return `
  <defs>
    <radialGradient id="glowA-${id}" cx="18%" cy="8%" r="70%">
      <stop offset="0%" stop-color="${C.primary}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="${C.primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB-${id}" cx="88%" cy="96%" r="65%">
      <stop offset="0%" stop-color="${C.accent}" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="brand-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.primaryLight}"/>
      <stop offset="100%" stop-color="${C.accent}"/>
    </linearGradient>
    <linearGradient id="fade-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.text}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${C.text}" stop-opacity="0.02"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#glowA-${id})"/>
  <rect width="${W}" height="${H}" fill="url(#glowB-${id})"/>`;
}

/** 一块「玻璃」面板：官网 .card 的观感。
 * 描边颜色/粗细走参数而不是拼字符串 —— 同名属性重复写两次是 XML 错误，
 * librsvg 会直接拒绝整个文档（"Attribute stroke-width redefined"）。 */
function panel(x, y, w, h, r = 18, stroke = C.border, strokeWidth = 1.5) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"
    fill="${C.glass}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
}

/** 一行「正文」占位条。 */
function line(x, y, w, h = 10, op = 0.20) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"
    fill="${C.text}" fill-opacity="${op}"/>`;
}

/* ---------------------------------------------------------------- 1. 拼接 */

/* 长截图的分块与接缝：3 行 × 2 列，块之间留出重叠带，
 * 接缝用虚线标出来，右下角一块高亮表示"正在拍的那一屏"。 */
function svgStitch() {
  const cols = 2;
  const rows = 3;
  const tw = 380;
  const th = 190;
  const gapX = 40;
  const gapY = 34;
  const totalW = cols * tw + (cols - 1) * gapX;
  const totalH = rows * th + (rows - 1) * gapY;
  const x0 = (W - totalW) / 2;
  const y0 = (H - totalH) / 2 - 10;

  let tiles = '';
  let n = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * (tw + gapX);
      const y = y0 + r * (th + gapY);
      const hot = r === rows - 1 && c === cols - 1;
      // 每块里画几条内容条，暗示"这一屏有内容"
      const inner = [0.62, 0.9, 0.74, 0.5]
        .map((k, i) => line(x + 26, y + 46 + i * 30, (tw - 52) * k, 12, hot ? 0.34 : 0.18))
        .join('');
      const head = line(x + 26, y + 20, 120, 10, hot ? 0.6 : 0.3);
      tiles +=
        panel(x, y, tw, th, 16, hot ? C.primary : C.border, hot ? 2.5 : 1.5) +
        head +
        inner +
        // 行号/列号小点，纯装饰
        `<circle cx="${x + tw - 22}" cy="${y + 25}" r="5" fill="${hot ? C.primary : C.muted2}" fill-opacity="${hot ? 1 : 0.5}"/>`;
      n++;
    }
  }

  // 接缝：横向贯穿（行与行之间）+ 纵向贯穿（列与列之间）
  let seams = '';
  for (let r = 1; r < rows; r++) {
    const y = y0 + r * (th + gapY) - gapY / 2;
    seams += `<line x1="${x0 - 26}" y1="${y}" x2="${x0 + totalW + 26}" y2="${y}"
      stroke="${C.primaryLight}" stroke-opacity="0.55" stroke-width="2"
      stroke-dasharray="10 8"/>`;
  }
  for (let c = 1; c < cols; c++) {
    const x = x0 + c * (tw + gapX) - gapX / 2;
    seams += `<line x1="${x}" y1="${y0 - 26}" x2="${x}" y2="${y0 + totalH + 26}"
      stroke="${C.accent}" stroke-opacity="0.45" stroke-width="2"
      stroke-dasharray="10 8"/>`;
  }

  // 拍摄顺序箭头：先向下走完一列，再换下一列
  const ax = x0 - 62;
  const arrow = `
    <path d="M ${ax} ${y0 + 10} L ${ax} ${y0 + totalH - 10}"
      stroke="${C.ok}" stroke-opacity="0.75" stroke-width="3" fill="none"
      stroke-dasharray="14 9"/>
    <path d="M ${ax - 9} ${y0 + totalH - 26} L ${ax} ${y0 + totalH - 8} L ${ax + 9} ${y0 + totalH - 26}"
      fill="none" stroke="${C.ok}" stroke-opacity="0.75" stroke-width="3" stroke-linecap="round"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${backdrop('stitch')}
  ${tiles}
  ${seams}
  ${arrow}
  <rect x="${x0}" y="${y0}" width="${totalW}" height="${totalH}" rx="24"
    fill="none" stroke="url(#brand-stitch)" stroke-opacity="0.35" stroke-width="2"/>
</svg>`;
}

/* ---------------------------------------------------------------- 2. 标注 */

/* 编辑器：一块画布 + 上面叠着几种标注（矩形、椭圆、箭头、自由笔、马赛克），
 * 顶部一条工具栏。 */
function svgEditor() {
  const cx = 110;
  const cy = 150;
  const cw = 980;
  const ch = 520;

  // 画布里的"正文"：一行行灰条
  let text = '';
  for (let i = 0; i < 11; i++) {
    const w = [0.9, 0.82, 0.88, 0.6, 0.86, 0.74, 0.9, 0.55, 0.84, 0.7, 0.4][i];
    text += line(cx + 60, cy + 70 + i * 38, (cw - 120) * w, 14, 0.16);
  }

  // 工具栏：九个圆角方块，暗示九个工具
  let tools = '';
  for (let i = 0; i < 9; i++) {
    const tx = cx + 28 + i * 52;
    const active = i === 4;
    tools +=
      `<rect x="${tx}" y="78" width="40" height="40" rx="11"
        fill="${active ? C.primary : 'rgba(255,255,255,0.06)'}"
        stroke="${active ? C.primaryLight : C.border}" stroke-width="1.5"/>` +
      `<rect x="${tx + 12}" y="${90 + (i % 3) * 3}" width="16" height="16" rx="${i % 2 ? 8 : 3}"
        fill="${active ? C.text : C.muted}" fill-opacity="${active ? 0.95 : 0.55}"/>`;
  }

  // 标注
  const ann = `
    <rect x="${cx + 150}" y="${cy + 96}" width="300" height="120" rx="10"
      fill="none" stroke="${C.primary}" stroke-width="4"/>
    <ellipse cx="${cx + 640}" cy="${cy + 150}" rx="130" ry="76"
      fill="none" stroke="${C.accent}" stroke-width="4"/>
    <path d="M ${cx + 300} ${cy + 330} L ${cx + 560} ${cy + 330}"
      stroke="${C.ok}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M ${cx + 560} ${cy + 330} l -26 -15 l 0 30 z" fill="${C.ok}"/>
    <path d="M ${cx + 96} ${cy + 400} q 70 -80 140 -20 t 150 10 t 120 -50"
      stroke="${C.primaryLight}" stroke-width="5" fill="none"
      stroke-linecap="round" stroke-linejoin="round"/>
    <g>
      <rect x="${cx + 660}" y="${cy + 300}" width="150" height="104" rx="8"
        fill="${C.muted2}" fill-opacity="0.55"/>
      <rect x="${cx + 676}" y="${cy + 316}" width="34" height="24" rx="4" fill="${C.bgDeep}" fill-opacity="0.85"/>
      <rect x="${cx + 724}" y="${cy + 316}" width="34" height="24" rx="4" fill="${C.bgDeep}" fill-opacity="0.55"/>
      <rect x="${cx + 772}" y="${cy + 316}" width="22" height="24" rx="4" fill="${C.bgDeep}" fill-opacity="0.75"/>
      <rect x="${cx + 676}" y="${cy + 352}" width="22" height="24" rx="4" fill="${C.bgDeep}" fill-opacity="0.6"/>
      <rect x="${cx + 706}" y="${cy + 352}" width="34" height="24" rx="4" fill="${C.bgDeep}" fill-opacity="0.8"/>
      <rect x="${cx + 748}" y="${cy + 352}" width="34" height="24" rx="4" fill="${C.bgDeep}" fill-opacity="0.45"/>
      <rect x="${cx + 676}" y="${cy + 388}" width="34" height="0" rx="4" fill="none"/>
    </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${backdrop('editor')}
  ${panel(cx, cy, cw, ch, 22)}
  ${text}
  ${ann}
  ${tools}
  <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="22"
    fill="none" stroke="url(#brand-editor)" stroke-opacity="0.3" stroke-width="2"/>
</svg>`;
}

/* ------------------------------------------------------------ 3. 只在本机 */

/* 本地处理：浏览器窗口 → 本机磁盘，中间一个"不联网"的标记。
 * 云的形状被一条斜线划掉。
 *
 * 三个块的左右边界是算出来的，不是手调的：两段箭头必须等长，
 * 否则一眼就看得出"中间那个只是被塞进去的"。 */
function svgLocal() {
  const bx = 70;
  const bw = 320;
  const bh = 310;
  const by = 285;

  const shieldX = 630; // 中间槽位正中
  const shieldHalf = 75;
  const midY = by + bh / 2; // 三个块共用同一条水平中线

  const dx = 870;
  const dw = 230;
  const dh = 220;
  const dy = midY - dh / 2;

  const gapL = { from: bx + bw + 24, to: shieldX - shieldHalf - 16 };
  const gapR = { from: shieldX + shieldHalf + 16, to: dx - 16 };

  // 浏览器窗口
  const browser = `
    ${panel(bx, by, bw, bh, 20)}
    <line x1="${bx}" y1="${by + 52}" x2="${bx + bw}" y2="${by + 52}"
      stroke="${C.border}" stroke-width="1.5"/>
    <circle cx="${bx + 30}" cy="${by + 26}" r="6" fill="${C.muted2}"/>
    <circle cx="${bx + 52}" cy="${by + 26}" r="6" fill="${C.muted2}"/>
    <circle cx="${bx + 74}" cy="${by + 26}" r="6" fill="${C.muted2}"/>
    <rect x="${bx + 100}" y="${by + 16}" width="${bw - 130}" height="20" rx="10"
      fill="rgba(255,255,255,0.05)" stroke="${C.border}" stroke-width="1"/>
    ${[0, 1, 2, 3, 4, 5]
      .map((i) => line(bx + 34, by + 88 + i * 36, (bw - 68) * [0.9, 0.72, 0.84, 0.6, 0.8, 0.66][i], 14, 0.18))
      .join('')}`;

  // 中间：盾牌 + 锁
  const shieldY = midY;
  const shield = `
    <path d="M ${shieldX} ${shieldY - 110}
             L ${shieldX + shieldHalf} ${shieldY - 62}
             L ${shieldX + shieldHalf} ${shieldY + 30}
             Q ${shieldX + shieldHalf} ${shieldY + 104} ${shieldX} ${shieldY + 132}
             Q ${shieldX - shieldHalf} ${shieldY + 104} ${shieldX - shieldHalf} ${shieldY + 30}
             L ${shieldX - shieldHalf} ${shieldY - 62} Z"
      fill="rgba(59,130,246,0.10)" stroke="${C.primary}" stroke-width="3"/>
    <rect x="${shieldX - 32}" y="${shieldY - 18}" width="64" height="52" rx="10"
      fill="${C.primaryLight}" fill-opacity="0.9"/>
    <path d="M ${shieldX - 19} ${shieldY - 18} v -19 a 19 19 0 0 1 38 0 v 19"
      fill="none" stroke="${C.primaryLight}" stroke-width="8" stroke-linecap="round"/>`;

  // 右边：本机磁盘
  const disk = `
    <rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" rx="26"
      fill="rgba(255,255,255,0.04)" stroke="${C.border}" stroke-width="1.5"/>
    <rect x="${dx + 36}" y="${dy + 44}" width="${dw - 72}" height="14" rx="7" fill="${C.muted}" fill-opacity="0.5"/>
    <rect x="${dx + 36}" y="${dy + 74}" width="${dw - 72}" height="14" rx="7" fill="${C.muted}" fill-opacity="0.35"/>
    <rect x="${dx + 36}" y="${dy + 104}" width="${(dw - 72) * 0.7}" height="14" rx="7" fill="${C.muted}" fill-opacity="0.25"/>
    <circle cx="${dx + dw / 2}" cy="${dy + 168}" r="28" fill="none" stroke="${C.ok}" stroke-width="3"/>
    <path d="M ${dx + dw / 2} ${dy + 152} v 32 M ${dx + dw / 2 - 13} ${dy + 172} l 13 13 l 13 -13"
      fill="none" stroke="${C.ok}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;

  // 被划掉的云：放在盾牌正上方，和下面那排保持距离
  const cloudX = 630;
  const cloudY = 132;
  const cloud = `
    <path d="M ${cloudX - 70} ${cloudY + 22}
             a 30 30 0 0 1 6 -59 a 42 42 0 0 1 80 -6 a 32 32 0 0 1 54 34 z"
      fill="none" stroke="${C.muted2}" stroke-width="3" stroke-opacity="0.7"/>
    <line x1="${cloudX - 96}" y1="${cloudY - 56}" x2="${cloudX + 92}" y2="${cloudY + 40}"
      stroke="#f87171" stroke-width="4" stroke-linecap="round" stroke-opacity="0.85"/>`;

  // 箭头。x2 必须大于 x1 —— 反过来画只会得到一个孤零零的箭头碎片。
  const arrow = (g, y) => {
    if (g.to <= g.from) throw new Error(`箭头画反了：${g.from} → ${g.to}`);
    return `
    <line x1="${g.from}" y1="${y}" x2="${g.to - 14}" y2="${y}" stroke="${C.ok}"
      stroke-width="3" stroke-opacity="0.7" stroke-dasharray="12 8"/>
    <path d="M ${g.to - 16} ${y - 9} l 16 9 l -16 9" fill="none" stroke="${C.ok}"
      stroke-width="3" stroke-opacity="0.7" stroke-linecap="round" stroke-linejoin="round"/>`;
  };

  // 整组内容在竖直方向补一个偏移：三块 + 云的实际包围盒偏上，
  // 直接铺在 750 高的画布里会让下方空出五分之一，缩到页面宽度时很明显。
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${backdrop('local')}
  <g transform="translate(0 46)">
  ${browser}
  ${cloud}
  ${shield}
  ${disk}
  ${arrow(gapL, midY)}
  ${arrow(gapR, midY)}
  </g>
</svg>`;
}

/* ── 图标 ────────────────────────────────────────────────────────
 *
 * 仓库里**没有**这张图的源 SVG（全仓 find 除 node_modules/dist 外为零），
 * 所以这里把它照原样重画一份，只画几何形状：
 * 蓝色圆角底 + 白色机身 + 顶部取景凸起 + 深蓝镜头 + 白色高光。
 *
 * 尺寸不是随便列的，每一个都对应一处真实引用：
 *   16   index.html 的 <link rel="icon" sizes="16x16">
 *   48   <link rel="icon" sizes="48x48">，另外**还被当正文图用**在导航与页脚
 *        （chrome.tsx 的 <img src="/favicon48.png" width="24">）——它有版式负担，
 *        改尺寸会动页面，不只是换标签页图标
 *   180  apple-touch-icon。iOS 的规范尺寸是 180×180，原来那张是 128×128，
 *        放大后发虚——而这个缺陷只在 iOS 的「添加到主屏幕」里看得见，
 *        桌面浏览器完全不显示它
 *   192/512  site.webmanifest 的 icons，Android Chrome 靠它拿启动图标、
 *        name 与 theme_color；没有 manifest 时只能用 favicon 兜底
 *
 * 关于 apple-touch-icon **不画圆角、不带透明**：iOS 自己会给主屏图标套圆角
 * 遮罩，再烘焙一层圆角等于圆了两次；而透明角在 iOS 上显示成黑色，比没圆角
 * 难看得多。所以它是满幅方图，favicon 才带圆角。
 *
 * maskable 同理，而且是 Android 的硬要求：`purpose: "maskable"` 的图会被
 * 裁成圆形/水滴形，只保证中间 80% 的「安全区」可见，其余四角会被切掉。
 * 一张带透明圆角的图放进遮罩槽，四个角露出来的是底色而不是蓝，看着像图标
 * 缺了角。所以 icon512-maskable.png 是**满幅蓝方图**，镜头图案整个落在安全
 * 区内。 */
const ICONS = [16, 48, 180, 192, 512];

/** maskable 变体：同一套几何，但底是满幅直角、图案按 80% 安全区缩小。 */
const MASKABLE = 512;

function iconFile(size) {
  if (size === 16) return 'favicon16.png';
  if (size === 48) return 'favicon48.png';
  if (size === 180) return 'apple-touch-icon.png';
  return `icon${size}.png`;
}

/** 圆角/直角由调用方决定，见上面两段注释。 */
function iconSvg(size, square = size === 180) {
  const rx = square ? '' : 'rx="24"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"
    width="${size}" height="${size}">
  <rect width="128" height="128" ${rx} fill="#2563eb"/>
  <rect x="52" y="36" width="24" height="16" rx="3" fill="#ffffff"/>
  <rect x="28" y="48" width="73" height="48.5" rx="9" fill="#ffffff"/>
  <circle cx="64" cy="72" r="11.5" fill="#1e40af"/>
  <circle cx="60" cy="68" r="4.5" fill="#ffffff"/>
</svg>`;
}

/** maskable 版：满幅直角底 + 图案缩到中间 80%（即安全区）再居中。 */
function maskableSvg(size) {
  /* 128 的 80% 是 102.4，图案本身占 73×60.5（x 28..101, y 36..96.5），
   * 已经在安全区内了；再整体缩到 0.8 并平移到中心，保证连白色机身的最外
   * 一点也在半径内。transform 里的 25.6 = 128 × 0.2 / 2。 */
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"
    width="${size}" height="${size}">
  <rect width="128" height="128" fill="#2563eb"/>
  <g transform="translate(12.8 12.8) scale(0.8)">
    <rect x="52" y="36" width="24" height="16" rx="3" fill="#ffffff"/>
    <rect x="28" y="48" width="73" height="48.5" rx="9" fill="#ffffff"/>
    <circle cx="64" cy="72" r="11.5" fill="#1e40af"/>
    <circle cx="60" cy="68" r="4.5" fill="#ffffff"/>
  </g>
</svg>`;
}

/* 三张插图出 WebP，不是 PNG（docs/seo.md §8.1）。
 *
 * 这三张是几何图形加大面积纯色渐变，PNG 的无损压缩对它们几乎无效：
 * 实测 97,155 / 99,457 / 94,725 字节，换 WebP q82 之后是 13,316 / 13,358 /
 * 11,052，合计 291 KB → 37 KB。它们都在首屏之后被 loading="lazy" 挡着，
 * 但用户往下滚就会拉到，而这三张加起来曾经比整页 gzip 后的 HTML+CSS 还大。
 *
 * 只有 `og-image.png` 不在此列：社交平台对 og:image 的 WebP 支持不一致，
 * 卡片静默不显示图的代价远大于省 200 KB。它由 scripts/og-image.html 单独
 * 生成，不在这个脚本里。 */
const JOBS = [
  { name: 'images/capture-stitch.webp', svg: svgStitch, w: W, h: H, format: 'webp' },
  { name: 'images/editor-tools.webp', svg: svgEditor, w: W, h: H, format: 'webp' },
  { name: 'images/local-pipeline.webp', svg: svgLocal, w: W, h: H, format: 'webp' },
  ...ICONS.map((size) => ({ name: iconFile(size), svg: () => iconSvg(size), w: size, h: size, format: 'png' })),
  { name: 'icon512-maskable.png', svg: () => maskableSvg(MASKABLE), w: MASKABLE, h: MASKABLE, format: 'png' },
];

const checkOnly = process.argv.includes('--check');

if (checkOnly) {
  const missing = [];
  for (const job of JOBS) {
    try {
      await access(join(PUBLIC_DIR, job.name));
    } catch {
      missing.push(job.name);
    }
  }
  if (missing.length) {
    console.error(`缺少插图或图标：${missing.join(', ')}（运行 node scripts/gen-site-images.mjs）`);
    process.exit(1);
  }
  console.log(`✅ public/ 的 ${JOBS.length} 个产物都在`);
  process.exit(0);
}

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error(
    '找不到 sharp，无法渲染 SVG。\n' +
      '生成好的位图已经提交在 public/，构建不需要它；\n' +
      '要重新生成请先 `npm i -D sharp`（目前它是 miniflare 的传递依赖）。',
  );
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

for (const job of JOBS) {
  const svg = Buffer.from(job.svg());
  /* density 144 = 2× 超采样，再 resize 回目标尺寸，边缘更干净。
   *
   * **两种格式都必须显式 resize**，不能指望 SVG 自带的 width/height 决定输出
   * 尺寸：librsvg 会按 density 缩放，`density: 144` 于是让一张写了 512 的
   * 图标出成 1024×1024，而 manifest 与 <link sizes> 里写的是 512——浏览器
   * 会按声明挑图、按真实尺寸绘制，图标糊成一团。实测过：不加 resize 时五个
   * 图标全部翻倍（32/96/360/384/1024）。 */
  const out = await sharp(svg, { density: 144 })
    .resize(job.w, job.h, { fit: 'contain' })
    /* q82 是量出来的，不是随手挑的：这一档的 PSNR 是 42.5 dB，与原图肉眼
     * 无差；再往上（q90）体积回涨且看不出来，往下（q75）边缘开始发糊。 */
    .toFormat(job.format, job.format === 'webp' ? { quality: 82 } : { compressionLevel: 9 })
    .toBuffer();
  await writeFile(join(PUBLIC_DIR, job.name), out);
  console.log(`  ${job.name}  ${job.w}×${job.h}  ${(out.length / 1024).toFixed(1)} KB`);
}

console.log(`✅ 已写入 public/`);
