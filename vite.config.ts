import path from 'node:path';
import { defineConfig } from 'vite';

// The `@` alias is what shadcn/ui components (and `components.json`) expect.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@reduxjs/toolkit': path.resolve(
        __dirname,
        './node_modules/@reduxjs/toolkit/dist/cjs/index.js'
      ),
    },
  },
});
