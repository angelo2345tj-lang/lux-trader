import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const geminiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';
  const twelveKey = env.VITE_TWELVE_DATA_KEY || env.TWELVE_DATA_KEY || '';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY || 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
        '/health': {
          target: env.VITE_API_PROXY || 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(geminiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
      'process.env.TWELVE_DATA_KEY': JSON.stringify(twelveKey),
      'process.env.VITE_TWELVE_DATA_KEY': JSON.stringify(twelveKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
