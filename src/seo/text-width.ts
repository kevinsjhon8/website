/* 文案的**显示宽度**，不是字符数。
 *
 * 中日韩文字是全角，一个字符占两格；拉丁字母、数字、空格占一格。搜索结果里的
 * 标题按像素截断，所以「25 个字符」的 `FAQ — Page Screenshot Pro` 与
 * 「25 个字符」的 `Support — bug reports`（后者其实是 23 格）在 SERP 里不是
 * 一样长。按字符数写阈值，中文页永远显得"够长"，而它的实际长度只有一半。
 *
 * 判据是码位区间，不是"有没有中文"：韩文谚文、假名、全角标点、中文引号
 * （「」『』）都是两格，而这些在八份字典里都真的出现过。
 *
 * 这是一个**估算模型**，不是浏览器排版：真实宽度还取决于字体、字重和字距。
 * 30 / 60 这两个阈值同理，是"桌面端标题行约能放下 600px"换算来的经验值，
 * 不是 Google 的限制（它的文档只说"按设备宽度截断"）。写在这里是为了让
 * 判断可复现，不是为了冒充标准——所以本文件与阈值都只服务于一条断言：
 * 「标题短到没有描述任何东西」。
 *
 * **只能有一份。** 两个测试各写一份宽度函数，就是 prices.test.ts 那次
 * 「两个真源」的教训（见 CLAUDE.md 的 *A price written into a dictionary*）。
 */

/** 东亚宽字符（W / F 类）的码位区间，够覆盖本站八种语言实际会出现的字符。 */
const WIDE: [number, number][] = [
  [0x1100, 0x115f], // 谚文字母
  [0x2e80, 0x303e], // 中日韩部首、标点（、。「」『』〔〕）
  [0x3041, 0x33ff], // 假名、注音、中日韩兼容
  [0x3400, 0x4dbf], // 中日韩扩展 A
  [0x4e00, 0x9fff], // 中日韩统一表意文字
  [0xa000, 0xa4cf], // 彝文
  [0xac00, 0xd7a3], // 谚文音节
  [0xf900, 0xfaff], // 中日韩兼容表意文字
  [0xfe30, 0xfe4f], // 中日韩兼容形式
  [0xff00, 0xff60], // 全角 ASCII
  [0xffe0, 0xffe6], // 全角符号（￥￡等）
  [0x20000, 0x3fffd], // 中日韩扩展 B 及以上
];

export function isWide(cp: number): boolean {
  for (const [lo, hi] of WIDE) if (cp >= lo && cp <= hi) return true;
  return false;
}

/** 显示宽度：全角记 2，其余记 1。按码位遍历，不按 UTF-16 码元（emoji 除外，
 *  本站文案里没有）。 */
export function displayWidth(s: string): number {
  let w = 0;
  for (const ch of s) w += isWide(ch.codePointAt(0)!) ? 2 : 1;
  return w;
}
