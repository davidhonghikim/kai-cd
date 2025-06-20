import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import fs from 'fs'

const packageJson = fs.readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
const { version } = JSON.parse(packageJson)

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/*',
          dest: '.',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@features': resolve(__dirname, './src/features'),
      '@shared': resolve(__dirname, './src/shared'),
      '@platforms': resolve(__dirname, './src/platforms'),
    },
  },
  assetsInclude: ['**/*.md'],
  define: {
    'process.env.PACKAGE_VERSION': JSON.stringify(version),
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        sidepanel: resolve(__dirname, 'sidepanel.html'),
        tab: resolve(__dirname, 'tab.html'),
        background: resolve(__dirname, 'src/background/main.ts'),
        docs: resolve(__dirname, 'docs.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          return `assets/[name]-[hash].js`;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})) 