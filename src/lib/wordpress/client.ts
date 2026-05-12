import { logger } from "@/lib/utils/logger";
import { getWordpressApiUrl, getWordpressAuthorizationHeader } from "./config";

const apiBase = () => getWordpressApiUrl();
import type { Locale } from "@/lib/i18n/locales";

export type WpFetchInit = RequestInit & {
  lang?: Locale;
  revalidate?: number | false;
  /**
   * When false, non-OK responses are not logged (used by `wpFetchOptional` so expected
   * misses e.g. missing plugin routes do not spam the console).
   */
  logErrors?: boolean;
};

/**
 * Fetches the WordPress REST API with optional Polylang `lang` query.
 */
export async function wpFetch<T>(path: string, init: WpFetchInit = {}): Promise<T> {
  const base = apiBase();
  if (!base) {
    throw new Error("WORDPRESS_API_URL is not set");
  }
  const { revalidate, lang, logErrors = true, ...fetchInit } = init;
  const url = new URL(path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`);
  if (lang) {
    url.searchParams.set("lang", lang);
  }
  const next: RequestInit = { ...fetchInit };
  const headers = new Headers(fetchInit.headers);
  const wpAuth = getWordpressAuthorizationHeader();
  if (wpAuth && !headers.has("Authorization")) {
    headers.set("Authorization", wpAuth);
  }
  next.headers = headers;
  if (revalidate !== undefined) {
    (next as { next?: { revalidate: number | false } }).next = { revalidate };
  }
  const res = await fetch(url.toString(), next);
  if (!res.ok) {
    const text = await res.text();
    if (logErrors) {
      logger.warn("wpFetch error", { url: url.toString(), status: res.status, text: text.slice(0, 500) });
    }
    throw new Error(`WordPress request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function wpFetchOptional<T>(path: string, init: WpFetchInit = {}): Promise<T | null> {
  if (!apiBase()) return null;
  try {
    return await wpFetch<T>(path, { ...init, logErrors: false });
  } catch {
    return null;
  }
}

export type WpCollectionResult<T> = {
  data: T;
  total: number;
  totalPages: number;
};

/**
 * GET a WordPress collection endpoint and read `X-WP-Total` / `X-WP-TotalPages` for pagination.
 */
export async function wpFetchCollectionOptional<T>(
  path: string,
  init: WpFetchInit = {}
): Promise<WpCollectionResult<T> | null> {
  if (!apiBase()) return null;
  try {
    const base = apiBase()!;
    const { revalidate, lang, logErrors = false, ...fetchInit } = init;
    const url = new URL(path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`);
    if (lang) {
      url.searchParams.set("lang", lang);
    }
    const next: RequestInit = { ...fetchInit };
    const headers = new Headers(fetchInit.headers);
    const wpAuth = getWordpressAuthorizationHeader();
    if (wpAuth && !headers.has("Authorization")) {
      headers.set("Authorization", wpAuth);
    }
    next.headers = headers;
    if (revalidate !== undefined) {
      (next as { next?: { revalidate: number | false } }).next = { revalidate };
    }
    const res = await fetch(url.toString(), next);
    if (!res.ok) {
      if (logErrors) {
        const text = await res.text();
        logger.warn("wpFetchCollection error", { url: url.toString(), status: res.status, text: text.slice(0, 500) });
      }
      return null;
    }
    const data = (await res.json()) as T;
    const totalRaw = parseInt(res.headers.get("X-WP-Total") || "0", 10);
    const pagesRaw = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
    const total = Number.isFinite(totalRaw) ? totalRaw : Array.isArray(data) ? data.length : 0;
    const totalPages = Number.isFinite(pagesRaw) && pagesRaw > 0 ? pagesRaw : 1;
    return { data, total, totalPages };
  } catch {
    return null;
  }
}
