import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/proxy': {
        target: 'https://saimo-tv.pages.dev',
        changeOrigin: true,
        secure: false,
      },
      '/api/catalogo': {
        target: 'https://saimo-tv.pages.dev',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
