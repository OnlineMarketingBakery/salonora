#!/usr/bin/env node
/** Seed privacy-policy and terms-conditions into WordPress. See README. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");
const contentDir = join(root, "src/lib/legal/content");
const apiBase = (process.env.WORDPRESS_API_URL || "").replace(/\/$/, "");
const user = process.env.WORDPRESS_APPLICATION_USER;
const pass = process.env.WORDPRESS_APPLICATION_PASSWORD;
if (!apiBase || !user || !pass) {
  console.error("Set WORDPRESS_API_URL, WORDPRESS_APPLICATION_USER, WORDPRESS_APPLICATION_PASSWORD.");
  process.exit(1);
}
const auth = Buffer.from(`${user}:${pass}`).toString("base64");
function loadHtml(name, lang) {
  return readFileSync(join(contentDir, `${name}.${lang}.html`), "utf8");
}
const PAGES = [
  { slug: "privacy-policy", title: { nl: "Privacybeleid", en: "Privacy Policy" }, html: { nl: () => loadHtml("privacy-policy", "nl"), en: () => loadHtml("privacy-policy", "en") }, acf: { is_legal_page: true } },
  { slug: "terms-conditions", title: { nl: "Algemene voorwaarden", en: "Terms & Conditions" }, html: { nl: () => loadHtml("terms-conditions", "nl"), en: () => loadHtml("terms-conditions", "en") }, acf: { is_legal_page: true } },
];
async function wpFetch(path, { method = "GET", lang, body } = {}) {
  const res = await fetch(`${apiBase}${path}`, { method, headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json", ...(lang ? { "X-Polylang-Language": lang } : {}) }, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`${method} ${path} ${res.status}: ${(await res.text()).slice(0, 400)}`);
  return res.json();
}
async function upsertPage(def, lang) {
  const list = await wpFetch(`/wp/v2/pages?slug=${encodeURIComponent(def.slug)}&per_page=1`, { lang });
  const payload = { title: def.title[lang], slug: def.slug, status: "publish", content: def.html[lang](), acf: def.acf };
  if (list[0]) { await wpFetch(`/wp/v2/pages/${list[0].id}`, { method: "POST", lang, body: payload }); console.log(`Updated ${lang}/${def.slug}`); }
  else { await wpFetch("/wp/v2/pages", { method: "POST", lang, body: payload }); console.log(`Created ${lang}/${def.slug}`); }
}
for (const def of PAGES) for (const lang of ["nl", "en"]) await upsertPage(def, lang);
console.log("FAQ: create slug faq in WP with ACF faq section, or use Next /faq fallback.");
