# SPM Interiors Design

Website for a warm, editorial South Indian interior-design studio, built with React 18, TypeScript and Vite. Every route is prerendered to static HTML at build time, so each page ships with its own title, description, canonical URL and Open Graph tags. After load, the page hydrates into a React app with client-side navigation, GSAP/ScrollTrigger scroll motion and Lenis smooth scrolling. Motion is skipped for visitors who prefer reduced motion.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck, client + SSR build, prerender 29 routes + 404, sitemap, robots → dist/
npm run preview    # serve dist/ at http://localhost:4173
python3 validate_site.py   # production checks against dist/
```

Build settings come from `.env` (copy `.env.example`) or the hosting environment. Only `PUBLIC_*` values are read, and all of them are public by design.

## Project structure

- `content/site.json`: services, illustrative project studies and journal articles.
- `assets/`: optimized images and the sample video. `npm run copy-assets` (run automatically by `dev` and `build`) copies the production WebP/SVG/MP4 files into `public/assets/`, which is gitignored.
- `src/pages/`: one component per route (home, about, services, projects, process, journal, contact, consultation, legal, 404).
- `src/components/`: layout (header, mobile menu, footer, WhatsApp button), cards, comparison slider, stats, process steps and the enquiry form.
- `src/motion.ts`: scroll animations. It only animates transforms, opacity and styles, never moves React-owned DOM nodes, and reverts its animations on every route change.
- `src/seo.ts`: route list and per-page metadata. `scripts/prerender.mjs` uses it.
- `tools/content-editor.html`: local form-based editor for `content/site.json`. Run `npm run dev` and open `/tools/content-editor.html`, export the updated JSON, replace `content/site.json` and rebuild. It does not publish anything and has no login or database.
- `prepare_assets.py`: regenerates the WebP derivatives when photography changes. It needs Pillow, and its high-resolution originals live in `assets/generated-source/`.

## Sample video

The homepage includes the supplied 32.7-second interior walkthrough (`assets/interiorsvideo.mp4`), served without re-encoding, with a WebP poster, native controls, metadata-only preload and no autoplay. It is labelled as sample media rather than a verified completed SPM project.

## Configuration that must be supplied before launch

- **Contact details:** phone numbers, email, WhatsApp number, office address and Instagram profile come from the `PUBLIC_*` variables; configure them in the Vercel build environment. Blank values show a "to be confirmed" note, and unconfigured social profiles are not linked. Only HTTPS links on each platform's own domain are accepted.
- **Lead endpoint:** a secure HTTPS `PUBLIC_LEAD_ENDPOINT` that accepts the form's JSON POST, validates fields and origin, rate-limits spam and handles data under a proper privacy policy. Without it, the form tells visitors that nothing was sent or stored.
- **Trust figures:** the current figures (500+ homes, 3+ years, 7+ professionals, 4.9/5) are illustrative placeholders and are disclosed as unverified on the page. Keep `PUBLIC_STATS_VERIFIED=false` until SPM confirms every figure.
- **Approvals still needed:** client testimonials, completed project details and photography, the business address and legal/privacy copy. Until these are supplied, testimonials stay marked as placeholders, portfolio imagery stays labelled as illustrative concepts, and no LocalBusiness structured data is emitted.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the Vercel settings, custom domain, redirect and HTTPS checklist.
