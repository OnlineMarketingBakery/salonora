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

export function getHomepageSlug(lang: "nl" | "en"): string {
  const key = `HOMEPAGE_SLUG_${lang.toUpperCase()}` as const;
  return process.env[key] || process.env.HOMEPAGE_SLUG || "home";
}

export function getMenuId(
  location: "primary" | "footer" | "legal",
  lang: "nl" | "en"
): string | undefined {
  const k = `WP_MENU_${location.toUpperCase()}_${lang.toUpperCase()}` as const;
  return process.env[k] || process.env[`WORDPRESS_MENU_${location.toUpperCase()}_${lang.toUpperCase()}`];
}

export function getCptRestBase(
  which: "service" | "testimonial"
): string {
  return process.env[
    which === "service" ? "WORDPRESS_SERVICE_REST_BASE" : "WORDPRESS_TESTIMONIAL_REST_BASE"
  ] || which;
}
