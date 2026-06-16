#!/usr/bin/env node
/**
 * Collect FAQ items from all WP pages + services + blog template globals,
 * merge into src/lib/legal/faq-data.json (NL + EN catalogs).
 *
 * Usage: node --import dotenv/config src/lib/legal/merge-site-faqs.mjs dotenv_config_path=.env.local
 */
import { readFileSync, writeFileSync } from "node:fs";

function decodeHtml(text) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8211;|&ndash;/g, "–");
}

const api = (process.env.WORDPRESS_API_URL || "").replace(/\/$/, "");
const user = process.env.WORDPRESS_APPLICATION_USER;
const pass = process.env.WORDPRESS_APPLICATION_PASSWORD;
const serviceBase = process.env.WORDPRESS_SERVICE_REST_BASE || "service";
const dataPath = "src/lib/legal/faq-data.json";

if (!api || !user || !pass) {
  console.error("Missing WORDPRESS_API_URL / WORDPRESS_APPLICATION_USER / WORDPRESS_APPLICATION_PASSWORD");
  process.exit(1);
}

const auth = Buffer.from(`${user}:${pass}`).toString("base64");

const SKIP_QUESTION_RE = /^(meer vragen|more questions)\??$/i;

async function wp(path, lang) {
  const res = await fetch(`${api}${path}`, {
    headers: {
      Authorization: `Basic ${auth}`,
      ...(lang ? { "X-Polylang-Language": lang } : {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path} ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

function walkSections(sections, slug, source) {
  const out = [];
  if (!Array.isArray(sections)) return out;
  for (const row of sections) {
    const layout = row?.acf_fc_layout || row?.layout;
    if (layout === "faq_contact_split" || layout === "faq") {
      for (const it of row.items || []) {
        if (!it?.question) continue;
        out.push({
          source,
          slug,
          layout,
          question: decodeHtml(String(it.question).trim()),
          answer: decodeHtml(
            String(it.answer || "")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim()
          ),
        });
      }
    }
  }
  return out;
}

function extractFromPost(p, lang, sourcePrefix) {
  const acf = p.acf || {};
  const slug = p.slug || "?";
  let all = walkSections(acf.page_sections, slug, `${lang}:${sourcePrefix}`);
  const nested = acf.page_sections?.page_sections;
  if (Array.isArray(nested)) {
    all = all.concat(walkSections(nested, slug, `${lang}:${sourcePrefix}:nested`));
  }
  const serviceSections = acf.service_sections;
  if (Array.isArray(serviceSections)) {
    all = all.concat(walkSections(serviceSections, slug, `${lang}:service_sections`));
  }
  return all;
}

async function allOf(endpoint, lang) {
  const out = [];
  let page = 1;
  while (true) {
    const batch = await wp(
      `${endpoint}?per_page=100&page=${page}&acf_format=standard&context=edit`,
      lang
    );
    if (!Array.isArray(batch) || !batch.length) break;
    out.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return out;
}

/** Heuristic: assign FAQ row to nl or en (never both). Keep in sync with faq-lang-detect.ts */
function detectLang(question) {
  const q = question.trim();
  if (!q) return "unknown";

  if (/^(how |do |does |can |what |will |are |have |who |why |is there |is the |is this |is it )/i.test(q)) {
    return "en";
  }
  if (
    /^(hoe |wat |kan |moet |zijn |werkt |blijven|kost |waarom|kunnen|proberen|bellen |welke |ik heb|ik ben|is er )/i.test(
      q
    )
  ) {
    return "nl";
  }
  if (/^is (er|dit|de|het|salonora|deze|een )/i.test(q)) return "nl";
  if (/^is /i.test(q)) return "en";

  if (/^i (already|am |do not|don'?t |have |need |want )/i.test(q)) return "en";
  if (/per month\b/i.test(q)) return "en";
  if (/per maand\b/i.test(q)) return "nl";

  const dutchRe =
    /\b(je|jouw|wij|niet|voor|het|een|jullie|hebben|deze|kappers|salon|boekingsmodule|instellen|minimale|looptijd|behandelingen|technisch|onderlegd|bellen|proberen|volledig|gratis|daarna|geen|maar|bij|naar|ons|dan|ook|wel|als|zijn|kan|moet|maand|goedkoop|klinkt|certificaten|behandeling|komen|werkt|mobiele|pedicure|wimpers|barbiers|medische|cosmetische)\b/gi;
  const englishRe =
    /\b(the|you|your|we|are|not|for|how|what|can|will|do|does|is|our|they|this|that|with|from|have|would|could|should|booking|demo|free|technical|contract|minimum|treatment|stylist|straight|afterwards|without|month|cheap|sounds|really|good|certificates|works|mobile|pedicurist|barbers|medical|cosmetic)\b/gi;
  const d = (q.match(dutchRe) || []).length;
  const e = (q.match(englishRe) || []).length;
  if (d > e + 1) return "nl";
  if (e > d + 1) return "en";
  return "unknown";
}

function slugify(q, used) {
  let base = q
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 56);
  if (!base) base = "faq-item";
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

function inferCategory(q, a) {
  const t = `${q} ${a}`.toLowerCase();
  if (/prijs|kost|cost|€|euro|price|tarief|low|laag|cheap|goedkoop/.test(t)) return "pricing";
  if (/techn|demo|live|website|domain|setup|hosting|code|module|mobiel|mobile|certificaat|certificate/.test(t)) {
    return "technical";
  }
  if (/behandel|service|stylist|kapper|walk-in|recurring|terugkerend|agenda|boek|barber|wimper|lash|pedicure|treatment/.test(t)) {
    return "features";
  }
  if (/start|begin|overstap|bestaande|zelf aanpass|change|already have|getting|foto|photo|time right now|geen tijd/.test(t)) {
    return "getting_started";
  }
  return "general";
}

function normalizeKey(question) {
  return question.trim().toLowerCase().replace(/\s+/g, " ");
}

async function collectLang(lang) {
  const pages = await allOf("/wp/v2/pages", lang);
  const services = await allOf(`/wp/v2/${serviceBase}`, lang);
  const faqs = [];
  for (const p of pages) faqs.push(...extractFromPost(p, lang, "page"));
  for (const p of services) faqs.push(...extractFromPost(p, lang, "service"));

  try {
    const g = await wp(`/omb-headless/v1/globals?lang=${lang}`, lang);
    const tpl = g?.templates;
    const rows =
      tpl?.blog_single_sections?.page_sections ||
      (Array.isArray(tpl?.blog_single_sections) ? tpl.blog_single_sections : null);
    if (rows) faqs.push(...walkSections(rows, "blog-single-template", `${lang}:templates`));
  } catch (e) {
    console.warn(`${lang} globals:`, e.message);
  }

  return faqs;
}

function mergeCatalog(seedItems, harvested, targetLang) {
  const byQuestion = new Map();
  const usedIds = new Set();

  for (const it of seedItems) {
    if (SKIP_QUESTION_RE.test(it.question.trim())) continue;
    const seedLang = detectLang(it.question);
    if (seedLang !== "unknown" && seedLang !== targetLang) continue;
    byQuestion.set(normalizeKey(it.question), { ...it });
    usedIds.add(it.id);
  }

  for (const row of harvested) {
    if (SKIP_QUESTION_RE.test(row.question.trim())) continue;
    if (!row.answer.trim()) continue;

    const detected = detectLang(row.question);
    if (detected !== "unknown" && detected !== targetLang) continue;

    const key = normalizeKey(row.question);
    const existing = byQuestion.get(key);
    if (existing) {
      if (row.answer.length > existing.answer.length) existing.answer = row.answer;
      continue;
    }

    const entry = {
      id: slugify(row.question, usedIds),
      category: inferCategory(row.question, row.answer),
      question: row.question,
      answer: row.answer,
    };
    byQuestion.set(key, entry);
  }

  const seedOrder = seedItems.map((it) => normalizeKey(it.question));
  const ordered = [];
  const seen = new Set();

  for (const key of seedOrder) {
    const it = byQuestion.get(key);
    if (it && !seen.has(key)) {
      ordered.push(it);
      seen.add(key);
    }
  }

  for (const [key, it] of byQuestion) {
    if (!seen.has(key)) ordered.push(it);
  }

  return ordered;
}

async function main() {
  const seed = JSON.parse(readFileSync(dataPath, "utf8"));
  const nlHarvest = await collectLang("nl");
  const enHarvest = await collectLang("en");

  const merged = {
    nl: mergeCatalog(seed.nl, nlHarvest, "nl"),
    en: mergeCatalog(seed.en, enHarvest, "en"),
  };

  writeFileSync(dataPath, `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`Wrote ${dataPath}`);
  console.log(`NL: ${merged.nl.length} items (from ${nlHarvest.length} harvested rows)`);
  console.log(`EN: ${merged.en.length} items (from ${enHarvest.length} harvested rows)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
