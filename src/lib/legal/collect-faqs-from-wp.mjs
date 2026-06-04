#!/usr/bin/env node
/**
 * One-off: list FAQ items from all WP pages + templates globals.
 * Usage: node --import dotenv/config src/lib/legal/collect-faqs-from-wp.mjs dotenv_config_path=.env.local
 */
const api = (process.env.WORDPRESS_API_URL || "").replace(/\/$/, "");
const user = process.env.WORDPRESS_APPLICATION_USER;
const pass = process.env.WORDPRESS_APPLICATION_PASSWORD;
if (!api || !user || !pass) {
  console.error("Missing WP env");
  process.exit(1);
}
const auth = Buffer.from(`${user}:${pass}`).toString("base64");

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
        if (it?.question) {
          out.push({
            source,
            slug,
            layout,
            question: String(it.question).trim(),
            answer: String(it.answer || "")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim(),
          });
        }
      }
    }
  }
  return out;
}

function extractFromPage(p, lang) {
  const acf = p.acf || {};
  const slug = p.slug || "?";
  let all = walkSections(acf.page_sections, slug, `${lang}:page`);
  const nested = acf.page_sections?.page_sections;
  if (Array.isArray(nested)) all = all.concat(walkSections(nested, slug, `${lang}:page:nested`));
  return all;
}

async function allPages(lang) {
  let page = 1;
  const all = [];
  while (true) {
    const batch = await wp(
      `/wp/v2/pages?per_page=100&page=${page}&acf_format=standard&context=edit`,
      lang
    );
    if (!Array.isArray(batch) || !batch.length) break;
    all.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return all;
}

async function main() {
  for (const lang of ["nl", "en"]) {
    const pages = await allPages(lang);
    const faqs = [];
    for (const p of pages) faqs.push(...extractFromPage(p, lang));

    try {
      const g = await wp(`/omb-headless/v1/globals?lang=${lang}`, lang);
      const tpl = g?.templates;
      const rows =
        tpl?.blog_single_sections?.page_sections ||
        (Array.isArray(tpl?.blog_single_sections) ? tpl.blog_single_sections : null);
      if (rows) faqs.push(...walkSections(rows, "blog-single-template", `${lang}:templates`));
    } catch (e) {
      console.warn(lang, "globals", e.message);
    }

    console.log(`\n=== ${lang} (${faqs.length} items) ===`);
    const seen = new Set();
    for (const f of faqs) {
      if (seen.has(f.question)) continue;
      seen.add(f.question);
      console.log(`\n[${f.source}] ${f.question}`);
      console.log(`  ${f.answer.slice(0, 180)}${f.answer.length > 180 ? "…" : ""}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
