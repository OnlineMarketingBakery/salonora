import { fetchTestimonialsByIds } from "@/lib/wordpress/fetch-testimonials";
import { fetchCf7Form } from "@/lib/wordpress/fetch-cf7-form";
import { getCptRestBase, getDefaultContactFormId } from "@/lib/wordpress/config";
import { wpFetchOptional } from "@/lib/wordpress/client";
import type { ArchiveUrlQuery } from "@/lib/wordpress/archive-search-params";
import type {
  AnySectionT,
  BlogPostOverviewSectionT,
  CaseStudyOverviewSectionT,
  DesignShowcaseGridSectionT,
  LatestPostsSectionT,
  TestimonialsSectionT,
} from "@/types/sections";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import { filterPostsByLocale } from "@/lib/i18n/post-language";
import { toPlainText, stripTags } from "@/lib/utils/strings";
import type { GlobalSettings } from "@/types/globals";
import type { SiteConfig } from "@/lib/wordpress/fetch-site-config";
import { fetchSiteConfig } from "@/lib/wordpress/fetch-site-config";
import { fetchBlogPostsCollection, fetchBlogOverviewPostCardById } from "@/lib/wordpress/fetch-blog-posts-collection";
import { fetchCaseStudiesCollection, fetchCaseStudyOverviewCardById } from "@/lib/wordpress/fetch-case-studies-collection";
import { resolvePostTranslationId } from "@/lib/wordpress/polylang-locale-hrefs";
type WpCptList = {
  id: number;
  slug: string;
  link?: string;
  title: { rendered: string };
  excerpt: { rendered: string };
};

type WpServiceListEmbedded = WpCptList & {
  _embedded?: { "wp:featuredmedia"?: { source_url?: string; alt_text?: string }[] };
};

function escapePlainForHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** @deprecated Use ArchiveUrlQuery */
export type BlogArchiveQuery = ArchiveUrlQuery;

function resolvedContactFormId(primary: number, globals: GlobalSettings): number {
  if (primary > 0) return primary;
  const fromGlobals = globals.integrations.defaultContactForm;
  if (typeof fromGlobals === "number" && Number.isFinite(fromGlobals) && fromGlobals > 0) {
    return Math.floor(fromGlobals);
  }
  const fromEnv = Number(getDefaultContactFormId());
  return Number.isFinite(fromEnv) && fromEnv > 0 ? Math.floor(fromEnv) : 0;
}

export type EnrichContext = {
  lang: Locale;
  globals: GlobalSettings;
  /** WP Polylang URL prefixes for filtering REST collections by `link`. */
  siteConfig?: SiteConfig;
  /** Slug path after locale (e.g. `blog`) for blog overview forms and pagination. */
  pageSlugPath?: string;
  /** When set, blog archive pages apply these query params to the blog overview section. */
  blogArchive?: BlogArchiveQuery | null;
  /** When set, case study archive pages apply these query params to the case study overview section. */
  caseStudyArchive?: BlogArchiveQuery | null;
};

/**
 * Fetches server-side data for relationship fields, latest posts, and form definitions.
 */
export async function enrichSections(
  sections: AnySectionT[],
  ctx: EnrichContext
): Promise<AnySectionT[]> {
  const siteConfig = ctx.siteConfig ?? (await fetchSiteConfig());
  const { lang, globals } = ctx;
  const resolvedCtx = { ...ctx, siteConfig };
  const out: AnySectionT[] = [];
  for (const s of sections) {
    if (s.type === "testimonials") {
      const t = s as TestimonialsSectionT;
      if (t.testimonialIds.length) {
        const items = await fetchTestimonialsByIds(t.testimonialIds, lang);
        out.push({ ...t, items, testimonialIds: t.testimonialIds });
      } else {
        out.push(t);
      }
    } else if (s.type === "latest_posts") {
      out.push(await enrichLatest(s as LatestPostsSectionT, resolvedCtx));
    } else if (s.type === "blog_post_overview") {
      out.push(await enrichBlogPostOverview(s as BlogPostOverviewSectionT, resolvedCtx));
    } else if (s.type === "case_study_overview") {
      out.push(await enrichCaseStudyOverview(s as CaseStudyOverviewSectionT, resolvedCtx));
    } else if (s.type === "design_showcase_grid") {
      out.push(await enrichDesignShowcaseGrid(s as DesignShowcaseGridSectionT, resolvedCtx));
    } else if (s.type === "form_embed") {
      const fid = resolvedContactFormId(s.formId, globals);
      const def = fid ? await fetchCf7Form(fid, lang) : null;
      out.push({ ...s, formId: fid, formDefinition: def });
    } else if (s.type === "faq_contact_split" && s.useForm) {
      const fid = s.customForm?.id || globals.integrations.defaultContactForm || 0;
      out.push({ ...s, formDefinition: fid ? await fetchCf7Form(Number(fid), lang) : null, defaultFormId: Number(fid) });
    } else {
      out.push(s);
    }
  }
  return out;
}

