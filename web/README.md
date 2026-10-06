# SPM Interiors Design — React site

React 18 + TypeScript + Vite version of the SPM Interiors Design website. Each route is prerendered to static HTML at build time, so every page keeps its own title, meta description, canonical URL and Open Graph tags. After load, the page hydrates into a React app with client-side navigation, GSAP/ScrollTrigger scroll motion and Lenis smooth scrolling.

## Shared with the original static site

- **Content:** `../content/site.json` (services, project concepts, journal articles). The local content editor in `../tools/` still works.
- **Settings:** `PUBLIC_*` values from the repository-level `../.env` or the hosting environment. See `../.env.example`.
- **Images and video:** `../assets/`. `npm run copy-assets` copies the production WebP/SVG/MP4 files into `public/assets/`, which is gitignored.

## Commands

```bash
npm install
npm run dev        # local dev server at http://localhost:5173
npm run build      # typecheck, client + SSR build, prerender 29 routes + 404, sitemap, robots
npm run preview    # serve dist/ at http://localhost:4173
```

To check the build with the repository's production validator, run this from the repo root:

```bash
SITE_DIST=web/dist python validate_site.py
```

## Structure

- `src/pages/`: one component per route (home, about, services, projects, process, journal, contact, consultation, legal, 404).
- `src/components/`: layout (header, mobile menu, footer, WhatsApp button), cards, comparison slider, stats, process steps and the enquiry form.
- `src/motion.ts`: GSAP scroll animations. It only animates transforms, opacity and styles, never moves React-owned DOM nodes, and reverts its animations on every route change.
- `src/seo.ts`: route list and per-page metadata. `scripts/prerender.mjs` uses it.

## Deploying on Vercel

Set the project **Root Directory** to `web`. Keep "Include source files outside of the Root Directory" enabled, because the build reads `../content` and `../assets`. `web/vercel.json` sets the build command, the `dist` output, trailing slashes, the www→apex redirect and the security headers. Configure the same `PUBLIC_*` environment variables as before.
