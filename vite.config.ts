import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  publicDir: 'public',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true, // 建议添加，确保每次构建前清空 dist 目录
    rollupOptions: {
      input: {
        options: resolve(__dirname, 'src/options/options.html'), // 指向 src 根目录的 HTML
        content: resolve(__dirname, 'src/content/content.ts'),
        // options: resolve(__dirname, 'src/options/options.html'),
        // popup: resolve(__dirname, 'src/popup/popup.html'),
        // background: resolve(__dirname, 'src/background/background.ts'),
      },
      // --- 添加或确保以下 output 配置存在且正确 ---
      output: {
        // [name] 会被替换为 input 中的键名 (options, content, popup)
        entryFileNames: 'js/[name].js',
        // 用于代码分割产生的 chunk 文件
        chunkFileNames: 'js/[name]-[hash].js',
        // 用于静态资源文件 (如 CSS, 图片等)
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.')?.pop() || '';
          // 将 CSS 文件输出到 css 目录
          if (extType === 'css') {
            // [name] 在这里通常是入口点的名字，如果 CSS 是从特定入口导入的
            // 例如，如果 content.ts 导入了一个 style.css，输出可能是 css/content.css
            // 或者如果 CSS 文件本身有独立的名字，会保留其名字
            return `css/[name].[ext]`;
          }
          // 其他资源可以放在 assets 目录
          if (assetInfo.name?.match(/\.(png|jpe?g|gif|svg|webp|woff2?|ttf|eot)$/)) {
            return `assets/[name].[ext]`;
          }
          return `assets/[name]-[hash].[ext]`;
        },
      }
      // --- 结束 output 配置 ---
    },
  },
})