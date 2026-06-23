#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  LOCALES, PATHS, collectLinks, classifyIssue, recommendLinkTarget,
  loadEnv, getWpConfig, wpFetch, fetchAllPosts, normalizeUrl, isWpBackendUrl,
} from "./lib/site-links-shared.mjs";

const asJson = process.argv.includes("--json");
await loadEnv();
const { apiBase, auth } = getWpConfig();

const MENU_IDS = {
  primary: { nl: process.env.WP_MENU_PRIMARY_NL, en: process.env.WP_MENU_PRIMARY_EN },
  footer: { nl: process.env.WP_MENU_FOOTER_NL, en: process.env.WP_MENU_FOOTER_EN },
  legal: { nl: process.env.WP_MENU_LEGAL_NL, en: process.env.WP_MENU_LEGAL_EN },
};

const findings = [];

for (const lang of LOCALES) {
  for (const type of ["pages", "service"]) {
    const items = await fetchAllPosts(apiBase, auth, type, lang);
    for (const item of items) {
      const links = collectLinks(item.acf, lang, { slug: item.slug, type, id: item.id, path: "acf" });
      for (const link of links) {
        const recommended = recommendLinkTarget(link);
        const issues = classifyIssue(link, recommended);
        if (issues.length) findings.push({ ...link, issues: issues.join(","), recommended: recommended || "" });
      }
    }
  }

  const globals = await wpFetch(apiBase, auth, `/omb-headless/v1/globals?lang=${lang}`, { lang });
  for (const [name, value] of [
    ["header_cta_link", globals.header?.header_cta_link],
    ["footer_cta_primary_link", globals.footer?.footer_cta_primary_link],
    ["footer_cta_secondary_link", globals.footer?.footer_cta_secondary_link],
  ]) {
    if (!value?.url) continue;
    const link = { lang, slug: "globals", type: "options", id: null, field: name, title: value.title || "", url: normalizeUrl(value.url) };
    const recommended = recommendLinkTarget(link);
    const issues = classifyIssue(link, recommended);
    if (issues.length) findings.push({ ...link, issues: issues.join(","), recommended: recommended || "" });
  }
}

for (const [location, ids] of Object.entries(MENU_IDS)) {
  for (const lang of LOCALES) {
    const menuId = ids[lang];
    if (!menuId) continue;
    const items = await wpFetch(apiBase, auth, `/wp/v2/menu-items?menus=${menuId}&per_page=100&orderby=menu_order&order=asc`, { lang });
    for (const item of items) {
      const url = normalizeUrl(item.url);
      let recommended = null;
      if (url === "#") continue;
      if (isWpBackendUrl(url) || !url.startsWith(`/${lang}`)) {
        try {
          const path = new URL(url.startsWith("http") ? url : `https://backend.salonora.eu${url}`).pathname.replace(/\/$/, "");
          const parts = path.split("/").filter(Boolean).filter((p) => p !== "nl" && p !== "en");
          const slug = parts[parts.length - 1] || "";
          recommended = slug ? `/${lang}/${slug}` : PATHS.home[lang];
        } catch { recommended = PATHS.home[lang]; }
      }
      if (item.title?.rendered === "Thuis" || item.title?.rendered === "Home") recommended = PATHS.home[lang];
      const link = { lang, slug: `menu-${location}`, type: "menu-item", id: item.id, field: item.title?.rendered || "", title: item.title?.rendered || "", url };
      const issues = classifyIssue(link, recommended);
      if (issues.length) findings.push({ ...link, issues: issues.join(","), recommended: recommended || "" });
    }
  }
}

if (asJson) {
  console.log(JSON.stringify(findings, null, 2));
} else {
  console.log(`Found ${findings.length} link issue(s)\n`);
  for (const f of findings) {
    console.log(`${f.lang} | ${f.type} | ${f.slug} | ${f.field} | ${f.title} | ${f.url} => ${f.recommended} [${f.issues}]`);
  }
}

const outPath = join(process.cwd(), "scripts", "audit-site-links-report.json");
writeFileSync(outPath, JSON.stringify(findings, null, 2));
if (!asJson) console.log(`\nReport written to ${outPath}`);
process.exit(findings.length ? 1 : 0);
