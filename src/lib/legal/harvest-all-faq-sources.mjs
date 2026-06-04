#!/usr/bin/env node
/**
 * Harvest FAQs from live + staging FAQ pages and homepages (NL/EN).
 * Usage: node src/lib/legal/harvest-all-faq-sources.mjs
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { extractFaqsFromRscHtml } from "./extract-faqs-from-rsc.mjs";
import { parseFaqAccordionFromHtml } from "./parse-faq-from-html.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SOURCES = [
  { site: "live", base: "https://salonora.eu", paths: ["/nl/faqs", "/en/faqs", "/faqs", "/nl/", "/en/", "/"] },
  { site: "staging", base: "https://staging.salonora.eu", paths: ["/nl/faqs", "/en/faqs", "/faqs", "/nl/", "/en/", "/"] },
];

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { Accept: "text/html", "User-Agent": "Salonora-FAQ-Harvest/2.0" },
    redirect: "follow",
  });
  return { url: res.url, status: res.status, html: res.ok ? await res.text() : "" };
}

function extractAll(html) {
  const rsc = extractFaqsFromRscHtml(html).map((it) => ({
    ...it,
    method: "rsc",
  }));
  const dom = parseFaqAccordionFromHtml(html).map((it) => ({
    ...it,
    method: "dom",
  }));
  return [...rsc, ...dom];
}

function normQ(q) {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

function mergeItems(sources) {
  const byQ = new Map();
  for (const entry of sources) {
    for (const it of entry.items) {
      const key = normQ(it.question);
      const prev = byQ.get(key);
      const next = {
        question: it.question.trim(),
        answer: it.answer.trim(),
        sources: [...(prev?.sources ?? []), `${entry.site}:${entry.path}`],
      };
      if (!prev || next.answer.length > prev.answer.length) {
        byQ.set(key, next);
      } else {
        byQ.set(key, { ...prev, sources: [...new Set([...prev.sources, ...next.sources])] });
      }
    }
  }
  return [...byQ.values()].map(({ question, answer }) => ({ question, answer }));
}

async function main() {
  const report = { fetched: [], nl: [], en: [] };

  for (const { site, base, paths } of SOURCES) {
    for (const path of paths) {
      const url = `${base}${path}`;
      const { url: finalUrl, status, html } = await fetchHtml(url);
      const items = extractAll(html);
      const lang = /\/en(\/|$)/.test(finalUrl) ? "en" : "nl";
      report.fetched.push({
        site,
        requested: url,
        finalUrl,
        status,
        lang,
        count: items.length,
      });
      if (items.length) {
        report[lang].push({ site, path, finalUrl, items });
      }
      console.error(`${site} ${finalUrl} -> ${status}, ${items.length} FAQs`);
    }
  }

  const nlMerged = mergeItems(
    report.nl.flatMap((b) => [{ site: b.site, path: b.path, items: b.items }])
  );
  const enMerged = mergeItems(
    report.en.flatMap((b) => [{ site: b.site, path: b.path, items: b.items }])
  );

  const out = {
    harvestedAt: new Date().toISOString(),
    report: report.fetched,
    nl: nlMerged,
    en: enMerged,
  };

  const outPath = join(__dirname, "content", "faq-sources-harvest.json");
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`Wrote ${outPath}`);
  console.log(JSON.stringify({ nl: nlMerged.length, en: enMerged.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