/** Fetches newest services with featured media embed; paginates past the default REST per_page cap. */
async function fetchServicesEmbeddedUpTo(
  lang: Locale,
  limit: number,
  siteConfig?: SiteConfig
): Promise<WpServiceListEmbedded[]> {
  const rest = getCptRestBase("service");
  const out: WpServiceListEmbedded[] = [];
  let page = 1;
  const batch = 100;
  const safeLimit = Math.max(1, limit);
  while (out.length < safeLimit && page <= 50) {
    const chunk = await wpFetchOptional<WpServiceListEmbedded[]>(
      `/wp/v2/${rest}?per_page=${batch}&page=${page}&_embed=1&orderby=date&order=desc`,
      { lang, revalidate: 30 }
    );
    if (!chunk?.length) break;
    const matching = filterPostsByLocale(chunk, lang, siteConfig);
    out.push(...matching);
    if (chunk.length < batch) break;
    page++;
  }
  return out.slice(0, safeLimit);
}

async function enrichDesignShowcaseGrid(
  s: DesignShowcaseGridSectionT,
  { lang, siteConfig }: EnrichContext
): Promise<DesignShowcaseGridSectionT> {
  const n = s.count;
  const list = await fetchServicesEmbeddedUpTo(lang, n, siteConfig);
  const tint = s.cardPanelTint ?? "surface";
  const cards = list.map((p) => {
      const featured = p._embedded?.["wp:featuredmedia"]?.[0];
      const titlePlain = stripTags(p.title.rendered);
      const visual =
        featured?.source_url != null && featured.source_url !== ""
          ? { url: featured.source_url, alt: featured.alt_text || titlePlain }
          : null;
      return {
        visual,
        titleHtml: `<p>${escapePlainForHtml(titlePlain)}</p>`,
        href: buildLocalePath(lang, p.slug),
        panelTint: tint,
      };
    });
  return { ...s, cards };
}

async function enrichLatest(
  s: LatestPostsSectionT,
  { lang }: EnrichContext
): Promise<LatestPostsSectionT> {
  const n = s.count;
  if (s.source === "post") {
    const posts = await wpFetchOptional<WpCptList[]>(`/wp/v2/posts?per_page=${n}&_embed&orderby=date&order=desc`, {
      lang,
      revalidate: 30,
    });
    const items =
      posts?.map((p) => ({
        id: p.id,
        title: stripTags(p.title.rendered),
        excerpt: s.showExcerpt ? toPlainText(p.excerpt.rendered) : "",
        href: buildLocalePath(lang, p.slug),
      })) || [];
    return { ...s, items };
  }
  const rest = getCptRestBase("service");
  const list = await wpFetchOptional<WpCptList[]>(`/wp/v2/${rest}?per_page=${n}&orderby=date&order=desc`, {
    lang,
    revalidate: 30,
  });
  const items =
    list?.map((p) => ({
      id: p.id,
      title: stripTags(p.title.rendered),
      excerpt: s.showExcerpt ? toPlainText(p.excerpt.rendered) : "",
      href: buildLocalePath(lang, p.slug),
    })) || [];
  return { ...s, items };
}

