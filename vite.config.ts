import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/manutencao_carro/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'pwa-192.svg', 'pwa-512.svg'],
      manifest: {
        name: 'Carango Véio',
        short_name: 'Carango',
        description: 'Histórico técnico e agenda de manutenção do Sandero.',
        start_url: '/manutencao_carro/#/',
        scope: '/manutencao_carro/',
        display: 'standalone',
        theme_color: '#151a20',
        background_color: '#f3f0e9',
        icons: [
          { src: 'pwa-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'pwa-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: { navigateFallback: 'index.html', runtimeCaching: [] }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase'))
            return 'firebase';
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler'))
            return 'react-vendor';
          if (id.includes('node_modules/lucide-react')) return 'icons';
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
    coverage: { reporter: ['text', 'html'] }
  }
});
