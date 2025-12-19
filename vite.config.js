import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core (всегда нужен)
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }

          // Material-UI (большая библиотека)
          if (id.includes('node_modules/@mui') ||
              id.includes('node_modules/@emotion')) {
            return 'vendor-mui';
          }

          // DnD Kit (для Kanban)
          if (id.includes('node_modules/@dnd-kit')) {
            return 'vendor-dnd';
          }

          // Firebase (загружается при логине)
          if (id.includes('node_modules/firebase') ||
              id.includes('node_modules/@firebase')) {
            return 'vendor-firebase';
          }

          // Rich Text Editor (тяжелый, используется редко)
          if (id.includes('node_modules/react-quill')) {
            return 'vendor-editor';
          }
        }
      }
    },
    // Увеличиваем лимит warning до 1MB (у нас теперь chunks)
    chunkSizeWarningLimit: 1000
  }
})