import type { Locale } from "@/lib/i18n/locales";

export type SeoPayload = {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  /** Yoast `@graph` schema from `yoast_head_json.schema`. */
  schema?: unknown;
  alternates?: Record<Locale, string>;
};
