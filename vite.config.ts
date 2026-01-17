import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'out/webview',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/webview/index.html'),
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/webview/components'),
      '@services': resolve(__dirname, 'src/services'),
      '@consumers': resolve(__dirname, 'src/consumers'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@src': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  },
});
