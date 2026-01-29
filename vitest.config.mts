import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.{ts,tsx,mjs}', '**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**'],
  },
});
