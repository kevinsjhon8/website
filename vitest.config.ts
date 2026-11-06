import { defineConfig } from 'vitest/config';

/* 官网自己的测试配置。
 *
 * environment 用 node：这里测的全是纯函数（路由、
 * 文案形状、meta 拼接），没有组件挂载，也不需要 DOM。
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
