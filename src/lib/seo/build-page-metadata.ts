import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/locales";
import { buildAbsoluteCanonical } from "@/lib/i18n/get-alternates";
import { buildLocalePath } from "@/lib/i18n/locale-url";
import type { GlobalSettings } from "@/types/globals";
import type { SeoPayload } from "@/types/seo";
import { getSiteUrl } from "@/lib/wordpress/config";
import { buildMetadataLanguageAlternates } from "./build-metadata-alternates";
import { getSiteName, seoToMetadata } from "./map-yoast-to-metadata";

type BuildPageMetadataOpts = {
  lang: Locale;
  pathAfterLocale: string;
  seo: SeoPayload;
  globals: GlobalSettings;
  /** When > 1, canonical includes `?page=N`. */
  archivePage?: number;
  /** Internal search on archive pages — noindex. */
  archiveSearch?: string;
};

export async function buildPageMetadata(opts: BuildPageMetadataOpts): Promise<Metadata> {
  const { lang, pathAfterLocale, seo, globals, archivePage, archiveSearch } = opts;
  const site = getSiteUrl();
  const pathname = buildLocalePath(lang, pathAfterLocale);

  let selfCanonical = buildAbsoluteCanonical(lang, pathAfterLocale);
  if (archivePage && archivePage > 1) {
    selfCanonical += `?page=${archivePage}`;
  }

  const languages = await buildMetadataLanguageAlternates(pathname, pathAfterLocale);

  const searchNoindex = Boolean(archiveSearch?.trim());
  const mergedSeo: SeoPayload = searchNoindex ? { ...seo, noindex: true } : seo;

  const base = seoToMetadata(mergedSeo, site, {
    canonicalUrl: selfCanonical,
    lang,
  });

  const title = seo.title ? { absolute: seo.title } : getSiteName(globals);

  return {
    ...base,
    title,
    alternates: {
      canonical: selfCanonical,
      languages,
    },
  };
}
