#!/usr/bin/env node
/**
 * Extract FAQ items embedded in Next.js RSC payloads (question/answer JSON).
 * Usage: node src/lib/legal/extract-faqs-from-rsc.mjs <html-file> [html-file2...]
 */
import { readFileSync } from "node:fs";

function stripAnswerHtml(html) {
  return String(html || "")
    .replace(/\\n/g, "\n")
    .replace(/\\u003c/g, "<")
    .replace(/\\u003e/g, ">")
    .replace(/\\"/g, '"')
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractFaqsFromRscHtml(html) {
  const items = [];
  const marker = 'question\\":\\"';
  let pos = 0;
  while (pos < html.length) {
    const start = html.indexOf(marker, pos);
    if (start < 0) break;
    let i = start + marker.length;
    let question = "";
    while (i < html.length) {
      const ch = html[i];
      if (ch === "\\" && html[i + 1] === '"') {
        if (html[i + 2] === "," && html.startsWith('\\"answer\\":\\"', i + 3)) break;
        question += '"';
        i += 2;
        continue;
      }
      if (ch === '"' && html[i - 1] !== "\\") break;
      question += ch;
      i += 1;
    }
    const ansMarker = '\\"answer\\":\\"';
    const aStart = html.indexOf(ansMarker, i);
    if (aStart < 0) break;
    i = aStart + ansMarker.length;
    let answerRaw = "";
    while (i < html.length) {
      const ch = html[i];
      if (ch === "\\" && html[i + 1] === '"') {
        if (html[i + 2] === "}" || html[i + 2] === "]" || html.startsWith('\\",\\"', i + 2))
          break;
        answerRaw += '"';
        i += 2;
        continue;
      }
      if (ch === '"' && html[i - 1] !== "\\") break;
      answerRaw += ch;
      i += 1;
    }
    const answer = stripAnswerHtml(
      answerRaw.replace(/\\u003c/g, "<").replace(/\\u003e/g, ">").replace(/\\n/g, "\n")
    );
    if (question && answer) items.push({ question, answer });
    pos = i;
  }
  return items;
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

const isMain = process.argv[1]?.endsWith("extract-faqs-from-rsc.mjs");
if (isMain) {
  const files = process.argv.slice(2);
  if (!files.length) {
    console.error("Pass one or more HTML files");
    process.exit(1);
  }

  let all = [];
  for (const f of files) {
    const html = readFileSync(f, "utf8");
    const items = extractFaqsFromRscHtml(html);
    console.error(`${f}: ${items.length} items`);
    all = all.concat(items);
  }

  const merged = dedupe(all);
  console.log(JSON.stringify(merged, null, 2));
}
