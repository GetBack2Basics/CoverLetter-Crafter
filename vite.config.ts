import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const getPort = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 0 || parsed > 65535 ? fallback : parsed;
};

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const defaultPort = getPort(env.PORT, 3000);

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      host: env.HOST || '0.0.0.0',
      port: defaultPort,
    },
    preview: {
      host: env.PREVIEW_HOST || env.HOST || '0.0.0.0',
      port: getPort(env.PREVIEW_PORT, defaultPort),
    },
  };
});
