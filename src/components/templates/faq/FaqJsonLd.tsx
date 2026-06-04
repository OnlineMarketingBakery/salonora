import { stripHtmlToText } from "@/lib/legal/parse-legal-html";
import type { FaqEntry } from "@/lib/legal/faq-items";
import type { Locale } from "@/lib/i18n/locales";
import { getSiteUrl } from "@/lib/wordpress/config";
import { getFaqUrlSlug } from "@/lib/legal/faq-slugs";

export function FaqJsonLd({ items, lang, pageTitle }: { items: FaqEntry[]; lang: Locale; pageTitle: string }) {
  const site = getSiteUrl();
  const pageUrl = `${site}/${lang}/${getFaqUrlSlug(lang)}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    url: pageUrl,
    name: pageTitle,
    inLanguage: lang === "nl" ? "nl-NL" : "en",
    mainEntity: items.map((it, index) => ({
      "@type": "Question",
      "@id": `${pageUrl}#faq-${it.id || index}`,
      name: it.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripHtmlToText(it.answer),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
