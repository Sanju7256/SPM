// Renders every route to static HTML with per-page SEO metadata, then writes sitemap.xml, robots.txt and 404.html.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, '../dist');
const serverDir = resolve(here, '../dist-server');
const template = readFileSync(join(dist, 'index.html'), 'utf-8');
const { render, allRoutes, getMeta, NOT_FOUND_META, config } = await import(pathToFileURL(join(serverDir, 'entry-server.js')).href);

const siteUrl = config.siteUrl;
if (!/^https:\/\/[^/]+$/.test(siteUrl)) throw new Error(`PUBLIC_SITE_URL must be an HTTPS origin, got "${siteUrl}"`);

const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ogImage = `${siteUrl}/assets/spm-hero-bangalore.webp`;

const organizationSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SPM Interiors Design',
    url: siteUrl,
    logo: `${siteUrl}/assets/mark.svg`,
    description: 'Thoughtful home interior design for Bangalore and South India.',
  };
  return `<script type="application/ld+json">${JSON.stringify(schema).replace(/<\//g, '<\\/')}</script>`;
};

const head = (route, meta) => {
  const canonical = route ? `${siteUrl}${route}` : '';
  const contactMeta = {
    'spm-whatsapp': config.raw.whatsapp,
    'spm-contact-email': config.raw.email,
    'spm-contact-phone': config.raw.phone,
    'spm-office-address': config.raw.office,
    'spm-instagram-url': config.raw.instagram,
    'spm-facebook-url': config.raw.facebook,
    'spm-youtube-url': config.raw.youtube,
    'spm-lead-endpoint': config.raw.leadEndpoint,
  };
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    meta.keywords ? `<meta name="keywords" content="${esc(meta.keywords)}">` : '',
    meta.noindex ? '<meta name="robots" content="noindex,follow">' : '',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="SPM Interiors Design">',
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    canonical ? `<link rel="canonical" href="${esc(canonical)}">` : '',
    canonical ? `<meta property="og:url" content="${esc(canonical)}">` : '',
    `<meta property="og:image" content="${esc(ogImage)}">`,
    '<meta property="og:image:alt" content="Warm contemporary South Indian home interior concept by SPM Interiors Design">',
    '<meta property="og:image:type" content="image/webp">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(meta.title)}">`,
    `<meta name="twitter:description" content="${esc(meta.description)}">`,
    `<meta name="twitter:image" content="${esc(ogImage)}">`,
    ...Object.entries(contactMeta).map(([name, value]) => `<meta name="${name}" content="${esc(value)}">`),
    route === '/' ? organizationSchema() : '',
  ].filter(Boolean).join('\n  ');
};

const page = (url, route, meta) => template
  .replace('<!--app-head-->', head(route, meta))
  .replace('<!--app-html-->', render(url));

const routes = allRoutes();
for (const route of routes) {
  const target = join(dist, route, 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, page(route, route, getMeta(route)));
}
writeFileSync(join(dist, '404.html'), page('/404/', null, NOT_FOUND_META));

const entries = routes.map((route) => `  <url><loc>${esc(siteUrl + route)}</loc></url>`).join('\n');
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`);
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
writeFileSync(join(dist, '.nojekyll'), '');
if (existsSync(serverDir)) rmSync(serverDir, { recursive: true, force: true });
console.log(`Prerendered ${routes.length} routes plus 404.html for ${siteUrl}`);
