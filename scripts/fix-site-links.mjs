#!/usr/bin/env node
/** Fix CMS links. Dry-run by default. Usage: node scripts/fix-site-links.mjs [--apply] */
import {
  LOCALES, PATHS, CHECKOUT_URL, collectLinks, detectIntent, resolveTarget,
  loadEnv, getWpConfig, wpFetch, fetchAllPosts, applyLinkFix, cloneDeep, normalizeUrl, langFromSlug, sanitizeAcfForRest,
} from "./lib/site-links-shared.mjs";

const apply = process.argv.includes("--apply");
await loadEnv();
const { apiBase, auth } = getWpConfig();

const MENU_FIXES = {
  en: { "About Us": "/en/about-us", "For whom we are here": "/en/for-whom-we-are-here", "Case Studies": "/en/case-studies", Blogs: "/en/blogs", Home: "/en" },
  nl: { Thuis: "/", Home: "/", "Over ons": "/over-ons", "Voor wie wij er zijn": "/voor-wie-wij-er-zijn", klantverhalen: "/klantverhalen", Blog: "/blog" },
};

function recommend(link) {
  const lang = langFromSlug(link.slug) || link.lang;
  if (link.type === "options" && (link.field === "header_cta_link" || link.field === "footer_cta_primary_link")) return CHECKOUT_URL;
  if ((link.slug === "demo-pagina" || link.slug === "demo-page") && /demo|gratis/i.test(link.title)) return PATHS.demoForm[lang];
  const intent = detectIntent(link.title, link.field);
  return resolveTarget(intent, lang, link.url, link.title, link.field);
}

let changeCount = 0;
const seen = new Set();

for (const lang of LOCALES) {
  for (const type of ["pages", "service"]) {
    const items = await fetchAllPosts(apiBase, auth, type, lang);
    for (const item of items) {
      const itemLang = langFromSlug(item.slug);
      if (!itemLang) continue;
      const acf = cloneDeep(item.acf);
      const links = collectLinks(acf, itemLang, { slug: item.slug, type, id: item.id, path: "acf" });
      let changed = false;
      for (const link of links) {
        const target = recommend(link);
        if (!target || target === link.url) continue;
        const key = `${item.id}:${link.field}:${target}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const field = link.field.replace(/^acf\./, "");
        if (applyLinkFix(acf, field, target)) {
          changed = true;
          changeCount += 1;
          console.log(`${apply ? "APPLY" : "DRY"} ${itemLang}/${item.slug} ${field}: ${link.url} -> ${target}`);
        }
      }
      if (changed && apply) { try { await wpFetch(apiBase, auth, `/wp/v2/${type}/${item.id}`, { method: "POST", lang: itemLang, body: { acf: sanitizeAcfForRest(acf) } }); } catch (e) { console.warn(`FAIL ${itemLang}/${item.slug}: ${e.message}`); } }
    }
  }

  const globals = await wpFetch(apiBase, auth, `/omb-headless/v1/globals?lang=${lang}`, { lang });
  const headerLink = globals.header?.header_cta_link;
  const footerPrimary = globals.footer?.footer_cta_primary_link;
  if (headerLink?.url !== CHECKOUT_URL) {
    changeCount += 1;
    console.log(`${apply ? "APPLY" : "DRY"} globals/${lang} header_cta_link -> ${CHECKOUT_URL}`);
    if (apply) {
      try { await wpFetch(apiBase, auth, `/acf/v3/options/omb-header-settings`, { method: "POST", lang, body: { acf: { header_cta_link: { title: headerLink?.title || (lang === "nl" ? "Begin nu" : "Start Now"), url: CHECKOUT_URL, target: "_blank" } } } }); } catch (e) { console.warn(e.message); }
    }
  }
  if (footerPrimary?.url !== CHECKOUT_URL) {
    changeCount += 1;
    console.log(`${apply ? "APPLY" : "DRY"} globals/${lang} footer_cta_primary_link -> ${CHECKOUT_URL}`);
    if (apply) {
      try { await wpFetch(apiBase, auth, `/acf/v3/options/omb-footer-settings`, { method: "POST", lang, body: { acf: { footer_cta_primary_link: { title: footerPrimary?.title || (lang === "nl" ? "Begin Nu" : "Start Now"), url: CHECKOUT_URL, target: "_blank" } } } }); } catch (e) { console.warn(e.message); }
    }
  }
}

const MENU_IDS = { primary: { nl: process.env.WP_MENU_PRIMARY_NL, en: process.env.WP_MENU_PRIMARY_EN }, footer: { nl: process.env.WP_MENU_FOOTER_NL, en: process.env.WP_MENU_FOOTER_EN }, legal: { nl: process.env.WP_MENU_LEGAL_NL, en: process.env.WP_MENU_LEGAL_EN } };
for (const [location, ids] of Object.entries(MENU_IDS)) {
  for (const lang of LOCALES) {
    const menuId = ids[lang]; if (!menuId) continue;
    const items = await wpFetch(apiBase, auth, `/wp/v2/menu-items?menus=${menuId}&per_page=100&orderby=menu_order&order=asc`, { lang });
    for (const item of items) {
      const title = item.title?.rendered || "";
      const target = MENU_FIXES[lang]?.[title];
      if (!target || normalizeUrl(item.url) === target) continue;
      changeCount += 1;
      console.log(`${apply ? "APPLY" : "DRY"} menu/${location}/${lang} "${title}": ${item.url} -> ${target}`);
      if (apply) await wpFetch(apiBase, auth, `/wp/v2/menu-items/${item.id}`, { method: "POST", lang, body: { url: target } });
    }
  }
}
console.log(`\n${apply ? "Applied" : "Planned"} ${changeCount} change(s).`);
if (!apply && changeCount > 0) console.log("Re-run with --apply to write changes.");


