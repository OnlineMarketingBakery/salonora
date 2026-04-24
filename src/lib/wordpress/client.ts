import { logger } from "@/lib/utils/logger";
import { getWordpressApiUrl, getWordpressAuthorizationHeader } from "./config";

const apiBase = () => getWordpressApiUrl();
import type { Locale } from "@/lib/i18n/locales";

export type WpFetchInit = RequestInit & {
  lang?: Locale;
  revalidate?: number | false;
};

/**
 * Fetches the WordPress REST API with optional Polylang `lang` query.
 */
export async function wpFetch<T>(path: string, init: WpFetchInit = {}): Promise<T> {
  const base = apiBase();
  if (!base) {
    throw new Error("WORDPRESS_API_URL is not set");
  }
  const { revalidate, lang, ...fetchInit } = init;
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
    logger.warn("wpFetch error", { url: url.toString(), status: res.status, text: text.slice(0, 500) });
    throw new Error(`WordPress request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function wpFetchOptional<T>(path: string, init: WpFetchInit = {}): Promise<T | null> {
  if (!apiBase()) return null;
  try {
    return await wpFetch<T>(path, init);
  } catch {
    return null;
  }
}
