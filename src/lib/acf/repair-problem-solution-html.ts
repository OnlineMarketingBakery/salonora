/**
 * Repairs problem_solution WYSIWYG HTML exported from WordPress:
 * - strips inline span noise from imports
 * - merges paragraphs split mid-sentence
 * - inserts missing periods between run-on sentences
 */

function decodeEntities(text: string): string {
  return text
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8230;/g, "\u2026")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
}

function stripInlineMarkup(html: string): string {
  return decodeEntities(
    html
      .replace(/<span[^>]*>/gi, "")
      .replace(/<\/span>/gi, "")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/?(strong|em|b|i)>/gi, "")
      .trim(),
  );
}

function plainParagraphText(innerHtml: string): string {
  return stripInlineMarkup(innerHtml).replace(/\s+/g, " ").trim();
}

const RUN_ON_SKIP_WORDS = new Set([
  "van",
  "het",
  "de",
  "en",
  "op",
  "in",
  "je",
  "na",
  "bij",
  "uit",
  "er",
  "aan",
  "tot",
  "door",
  "om",
  "als",
  "dat",
  "die",
  "dit",
  "of",
  "met",
  "voor",
  "waar",
  "wel",
  "ook",
  "nog",
  "dan",
  "kan",
  "zit",
  "gaat",
  "wordt",
  "zijn",
  "haar",
  "hun",
  "ons",
  "jou",
  "jouw",
  "mij",
  "mijn",
  "uw",
  "the",
  "and",
  "or",
  "for",
  "with",
  "your",
  "you",
  "they",
  "that",
  "this",
  "from",
  "are",
  "not",
  "can",
  "will",
  "but",
  "when",
  "how",
  "what",
  "who",
  "our",
  "their",
]);

/** Insert a period when a completed word runs into the next sentence (not Title Case). */
export function fixRunOnSentences(text: string): string {
  return text.replace(
    /(\w*\p{Ll}{4,}) (\p{Lu}\p{Ll}{1,})/gu,
    (match, wordPart: string, nextWord: string, index: number, full: string) => {
      const before = full.slice(0, index);
      const prevWordMatch = before.match(/(?:^|[\s("\u201C])([\p{L}]+)$/u);
      const prevWord = (prevWordMatch?.[1] ?? "").toLowerCase();
      if (RUN_ON_SKIP_WORDS.has(prevWord)) return match;
      if (RUN_ON_SKIP_WORDS.has(nextWord.toLowerCase())) return match;
      return `${wordPart}. ${nextWord}`;
    },
  );
}

function nextParagraphContinues(_previous: string, next: string): boolean {
  const n = next.trim();
  if (!n) return true;
  return /^[\p{Ll}(\[]/u.test(n);
}

/** Merge `<p>` blocks broken mid-sentence; return clean `<p>...</p>` HTML. */
export function repairProblemSolutionHtml(html: string): string {
  const raw = (html ?? "").trim();
  if (!raw) return "";

  const matches = [...raw.matchAll(/<p[^>]*>(.*?)<\/p>/gis)];
  if (matches.length === 0) {
    const text = fixRunOnSentences(stripInlineMarkup(raw));
    return text ? `<p>${text}</p>` : "" ;
  }

  const innerParts = matches.map((m) => m[1] ?? "");
  const output: string[] = [];

  for (let i = 0; i < innerParts.length; i++) {
    let combined = innerParts[i] ?? "" ;
    let plain = plainParagraphText(combined);

    while (
      i + 1 < innerParts.length &&
      nextParagraphContinues(plain, plainParagraphText(innerParts[i + 1] ?? ""))
    ) {
      i++;
      combined += ` ${innerParts[i] ?? ""}`;
      plain = plainParagraphText(combined);
    }

    const isFirstParagraph = output.length === 0;
    const cleaned = isFirstParagraph ? plain : fixRunOnSentences(plain);
    if (cleaned) output.push(`<p>${cleaned}</p>`);
  }

  return output.join("\n");
}

export function repairSolutionListItem(text: string): string {
  return stripInlineMarkup(text).replace(/"([^"]*?)\.\s+([^"]*?)"/g, '"$1 $2"');
}

function splitMergedSolutionListItems(items: { text: string }[]): { text: string }[] {
  const expanded: string[] = [];

  for (const row of items) {
    const text = row.text.trim();
    if (!text) continue;

    if (/\bjij verschijnt\./i.test(text)) {
      const parts = text.split(/\s+jij verschijnt\.\s*/i);
      parts.forEach((part, index) => {
        const trimmed = repairSolutionListItem(part);
        if (!trimmed) return;
        expanded.push(
          index < parts.length - 1 ? `${trimmed} jij verschijnt.` : trimmed,
        );
      });
      continue;
    }

    expanded.push(repairSolutionListItem(text));
  }

  return expanded.map((text) => ({ text }));
}

/** Merge checklist rows split mid-phrase (e.g. title row + continuation). */
export function repairSolutionListItems(
  items: { text: string }[],
): { text: string }[] {
  const out: { text: string }[] = [];

  for (const row of items) {
    const raw = row.text.trim();
    if (!raw) continue;

    const repaired = repairSolutionListItem(raw);
    const prev = out[out.length - 1];

    if (prev && /^[\p{Ll}]/u.test(repaired)) {
      prev.text = repairSolutionListItem(`${prev.text} ${repaired}`);
    } else {
      out.push({ text: repaired });
    }
  }

  return splitMergedSolutionListItems(out);
}
