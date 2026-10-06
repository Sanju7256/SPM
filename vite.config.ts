import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Public build settings (PUBLIC_*) come from .env or the hosting environment.
export default defineConfig({
  plugins: [react()],
  envPrefix: 'PUBLIC_',
  build: { assetsDir: 'static' },
  ssr: { noExternal: ['gsap', 'lenis', 'react-router-dom', 'react-router', '@remix-run/router'] },
});
