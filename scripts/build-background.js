// scripts/build-background.js
import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// 构建background脚本
async function buildBackground() {
  console.log('Building background script...');
  
  await build({
    configFile: false,
    root: rootDir,
    build: {
      outDir: 'dist/js',
      emptyOutDir: false,
      lib: {
        entry: resolve(rootDir, 'src/background/background.ts'),
        formats: ['iife'],
        name: 'background',
        fileName: () => 'background.js'
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true
        }
      }
    }
  });
}

buildBackground().catch(err => {
  console.error('Error building background script:', err);
  process.exit(1);
}); 