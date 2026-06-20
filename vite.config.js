import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        app: './index.html'
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'styles.css';
          }
          return '[name].[ext]';
        },
        chunkFileNames: '[name].js',
      }
    }
  }
});
