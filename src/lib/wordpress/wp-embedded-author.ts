import { wpFetchOptional } from "@/lib/wordpress/client";
import type { Locale } from "@/lib/i18n/locales";
import type { PostAuthorT } from "@/types/documents";
import type { WpEmbeddedAuthor } from "@/types/wordpress";
import { toPlainText } from "@/lib/utils/strings";

/** Map WordPress REST user / embedded author shape → headless author card fields. */
export function wpEmbeddedUserToAuthor(u: WpEmbeddedAuthor | null | undefined): PostAuthorT {
  const name = u?.name?.trim() || "";
  const avatarUrl =
    u?.avatar_urls?.["96"] || u?.avatar_urls?.["48"] || u?.avatar_urls?.["24"] || null;
  const rawUrl = typeof u?.url === "string" && u.url.trim() ? u.url.trim() : null;
  const soc = u?.omb_author_social;
  const liFromSoc = typeof soc?.linkedin === "string" ? soc.linkedin.trim() : "";
  const linkedinFromCoreUrl = rawUrl && /linkedin\.com/i.test(rawUrl) ? rawUrl : "";
  const linkedinUrl = (liFromSoc || linkedinFromCoreUrl) || null;
  const profileUrl = rawUrl && !linkedinFromCoreUrl && !liFromSoc ? rawUrl : null;
  const bio = toPlainText(u?.description || "");
  const fb = typeof soc?.facebook === "string" ? soc.facebook.trim() : "";
  const ig = typeof soc?.instagram === "string" ? soc.instagram.trim() : "";
  return {
    name,
    avatarUrl,
    bio,
    profileUrl,
    linkedinUrl,
    facebookUrl: fb || null,
    instagramUrl: ig || null,
  };
}

export function authorIdFromWpPostLike(p: { author?: unknown }): number | null {
  const a = p.author;
  if (typeof a === "number" && Number.isFinite(a) && a >= 1) return a;
  if (typeof a === "string" && /^\d+$/.test(a)) {
    const n = parseInt(a, 10);
    return Number.isFinite(n) && n >= 1 ? n : null;
  }
  return null;
}

/**
 * `_embedded.author` often omits or defaults `description` to the wrong locale.
 * Always load `/wp/v2/users/{id}?lang=` (matches `[lang]` in the URL) so Polylang + `rest_prepare_user` can supply the right bio.
 */
export async function resolveAuthorFromRestEmbed(
  embedded: WpEmbeddedAuthor | undefined,
  authorField: unknown,
  lang: Locale
): Promise<PostAuthorT> {
  const fromEmbed = wpEmbeddedUserToAuthor(embedded);
  const id = authorIdFromWpPostLike({ author: authorField });
  if (id == null) return fromEmbed;

  const u = await wpFetchOptional<WpEmbeddedAuthor>(`/wp/v2/users/${id}`, { lang, revalidate: 300 });
  if (!u) return fromEmbed;

  const fromFetch = wpEmbeddedUserToAuthor(u);
  return {
    name: fromFetch.name.trim() ? fromFetch.name : fromEmbed.name,
    avatarUrl: fromEmbed.avatarUrl || fromFetch.avatarUrl,
    bio: fromFetch.bio.trim() ? fromFetch.bio : fromEmbed.bio,
    profileUrl: fromFetch.profileUrl || fromEmbed.profileUrl,
    linkedinUrl: fromFetch.linkedinUrl || fromEmbed.linkedinUrl,
    facebookUrl: fromFetch.facebookUrl || fromEmbed.facebookUrl,
    instagramUrl: fromFetch.instagramUrl || fromEmbed.instagramUrl,
  };
}
