import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/orders': 'http://localhost:3001',
      '/api/products': 'http://localhost:3001',
      '/api/customers': 'http://localhost:3001',
      '/api/approvals': 'http://localhost:3002',
      '/api/ai': 'http://localhost:3002',
      '/api/notifications': 'http://localhost:3003',
    },
  },
});
