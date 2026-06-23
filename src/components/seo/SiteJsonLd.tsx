import { getImageUrl } from "@/lib/utils/media";
import type { GlobalSettings } from "@/types/globals";
import type { Locale } from "@/lib/i18n/locales";
import { buildLocalePath } from "@/lib/i18n/locale-url";
import { getSiteUrl } from "@/lib/wordpress/config";
import { getSiteName } from "@/lib/seo/map-yoast-to-metadata";

type Props = {
  globals: GlobalSettings;
  lang: Locale;
};

/** Site-wide Organization + WebSite structured data. */
export function SiteJsonLd({ globals, lang }: Props) {
  const site = getSiteUrl().replace(/\/$/, "");
  const name = getSiteName(globals);
  const logo =
    getImageUrl(globals.header.headerLogo) ||
    getImageUrl(globals.site.defaultOgImage) ||
    getImageUrl(globals.defaultSeo.defaultShareImage);
  const homeUrl = `${site}${buildLocalePath(lang, "")}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site}/#organization`,
        name,
        url: site,
        logo: logo ? { "@type": "ImageObject", url: logo } : undefined,
        email: globals.contact.mainEmail || undefined,
        sameAs: [
          globals.contact.linkedinUrl,
          globals.contact.instagramUrl,
          globals.contact.facebookUrl,
          globals.contact.youtubeUrl,
        ].filter(Boolean),
      },
      {
        "@type": "WebSite",
        "@id": `${site}/#website`,
        url: site,
        name,
        publisher: { "@id": `${site}/#organization` },
        inLanguage: lang === "nl" ? "nl-NL" : "en-GB",
        potentialAction: {
          "@type": "SearchAction",
          target: `${homeUrl}?s={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
