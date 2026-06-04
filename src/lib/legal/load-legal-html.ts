import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Locale } from "@/lib/i18n/locales";

const CONTENT_DIR = join(process.cwd(), "src/lib/legal/content");

const cache = new Map<string, string>();

export function loadLegalHtml(baseName: string, lang: Locale): string {
  const key = `${baseName}.${lang}.html`;
  const cached = cache.get(key);
  if (cached) return cached;
  const filePath = join(CONTENT_DIR, key);
  const html = readFileSync(filePath, "utf8").trim();
  cache.set(key, html);
  return html;
}
