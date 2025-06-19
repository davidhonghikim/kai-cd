import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  root: 'src',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, '../public'),
          dest: '../'
        }
      ]
    })
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/popup/popup.html'),
        sidepanel: path.resolve(__dirname, 'src/sidepanel/sidepanel.html'),
        tab: path.resolve(__dirname, 'src/tab/tab.html'),
        background: path.resolve(__dirname, 'src/background/main.ts')
      },
      output: {
        entryFileNames: chunk => {
          if (chunk.name === 'background') {
            return 'background.js'
          }
          return 'assets/[name]-[hash].js'
        }
      }
    }
  }
})
