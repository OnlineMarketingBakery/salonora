import { getWordpressApiUrl, getWordpressBaseUrl, getSiteUrl } from "@/lib/wordpress/config";
import type { WpImage } from "@/types/wordpress";

function sizeEntryUrl(
  e: string | { url: string; width?: number; height?: number } | undefined
): string | null {
  if (!e) return null;
  if (typeof e === "string") return e;
  if (typeof e === "object" && e.url) return e.url;
  return null;
}

/**
 * ACF/REST `url` is often a smaller generated size. For crisp logos/badges, use
 * the largest `sizes` entry (full, 1536, large, …) so `next/image` is not
 * up‑scaling a thumbnail.
 */
export function getLargestImageUrl(image: WpImage | null | undefined): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  const sizes = image.sizes;
  if (sizes && typeof sizes === "object") {
    for (const key of ["full", "2048x2048", "1536x1536", "large", "medium_large", "medium"] as const) {
      const u = sizeEntryUrl(sizes[key] as { url: string } | string | undefined);
      if (u) return u;
    }
  }
  return image.url || null;
}

export function getImageUrl(image: WpImage | null | undefined): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  return image.url || null;
}

export function getImageAlt(image: WpImage | null | undefined): string {
  if (!image) return "";
  if (typeof image === "string") return "";
  return image.alt || image.title || "";
}

/**
 * WordPress/ACF often return root-relative upload paths. The marketing site uses
 * them in CSS `background-image` and in `<img src>`; without a host, the browser
 * requests the Next app origin and the asset 404s.
 */
export function resolveAbsoluteMediaUrl(url: string | null | undefined): string | null {
  if (url == null || typeof url !== "string") return null;
  const u = url.trim();
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) {
    const wpBase = getWordpressBaseUrl().replace(/\/$/, "");
    const site = getSiteUrl().replace(/\/$/, "");
    if (wpBase && site && wpBase !== site && u.startsWith(`${wpBase}/wp-content/`)) {
      return `${site}${u.slice(wpBase.length)}`;
    }
    // Client components only have NEXT_PUBLIC_SITE_URL — rewrite any /wp-content/ host.
    if (site) {
      try {
        const { pathname } = new URL(u);
        if (pathname.startsWith("/wp-content/")) {
          return `${site}${pathname}`;
        }
      } catch {
        /* noop */
      }
    }
    return u;
  }
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/")) {
    const site = getSiteUrl().replace(/\/$/, "");
    if (site && u.startsWith("/wp-content/")) {
      return `${site}${u}`;
    }
    const base = getWordpressBaseUrl().replace(/\/$/, "");
    if (base) return `${base}${u}`;
    const api = getWordpressApiUrl();
    if (api) {
      try {
        const origin = new URL(api).origin;
        return `${origin}${u}`;
      } catch {
        /* noop */
      }
    }
  }
  return u;
}

/**
 * Public `src` for `<Image>` — root-relative `/wp-content/...` on the marketing
 * site so the browser and `/_next/image` never see localhost or backend hosts.
 */
export function resolvePublicMediaSrc(url: string | null | undefined): string | null {
  const absolute = resolveAbsoluteMediaUrl(url);
  if (!absolute) return null;
  const site = getSiteUrl().replace(/\/$/, "");
  if (site && absolute.startsWith(`${site}/wp-content/`)) {
    return absolute.slice(site.length);
  }
  if (absolute.startsWith("/wp-content/")) return absolute;
  return absolute;
}

/** Rewrite CMS image URLs to root-relative `/wp-content/...` for client-safe RSC props. */
export function normalizeWpImageForPublic(image: WpImage | null | undefined): WpImage | null {
  if (!image) return null;
  if (typeof image === "string") {
    return { url: resolvePublicMediaSrc(image) ?? image, alt: "" };
  }
  const url = image.url ? (resolvePublicMediaSrc(image.url) ?? image.url) : image.url;
  if (!image.sizes || typeof image.sizes !== "object") {
    return url === image.url ? image : { ...image, url };
  }
  const sizes = { ...image.sizes } as Record<
    string,
    string | { url: string; width?: number; height?: number } | undefined
  >;
  for (const key of Object.keys(sizes)) {
    const entry = sizes[key];
    if (typeof entry === "string") {
      sizes[key] = resolvePublicMediaSrc(entry) ?? entry;
    } else if (entry && typeof entry === "object" && typeof entry.url === "string") {
      sizes[key] = { ...entry, url: resolvePublicMediaSrc(entry.url) ?? entry.url };
    }
  }
  return { ...image, url, sizes: sizes as WpImage["sizes"] };
}
