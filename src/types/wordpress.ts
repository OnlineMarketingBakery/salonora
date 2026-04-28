import type { Locale } from "@/lib/i18n/locales";

export type WpAcfLink = {
  title?: string;
  url: string;
  target?: string;
};

export type WpImage = {
  ID?: number;
  id?: number;
  url: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  sizes?: Record<string, string | { url: string }>;
};

export type WpPageRaw = {
  id: number;
  slug: string;
  /** Polylang: translation post IDs by language code (e.g. { en: 12, nl: 5 }) */
  translations?: Record<string, number> | null;
  link?: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  acf?: Record<string, unknown>;
  yoast_head_json?: WpYoastHeadJson;
  _embedded?: { "wp:featuredmedia"?: { source_url: string; alt_text: string }[] };
};

export type WpPostRaw = WpPageRaw & { type: "post" };

export type WpServiceRaw = WpPageRaw & { type: "service" };

export type WpTestimonialRaw = {
  id: number;
  title: { rendered: string };
  acf?: {
    client_name?: string;
    client_role?: string;
    client_testimonial?: string;
    rating?: number | string;
    /** Image array, attachment-shaped object, media ID, or URL string depending on REST/ACF format */
    avatar?: unknown;
  };
};

export type WpYoastHeadJson = {
  title?: string;
  description?: string;
  canonical?: string;
  og_title?: string;
  og_description?: string;
  og_url?: string;
  og_image?: { url: string; width?: number; height?: number }[];
  twitter_title?: string;
  twitter_description?: string;
  robots?: { index: string; follow: string };
  schema?: unknown;
};

export type WpMenuItemRaw = {
  id: number;
  title: { rendered: string };
  url: string;
  menu_order: number;
  parent: number;
  type: string;
  object: string;
  object_id: number;
  classes: string[];
  target: string;
  attr_title: string;
  description: string;
};

export type WpMenuLocationItem = { id: number; name: string; slug: string };

export type WpMenuResponse = { id: number; name: string; slug: string }[];

export type WpCptItem = { id: number; slug: string; title: { rendered: string } };

export type FetchContext = { lang: Locale };
