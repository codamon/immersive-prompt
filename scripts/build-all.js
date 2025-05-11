// scripts/build-all.js
import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// 构建主应用（options页面）
async function buildMain() {
  console.log('Building main application...');
  
  await build({
    configFile: false,
    root: rootDir,
    publicDir: 'public',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          options: resolve(rootDir, 'src/options/options.html'),
        },
        output: {
          entryFileNames: 'js/[name].js',
          chunkFileNames: 'js/chunks/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const assetName = assetInfo.name || '';
            const extType = assetName.split('.').pop()?.toLowerCase() || '';
          
            if (extType === 'css') {
              if (assetName.startsWith('options')) return `css/options.[ext]`;
              return `css/[name].[ext]`;
            }
            if (assetName.match(/\.(png|jpe?g|gif|svg|webp|woff2?|ttf|eot)$/i)) {
              return `assets/[name].[ext]`;
            }
            return `assets/[name]-[hash].[ext]`;
          }
        }
      }
    }
  });
  
  // 创建options目录并复制options.html文件
  await fs.mkdir(resolve(rootDir, 'dist/options'), { recursive: true });
  await fs.copyFile(
    resolve(rootDir, 'dist/src/options/options.html'),
    resolve(rootDir, 'dist/options/options.html')
  );
  
  console.log('Copied options.html to the correct location');
}

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
  
  // 复制content-style.css到dist/css/content.css
  await fs.mkdir(resolve(rootDir, 'dist/css'), { recursive: true });
  await fs.copyFile(
    resolve(rootDir, 'src/content/content-style.css'),
    resolve(rootDir, 'dist/css/content.css')
  );
  
  console.log('Copied content-style.css to dist/css/content.css');
}

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

// 按顺序执行构建
async function buildAll() {
  try {
    // 首先构建主应用
    await buildMain();
    
    // 然后构建content和background脚本
    await buildContent();
    await buildBackground();
    
    console.log('Build completed successfully!');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

buildAll(); 