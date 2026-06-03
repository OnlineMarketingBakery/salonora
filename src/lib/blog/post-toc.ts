import type { Locale } from "@/lib/i18n/locales";
import type { PostTocItem } from "@/lib/blog/post-html";

const FAQ_TOC_COPY = {
  nl: "Veelgestelde vragen",
  en: "Frequently asked questions",
} as const;

export function appendBlogFaqTocItem(items: PostTocItem[], lang: Locale, includeFaq: boolean): PostTocItem[] {
  if (!includeFaq) return items;
  return [...items, { id: "post-faq", label: FAQ_TOC_COPY[lang], level: 2 }];
}
