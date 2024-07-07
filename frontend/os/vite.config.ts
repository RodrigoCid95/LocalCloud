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
        entryFileNames: 'app.js'
      }
    },
    outDir: './../../backend/lc/client/public',
    emptyOutDir: true,
    minify: false,
    sourcemap: false
  },
  plugins: [
    react()
  ],
})
