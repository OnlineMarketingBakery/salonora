/**
 * Shared constants and helpers for audit-site-links.mjs + fix-site-links.mjs.
 */
export const CHECKOUT_URL = "https://salonora.plugandpay.com/checkout/professionele-salon-boekingssysteem";
export const ALT_CHECKOUT_URL = "https://salonora.plugandpay.com/checkout/professionele-website-op-maat";
export const LOCALES = ["nl", "en"];
export const PRIMARY_LOCALE = "nl";

/** Public Next.js path for a locale + slug segment (primary locale has no prefix). */
export function buildCmsPath(lang, slug = "") {
  const clean = String(slug || "").replace(/^\//, "");
  if (lang === PRIMARY_LOCALE) return clean ? `/${clean}` : "/";
  return clean ? `/${lang}/${clean}` : `/${lang}`;
}
export const PATHS = {
  demo: { nl: "/demo-pagina", en: "/en/demo-page" },
  demoForm: { nl: "/demo-pagina#free-demo-form", en: "/en/demo-page#free-demo-form" },
  caseStudies: { nl: "/klantverhalen", en: "/en/case-studies" },
  home: { nl: "/", en: "/en" },
  whom: { nl: "/voor-wie-wij-er-zijn", en: "/en/for-whom-we-are-here" },
};
export const CONTACT = { email: "mailto:hoi@salonora.nl", phone: "tel:+31681843267" };
export const SERVICE_SLUGS = {
  barbershop: { nl: "barbershops", en: "barbershop" },
  hair: { nl: "kapperszaken", en: "hair-salons" },
  nail: { nl: "nagelsalons", en: "nail-salons" },
  pedicure: { nl: "pedicure-salon", en: "pedicures" },
  massage: { nl: "massagesalon", en: "massage-salons" },
};
export const LINK_FIELD_KEYS = new Set(["cta_url","cta_link","button","redirect_link","pill_link","download_link","left_link","right_primary_link","right_secondary_link","footer_cta_link","primary_cta","secondary_cta","header_cta_link","footer_cta_primary_link","footer_cta_secondary_link","announcement_link"]);
export function servicePath(lang, key) { const slug = SERVICE_SLUGS[key]?.[lang]; return slug ? buildCmsPath(lang, slug) : null; }
export function normalizeUrl(url) { return String(url || "").trim(); }
export function isBrokenInternal(url) { const u = normalizeUrl(url); return u === "#" || u === "/contact" || u === "/contact/"; }
export function isPlaceholderPhone(url) { return /tel:\+1234567890/i.test(normalizeUrl(url)); }
export function isDeadAboutUs2(url) { return /about-us-2/i.test(normalizeUrl(url)); }
export function isWpBackendUrl(url) { return /backend\.salonora\.eu/i.test(normalizeUrl(url)); }
export function isWrongCheckout(url) { return normalizeUrl(url).includes("professionele-website-op-maat"); }
export function isEmptyOrRoot(url) { const u = normalizeUrl(url); return u === "" || u === "/"; }
export function detectIntent(label, fieldPath = "") {
  const lower = String(label || "").trim().toLowerCase();
  const fp = fieldPath.toLowerCase();
  if (fp.includes("contact_ctas")) {
    if (/mail|bericht|message|stuur/i.test(lower)) return "contact-email";
    if (/gesprek|meeting|plan|bel|call|phone/i.test(lower)) return "contact-phone";
  }
  if (/demo|bekijk eerst/i.test(lower) && !/gratis demo/i.test(lower)) return "demo";
  if (/gratis demo|free demo|stuur mij de demo|send me the demo/i.test(lower)) return "demo-form";
  if (/bekijk ons werk|view our work/i.test(lower)) return "case-studies";
  if (/bekijk mijn branche|view my industry/i.test(lower)) return "industry-hub";
  if (/barbershop/i.test(lower)) return "service-barbershop";
  if (/kapperszaak|hair salon/i.test(lower)) return "service-hair";
  if (/nagelstudio|nail salon/i.test(lower)) return "service-nail";
  if (/pedicure/i.test(lower) && !/salon/i.test(lower)) return "service-pedicure";
  if (/massagesalon|massage salon/i.test(lower)) return "service-massage";
  if (/start nu|start now|begin nu|begin met boeken|start taking bookings|start today|start vandaag|ja, ik wil|yes, i want|wil dit|want this|complete oplossing|complete solution|aan de slag|begin vandaag|dit is voor mij|this is for me/i.test(lower)) {
    if (/demo/i.test(lower)) return "demo-form";
    if (/download|gids|guide|garanties|guarantees/i.test(lower)) return "keep";
    return "checkout";
  }
  if (/download/i.test(lower)) return "keep";
  return null;
}
export function resolveTarget(intent, lang, currentUrl, label, fieldPath) {
  const map = {
    checkout: CHECKOUT_URL,
    demo: PATHS.demo[lang],
    "demo-form": PATHS.demoForm[lang],
    "case-studies": PATHS.caseStudies[lang],
    "industry-hub": PATHS.whom[lang],
    "contact-email": CONTACT.email,
    "contact-phone": CONTACT.phone,
    "service-barbershop": servicePath(lang, "barbershop"),
    "service-hair": servicePath(lang, "hair"),
    "service-nail": servicePath(lang, "nail"),
    "service-pedicure": servicePath(lang, "pedicure"),
    "service-massage": servicePath(lang, "massage"),
    keep: null,
  };
  if (intent && intent in map) return map[intent];
  const u = normalizeUrl(currentUrl);
  if (isBrokenInternal(u) || isDeadAboutUs2(u) || isWrongCheckout(u) || isPlaceholderPhone(u)) {
    const inferred = detectIntent(label, fieldPath);
    if (inferred) return resolveTarget(inferred, lang, u, label, fieldPath);
    if (isPlaceholderPhone(u)) return CONTACT.phone;
    if (isBrokenInternal(u)) return CHECKOUT_URL;
    if (isDeadAboutUs2(u)) return PATHS.whom[lang];
    if (isWrongCheckout(u)) return CHECKOUT_URL;
  }
  if (isEmptyOrRoot(u) && /demo/i.test(label)) return PATHS.demo[lang];
  if (isEmptyOrRoot(u) && /boeken|bookings|complete|oplossing|solution/i.test(label)) return CHECKOUT_URL;
  if (isWpBackendUrl(u)) {
    try {
      const path = new URL(u).pathname.replace(/\/$/, "") || "/";
      const parts = path.split("/").filter(Boolean);
      const slug = parts[parts.length - 1] || "";
      if (slug && slug !== "wp-content") return `/${lang}/${slug}`;
    } catch {}
  }
  if (u.startsWith("/demo-pagina")) return PATHS.demo.nl;
  if (u.startsWith("/demo-page")) return PATHS.demo.en;
  if (u.startsWith("/en/demo-pagina")) return PATHS.demo.en;
  if (u.startsWith("/nl/demo-page")) return PATHS.demo.nl;
  if (u.startsWith("/nl/")) return buildCmsPath("nl", u.replace(/^\/nl\/?/, ""));
  if (u === "/contact" || u === "/contact/") return CHECKOUT_URL;
  return null;
}
export function collectLinks(root, lang, meta = {}, out = []) {
  if (!root || typeof root !== "object") return out;
  if (Array.isArray(root)) {
    root.forEach((item, i) => collectLinks(item, lang, { ...meta, path: `${meta.path || ""}[${i}]` }, out));
    return out;
  }
  for (const [key, value] of Object.entries(root)) {
    const path = meta.path ? `${meta.path}.${key}` : key;
    if (LINK_FIELD_KEYS.has(key) && value && typeof value === "object" && "url" in value) {
      out.push({ lang, slug: meta.slug || "", type: meta.type || "", id: meta.id || null, field: path, title: String(value.title || "").trim(), url: normalizeUrl(value.url) });
    }
    if (key === "ctas" && Array.isArray(value)) {
      value.forEach((row, i) => {
        if (row?.cta_url && typeof row.cta_url === "object") {
          out.push({ lang, slug: meta.slug || "", type: meta.type || "", id: meta.id || null, field: `${path}[${i}].cta_url`, title: String(row.cta_text || row.cta_url.title || "").trim(), url: normalizeUrl(row.cta_url.url) });
        }
      });
    }
    collectLinks(value, lang, { ...meta, path }, out);
  }
  return out;
}
export function classifyIssue(link, recommended) {
  const issues = [];
  const u = link.url;
  if (isBrokenInternal(u)) issues.push("broken-internal");
  if (isPlaceholderPhone(u)) issues.push("placeholder-phone");
  if (isDeadAboutUs2(u)) issues.push("dead-about-us-2");
  if (isWrongCheckout(u)) issues.push("wrong-checkout");
  if (isEmptyOrRoot(u)) issues.push("empty-url");
  if (isWpBackendUrl(u)) issues.push("wp-backend-url");
  if (u === "/contact" || u === "/contact/") issues.push("broken-contact");
  if (recommended && recommended !== u) issues.push("needs-fix");
  return [...new Set(issues)];
}
export async function loadEnv() {
  const { config } = await import("dotenv");
  const { existsSync } = await import("node:fs");
  const { join, dirname } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  if (existsSync(join(root, ".env.local"))) config({ path: join(root, ".env.local") });
  if (existsSync(join(root, ".env"))) config({ path: join(root, ".env") });
  return root;
}
export function getWpConfig() {
  const apiBase = (process.env.WORDPRESS_API_URL || "").replace(/\/$/, "");
  const user = process.env.WORDPRESS_APPLICATION_USER;
  const pass = process.env.WORDPRESS_APPLICATION_PASSWORD;
  if (!apiBase || !user || !pass) throw new Error("Set WORDPRESS_API_URL, WORDPRESS_APPLICATION_USER, and WORDPRESS_APPLICATION_PASSWORD.");
  const auth = Buffer.from(`${user}:${pass.replace(/\s+/g, "")}`).toString("base64");
  return { apiBase, auth };
}
export async function wpFetch(apiBase, auth, path, { method = "GET", lang, body } = {}) {
  const res = await fetch(`${apiBase}${path}`, { method, headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json", ...(lang ? { "X-Polylang-Language": lang } : {}) }, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`${method} ${path} ${res.status}: ${(await res.text()).slice(0, 500)}`);
  return res.json();
}
export async function fetchAllPosts(apiBase, auth, type, lang) {
  let page = 1; const all = [];
  while (true) {
    const batch = await wpFetch(apiBase, auth, `/wp/v2/${type}?per_page=100&page=${page}&lang=${lang}&acf_format=standard&status=publish`, { lang });
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return all;
}
export function applyLinkFix(acf, fieldPath, newUrl) {
  const parts = fieldPath.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let node = acf;
  for (let i = 0; i < parts.length - 1; i++) node = node?.[parts[i]];
  const last = parts[parts.length - 1];
  if (!node || !node[last] || typeof node[last] !== "object") return false;
  if (node[last].url === newUrl) return false;
  node[last] = { ...node[last], url: newUrl };
  return true;
}
export function cloneDeep(value) { return JSON.parse(JSON.stringify(value ?? null)); }

export const NL_SLUGS = new Set(["home","over-ons","voor-wie-wij-er-zijn","blog","klantverhalen","demo-pagina","campagne","onweerstaanbaar-aanbod","privacybeleid","algemene-voorwaarden","veelgestelde-vragen","massagesalon","nagelsalons","kapperszaken","barbershops","pedicure-salon"]);
export const EN_SLUGS = new Set(["home-2","about-us","for-whom-we-are-here","blogs","case-studies","demo-page","campaign","irresistible-offer","privacy-policy","terms-conditions","faqs","massage-salons","nail-salons","hair-salons","barbershop","pedicures"]);
export function langFromSlug(slug) {
  if (NL_SLUGS.has(slug)) return "nl";
  if (EN_SLUGS.has(slug)) return "en";
  return null;
}


function isLinkObject(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "url" in value &&
    !("mime_type" in value) &&
    !("acf_fc_layout" in value)
  );
}
const LINKISH_KEYS = new Set(["button","cta_link","pill_link","download_link","left_link","right_primary_link","right_secondary_link","footer_cta_link","primary_cta","secondary_cta","redirect_link","link"]);
export function sanitizeAcfForRest(value, key = "") {
  if (LINKISH_KEYS.has(key) && (value === false || value === "" || value === null)) {
    return { title: "", url: "", target: "" };
  }
  if (value === false) {
    if (key === "page_footer_sections" || key === "service_highlights") return [];
    return null;
  }
  if (value === "") {
    if (/(padding|width|height|size|count|order|rating|gap|offset|margin|columns?|image|icon|logo|avatar|photo|thumbnail|media|background)/i.test(key)) {
      return null;
    }
    return value;
  }
  if (Array.isArray(value)) return value.map((v, i) => sanitizeAcfForRest(v, String(i)));
  if (isLinkObject(value)) {
    const url = typeof value.url === "string" ? value.url : "";
    return { title: value.title ?? "", url, target: value.target ?? "" };
  }
  if (!value || typeof value !== "object") return value;
  if ("post_type" in value && ("ID" in value || "id" in value)) {
    const id = value.ID ?? value.id;
    return typeof id === "number" ? id : null;
  }
  if ("mime_type" in value && ("id" in value || "ID" in value)) {
    const id = value.id ?? value.ID;
    return typeof id === "number" ? id : null;
  }
  const out = {};
  for (const [k, v] of Object.entries(value)) out[k] = sanitizeAcfForRest(v, k);
  return out;
}
