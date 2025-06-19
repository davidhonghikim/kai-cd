import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import fs from 'fs'

const packageJson = fs.readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
const { version } = JSON.parse(packageJson)

export default defineConfig({
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
  assetsInclude: ['**/*.md'],
  define: {
    'process.env.PACKAGE_VERSION': JSON.stringify(version),
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
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
}) 