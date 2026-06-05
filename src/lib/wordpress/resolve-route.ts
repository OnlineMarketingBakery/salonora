import { cache } from "react";
import { fetchPageBySlug } from "./fetch-page";
import { fetchServiceBySlug } from "./fetch-service";
import { fetchPostBySlug } from "./fetch-post";
import { fetchCaseStudyBySlug } from "./fetch-case-study";
import type { GlobalSettings } from "@/types/globals";
import type { ContentDocument, PageDocument } from "@/types/documents";
import type { Locale } from "@/lib/i18n/locales";
import { enrichSections, type BlogArchiveQuery } from "@/lib/acf/enrich-sections";
import { fetchHomePage } from "./fetch-page";
import { applyStaticLegalFallback, hasUsableLegalPageContent } from "@/lib/legal/page-content";
import {
  resolveLegalFetchSlug,
  resolveLegalPageKey,
} from "@/lib/legal/legal-slugs";
import { tryBuildStaticLegalPage } from "@/lib/legal/static-pages";

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

function archiveCacheKey(archiveQueries?: ResolveRouteArchiveQueries | null): string {
  const b = archiveQueries?.blog;
  const c = archiveQueries?.caseStudy;
  return [
    b?.page ?? 1,
    b?.search ?? "",
    c?.page ?? 1,
    c?.search ?? "",
  ].join("|");
}

const resolveRouteCached = cache(
  async (
    lang: Locale,
    slugPath: string,
    globals: GlobalSettings,
    archiveKey: string,
  ): Promise<ResolvedRoute> => {
    const slugParts = slugPath ? slugPath.split("/").filter(Boolean) : [];
    const last = slugParts[slugParts.length - 1];
    if (!last) return null;

    const [blogPage, blogSearch, caseStudyPage, caseStudySearch] = archiveKey.split("|");
    const archiveQueries: ResolveRouteArchiveQueries = {
      blog: { page: Number(blogPage) || 1, search: blogSearch ?? "" },
      caseStudy: { page: Number(caseStudyPage) || 1, search: caseStudySearch ?? "" },
    };

    const pathJoined = slugParts.join("/");
    const legalKey = resolveLegalPageKey(lang, last);
    const fetchSlug = resolveLegalFetchSlug(lang, last);
    const page = await fetchPageBySlug(lang, fetchSlug, globals);
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
      let doc = { ...page.doc, sections, slug: last };
      if (!doc.isLegalPage && legalKey && (legalKey === "privacy" || legalKey === "terms")) {
        doc.isLegalPage = true;
      }
      if (legalKey && !hasUsableLegalPageContent(doc, lang, last)) {
        doc = applyStaticLegalFallback(doc, lang, last);
        const enriched = await enrichSections(doc.sections, { lang, globals, pageSlugPath: pathJoined });
        doc = { ...doc, sections: enriched, slug: last };
      }
      return { document: doc };
    }

    const staticLegal = tryBuildStaticLegalPage(lang, last);
    if (staticLegal) {
      const sections = await enrichSections(staticLegal.sections, { lang, globals });
      return { document: { ...staticLegal, slug: last, sections } };
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
  },
);

/**
 * Resolves a catch-all slug (final segment) to a page, case study, service, or post in that order.
 * @param archiveQueries Optional `?page=` / `?s=` when the resolved page is a blog or case study archive.
 */
export async function resolveRoute(
  lang: Locale,
  slugParts: string[],
  globals: GlobalSettings,
  archiveQueries?: ResolveRouteArchiveQueries | null,
): Promise<ResolvedRoute> {
  return resolveRouteCached(lang, slugParts.join("/"), globals, archiveCacheKey(archiveQueries));
}

export async function resolveHome(lang: Locale, globals: GlobalSettings): Promise<ResolvedHome> {
  const home = await fetchHomePage(lang, globals);
  if (!home) return null;
  const sections = await enrichSections(home.doc.sections, { lang, globals: globals });
  return { document: { ...home.doc, sections } };
}
