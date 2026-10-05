# SPM Interiors Design — redesign plan

## Product structure

Rebuild the plain-local static site as a content-driven, provider-neutral editorial showroom. A readable Python generator will render semantic HTML from structured data in `content/site.json`; `styles.css` and `app.js` own the responsive presentation and progressive enhancement; `prepare_deploy.py` continues to add canonical/open-graph metadata, sitemap, robots and a custom 404 into `dist/`. Vercel-specific redirect and response headers stay isolated in `vercel.json`. The site remains static because no approved backend, CMS, business contact details or lead-processing service has been supplied.

Routes: Home, About, Services and twelve service detail pages, Projects and four clearly labelled concept-study details, Process, Journal and three article details, Contact, Consultation, Privacy and Terms. Every route has a real static HTML page. Content data remains separate from templates so ordinary copy/project/service updates do not require editing rendering logic.

## Design system

- **Design movement:** warm South Indian contemporary architecture presented as a premium design-journal editorial.
- **Core principles:** material honesty; dramatic but calm negative space; asymmetrical architectural composition; trust through verified information rather than invented claims.
- **Color philosophy:** warm ivory `#F6F2EA` and charcoal `#191919` establish clarity; warm beige `#D8CBB9` and stone gray `#8C877E` carry the material palette; terracotta `#A85D42` is a restrained, ownable accent. Avoid gold-heavy luxury cues.
- **Layout paradigm:** wide, magazine-like sections with staggered image/text relationships, full-bleed moments and variable gallery proportions—not an even card grid.
- **Signature elements:** a typographic stacked SPM wordmark; fine architectural rules and generous numbered section labels; a terracotta before/after divider and material-strip motif.
- **Interaction philosophy:** make exploration tactile and useful. Filters, accessible before/after sliders, service previews and process navigation must work with keyboard and touch; links remain ordinary links.
- **Animation:** short, low-distance reveals and image masks; restrained hover zoom; no looping heavy parallax. All motion is optional under `prefers-reduced-motion` and disabled for touch-only custom-cursor behavior.
- **Typography:** editorial display serif (Cormorant Garamond) paired with a legible modern sans (DM Sans); oversized display statements, measured body copy and crisp metadata labels.
- **Brand essence:** SPM Interiors Design creates thoughtful, functional interiors for South Indian homes, balancing architecture, material warmth and daily life. Personality: considered, confident, welcoming.
- **Brand voice:** concise and human, never inflated. Examples: “Your home. Your story. Our design.” “Every detail earns its place.”
- **Wordmark concept:** clean text-only lockup, large `SPM` above widely tracked `INTERIORS DESIGN`; no decorative symbol in the main logo.
- **Signature brand color:** terracotta `#A85D42` used sparingly for active states, rules and calls to action.

## Integrity and deployment constraints

Use only newly generated project photography in production. Treat project imagery as design concepts, not completed client work. Configured example statistics may be shown only with an explicit visible disclosure that they are illustrative, unverified placeholders; `PUBLIC_STATS_VERIFIED=true` is reserved for owner-confirmed figures. Testimonial slots remain plainly labelled placeholders rather than fake quotes/names/ratings. WhatsApp number, business phone/email, public form endpoint and `PUBLIC_SITE_URL` are environment configuration, never fabricated source constants. Hide unconfigured contact actions and report honestly when the form cannot transmit. Do not emit LocalBusiness/NAP structured data until the real address and contact details are confirmed; use Organization metadata only. No Vercel authorization or public deployment is implied by this redesign; preserve the existing custom-domain configuration and ask for production go-live confirmation separately.