async function enrichBlogPostOverview(
  s: BlogPostOverviewSectionT,
  ctx: EnrichContext
): Promise<BlogPostOverviewSectionT> {
  const archivePath = ctx.pageSlugPath ?? "";
  const blog = ctx.blogArchive;
  let currentPage = blog?.page ?? 1;
  const searchQuery = blog?.search ?? "";

  const fetchOpts = {
    lang: ctx.lang,
    search: searchQuery,
    siteConfig: ctx.siteConfig,
  };

  let fetched = await fetchBlogPostsCollection({ ...fetchOpts, page: currentPage });

  if (!fetched && currentPage > 1) {
    currentPage = 1;
    fetched = await fetchBlogPostsCollection({ ...fetchOpts, page: 1 });
  }

  if (!fetched) {
    return {
      ...s,
      archivePath,
      items: [],
      total: 0,
      totalPages: 1,
      currentPage,
      searchQuery,
    };
  }

  const perPage = fetched.perPage;

  if (currentPage > fetched.totalPages) {
    currentPage = fetched.totalPages;
    fetched = await fetchBlogPostsCollection({ ...fetchOpts, page: currentPage });
    if (!fetched) {
      return {
        ...s,
        archivePath,
        postsPerPage: perPage,
        items: [],
        total: 0,
        totalPages: 1,
        currentPage: 1,
        searchQuery,
      };
    }
  }

  let items = fetched.items;
  const pinId = s.featuredPostId;
  if (
    currentPage === 1 &&
    !searchQuery.trim() &&
    s.showFeatured &&
    pinId != null &&
    pinId > 0
  ) {
    const resolvedPinId = await resolvePostTranslationId(pinId, ctx.lang);
    const pinned = await fetchBlogOverviewPostCardById(ctx.lang, resolvedPinId);
    if (pinned) {
      const rest = items.filter((i) => i.id !== pinned.id).slice(0, Math.max(0, fetched.perPage - 1));
      items = [pinned, ...rest];
    }
  }

  return {
    ...s,
    archivePath,
    postsPerPage: fetched.perPage,
    items,
    total: fetched.total,
    totalPages: fetched.totalPages,
    currentPage,
    searchQuery,
  };
}

async function enrichCaseStudyOverview(
  s: CaseStudyOverviewSectionT,
  ctx: EnrichContext
): Promise<CaseStudyOverviewSectionT> {
  const archivePath = ctx.pageSlugPath ?? "";
  const archive = ctx.caseStudyArchive;
  const currentPage = archive?.page ?? 1;
  const searchQuery = archive?.search ?? "";
  const perPage = Math.min(50, Math.max(1, s.postsPerPage));

  const fetched = await fetchCaseStudiesCollection({
    lang: ctx.lang,
    page: currentPage,
    perPage,
    search: searchQuery,
    siteConfig: ctx.siteConfig,
  });

  if (!fetched) {
    return {
      ...s,
      archivePath,
      items: [],
      total: 0,
      totalPages: 1,
      currentPage,
      searchQuery,
    };
  }

  let items = fetched.items;
  const pinId = s.featuredCaseStudyId;
  if (
    currentPage === 1 &&
    !searchQuery.trim() &&
    s.showFeatured &&
    pinId != null &&
    pinId > 0
  ) {
    const pinned = await fetchCaseStudyOverviewCardById(ctx.lang, pinId);
    if (pinned) {
      const rest = items.filter((i) => i.id !== pinned.id).slice(0, Math.max(0, perPage - 1));
      items = [pinned, ...rest];
    }
  }

  // Collection `GET …/case_study` often omits repeater ACF; single `GET …/case_study/{id}` includes it.
  if (currentPage === 1 && !searchQuery.trim() && s.showFeatured && items.length > 0) {
    const featuredId = items[0].id;
    const hydrated = await fetchCaseStudyOverviewCardById(ctx.lang, featuredId);
    if (hydrated && hydrated.id === featuredId) {
      items = [
        {
          ...items[0],
          metrics: hydrated.metrics.length > 0 ? hydrated.metrics : items[0].metrics,
          projectLabel: hydrated.projectLabel || items[0].projectLabel,
          excerpt: hydrated.excerpt || items[0].excerpt,
          image: hydrated.image ?? items[0].image,
          title: hydrated.title || items[0].title,
          href: hydrated.href || items[0].href,
        },
        ...items.slice(1),
      ];
    }
  }

  return {
    ...s,
    archivePath,
    items,
    total: fetched.total,
    totalPages: fetched.totalPages,
    currentPage,
    searchQuery,
  };
}
