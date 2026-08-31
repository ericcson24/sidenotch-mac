import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  base: './', // Ensures relative assets in packaged Electron file:// protocol
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: ['**/dist-apps/**', '**/dmg-staging/**', '**/node_modules/**', '**/dmg-build/**'],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
