import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './chrome-extension/manifest.json' assert { type: 'json' };

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: 'chrome-extension',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        help: resolve(__dirname, 'chrome-extension/help.html'),
      }
    }
  },
  plugins: [crx({ manifest })],
});
