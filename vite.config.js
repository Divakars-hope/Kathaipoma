import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'robots.txt', 'icons/apple-touch-icon.png'],
            manifest: {
                name: "AUREVA — Women's Health AI",
                short_name: 'AUREVA',
                description: "Private, anonymous women's health awareness and preliminary screening companion. No login required.",
                theme_color: '#F8BBD9',
                background_color: '#FFFFFF',
                display: 'standalone',
                start_url: '/',
                icons: [
                    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                    { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
                ]
            },
            workbox: {
                // Cache the app shell so screenings still load with a flaky rural connection.
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
            }
        })
    ],
    server: {
        port: 5173
    }
});
