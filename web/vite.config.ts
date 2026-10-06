import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Public build settings (PUBLIC_*) are read from the repository-level .env, shared with the original static site.
export default defineConfig({
  plugins: [react()],
  envDir: '..',
  envPrefix: 'PUBLIC_',
  server: { fs: { allow: ['..'] } },
  build: { assetsDir: 'static' },
  ssr: { noExternal: ['gsap', 'lenis', 'react-router-dom', 'react-router', '@remix-run/router'] },
});
