import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Projekt-Pages unter https://<nutzername>.github.io/Fitness-App/ werden aus einem
// Unterpfad ausgeliefert, nicht von der Domainwurzel — daher der feste base-Pfad.
const BASE = '/Fitness-App/';

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.svg'],
      manifest: {
        name: 'Kraft & Mobility',
        short_name: 'Kraft&Mob',
        description: 'Radsportspezifische Kraft- und Mobility-Einheiten zusammenstellen, generieren und per Timer absolvieren.',
        theme_color: '#161826',
        background_color: '#161826',
        display: 'standalone',
        orientation: 'portrait-primary',
        // start_url/scope werden von vite-plugin-pwa aus `base` übernommen.
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Kein Offline-Betrieb gefordert; Precache nur für App-Shell (schnelleres Nachladen im WLAN).
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        navigateFallbackDenylist: [/^\/oauth2callback/]
      }
    })
  ],
  server: {
    host: true
  }
});
