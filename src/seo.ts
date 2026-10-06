import { articles, projects, services } from './content';

export interface PageMeta {
  title: string;
  description: string;
  keywords: string;
  noindex?: boolean;
}

const DEFAULT_KEYWORDS = 'interior designers in Bangalore, home interiors Bangalore, South Indian interior design';

const STATIC_META: Record<string, PageMeta> = {
  '/': {
    title: 'Interior Designers in Bangalore | SPM Interiors Design',
    description: 'SPM Interiors Design creates thoughtful home interiors in Bangalore and South India. Explore home design services, original concept studies and a considered design process.',
    keywords: 'interior designers in Bangalore, home interiors Bangalore, interior design South India, home interior design, modular kitchen design, bedroom interiors',
  },
  '/about/': {
    title: 'About SPM Interiors Design | Home Design Studio in Bangalore',
    description: 'Meet SPM Interiors Design, a thoughtful home-interior design studio focused on function, material warmth and daily life in Bangalore and South India.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/services/': {
    title: 'Interior Design Services in Bangalore | Residential & Commercial | SPM Interiors Design',
    description: 'Explore residential and commercial interior design in Bangalore: complete homes, kitchens, compact spaces, workplaces, office furniture, retail, cafés and restaurants.',
    keywords: 'residential interior design Bangalore, commercial interior designers Bangalore, office furniture, space-saving interiors',
  },
  '/projects/': {
    title: 'Interior Design Projects & Concepts | SPM Interiors Design',
    description: 'Browse original whole-home, kitchen, bedroom and living-room design concepts by SPM Interiors Design. Illustrative imagery is clearly labelled.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/process/': {
    title: 'Interior Design Process | SPM Interiors Design Bangalore',
    description: 'Learn about the SPM Interiors Design journey: discovery, site understanding, concept development, material refinement, coordination and handover.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/journal/': {
    title: 'Interior Design Journal | SPM Interiors Design',
    description: 'Read SPM Interiors Design notes on home planning, materials, lighting and thoughtful interiors for South Indian homes.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/contact/': {
    title: 'Contact SPM Interiors Design | Bangalore Home Interiors',
    description: 'Contact SPM Interiors Design about home interior design in Bangalore and South India. Share your project details through the enquiry form.',
    keywords: 'contact interior designers Bangalore, home interiors contact, SPM Interiors Design',
  },
  '/consultation/': {
    title: 'Book an Interior Design Consultation | SPM Interiors Design',
    description: 'Request a home interior design consultation with SPM Interiors Design in Bangalore. Share your location, home type, budget and preferred style.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/privacy/': {
    title: 'Privacy Notice | SPM Interiors Design',
    description: 'Read the privacy notice for the SPM Interiors Design website.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/terms/': {
    title: 'Terms & Conditions | SPM Interiors Design',
    description: 'Read the terms & conditions for the SPM Interiors Design website.',
    keywords: DEFAULT_KEYWORDS,
  },
};

export const NOT_FOUND_META: PageMeta = {
  title: 'Page not found | SPM Interiors Design',
  description: 'The page could not be found. Explore SPM Interiors Design.',
  keywords: DEFAULT_KEYWORDS,
  noindex: true,
};

/** Every indexable route, in sitemap order. */
export const allRoutes = (): string[] => [
  '/', '/about/', '/services/', ...services.map((s) => `/services/${s.slug}/`),
  '/projects/', ...projects.map((p) => `/projects/${p.slug}/`), '/process/',
  '/journal/', ...articles.map((a) => `/journal/${a.slug}/`),
  '/contact/', '/consultation/', '/privacy/', '/terms/',
];

export const normalizePath = (pathname: string) => {
  const clean = pathname.replace(/index\.html$/, '');
  return clean.endsWith('/') ? clean : `${clean}/`;
};

export const getMeta = (pathname: string): PageMeta => {
  const path = normalizePath(pathname);
  if (STATIC_META[path]) return STATIC_META[path];
  const [, section, slug] = path.split('/');
  if (section === 'services') {
    const item = services.find((s) => s.slug === slug);
    if (item) {
      return {
        title: item.seo_title ?? `${item.title} | SPM Interiors Design Bangalore`,
        description: item.seo_description ?? `Explore ${item.title.toLowerCase()} with SPM Interiors Design. Thoughtful interior planning shaped around your needs in Bangalore and South India.`,
        keywords: item.seo_keywords ?? '',
      };
    }
  }
  if (section === 'projects') {
    const item = projects.find((p) => p.slug === slug);
    if (item) {
      return {
        title: `${item.name} — Interior Design Concept | SPM Interiors Design`,
        description: `Explore ${item.name}, an illustrative ${item.typology.toLowerCase()} by SPM Interiors Design. Original concept imagery, materials and design notes.`,
        keywords: DEFAULT_KEYWORDS,
      };
    }
  }
  if (section === 'journal') {
    const item = articles.find((a) => a.slug === slug);
    if (item) {
      return {
        title: `${item.title} | SPM Interiors Design Journal`,
        description: item.excerpt,
        keywords: `${item.category}, South Indian interior design, home interiors Bangalore`,
      };
    }
  }
  return NOT_FOUND_META;
};
