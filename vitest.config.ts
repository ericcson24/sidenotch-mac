import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['**/dist-apps/**', '**/dist/**', '**/node_modules/**', '**/dmg-build/**'],
    globals: true,
    // Never spend the user's Claude/Gemini subscription quota from tests.
    env: { SIDENOTCH_DISABLE_SUBSCRIPTIONS: '1' },
  },
});
