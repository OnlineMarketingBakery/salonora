#!/usr/bin/env node
/**
 * Seeds privacy-policy and terms-conditions with legal_content ACF sections.
 * Skips when legal_content body is already filled unless --force.
 * Optional: --faq to seed faq section from built-in Q&A list.
 *
 * Usage: node src/lib/legal/seed-legal-pages.mjs [--force] [--faq]
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentDir = join(__dirname, "content");
const faqData = JSON.parse(readFileSync(join(__dirname, "faq-data.json"), "utf8"));

const apiBase = (process.env.WORDPRESS_API_URL || "").replace(/\/$/, "");
const user = process.env.WORDPRESS_APPLICATION_USER;
const pass = process.env.WORDPRESS_APPLICATION_PASSWORD;
const seedFaq = process.argv.includes("--faq");
const force = process.argv.includes("--force");

if (!apiBase || !user || !pass) {
  console.error(
    "Set WORDPRESS_API_URL, WORDPRESS_APPLICATION_USER, and WORDPRESS_APPLICATION_PASSWORD."
  );
  process.exit(1);
}

const auth = Buffer.from(`${user}:${pass}`).toString("base64");

const WP_BOILERPLATE_RE =
  /Suggested text|Gravatar service|post ID of the article you just edited/i;

function loadHtml(name, lang) {
  return readFileSync(join(contentDir, `${name}.${lang}.html`), "utf8");
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isWpBoilerplate(html) {
  return WP_BOILERPLATE_RE.test(stripHtml(html));
}

const LEGAL_PAGES = [
  {
    slug: { nl: "privacybeleid", en: "privacy-policy" },
    title: { nl: "Privacybeleid", en: "Privacy Policy" },
    html: { nl: () => loadHtml("privacy-policy", "nl"), en: () => loadHtml("privacy-policy", "en") },
  },
  {
    slug: { nl: "algemene-voorwaarden", en: "terms-conditions" },
    title: { nl: "Algemene voorwaarden", en: "Terms & Conditions" },
    html: {
      nl: () => loadHtml("terms-conditions", "nl"),
      en: () => loadHtml("terms-conditions", "en"),
    },
  },
];

function faqRows(lang) {
  const rows = faqData[lang] || [];
  return rows
    .filter((it) => !/^(meer vragen|more questions)\??$/i.test(String(it.question || "").trim()))
    .map(({ question, answer }) => [question, answer]);
}

async function wpFetch(path, { method = "GET", lang, body } = {}) {
  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      ...(lang ? { "X-Polylang-Language": lang } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`${method} ${path} ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }
  return res.json();
}

async function findPageBySlug(slug, lang) {
  const list = await wpFetch(`/wp/v2/pages?slug=${encodeURIComponent(slug)}&acf_format=standard`, {
    lang,
  });
  return list[0] ?? null;
}

/** True only when a non-empty legal_content row exists in page_sections. */
function hasLegalContentSection(page) {
  const sections = page?.acf?.page_sections;
  if (!Array.isArray(sections)) return false;
  for (const row of sections) {
    if (row?.acf_fc_layout === "legal_content" && stripHtml(row.body).length > 0) return true;
  }
  return false;
}

function needsLegalSeed(page) {
  if (force) return true;
  if (!hasLegalContentSection(page)) return true;
  const editorHtml = page?.content?.rendered || "";
  if (stripHtml(editorHtml).length > 0 && isWpBoilerplate(editorHtml)) return true;
  return false;
}

function hasFaqContent(page) {
  const sections = page?.acf?.page_sections;
  if (!Array.isArray(sections)) return false;
  for (const row of sections) {
    if (row?.acf_fc_layout === "faq" && Array.isArray(row.items) && row.items.length > 0) return true;
  }
  return false;
}

async function upsertLegalPage(def, lang) {
  const slug = def.slug[lang];
  const existing = await findPageBySlug(slug, lang);
  if (!existing) {
    console.warn(`Skip ${lang}/${slug}: page not found in WordPress`);
    return;
  }
  if (!needsLegalSeed(existing)) {
    console.log(`Skip ${lang}/${slug}: legal_content already set`);
    return;
  }
  const payload = {
    title: def.title[lang],
    slug,
    status: "publish",
    content: "",
    acf: {
      is_legal_page: true,
      hide_page_title: false,
      page_sections: [
        {
          acf_fc_layout: "legal_content",
          body: def.html[lang](),
          content_width: "narrow",
        },
      ],
    },
  };
  await wpFetch(`/wp/v2/pages/${existing.id}`, { method: "POST", lang, body: payload });
  console.log(`Updated ${lang}/${slug} with legal_content${force ? " (force)" : ""}`);
}

const FAQ_PAGE_SLUG = { nl: "veelgestelde-vragen", en: "faqs" };

async function upsertFaq(lang) {
  const slug = FAQ_PAGE_SLUG[lang];
  const existing = await findPageBySlug(slug, lang);
  if (!existing) {
    console.warn(`Skip ${lang}/${slug}: page not found`);
    return;
  }
  if (hasFaqContent(existing) && !force) {
    console.log(`Skip ${lang}/${slug}: already has FAQ items`);
    return;
  }
  const rows = faqRows(lang);
  const payload = {
    acf: {
      page_sections: [
        {
          acf_fc_layout: "faq",
          title: lang === "nl" ? "Veelgestelde vragen" : "Frequently asked questions",
          items: rows.map(([question, answer]) => ({ question, answer })),
        },
      ],
    },
  };
  await wpFetch(`/wp/v2/pages/${existing.id}`, { method: "POST", lang, body: payload });
  console.log(`Updated ${lang}/${slug} with faq section`);
}

for (const def of LEGAL_PAGES) {
  for (const lang of ["nl", "en"]) {
    await upsertLegalPage(def, lang);
  }
}

if (seedFaq) {
  for (const lang of ["nl", "en"]) {
    await upsertFaq(lang);
  }
} else {
  console.log("\nTip: run with --faq to seed the faq page sections.");
}

console.log("\nDone. Revalidate legal paths after deploy (e.g. /nl/privacybeleid, /en/privacy-policy).");
