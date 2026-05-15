import type { GlobalSettings } from "@/types/globals";

function requireEnv(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
}

export function getWordpressApiUrl(): string {
  return (process.env.WORDPRESS_API_URL || "").replace(/\/$/, "");
}

/**
 * HTTP Basic auth for WordPress Application Passwords (server-only env).
 * Required when routes such as `/wp/v2/menu-items` return 401 for anonymous requests.
 */
export function getWordpressAuthorizationHeader(): string | undefined {
  const user = process.env.WORDPRESS_APPLICATION_USER?.trim();
  const appPassword = process.env.WORDPRESS_APPLICATION_PASSWORD?.trim();
  if (!user || !appPassword) return undefined;
  const token = Buffer.from(`${user}:${appPassword.replace(/\s+/g, "")}`, "utf8").toString("base64");
  return `Basic ${token}`;
}

export function getWordpressBaseUrl(): string {
  return (process.env.WORDPRESS_BASE_URL || getWordpressApiUrl().replace(/\/wp(-json)?$/, "")).replace(
    /\/$/,
    ""
  );
}

export function getSiteUrl(): string {
  return requireEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000").replace(/\/$/, "");
}

export function getRevalidationSecret(): string | undefined {
  return process.env.REVALIDATION_SECRET;
}

export function getDefaultContactFormId(): string | undefined {
  return process.env.NEXT_PUBLIC_DEFAULT_CF7_FORM_ID;
}

/**
 * Bearer secret for `POST …/custom-form-builder/v1/public/forms/{id}/submit` (OMB Form Builder headless).
 * Must match `CFB_HEADLESS_SUBMIT_SECRET` in WordPress `wp-config.php`.
 */
export function getOmbFormBuilderHeadlessSubmitSecret(): string | undefined {
  const a = process.env.OMB_FORM_BUILDER_SUBMIT_SECRET?.trim();
  const b = process.env.CFB_HEADLESS_SUBMIT_SECRET?.trim();
  return a || b || undefined;
}

/** Fallback when WordPress Reading → Homepage is unavailable (older plugin) or not a static page. */
export function getHomepageSlug(lang: "nl" | "en"): string {
  const key = `HOMEPAGE_SLUG_${lang.toUpperCase()}` as const;
  return process.env[key] || process.env.HOMEPAGE_SLUG || "home";
}

/** Prefer WordPress Reading static homepage slug (per language via OMB + Polylang); else env / `home`. */
export function resolveHomepageSlug(lang: "nl" | "en", globals: GlobalSettings): string {
  const { showOnFront, homepageSlug } = globals.reading;
  if (showOnFront === "page" && homepageSlug) {
    return homepageSlug;
  }
  return getHomepageSlug(lang);
}

export function getMenuId(
  location: "primary" | "footer" | "legal",
  lang: "nl" | "en"
): string | undefined {
  const k = `WP_MENU_${location.toUpperCase()}_${lang.toUpperCase()}` as const;
  return process.env[k] || process.env[`WORDPRESS_MENU_${location.toUpperCase()}_${lang.toUpperCase()}`];
}

export function getCptRestBase(
  which: "service" | "testimonial" | "case_study"
): string {
  if (which === "service") {
    return process.env.WORDPRESS_SERVICE_REST_BASE || "service";
  }
  if (which === "testimonial") {
    return process.env.WORDPRESS_TESTIMONIAL_REST_BASE || "testimonial";
  }
  return process.env.WORDPRESS_CASE_STUDY_REST_BASE || "case_study";
}

/** Single segment path for blog archive (breadcrumbs). Override per locale or fall back to `blog`. */
export function getBlogPageSlug(lang: "nl" | "en"): string {
  const key = `WORDPRESS_BLOG_PAGE_SLUG_${lang.toUpperCase()}` as const;
  return process.env[key]?.trim() || process.env.WORDPRESS_BLOG_PAGE_SLUG?.trim() || "blog";
}

/** Single segment path for case study archive (breadcrumbs). Override per locale or fall back to `case-studies` (CPT rewrite slug). */
export function getCaseStudyArchiveSlug(lang: "nl" | "en"): string {
  const key = `WORDPRESS_CASE_STUDY_PAGE_SLUG_${lang.toUpperCase()}` as const;
  return process.env[key]?.trim() || process.env.WORDPRESS_CASE_STUDY_PAGE_SLUG?.trim() || "case-studies";
}
