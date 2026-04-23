import { wpFetchOptional } from "./client";
import type { WpPageRaw, WpPostRaw } from "@/types/wordpress";
import type { Locale } from "@/lib/i18n/locales";
import { normalizePostSections } from "@/lib/acf/normalize-post-sections";
import { mapYoastToSeo } from "@/lib/seo/map-yoast-to-metadata";
import type { GlobalSettings } from "@/types/globals";
import type { PostDocument } from "@/types/documents";

function toDoc(p: WpPostRaw, gs: GlobalSettings): { doc: PostDocument; raw: WpPostRaw } {
  const acf = p.acf || {};
  const featured = p._embedded?.["wp:featuredmedia"]?.[0];
  const featuredForm = (acf as { featured_form?: { id?: number } | null }).featured_form;
  const doc: PostDocument = {
    kind: "post",
    id: p.id,
    slug: p.slug,
    title: p.title?.rendered || "",
    content: p.content?.rendered || "",
    excerpt: p.excerpt?.rendered || "",
    featuredImage: featured?.source_url || null,
    featuredImageAlt: featured?.alt_text || "",
    featuredFormId: featuredForm && typeof featuredForm === "object" ? featuredForm.id || null : null,
    sections: normalizePostSections((acf as { post_sections?: unknown }).post_sections),
    seo: mapYoastToSeo(p, gs, { fallbackTitle: p.title?.rendered || "Post" }),
  };
  return { doc, raw: p };
}

export async function fetchPostBySlug(
  lang: Locale,
  slug: string,
  gs: GlobalSettings
): Promise<{ doc: PostDocument; raw: WpPageRaw } | null> {
  const list = await wpFetchOptional<WpPostRaw[]>(
    `/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1&acf_format=standard`,
    { lang, revalidate: 60 }
  );
  if (list?.[0]) return toDoc(list[0] as WpPostRaw, gs);
  return null;
}
