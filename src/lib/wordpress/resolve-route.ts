import { fetchPageBySlug } from "./fetch-page";
import { fetchServiceBySlug } from "./fetch-service";
import { fetchPostBySlug } from "./fetch-post";
import { fetchCaseStudyBySlug } from "./fetch-case-study";
import type { GlobalSettings } from "@/types/globals";
import type { ContentDocument, PageDocument } from "@/types/documents";
import type { Locale } from "@/lib/i18n/locales";
import { enrichSections, type BlogArchiveQuery } from "@/lib/acf/enrich-sections";
import { fetchHomePage } from "./fetch-page";

export type ResolveRouteArchiveQueries = {
  blog?: BlogArchiveQuery | null;
  caseStudy?: BlogArchiveQuery | null;
};
export type ResolvedRoute = {
  document: ContentDocument;
} | null;

export type ResolvedHome = {
  document: PageDocument;
} | null;

/**
 * Resolves a catch-all slug (final segment) to a page, case study, service, or post in that order.
 * @param archiveQueries Optional `?page=` / `?s=` when the resolved page is a blog or case study archive.
 */
export async function resolveRoute(
  lang: Locale,
  slugParts: string[],
  globals: GlobalSettings,
  archiveQueries?: ResolveRouteArchiveQueries | null
): Promise<ResolvedRoute> {
  const last = slugParts[slugParts.length - 1];
  if (!last) return null;
  const pathJoined = slugParts.join("/");
  const page = await fetchPageBySlug(lang, last, globals);
  if (page) {
    const sections = await enrichSections(page.doc.sections, {
      lang,
      globals: globals,
      pageSlugPath: pathJoined,
      blogArchive: page.doc.isBlogArchive ? archiveQueries?.blog ?? { page: 1, search: "" } : undefined,
      caseStudyArchive: page.doc.isCaseStudyArchive
        ? archiveQueries?.caseStudy ?? { page: 1, search: "" }
        : undefined,
    });
    return { document: { ...page.doc, sections } };
  }
  const caseStudy = await fetchCaseStudyBySlug(lang, last, globals);
  if (caseStudy) {
    const sections = await enrichSections(caseStudy.doc.sections, { lang, globals: globals });
    return { document: { ...caseStudy.doc, sections } };
  }
  const service = await fetchServiceBySlug(lang, last, globals);
  if (service) {
    const sections = await enrichSections(service.doc.sections, { lang, globals: globals });
    return { document: { ...service.doc, sections } };
  }
  const post = await fetchPostBySlug(lang, last, globals);
  if (post) {
    const sections = await enrichSections(post.doc.sections, { lang, globals: globals });
    return { document: { ...post.doc, sections } };
  }
  return null;
}

export async function resolveHome(lang: Locale, globals: GlobalSettings): Promise<ResolvedHome> {
  const home = await fetchHomePage(lang, globals);
  if (!home) return null;
  const sections = await enrichSections(home.doc.sections, { lang, globals: globals });
  return { document: { ...home.doc, sections } };
}
