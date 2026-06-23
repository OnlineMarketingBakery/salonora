#!/usr/bin/env node
/**
 * Verify SEO-related env vs WordPress site config and print post-deploy checklist.
 *
 * Usage:
 *   node src/lib/cms/verify-seo-config.mjs
 */
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const api = (process.env.WORDPRESS_API_URL || "").replace(/\/$/, "");
const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
const defaultLocale = process.env.DEFAULT_LOCALE || "nl";

async function fetchJson(path) {
  const url = `${api}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

async function main() {
  console.log("=== Salonora SEO config check ===\n");
  console.log(`NEXT_PUBLIC_SITE_URL: ${site || "(unset)"}`);
  console.log(`DEFAULT_LOCALE:       ${defaultLocale}`);
  console.log(`WORDPRESS_API_URL:    ${api || "(unset)"}\n`);

  if (!api) {
    console.error("Set WORDPRESS_API_URL in .env.local");
    process.exit(1);
  }

  let wpPrimary = "(unknown)";
  try {
    const cfg = await fetchJson("/omb-headless/v1/site");
    wpPrimary = cfg?.primary_language || "(missing)";
    console.log(`WP primary_language:  ${wpPrimary}`);

    if (wpPrimary !== defaultLocale) {
      console.warn(
        `\n⚠ Mismatch: DEFAULT_LOCALE=${defaultLocale} but WordPress primary_language=${wpPrimary}.`
      );
      console.warn(
        "  Middleware redirects / → /" +
          defaultLocale +
          "; hreflang x-default uses DEFAULT_LOCALE. Align env with Polylang primary if intentional."
      );
    } else {
      console.log("✓ DEFAULT_LOCALE matches WordPress primary_language");
    }
  } catch (e) {
    console.warn("Could not fetch /omb-headless/v1/site:", e.message);
  }

  console.log("\n=== Post-deploy checklist ===");
  console.log(`1. Open ${site}/robots.txt — should reference ${site}/sitemap.xml`);
  console.log(`2. Open ${site}/sitemap.xml — should list NL/EN URLs`);
  console.log("3. View source /en/hair-salons + /nl/kapperszaken — hreflang must cross-link");
  console.log("4. Confirm <html lang=\"en\"> on EN pages");
  console.log("5. Submit sitemap in Google Search Console:");
  console.log(`   ${site}/sitemap.xml`);
  console.log("6. URL Inspection → re-crawl key pages after deploy\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
