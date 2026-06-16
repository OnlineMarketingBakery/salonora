import fs from "node:fs";
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const API = env.WORDPRESS_API_URL;
const auth = "Basic " + Buffer.from(`${env.WORDPRESS_APPLICATION_USER}:${env.WORDPRESS_APPLICATION_PASSWORD}`).toString("base64");
const H = { Authorization: auth };

function findFaq(obj, hits) {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) { for (const v of obj) findFaq(v, hits); return; }
  const layout = obj.acf_fc_layout || obj.layout;
  if (typeof layout === "string" && /faq/i.test(layout)) hits.push(obj);
  for (const k of Object.keys(obj)) findFaq(obj[k], hits);
}

const pages = await (await fetch(`${API}/wp/v2/pages?per_page=100&_fields=id,slug,title`, { headers: H })).json();
console.log(`pages: ${pages.length}`);
for (const pg of pages) {
  const res = await fetch(`${API}/wp/v2/pages/${pg.id}?context=edit`, { headers: H });
  const full = await res.json();
  const hits = [];
  findFaq(full.acf, hits);
  for (const h of hits) {
    const items = h.items || h.faqs || h.questions || [];
    const answered = Array.isArray(items) ? items.filter((q) => String(q.answer ?? q.content ?? "").trim().length > 0).length : 0;
    if (Array.isArray(items) && items.length) {
      console.log(`\nPAGE ${pg.id} ${pg.slug} :: faq "${h.title}" items=${items.length} answered=${answered}`);
      items.forEach((q, j) => console.log(`   Q${j}: ${String(q.question ?? q.title ?? "").slice(0,75)}`));
    }
  }
}
