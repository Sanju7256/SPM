/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_WHATSAPP_NUMBER?: string;
  readonly PUBLIC_CONTACT_EMAIL?: string;
  readonly PUBLIC_CONTACT_PHONE?: string;
  readonly PUBLIC_OFFICE_ADDRESS?: string;
  readonly PUBLIC_INSTAGRAM_URL?: string;
  readonly PUBLIC_FACEBOOK_URL?: string;
  readonly PUBLIC_YOUTUBE_URL?: string;
  readonly PUBLIC_LEAD_ENDPOINT?: string;
  readonly PUBLIC_HOMES_DESIGNED?: string;
  readonly PUBLIC_YEARS_EXPERIENCE?: string;
  readonly PUBLIC_DESIGN_TEAM?: string;
  readonly PUBLIC_CLIENT_RATING?: string;
  readonly PUBLIC_STATS_VERIFIED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
