import { wpFetchOptional } from "@/lib/wordpress/client";
import { resolvePublicMediaSrc } from "@/lib/utils/media";
import type { Locale } from "@/lib/i18n/locales";
import type { PostAuthorT } from "@/types/documents";
import type { OmbAuthorCard, WpEmbeddedAuthor } from "@/types/wordpress";
import { toPlainText } from "@/lib/utils/strings";

function authorSocialUrl(raw: string | undefined): string | null {
  const t = raw?.trim() ?? "";
  if (!t || t === "#") return null;
  return t;
}

function normalizeAuthorAvatarUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  return resolvePublicMediaSrc(trimmed) ?? trimmed;
}

/**
 * Author from the `author_card` REST field on the post (bakery-core).
 * This is the primary source; the core `/wp/v2/users` endpoint is locked down,
 * so `_embedded.author` cannot resolve on this install. Returns null when the
 * card carries no usable display fields so callers can fall back to the embed.
 */
export function authorFromOmbCard(card: OmbAuthorCard | null | undefined): PostAuthorT | null {
  if (!card) return null;
  const name = card.name?.trim() || "";
  const avatarUrl = normalizeAuthorAvatarUrl(card.avatar_url);
  const bio = toPlainText(card.bio || "");
  if (!name && !avatarUrl && !bio) return null;
  return {
    name,
    avatarUrl,
    bio,
    profileUrl: authorSocialUrl(card.profile_url),
    linkedinUrl: authorSocialUrl(card.linkedin),
    facebookUrl: authorSocialUrl(card.facebook),
    instagramUrl: authorSocialUrl(card.instagram),
  };
}

export function resolveWpAuthorAvatarUrl(u: WpEmbeddedAuthor | null | undefined): string | null {
  const custom = u?.omb_author_avatar_url?.trim();
  if (custom) return normalizeAuthorAvatarUrl(custom);
  const embedded =
    u?.avatar_urls?.["96"] || u?.avatar_urls?.["48"] || u?.avatar_urls?.["24"] || null;
  return normalizeAuthorAvatarUrl(embedded);
}

/** Map WordPress REST user / embedded author shape → headless author card fields. */
export function wpEmbeddedUserToAuthor(u: WpEmbeddedAuthor | null | undefined): PostAuthorT {
  const name = u?.name?.trim() || "";
  const avatarUrl = resolveWpAuthorAvatarUrl(u);
  const rawUrl = typeof u?.url === "string" && u.url.trim() ? u.url.trim() : null;
  const soc = u?.omb_author_social;
  const liFromSoc = authorSocialUrl(typeof soc?.linkedin === "string" ? soc.linkedin : undefined);
  const linkedinFromCoreUrl = rawUrl && /linkedin\.com/i.test(rawUrl) ? rawUrl : "";
  const linkedinUrl = liFromSoc || linkedinFromCoreUrl || null;
  const profileUrl = rawUrl && !linkedinFromCoreUrl && !liFromSoc ? rawUrl : null;
  const bio = toPlainText(u?.description || "");
  const fb = authorSocialUrl(typeof soc?.facebook === "string" ? soc.facebook : undefined);
  const ig = authorSocialUrl(typeof soc?.instagram === "string" ? soc.instagram : undefined);
  return {
    name,
    avatarUrl,
    bio,
    profileUrl,
    linkedinUrl,
    facebookUrl: fb,
    instagramUrl: ig,
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
  lang: Locale,
  card?: OmbAuthorCard | null
): Promise<PostAuthorT> {
  const fromEmbed = wpEmbeddedUserToAuthor(embedded);

  // Primary source: author_card on the post (bakery-core). Merge embed as
  // a secondary fill so any field the card omits still resolves when available.
  const fromCard = authorFromOmbCard(card);
  if (fromCard) {
    return {
      name: fromCard.name || fromEmbed.name,
      avatarUrl: fromCard.avatarUrl || fromEmbed.avatarUrl,
      bio: fromCard.bio || fromEmbed.bio,
      profileUrl: fromCard.profileUrl || fromEmbed.profileUrl,
      linkedinUrl: fromCard.linkedinUrl || fromEmbed.linkedinUrl,
      facebookUrl: fromCard.facebookUrl || fromEmbed.facebookUrl,
      instagramUrl: fromCard.instagramUrl || fromEmbed.instagramUrl,
    };
  }

  const id = authorIdFromWpPostLike({ author: authorField });
  if (id == null) return fromEmbed;

  const u = await wpFetchOptional<WpEmbeddedAuthor>(`/wp/v2/users/${id}`, { lang, revalidate: 300 });
  if (!u) return fromEmbed;

  const fromFetch = wpEmbeddedUserToAuthor(u);
  return {
    name: fromFetch.name.trim() ? fromFetch.name : fromEmbed.name,
    avatarUrl: fromFetch.avatarUrl || fromEmbed.avatarUrl,
    bio: fromFetch.bio.trim() ? fromFetch.bio : fromEmbed.bio,
    profileUrl: fromFetch.profileUrl || fromEmbed.profileUrl,
    linkedinUrl: fromFetch.linkedinUrl || fromEmbed.linkedinUrl,
    facebookUrl: fromFetch.facebookUrl || fromEmbed.facebookUrl,
    instagramUrl: fromFetch.instagramUrl || fromEmbed.instagramUrl,
  };
}
