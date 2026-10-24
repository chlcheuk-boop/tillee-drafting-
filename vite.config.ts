import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: { assetsInlineLimit: 100_000, cssCodeSplit: false, modulePreload: false },
  test: { globals: true, environment: 'jsdom' },
});
