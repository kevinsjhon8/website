import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* 官网的 Vite 配置。
 *
 * 只有一份 —— 客户端构建与 `--ssr` 构建共用它，差别全在命令行上
 * （见 package.json 的 build 脚本）。刻意**没有** historyApiFallback
 * 之类的 SPA 兜底：这个站点是预渲染出每个路由一个真实 HTML，
 * 不是在浏览器里拼路由，`/pricing` 必须是 dist/pricing/index.html
 * 这个文件本身。 */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
