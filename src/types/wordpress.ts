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

export type WpEmbeddedAuthor = {
  id?: number;
  name?: string;
  slug?: string;
  url?: string;
  description?: string;
  avatar_urls?: Record<string, string | undefined>;
  /** Custom profile photo from user meta `omb_author_avatar_id` (omb-headless-core). */
  omb_author_avatar_url?: string;
  /** Added by omb-headless-core `rest_prepare_user` */
  omb_author_social?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  } | null;
};

/**
 * Author card attached directly to the post/case_study REST response by
 * omb-headless-core (`register_rest_field` → `author_card`). Primary author
 * source for headless clients, since the core `/wp/v2/users` endpoint is
 * locked down (no user enumeration) and `_embedded.author` cannot resolve.
 */
export type OmbAuthorCard = {
  id?: number;
  name?: string;
  avatar_url?: string;
  bio?: string;
  profile_url?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
};

export type WpPageRaw = {
  id: number;
  slug: string;
  /** WordPress user ID of the post author (REST); used when `_embedded.author` is missing. */
  author?: number;
  /** ISO8601 post/page date from REST */
  date?: string;
  /** Category term IDs (posts) */
  categories?: number[];
  /** Polylang: translation post IDs by language code (e.g. { en: 12, nl: 5 }) */
  translations?: Record<string, number> | null;
  link?: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  acf?: Record<string, unknown>;
  yoast_head_json?: WpYoastHeadJson;
  /** omb-headless-core: public author display fields on the post itself. */
  author_card?: OmbAuthorCard | null;
  _embedded?: {
    "wp:featuredmedia"?: { source_url: string; alt_text: string }[];
    author?: WpEmbeddedAuthor[];
  };
};

export type WpPostRaw = WpPageRaw & { type: "post" };

export type WpServiceRaw = WpPageRaw & { type: "service" };

export type WpCaseStudyRaw = WpPageRaw & { type?: string };

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
