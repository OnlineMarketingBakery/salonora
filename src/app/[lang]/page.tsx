import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/locales";
import { fetchGlobals } from "@/lib/wordpress/fetch-globals";
import { resolveHome } from "@/lib/wordpress/resolve-route";
import { PageTemplate } from "@/components/templates/PageTemplate";
import { seoToMetadata, getSiteName } from "@/lib/seo/map-yoast-to-metadata";
import { getSiteUrl } from "@/lib/wordpress/config";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import { supportedLocales } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ lang: string }> };

export default async function HomePage({ params }: P) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const globals = await fetchGlobals(lang);
  const resolved = await resolveHome(lang, globals);
  if (!resolved) notFound();
  const { document: doc } = resolved;
  return <PageTemplate document={doc} lang={lang} />;
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang: raw } = await params;
  if (!isLocale(raw)) return {};
  const lang = raw as Locale;
  const globals = await fetchGlobals(lang);
  const resolved = await resolveHome(lang, globals);
  if (!resolved) return { title: "Not found" };
  const s = resolved.document.seo;
  const site = getSiteUrl();
  const languages: Record<string, string> = {};
  for (const l of supportedLocales) {
    languages[l] = `${getSiteUrl()}${buildLocalePath(l, "")}`;
  }
  return {
    ...seoToMetadata(s, site),
    title: s.title || getSiteName(globals),
    alternates: { canonical: s.canonical || buildLocalePath(lang, ""), languages },
  };
}
