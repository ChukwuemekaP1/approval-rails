import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 15000,
    environmentMatchGlobs: [
      ['tests/ui/**', 'jsdom'],
      ['tests/unit/**', 'node'],
      ['tests/integration/**', 'node'],
    ],
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
      'tests/ui/**/*.{test,spec}.{ts,tsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
