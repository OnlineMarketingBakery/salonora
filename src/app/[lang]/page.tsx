import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/locales";
import { fetchGlobals } from "@/lib/wordpress/fetch-globals";
import { resolveHome } from "@/lib/wordpress/resolve-route";
import { PageTemplate } from "@/components/templates/PageTemplate";
import { YoastJsonLd } from "@/components/seo/YoastJsonLd";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

/** ISR: reuse cached WordPress fetches between visitors (revalidate on-demand via /api/revalidate). */
export const revalidate = 60;

type P = { params: Promise<{ lang: string }> };

export default async function HomePage({ params }: P) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const globals = await fetchGlobals(lang);
  const resolved = await resolveHome(lang, globals);
  if (!resolved) notFound();
  const { document: doc } = resolved;
  return (
    <>
      <YoastJsonLd schema={doc.seo.schema} />
      <PageTemplate document={doc} lang={lang} />
    </>
  );
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang: raw } = await params;
  if (!isLocale(raw)) return {};
  const lang = raw as Locale;
  const globals = await fetchGlobals(lang);
  const resolved = await resolveHome(lang, globals);
  if (!resolved) return { title: "Not found" };
  return buildPageMetadata({
    lang,
    pathAfterLocale: "",
    seo: resolved.document.seo,
    globals,
  });
}
