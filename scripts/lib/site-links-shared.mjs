/**
 * Shared constants and helpers for audit-site-links.mjs + fix-site-links.mjs.
 */
export const CHECKOUT_BOOKING_URL =
  "https://salonora.plugandpay.com/checkout/professionele-salon-boekingssysteem";
export const CHECKOUT_WEBSITE_URL =
  "https://salonora.plugandpay.com/checkout/professionele-website-op-maat";

/** @deprecated Use CHECKOUT_BOOKING_URL */
export const CHECKOUT_URL = CHECKOUT_BOOKING_URL;
export const ALT_CHECKOUT_URL = CHECKOUT_WEBSITE_URL;

export const LOCALES = ["nl", "en"];
export const PRIMARY_LOCALE = "nl";

export const CAMPAIGN_PATH = { nl: "/nl/campagne", en: "/en/campaign" };

export const SALES_FUNNEL_SLUGS = new Set([
  "campagne",
  "onweerstaanbaar-aanbod",
  "campaign",
  "irresistible-offer",
]);

export function buildCmsPath(lang, slug = "") {
  const clean = String(slug || "").replace(/^\//, "");
  return clean ? `/${lang}/${clean}` : `/${lang}`;
}


export function isServiceSlug(slug) {
  if (!slug) return false;
  return Object.values(SERVICE_SLUGS).some((byLang) => Object.values(byLang).includes(slug));
}

export function isSelfReferencingServiceUrl(link) {
  if (link.type !== "service" || !link.slug) return false;
  const u = normalizeUrl(link.url);
  if (!u || u === "/") return false;
  const expected = buildCmsPath(link.lang, link.slug);
  if (u === expected || u === `${expected}/`) return true;
  return u.endsWith(`/${link.slug}`) || u.endsWith(`/${link.slug}/`);
}

function labelImpliesCampaignQualification(label) {
  const lower = String(label || "").trim().toLowerCase();
  return /^ja,? dit is voor mij$|^yes,? this is for me$|^dit is voor mij$|^this is for me$/i.test(lower);
}

function labelImpliesPurchase(label) {
  const lower = String(label || "").trim().toLowerCase();
  return (
    /start nu|start now|begin nu|begin met boeken|start taking bookings|start today|start vandaag|ja,? ik wil|yes,? i want|wil dit|want this|dit wil ik|complete oplossing|complete solution|aan de slag|begin vandaag|€\s*10|€\s*50|10\/maand|50\/maand|boekingsmodule|website op maat|complete pakket/i.test(
      lower
    )
  );
}

export const PATHS = {
  demo: { nl: "/nl/demo-pagina", en: "/en/demo-page" },
  demoForm: { nl: "/nl/demo-pagina#free-demo-form", en: "/en/demo-page#free-demo-form" },
  caseStudies: { nl: "/nl/klantverhalen", en: "/en/case-studies" },
  home: { nl: "/nl", en: "/en" },
  whom: { nl: "/nl/voor-wie-wij-er-zijn", en: "/en/for-whom-we-are-here" },
  campaign: CAMPAIGN_PATH,
};

export const CONTACT = { email: "mailto:hoi@salonora.nl", phone: "tel:+31681843267" };

export const SERVICE_SLUGS = {
  barbershop: { nl: "barbershops", en: "barbershop" },
  hair: { nl: "kapperszaken", en: "hair-salons" },
  nail: { nl: "nagelsalons", en: "nail-salons" },
  pedicure: { nl: "pedicure-salon", en: "pedicures" },
  massage: { nl: "massagesalon", en: "massage-salons" },
};

export const LINK_FIELD_KEYS = new Set([
  "cta_url","cta_link","button","redirect_link","pill_link","download_link","left_link",
  "right_primary_link","right_secondary_link","footer_cta_link","primary_cta","secondary_cta",
  "header_cta_link","footer_cta_primary_link","footer_cta_secondary_link","announcement_link",
]);

export function servicePath(lang, key) {
  const slug = SERVICE_SLUGS[key]?.[lang];
  return slug ? buildCmsPath(lang, slug) : null;
}

export function normalizeUrl(url) { return String(url || "").trim(); }

export function isPlugAndPayCheckout(url) {
  return /plugandpay\.com\/checkout\//i.test(normalizeUrl(url));
}

export function isBrokenInternal(url) {
  const u = normalizeUrl(url);
  return u === "#" || u === "/contact" || u === "/contact/";
}

export function isPlaceholderPhone(url) { return /tel:\+1234567890/i.test(normalizeUrl(url)); }
export function isDeadAboutUs2(url) { return /about-us-2/i.test(normalizeUrl(url)); }
export function isWpBackendUrl(url) { return /backend\.salonora\.eu/i.test(normalizeUrl(url)); }
export function isEmptyOrRoot(url) { const u = normalizeUrl(url); return u === "" || u === "/"; }
export function isSalesFunnelSlug(slug) { return SALES_FUNNEL_SLUGS.has(String(slug || "").trim()); }

export function pricingCardIndexFromFieldPath(fieldPath) {
  const fp = String(fieldPath || "").toLowerCase();
  for (const re of [/\.cards\[(\d+)\]/, /\.items\[(\d+)\]/, /\.pricing_cards\[(\d+)\]/, /\.pricing_ctas\[(\d+)\]/]) {
    const m = fp.match(re);
    if (m) return Number(m[1]);
  }
  return null;
}

export function labelImpliesWebsiteTier(label) {
  const lower = String(label || "").trim().toLowerCase();
  return (
    /€\s*50|50\s*\/\s*maand|50\/maand|€\s*500|€500/.test(lower) ||
    /complete pakket|complete solution|complete package|complete website|het complete pakket/.test(lower) ||
    /website op maat|custom website|website package|professionele website/.test(lower) ||
    /start compleet|start het complete|start complete|complete oplossing/.test(lower) ||
    /start compleet met website|met website —|with website —|start het complete pakket/.test(lower)
  );
}

export function labelImpliesBookingTier(label) {
  const lower = String(label || "").trim().toLowerCase();
  return (
    /€\s*10|10\s*\/\s*maand|10\/maand/.test(lower) ||
    /boekingsmodule|booking module|begin met boeken|begin met de boeking|start taking bookings/.test(lower) ||
    /begin voor €10|start for €10|€10\/month|10\/month/.test(lower) ||
    /stop dit nu.*€10|begin klein voor €10|begin zonder risico voor €10/.test(lower)
  );
}

export function labelImpliesGenericCampaign(label) {
  const lower = String(label || "").trim().toLowerCase();
  if (labelImpliesWebsiteTier(label) || labelImpliesBookingTier(label)) return false;
  return (
    /^start nu$|^begin nu$|^start now$|^begin now$/.test(lower) ||
    /begin vandaag|start today|begin today|aan de slag|ik wil beginnen|i want to start/.test(lower) ||
    (/^start nu|^begin nu|^start now|^begin now/.test(lower) && !/€|\/maand|month|pakket|package|website|boeking|booking/.test(lower))
  );
}

export function resolveCheckoutTier(label, fieldPath, slug, lang) {
  const cardIndex = pricingCardIndexFromFieldPath(fieldPath);
  if (cardIndex === 0) return CHECKOUT_BOOKING_URL;
  if (cardIndex === 1) return CHECKOUT_WEBSITE_URL;
  if (labelImpliesWebsiteTier(label)) return CHECKOUT_WEBSITE_URL;
  if (labelImpliesBookingTier(label)) return CHECKOUT_BOOKING_URL;
  if (!isSalesFunnelSlug(slug) && labelImpliesGenericCampaign(label)) {
    return CAMPAIGN_PATH[lang] || CAMPAIGN_PATH.nl;
  }
  if (isServiceSlug(slug) && labelImpliesPurchase(label)) {
    return CHECKOUT_BOOKING_URL;
  }
  if (isSalesFunnelSlug(slug)) {
    if (/complete|website|pakket|package|€\s*50|50\/maand/i.test(label)) return CHECKOUT_WEBSITE_URL;
    if (/€\s*10|10\/maand|boeking|booking/i.test(label)) return CHECKOUT_BOOKING_URL;
  }
  return null;
}

export function detectIntent(label, fieldPath = "") {
  const lower = String(label || "").trim().toLowerCase();
  const fp = fieldPath.toLowerCase();
  if (fp.includes("contact_ctas")) {
    if (/mail|bericht|message|stuur/i.test(lower)) return "contact-email";
    if (/gesprek|meeting|plan een|bel|call|phone/i.test(lower) && !/€/i.test(lower)) return "contact-phone";
  }
  if (/demo|bekijk eerst/i.test(lower) && !/gratis demo/i.test(lower)) return "demo";
  if (/gratis demo|free demo|stuur mij de demo|send me the demo/i.test(lower)) return "demo-form";
  if (/bekijk ons werk|view our work/i.test(lower)) return "case-studies";
  if (/bekijk mijn branche|view my industry/i.test(lower)) return "industry-hub";
  if (labelImpliesCampaignQualification(lower)) return "campaign";
  if (labelImpliesPurchase(lower)) {
    if (/demo/i.test(lower)) return "demo-form";
    if (/download|gids|guide|garanties|guarantees/i.test(lower)) return "keep";
    return "purchase";
  }
  if (/barbershop/i.test(lower)) return "service-barbershop";
  if (/kapperszaak|hair salon/i.test(lower)) return "service-hair";
  if (/nagelstudio|nail salon/i.test(lower)) return "service-nail";
  if (/pedicure/i.test(lower) && !/salon/i.test(lower)) return "service-pedicure";
  if (/massagesalon|massage salon/i.test(lower)) return "service-massage";
  if (/download/i.test(lower) && !/demo/i.test(lower)) return "keep";
  return null;
}

export function resolveTarget(intent, lang, currentUrl, label, fieldPath, slug = "") {
  const map = {
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
    campaign: CAMPAIGN_PATH[lang],
    "checkout-booking": CHECKOUT_BOOKING_URL,
    "checkout-website": CHECKOUT_WEBSITE_URL,
  };
  if (intent === "purchase") {
    const tier = resolveCheckoutTier(label, fieldPath, slug, lang);
    if (tier) return tier;
  }
  if (intent && intent in map) return map[intent];
  const u = normalizeUrl(currentUrl);
  if (isBrokenInternal(u) || isDeadAboutUs2(u) || isPlaceholderPhone(u)) {
    const inferred = detectIntent(label, fieldPath);
    if (inferred) return resolveTarget(inferred, lang, u, label, fieldPath, slug);
    if (isPlaceholderPhone(u)) return CONTACT.phone;
    if (isBrokenInternal(u)) {
      return isSalesFunnelSlug(slug)
        ? resolveCheckoutTier(label, fieldPath, slug, lang) || CHECKOUT_BOOKING_URL
        : CAMPAIGN_PATH[lang];
    }
    if (isDeadAboutUs2(u)) return PATHS.whom[lang];
  }
  if (isEmptyOrRoot(u) && /demo/i.test(label)) return PATHS.demo[lang];
  if (isEmptyOrRoot(u) && /boeken|bookings|complete|oplossing|solution|pakket|package/i.test(label)) {
    return resolveCheckoutTier(label, fieldPath, slug, lang) || CHECKOUT_BOOKING_URL;
  }
  if (isPlugAndPayCheckout(u)) {
    const tier = resolveCheckoutTier(label, fieldPath, slug, lang);
    if (tier && tier !== u) return tier;
    if (!isSalesFunnelSlug(slug) && labelImpliesGenericCampaign(label)) return CAMPAIGN_PATH[lang];
  }
  if (isWpBackendUrl(u)) {
    try {
      const path = new URL(u).pathname.replace(/\/$/, "") || "/";
      const parts = path.split("/").filter(Boolean);
      const pathSlug = parts[parts.length - 1] || "";
      if (pathSlug && pathSlug !== "wp-content") return buildCmsPath(lang, pathSlug);
    } catch {}
  }
  if (u.startsWith("/demo-pagina")) return PATHS.demo.nl;
  if (u.startsWith("/demo-page")) return PATHS.demo.en;
  if (u.startsWith("/en/demo-pagina")) return PATHS.demo.en;
  if (u.startsWith("/nl/demo-page")) return PATHS.demo.nl;
  if (u.startsWith("/nl/")) return buildCmsPath("nl", u.replace(/^\/nl\/?/, ""));
  if (u === "/contact" || u === "/contact/") return CAMPAIGN_PATH[lang];
  return null;
}

export function recommendLinkTarget(link) {
  const lang = langFromSlug(link.slug) || link.lang;
  const slug = link.slug || "";
  if (link.type === "options" && (link.field === "header_cta_link" || link.field === "footer_cta_primary_link")) {
    return CAMPAIGN_PATH[lang];
  }
  if ((slug === "demo-pagina" || slug === "demo-page") && /demo|gratis/i.test(link.title)) {
    return PATHS.demoForm[lang];
  }
  const intent = detectIntent(link.title, link.field);
  return resolveTarget(intent, lang, link.url, link.title, link.field, slug);
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
  if (isEmptyOrRoot(u)) issues.push("empty-url");
  if (isWpBackendUrl(u)) issues.push("wp-backend-url");
  if (u === "/contact" || u === "/contact/") issues.push("broken-contact");
  if (!isSalesFunnelSlug(link.slug) && isPlugAndPayCheckout(u) && labelImpliesGenericCampaign(link.title)) {
    issues.push("generic-on-checkout");
  }
  if (isPlugAndPayCheckout(u) && recommended) {
    if (recommended === CHECKOUT_WEBSITE_URL && u.includes("boekingssysteem")) issues.push("website-label-on-booking-checkout");
    if (recommended === CHECKOUT_BOOKING_URL && u.includes("website-op-maat")) issues.push("booking-label-on-website-checkout");
    if (recommended === CAMPAIGN_PATH[link.lang] && isPlugAndPayCheckout(u)) issues.push("generic-on-checkout");
  }
  if (
    link.type === "service" &&
    isSelfReferencingServiceUrl(link) &&
    (labelImpliesPurchase(link.title) || labelImpliesCampaignQualification(link.title))
  ) {
    issues.push("self-link-on-service");
  }
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
  return value && typeof value === "object" && !Array.isArray(value) && "url" in value && !("mime_type" in value) && !("acf_fc_layout" in value);
}
const LINKISH_KEYS = new Set(["button","cta_link","pill_link","download_link","left_link","right_primary_link","right_secondary_link","footer_cta_link","primary_cta","secondary_cta","redirect_link","link"]);
export function sanitizeAcfForRest(value, key = "") {
  if (LINKISH_KEYS.has(key) && (value === false || value === "" || value === null)) return { title: "", url: "", target: "" };
  if (value === false) {
    if (key === "page_footer_sections" || key === "service_highlights") return [];
    return null;
  }
  if (value === "") {
    if (/(padding|width|height|size|count|order|rating|gap|offset|margin|columns?|image|icon|logo|avatar|photo|thumbnail|media|background)/i.test(key)) return null;
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
