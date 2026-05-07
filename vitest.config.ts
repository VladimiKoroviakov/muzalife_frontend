/**
 * @fileoverview Vitest configuration for MuzaLife Frontend.
 *
 * Test suites:
 *  - `docs`  — living-documentation tests in src/tests/docs/
 *  - `unit`  — component and hook unit tests in src/tests/unit/
 *
 * Run all:       npm test
 * Run docs:      npm run test:docs
 * Coverage:      npm run test:coverage
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',

    include: ['src/tests/**/*.test.{ts,tsx}'],

    reporters: process.env.CI ? ['verbose', 'junit'] : ['verbose'],

    outputFile: {
      junit: './docs/test-results/junit.xml',
    },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './docs/coverage',
      include: ['src/utils/**', 'src/services/**', 'src/hooks/**'],
      exclude: ['node_modules/**', 'src/tests/**', 'docs/**'],
      thresholds: {
        statements: 90,
        functions: 90,
        lines: 90,
        branches: 80,
      },
    },
  },
});
