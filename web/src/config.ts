// Public build-time settings. Blank values keep the honest "to be confirmed" placeholders.
const env = import.meta.env;
const value = (raw?: string) => (raw ?? '').trim();
const digits = (raw: string) => raw.replace(/\D/g, '');

const SOCIAL_HOSTS: Record<SocialPlatform, string[]> = {
  instagram: ['instagram.com', 'www.instagram.com'],
  facebook: ['facebook.com', 'www.facebook.com'],
  youtube: ['youtube.com', 'www.youtube.com', 'youtu.be'],
};

export type SocialPlatform = 'instagram' | 'facebook' | 'youtube';

// Only HTTPS links on each platform's own domain are accepted as official profiles.
const officialProfile = (platform: SocialPlatform, raw: string): string => {
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    return SOCIAL_HOSTS[platform].includes(url.hostname.toLowerCase()) ? url.href : '';
  } catch {
    return '';
  }
};

const whatsappDigits = digits(value(env.PUBLIC_WHATSAPP_NUMBER));
const email = value(env.PUBLIC_CONTACT_EMAIL);
const leadEndpoint = (() => {
  const raw = value(env.PUBLIC_LEAD_ENDPOINT);
  if (!raw) return '';
  try {
    const url = new URL(raw, 'https://spminteriorsdesign.com');
    return url.protocol === 'https:' || (url.hostname === 'localhost' && url.protocol === 'http:') ? url.href : '';
  } catch {
    return '';
  }
})();

export const config = {
  siteUrl: (value(env.PUBLIC_SITE_URL) || 'https://spminteriorsdesign.com').replace(/\/+$/, ''),
  raw: {
    whatsapp: value(env.PUBLIC_WHATSAPP_NUMBER),
    email,
    phone: value(env.PUBLIC_CONTACT_PHONE),
    office: value(env.PUBLIC_OFFICE_ADDRESS),
    instagram: value(env.PUBLIC_INSTAGRAM_URL),
    facebook: value(env.PUBLIC_FACEBOOK_URL),
    youtube: value(env.PUBLIC_YOUTUBE_URL),
    leadEndpoint: value(env.PUBLIC_LEAD_ENDPOINT),
  },
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '',
  phones: value(env.PUBLIC_CONTACT_PHONE).split(/[,;\n]+/).map((n) => n.trim()).filter((n) => {
    const count = digits(n).length;
    return count >= 7 && count <= 15;
  }),
  whatsappUrl: whatsappDigits.length >= 8 && whatsappDigits.length <= 15
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent('Hello SPM Interiors Design, I would like to discuss my interior project.')}`
    : '',
  office: value(env.PUBLIC_OFFICE_ADDRESS),
  social: {
    instagram: officialProfile('instagram', value(env.PUBLIC_INSTAGRAM_URL)),
    facebook: officialProfile('facebook', value(env.PUBLIC_FACEBOOK_URL)),
    youtube: officialProfile('youtube', value(env.PUBLIC_YOUTUBE_URL)),
  },
  leadEndpoint,
  stats: {
    verified: ['1', 'true', 'yes'].includes(value(env.PUBLIC_STATS_VERIFIED).toLowerCase()),
    homes: value(env.PUBLIC_HOMES_DESIGNED),
    years: value(env.PUBLIC_YEARS_EXPERIENCE),
    team: value(env.PUBLIC_DESIGN_TEAM),
    rating: value(env.PUBLIC_CLIENT_RATING),
  },
};

export const telHref = (number: string) => `tel:${digits(number)}`;
