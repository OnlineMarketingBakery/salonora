import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, supportedLocales } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/locales";
import { fetchGlobals } from "@/lib/wordpress/fetch-globals";
import { archiveQueryFromSearchParams } from "@/lib/wordpress/archive-search-params";
import { resolveRoute } from "@/lib/wordpress/resolve-route";
import { PageTemplate } from "@/components/templates/PageTemplate";
import { ServiceTemplate } from "@/components/templates/ServiceTemplate";
import { PostTemplate } from "@/components/templates/PostTemplate";
import { CaseStudyTemplate } from "@/components/templates/CaseStudyTemplate";
import { seoToMetadata, getSiteName } from "@/lib/seo/map-yoast-to-metadata";
import { getSiteUrl } from "@/lib/wordpress/config";
import { buildLocalePath } from "@/lib/i18n/get-alternates";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ lang: string; slug: string[] }> };

export default async function CatchAllPage({
  params,
  searchParams,
}: P & { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const { lang: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const globals = await fetchGlobals(lang);
  const sp = searchParams ? await searchParams : {};
  const aq = archiveQueryFromSearchParams(sp);
  const resolved = await resolveRoute(lang, slug, globals, { blog: aq, caseStudy: aq });
  if (!resolved) notFound();
  const { document: doc } = resolved;
  if (doc.kind === "page") return <PageTemplate document={doc} lang={lang} />;
  if (doc.kind === "case_study") return <CaseStudyTemplate document={doc} lang={lang} />;
  if (doc.kind === "service") return <ServiceTemplate document={doc} lang={lang} />;
  return <PostTemplate document={doc} lang={lang} />;
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const lang = raw as Locale;
  const globals = await fetchGlobals(lang);
  const resolved = await resolveRoute(lang, slug, globals);
  if (!resolved) return { title: "Not found" };
  const s = resolved.document.seo;
  const path = `/${slug.join("/")}`;
  const site = getSiteUrl();
  const languages: Record<string, string> = {};
  for (const l of supportedLocales) {
    languages[l] = `${getSiteUrl()}${buildLocalePath(l, slug.join("/"))}`;
  }
  return {
    ...seoToMetadata(s, site),
    title: s.title || getSiteName(globals),
    alternates: { canonical: s.canonical || `${getSiteUrl()}${buildLocalePath(lang, path.replace(/^\//, ""))}`, languages },
  };
}
