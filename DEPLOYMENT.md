# SPM Interiors Design — deployment checklist

## Build and output

The application is a React site that is prerendered to provider-neutral static HTML. Set the public origin in `.env` or the hosting build environment, then run:

```bash
test -f .env || cp .env.example .env
# Set confirmed values in .env or in the hosting build environment; keep secrets out of the repository.
npm install
npm run build
python3 validate_site.py   # optional production checks
```

The production artifact is `dist/`. The build copies the optimized WebP/SVG/MP4 files from `assets/` and renders every route from `content/site.json` to its own HTML file. It writes canonical URLs, Open Graph/Twitter image metadata, homepage Organization JSON-LD, `sitemap.xml`, `robots.txt` and `404.html`. Hashed JavaScript and CSS bundles go to `dist/static/`. All site navigation and asset paths are root-relative. The only domain-derived URLs are generated from `PUBLIC_SITE_URL` at build time.

If you replace generated photography, run `python3 prepare_assets.py` first. It needs Pillow and regenerates the WebP derivatives in `assets/`.

The homepage also serves the supplied `assets/interiorsvideo.mp4` unchanged and generates an optimized WebP poster for it. The native player is inline, controlled by the visitor, and does not autoplay; the page labels the footage as sample media rather than verified completed SPM work.

## Vercel project settings

- Framework preset: **Other** (static output). `vercel.json` sets the build command and output.
- Build command: **`npm run build`** (Node 18 or newer).
- Output directory: **`dist`**.
- Keep the custom `vercel.json` rules isolated from application code. It applies a permanent, exact-host `www.spminteriorsdesign.com` → `spminteriorsdesign.com` redirect and security/cache headers; preview hostnames are not redirected.
- Configure `PUBLIC_SITE_URL=https://spminteriorsdesign.com` in the Vercel project's build environment before each production build.

No Vercel account connection or deployment has been made from this workspace. Connect/import the project in the owner's Vercel account, review a preview deployment, and confirm the exact release before making it public.

## Custom domain, HTTPS and DNS

The requested canonical host is the apex `spminteriorsdesign.com`. Add both the apex and `www.spminteriorsdesign.com` to the Vercel project only when the owner confirms the domain is available and under their control. Set apex as the primary domain; the repository redirect then sends `www` to non-`www`.

Vercel shows project-specific DNS records under the project's Domains settings. Use those exact values at the registrar. Do not substitute generic A/CNAME records, change nameservers, or alter existing email MX/TXT records without the owner's direction. Vercel may require TXT ownership verification if the domain is associated with another account. **No domain is purchased and no DNS is changed by this build.**

Vercel automatically attempts to issue and renew managed HTTPS certificates after the domain is assigned and DNS validation succeeds. Confirm both apex and `www` HTTPS behavior after DNS propagation.

## SEO and technical outputs

- Unique title and meta description per route; homepage and relevant service pages target the user-specified Bangalore / South India search intent.
- Canonical and Open Graph/Twitter URLs derive from `PUBLIC_SITE_URL`; generated hero photography is used for social previews.
- `sitemap.xml`, `robots.txt`, branded SVG favicon and static `404.html` are included in `dist/`.
- Homepage structured data is `Organization` only. LocalBusiness/NAP markup is intentionally withheld until the real business address and public contact channels are verified.
- Responsive layouts, touch/keyboard-operated before/after comparisons, project filters, reduced-motion support and native form validation are included.

## Required owner configuration before advertising the site

1. The currently supplied public details are in the local ignored build configuration: two call numbers, the studio email, Chandapur, Bangalore-560099, WhatsApp on the first number and the Instagram profile. Configure the corresponding `PUBLIC_CONTACT_PHONE`, `PUBLIC_CONTACT_EMAIL`, `PUBLIC_OFFICE_ADDRESS`, `PUBLIC_WHATSAPP_NUMBER` and `PUBLIC_INSTAGRAM_URL` values in the hosting build environment when rebuilding. `PUBLIC_CONTACT_PHONE` accepts comma-separated numbers and renders separate tap-to-call links.
2. Select and implement a secure lead-processing endpoint, then set `PUBLIC_LEAD_ENDPOINT`. The endpoint must accept JSON POST requests from the production origin, validate input, rate-limit abuse, handle spam protection and store/notify securely. Any API keys or mail-provider secrets belong on the server side—not in these public values or browser source. Without the endpoint, the website explicitly says the enquiry was **not** sent.
3. The current example figures (500+ homes, 3+ years, 7+ professionals and 4.9/5) are **illustrative placeholders, not verified SPM data**. Their on-page disclosure remains visible while `PUBLIC_STATS_VERIFIED=false`. Set `PUBLIC_STATS_VERIFIED=true` only after SPM confirms all figures; the build then changes the disclosure to say the figures were supplied and approved by SPM. Blank metric settings show an explicit pending value.
4. Replace the three visibly marked testimonial slots with approved client statements and permission; verify any live project names, location, size, photography and scope before removing concept labels.
5. Confirm the actual business address and legal/privacy text. The current policy/terms pages are sample copy, not legal advice. No map pin or office address is fabricated.
6. For local copy updates, serve the project root and open `tools/content-editor.html`; it exports revised `content/site.json` from form controls without requiring JSON editing. This is a local file editor, not a hosted or authenticated admin. A live login-based CMS, image upload, team directory, testimonial manager or lead inbox requires a separately selected and secured CMS/backend.
7. Review the public preview on desktop and mobile, test form delivery and accessibility, verify `robots.txt`, sitemap and redirects, then deploy from the owner's Vercel account.

## Official Vercel references

- [Add and configure a custom domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain) — use the exact DNS values shown for this project and preserve existing mail records.
- [Vercel SSL certificates](https://vercel.com/docs/domains/working-with-ssl) — managed HTTPS issuance follows successful domain and DNS validation.
- [Redirects](https://vercel.com/docs/routing/redirects) — permanent redirects can be configured in `vercel.json` and scoped to exact hosts.
- [Static project configuration](https://vercel.com/docs/project-configuration/vercel-json) and [build output](https://vercel.com/docs/builds/configure-a-build) — the configured `dist/` directory is the static output.
- [Custom 404 page](https://vercel.com/kb/guide/custom-404-page) — Vercel serves `404.html` for unmatched static routes.
