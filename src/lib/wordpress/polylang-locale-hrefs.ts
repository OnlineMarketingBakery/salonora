import { cache } from "react";
import { isLocale, supportedLocales } from "@/lib/i18n/config";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import { wpFetchOptional } from "./client";
import { fetchPageBySlug } from "./fetch-page";
import { fetchPostBySlug } from "./fetch-post";
import { fetchServiceBySlug } from "./fetch-service";
import { getCptRestBase } from "./config";
import type { WpPageRaw } from "@/types/wordpress";
import { fetchGlobals } from "./fetch-globals";
import { mapWordPressPermalinkToAppPathname } from "./wp-url-to-app-pathname";

function restItemPath(kind: "page" | "post" | "service", id: number): string {
  if (kind === "page") return `/wp/v2/pages/${id}`;
  if (kind === "post") return `/wp/v2/posts/${id}`;
  return `/wp/v2/${getCptRestBase("service")}/${id}`;
}

type Kind = "page" | "post" | "service";

function withSameSlugForAllLocales(pathAfterLocale: string): Record<Locale, string> {
  return Object.fromEntries(
    supportedLocales.map((l) => [l, buildLocalePath(l, pathAfterLocale)])
  ) as Record<Locale, string>;
}

/** Polylang may use keys like `en`, `en_GB`, or `nl_NL` — map to the app’s locale. */
function valueForLocaleStringKey<T>(map: Record<string, T>, loc: Locale): T | undefined {
  if (Object.prototype.hasOwnProperty.call(map, loc) && map[loc] != null) {
    return map[loc];
  }
  const k = Object.keys(map).find((x) => x === loc || x.startsWith(`${loc}_`));
  return k != null && map[k] != null ? map[k] : undefined;
}

/**
 * Coerce `translations` from WP REST to string-key → id (Polylang Pro) or return null.
 */
function normalizePolylangTranslationIdMap(
  t: unknown
): Record<string, number> | null {
  if (!t || typeof t !== "object") {
    return null;
  }
  if (Array.isArray(t)) {
    const o: Record<string, number> = {};
    for (const item of t) {
      if (item && typeof item === "object" && "lang" in item && "id" in item) {
        const lang = String((item as { lang: string }).lang);
        const id = (item as { id: string | number }).id;
        const n = typeof id === "string" ? Number.parseInt(id, 10) : id;
        if (Number.isFinite(n) && (n as number) > 0) {
          o[lang] = n as number;
        }
      }
    }
    return Object.keys(o).length ? o : null;
  }
  const o: Record<string, number> = {};
  for (const [k, v] of Object.entries(t as Record<string, unknown>)) {
    if (v == null || v === "") {
      continue;
    }
    const n = typeof v === "string" ? Number.parseInt(v, 10) : Number(v);
    if (Number.isFinite(n) && n > 0) {
      o[k] = n;
    }
  }
  return Object.keys(o).length ? o : null;
}

type HeadlessPathsRes = { paths: Record<string, string> };

/**
 * Optional mu-plugin: `headless/v1/polylang-paths/{id}` (see wordpress/mu-plugins/ in this repo).
 * Fills the gap when Polylang is free or does not add `translations` to `/wp/v2/...` responses.
 */
async function tryHrefsFromHeadlessPlugin(
  postId: number,
  currentLang: Locale,
  pathAfterLocale: string
): Promise<Record<Locale, string> | null> {
  const res = await wpFetchOptional<HeadlessPathsRes>(`/headless/v1/polylang-paths/${postId}`, {
    revalidate: 60,
  });
  if (!res?.paths || typeof res.paths !== "object") {
    return null;
  }
  const samePath = (l: Locale) => buildLocalePath(l, pathAfterLocale);
  const out = {} as Record<Locale, string>;
  for (const l of supportedLocales) {
    if (l === currentLang) {
      out[l] = samePath(l);
      continue;
    }
    const p = valueForLocaleStringKey(res.paths, l);
    if (p == null) {
      out[l] = samePath(l);
      continue;
    }
    out[l] = buildLocalePath(l, p);
  }
  return out;
}

async function localeHrefsFromRestItem(
  kind: Kind,
  raw: { id: number; slug: string; translations?: Record<string, string | number> | null; link?: string },
  currentLang: Locale,
  pathAfterLocale: string
): Promise<Record<Locale, string>> {
  const samePath = (l: Locale) => buildLocalePath(l, pathAfterLocale);

  const fromPlugin = await tryHrefsFromHeadlessPlugin(raw.id, currentLang, pathAfterLocale);
  if (fromPlugin) {
    return fromPlugin;
  }

  const t = normalizePolylangTranslationIdMap(raw.translations) ?? null;
  if (!t) {
    return withSameSlugForAllLocales(pathAfterLocale);
  }

  const out = {} as Record<Locale, string>;
  for (const l of supportedLocales) {
    if (l === currentLang) {
      out[l] = samePath(l);
      continue;
    }
    const otherId = valueForLocaleStringKey(t, l) ?? t[l as keyof typeof t];
    if (otherId == null) {
      out[l] = samePath(l);
      continue;
    }
    const idNum = typeof otherId === "string" ? Number.parseInt(otherId, 10) : otherId;
    if (Number.isNaN(idNum)) {
      out[l] = samePath(l);
      continue;
    }
    if (idNum === raw.id) {
      out[l] = buildLocalePath(l, raw.slug);
      continue;
    }
    const tr = await wpFetchOptional<WpPageRaw>(restItemPath(kind, idNum), { lang: l, revalidate: 60 });
    if (!tr) {
      out[l] = samePath(l);
      continue;
    }
    if (tr.link) {
      out[l] = mapWordPressPermalinkToAppPathname(tr.link, l);
    } else {
      out[l] = buildLocalePath(l, tr.slug);
    }
  }
  return out;
}

async function fromPathname(
  pathname: string
): Promise<Record<Locale, string> | null> {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 1 || !isLocale(segments[0]!)) {
    return null;
  }
  const currentLang = segments[0] as Locale;
  const afterLocale = segments.slice(1);
  const globals = await fetchGlobals(currentLang);
  if (afterLocale.length === 0) {
    return withSameSlugForAllLocales("");
  }
  const last = afterLocale[afterLocale.length - 1]!;
  const page = await fetchPageBySlug(currentLang, last, globals);
  if (page) {
    return localeHrefsFromRestItem("page", page.raw, currentLang, afterLocale.join("/"));
  }
  const service = await fetchServiceBySlug(currentLang, last, globals);
  if (service) {
    return localeHrefsFromRestItem("service", service.raw, currentLang, afterLocale.join("/"));
  }
  const post = await fetchPostBySlug(currentLang, last, globals);
  if (post) {
    return localeHrefsFromRestItem("post", post.raw, currentLang, afterLocale.join("/"));
  }
  return null;
}

/**
 * For the current app pathname (e.g. /nl/over), returns localized paths
 * (e.g. { nl: "/nl/over", en: "/en/about" }) using Polylang’s `translations`
 * on the resolved document when the REST API exposes it.
 * Cached per request and pathname; falls back to swapping only the locale prefix when
 * `translations` is missing or a translation is not linked in WordPress.
 */
export const getLocaleHrefsForPathname = cache(async (pathname: string) => {
  if (!pathname || pathname === "/") {
    return null;
  }
  return fromPathname(pathname);
});
