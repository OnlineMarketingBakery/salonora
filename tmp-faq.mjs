import fs from "node:fs";
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const API = env.WORDPRESS_API_URL;
const auth = "Basic " + Buffer.from(`${env.WORDPRESS_APPLICATION_USER}:${env.WORDPRESS_APPLICATION_PASSWORD}`).toString("base64");

function findFaq(obj, hits) {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) { for (const v of obj) findFaq(v, hits); return; }
  const layout = obj.acf_fc_layout || obj.layout;
  if (typeof layout === "string" && /faq/i.test(layout)) hits.push(obj);
  for (const k of Object.keys(obj)) findFaq(obj[k], hits);
}

for (const lang of ["nl", "en"]) {
  const res = await fetch(`${API}/omb-headless/v1/globals?lang=${lang}`, { headers: { Authorization: auth } });
  const body = await res.json();
  fs.writeFileSync(`tmp-globals-${lang}.json`, JSON.stringify(body, null, 2), "utf8");
  const templates = body?.templates ?? null;
  console.log(`== ${lang} | templates keys:`, templates ? Object.keys(templates) : null);
  const hits = [];
  findFaq(templates, hits);
  console.log(`   faq layouts found: ${hits.length}`);
  hits.forEach((h, i) => {
    const items = h.items || h.faqs || h.questions || [];
    console.log(`   [faq ${i}] layout=${h.acf_fc_layout || h.layout} title=${JSON.stringify(h.title)} items=${Array.isArray(items) ? items.length : "?"}`);
    if (Array.isArray(items)) items.forEach((q, j) => {
      const question = q.question ?? q.title ?? "";
      const answer = q.answer ?? q.content ?? "";
      console.log(`      Q${j}: ${String(question).slice(0,70)} | A_len=${String(answer).length}`);
    });
  });
}
