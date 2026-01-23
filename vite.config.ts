
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    hmr: {
      // Configuración necesaria para que el WebSocket de Vite funcione a través de proxies de Cloud Workstations
      protocol: 'wss',
      clientPort: 443,
    },
  },
});
