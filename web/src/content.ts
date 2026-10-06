// Single source of truth shared with the original static build and the local content editor.
import site from '../../content/site.json';

export interface Service {
  slug: string;
  title: string;
  category: string;
  audience?: string;
  short: string;
  intro: string;
  image: string;
  alt: string;
  includes: string[];
  faqs: [string, string][];
  chapters?: { id: string; title: string; copy: string }[];
  cta_label?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export interface Project {
  slug: string;
  name: string;
  category: string;
  typology: string;
  location: string;
  style: string;
  image: string;
  before_image: string;
  alt: string;
  description: string;
  materials: string[];
  rooms: string[];
}

export interface Article {
  slug: string;
  title: string;
  category: string;
  date: string;
  read_time: string;
  image: string;
  alt: string;
  excerpt: string;
  sections: [string, string][];
}

export const services = site.services as unknown as Service[];
export const projects = site.projects as unknown as Project[];
export const articles = site.articles as unknown as Article[];

export const audienceOf = (service: Service) => service.audience ?? 'residential';

// Production serves optimized WebP derivatives of every JPEG working file.
export const asset = (name: string) => `/assets/${name.replace(/\.jpe?g$/i, '.webp')}`;

/** React 18 has no typed fetchPriority prop; pass the plain HTML attribute for above-the-fold images. */
export const highPriority = { fetchpriority: 'high' } as Record<string, string>;
