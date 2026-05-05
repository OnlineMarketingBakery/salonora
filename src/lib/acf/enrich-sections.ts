import { fetchTestimonialsByIds } from "@/lib/wordpress/fetch-testimonials";
import { fetchCf7Form } from "@/lib/wordpress/fetch-cf7-form";
import { wpFetchOptional } from "@/lib/wordpress/client";
import { getCptRestBase } from "@/lib/wordpress/config";
import type {
  AnySectionT,
  DesignShowcaseGridSectionT,
  LatestPostsSectionT,
  TestimonialsSectionT,
} from "@/types/sections";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import { toPlainText, stripTags } from "@/lib/utils/strings";
import type { GlobalSettings } from "@/types/globals";

type WpCptList = {
  id: number;
  slug: string;
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

export type EnrichContext = {
  lang: Locale;
  globals: GlobalSettings;
};

/**
 * Fetches server-side data for relationship fields, latest posts, and form definitions.
 */
export async function enrichSections(
  sections: AnySectionT[],
  ctx: EnrichContext
): Promise<AnySectionT[]> {
  const { lang, globals } = ctx;
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
      out.push(await enrichLatest(s as LatestPostsSectionT, ctx));
    } else if (s.type === "design_showcase_grid") {
      out.push(await enrichDesignShowcaseGrid(s as DesignShowcaseGridSectionT, ctx));
    } else if (s.type === "form_embed") {
      const def = s.formId ? await fetchCf7Form(s.formId, lang) : null;
      out.push({ ...s, formDefinition: def });
    } else if (s.type === "faq_contact_split" && s.useForm) {
      const fid = s.customForm?.id || globals.integrations.defaultContactForm || 0;
      out.push({ ...s, formDefinition: fid ? await fetchCf7Form(Number(fid), lang) : null, defaultFormId: Number(fid) });
    } else {
      out.push(s);
    }
  }
  return out;
}

async function enrichDesignShowcaseGrid(
  s: DesignShowcaseGridSectionT,
  { lang }: EnrichContext
): Promise<DesignShowcaseGridSectionT> {
  const n = s.count;
  const rest = getCptRestBase("service");
  const list = await wpFetchOptional<WpServiceListEmbedded[]>(
    `/wp/v2/${rest}?per_page=${n}&_embed=1&orderby=date&order=desc`,
    { lang, revalidate: 30 }
  );
  const tint = s.cardPanelTint ?? "surface";
  const cards =
    list?.map((p) => {
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
    }) ?? [];
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
