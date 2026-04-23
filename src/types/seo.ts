import type { Locale } from "@/lib/i18n/locales";

export type SeoPayload = {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  alternates?: Record<Locale, string>;
};
