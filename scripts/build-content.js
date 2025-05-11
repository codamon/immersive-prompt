// scripts/build-content.js
import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// 构建content脚本
async function buildContent() {
  console.log('Building content script...');
  
  await build({
    configFile: false,
    root: rootDir,
    build: {
      outDir: 'dist/js',
      emptyOutDir: false,
      lib: {
        entry: resolve(rootDir, 'src/content/content.ts'),
        formats: ['iife'],
        name: 'content',
        fileName: () => 'content.js'
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true
        }
      }
    }
  });
}

buildContent().catch(err => {
  console.error('Error building content script:', err);
  process.exit(1);
}); 