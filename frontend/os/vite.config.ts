import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './src/main.tsx',
      },
      output: {
        entryFileNames: 'js/app.js',
        chunkFileNames: 'js/chunk-[name].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    },
    outDir: './../../backend/client',
    emptyOutDir: true,
    minify: false,
    sourcemap: false
  },
  plugins: [
    react()
  ],
})
