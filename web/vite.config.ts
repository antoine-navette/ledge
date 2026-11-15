import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        // Internal port: Docker maps it to WEB_PORT on the host, so there is no reason to change it
        port: 5173,
        // Fails instead of silently switching to another port, which the Docker mapping wouldn't reach
        strictPort: true,
        // The API is only reachable inside Docker: the browser always talks to the web origin
        proxy: {
            '/api': {
                target: 'http://api:3000',
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
});
