# SPM Interiors Design

A responsive, provider-neutral static website for a warm, editorial South Indian interior-design brand. The site uses a text-only **SPM / INTERIORS DESIGN** wordmark and original project-specific AI-generated interior concepts; no RAK Interiors copy, layout or imagery is reused.

## Local preview

```bash
python3 build_site.py
python3 -m http.server 4173
```

Open `http://localhost:4173/`. The site is static HTML/CSS/JavaScript and has no runtime backend. The `content/site.json` file holds the service catalog, illustrative design studies and journal articles separately from the page-rendering code.

## Production build

```bash
test -f .env || cp .env.example .env
# Set or verify the public environment values before building.
PUBLIC_SITE_URL=https://spminteriorsdesign.com python3 prepare_deploy.py
```

The build optimizes the generated image assets, renders every route, and creates `dist/` with per-page canonicals and Open Graph metadata, homepage Organization JSON-LD, sitemap, robots file, a branded 404 page, favicon, CSS, JavaScript and production assets. The twelve-service catalog separates Residential and Commercial work, with dedicated commercial-interiors, office-furniture and space-saving pages. The canonical origin is read from `PUBLIC_SITE_URL`; the application uses root-relative links and does not repeat a Vercel hostname.

## Sample video

The homepage includes the supplied 32.7-second interior walkthrough at `assets/interiorsvideo.mp4`, served without re-encoding. It has an optimized WebP poster, inline native controls, metadata-only preload and no autoplay. It is clearly labelled as sample media rather than a verified completed SPM project. The original audio is preserved; automatic transcription detected no speech, so no subtitle track was added.

## Content and images

For visual copy updates without editing source code, serve the project root and open `http://localhost:4173/tools/content-editor.html`. The local editor loads `content/site.json`, provides fields for services, project concepts and journal articles, and exports an updated JSON file. Replace `content/site.json` with that export and rebuild. It does not publish, upload images, or administer the live site; there is no login or database. Contacts and metrics remain build-environment settings.

Replace concept studies with verified SPM work only after the studio supplies approved photography and descriptions. Original generated source images are preserved under `assets/generated-source/`; optimized JPEG working files and production WebP derivatives are in `assets/`. `prepare_assets.py` is repeatable and keeps the high-resolution originals out of the deploy payload. Approved images can be added to `assets/` and referenced by filename in the editor.

## Configuration that must be supplied before launch

- The currently supplied phone numbers, email, WhatsApp number, Chandapur Bangalore address and Instagram profile are in the ignored local `.env`; configure their public variables in the Vercel build environment. Blank contact values remain pending and unconfigured social profiles are not linked.
- A secure HTTPS `PUBLIC_LEAD_ENDPOINT` that accepts the site's JSON POST, validates fields and origin, rate-limits spam and handles data under a proper privacy policy. Without it, the form tells visitors that nothing was sent or stored.
- The current figures (500+ homes, 3+ years, 7+ professionals and 4.9/5) are illustrative placeholders, explicitly disclosed as not verified SPM data. Keep `PUBLIC_STATS_VERIFIED=false`; set it to `true` only after SPM verifies all figures. Blank values display a pending marker.
- Approved client testimonials, completed project details, business address and legal/privacy copy. Until supplied, the site keeps testimonials visibly marked as placeholders, labels portfolio imagery as illustrative concepts, and does not emit LocalBusiness address/contact structured data.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the Vercel project settings, custom-domain, redirect and HTTPS checklist. No deployment, domain purchase, DNS edit or account connection is performed by this local build.
