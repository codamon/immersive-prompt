// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
// 开发环境配置
export default defineConfig({
    publicDir: 'public',
    plugins: [react()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                options: resolve(__dirname, 'src/options/options.html'),
                content: resolve(__dirname, 'src/content/content.js'),
            },
            output: {
                entryFileNames: 'js/[name].js',
                chunkFileNames: 'js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.');
                    const ext = info[info.length - 1];
                    if (/\.(css)$/i.test(assetInfo.name)) {
                        return 'css/[name][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                }
            }
        }
    }
});
