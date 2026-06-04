#!/usr/bin/env node
/**
 * Harvest homepage FAQ blocks from https://staging.salonora.eu/ only.
 * Usage: node src/lib/legal/harvest-staging-faqs.mjs
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { extractFaqsFromRscHtml } from "./extract-faqs-from-rsc.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STAGING = "https://staging.salonora.eu";

const PATHS = {
  nl: ["/", "/nl/", "/nl"],
  en: ["/en/", "/en", "/english/"],
};

async function fetchHtml(path) {
  const url = `${STAGING}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    headers: { Accept: "text/html", "User-Agent": "Salonora-FAQ-Harvest/1.0" },
    redirect: "follow",
  });
  return { url: res.url, status: res.status, html: res.ok ? await res.text() : "" };
}

function clean(items) {
  return items.map((it) => ({
    question: it.question.trim(),
    answer: it.answer.replace(/\\+$/g, "").trim(),
  }));
}

async function harvestLang(lang) {
  for (const path of PATHS[lang]) {
    const { url, status, html } = await fetchHtml(path);
    const items = clean(extractFaqsFromRscHtml(html));
    const hasRsc = html.includes('question\\":\\"');
    console.error(`${lang} ${url} -> ${status}, ${items.length} FAQs, rsc=${hasRsc}`);
    if (items.length > 0) return { source: url, items };
  }
  return { source: null, items: [] };
}

async function main() {
  const out = { staging: STAGING, nl: await harvestLang("nl"), en: await harvestLang("en") };
  const outPath = join(__dirname, "content", "staging-faqs-harvest.json");
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`Wrote ${outPath}`);
  console.log(JSON.stringify({ nl: out.nl.items.length, en: out.en.items.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
