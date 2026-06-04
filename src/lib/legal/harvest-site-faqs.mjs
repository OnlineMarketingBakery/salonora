#!/usr/bin/env node
/**
 * Harvest FAQ items from rendered Next pages (RSC payload) for all WP pages.
 * Usage: node --import dotenv/config src/lib/legal/harvest-site-faqs.mjs dotenv_config_path=.env.local
 *
 * Requires dev server at NEXT_PUBLIC_SITE_URL (default http://localhost:3000).
 */
import { writeFileSync } from "node:fs";
import { extractFaqsFromRscHtml } from "./extract-faqs-from-rsc.mjs";

const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const api = (process.env.WORDPRESS_API_URL || "").replace(/\/$/, "");
const user = process.env.WORDPRESS_APPLICATION_USER;
const pass = process.env.WORDPRESS_APPLICATION_PASSWORD;
const auth = user && pass ? Buffer.from(`${user}:${pass}`).toString("base64") : "";

async function wpPages(lang) {
  if (!api || !auth) return [];
  const out = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${api}/wp/v2/pages?per_page=100&page=${page}&acf_format=standard&status=publish`,
      { headers: { Authorization: `Basic ${auth}`, "X-Polylang-Language": lang } }
    );
    const batch = await res.json();
    if (!Array.isArray(batch) || !batch.length) break;
    out.push(...batch.map((p) => p.slug).filter(Boolean));
    if (batch.length < 100) break;
    page += 1;
  }
  return [...new Set(out)];
}

async function fetchHtml(path) {
  const url = `${site}${path}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return { url, html: "", status: res.status };
  return { url, html: await res.text(), status: res.status };
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((it) => {
    const k = it.question.trim().toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function cleanAnswer(a) {
  return a.replace(/\\+$/g, "").trim();
}

async function main() {
  const report = { nl: {}, en: {} };
  for (const lang of ["nl", "en"]) {
    const slugs = await wpPages(lang);
    const paths = [`/${lang}`, `/${lang}/home`, ...slugs.map((s) => `/${lang}/${s}`)];
    const uniquePaths = [...new Set(paths)];
    const all = [];
    for (const path of uniquePaths) {
      const { url, html, status } = await fetchHtml(path);
      const items = extractFaqsFromRscHtml(html).map((it) => ({
        ...it,
        answer: cleanAnswer(it.answer),
        source: url,
      }));
      if (items.length) {
        report[lang][path] = items;
        all.push(...items);
      } else if (status === 200 && html.includes("faq_contact_split")) {
        report[lang][path] = [];
      }
    }
    report[lang]._merged = dedupe(all);
    console.error(`${lang}: ${report[lang]._merged.length} unique FAQs from ${Object.keys(report[lang]).length - 1} paths`);
  }
  const outPath = "src/lib/legal/content/harvested-faqs.json";
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
