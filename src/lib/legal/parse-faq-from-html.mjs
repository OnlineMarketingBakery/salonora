import { readFileSync, writeFileSync } from "node:fs";

/** Extract FAQ accordion Q&A from rendered Salonora HTML (faq_contact_split). */
export function parseFaqAccordionFromHtml(html) {
  const items = [];
  const blockRe =
    /text-slate-900">([^<]+)<\/span><\/button><div[^>]*aria-hidden="[^"]*"[^>]*><div[^>]*><div[^>]*><div class="prose[^"]*"[^>]*>([\s\S]*?)<\/div><\/div><\/div><\/div>/g;
  let m;
  while ((m = blockRe.exec(html)) !== null) {
    const question = m[1].replace(/\s+/g, " ").trim();
    const answer = m[2]
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (question && answer) items.push({ question, answer });
  }
  return items;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  const file = process.argv[2] || ".tmp-nl.html";
  const html = readFileSync(file, "utf8");
  const items = parseFaqAccordionFromHtml(html);
  console.log(JSON.stringify(items, null, 2));
  writeFileSync("src/lib/legal/content/faq-extracted-nl.json", JSON.stringify(items, null, 2));
}
