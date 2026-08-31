import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/__tests__/**/*.test.ts'],
    exclude: ['**/dist-apps/**', '**/dist/**', '**/node_modules/**', '**/dmg-build/**'],
  },
});
