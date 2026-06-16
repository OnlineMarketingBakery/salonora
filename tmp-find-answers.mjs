import fs from "node:fs";
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const API = env.WORDPRESS_API_URL;
const auth = "Basic " + Buffer.from(`${env.WORDPRESS_APPLICATION_USER}:${env.WORDPRESS_APPLICATION_PASSWORD}`).toString("base64");
const H = { Authorization: auth };

// 1. discover post types
const types = await (await fetch(`${API}/wp/v2/types`, { headers: H })).json();
console.log("REST types:", Object.keys(types).join(", "));

const questions = [
  "Wat als ik nog niet klaar ben voor 24/7 boeken",
  "Wat als een klant per ongeluk dubbel boekt",
  "Hoe voorkom ik dat klanten een afspraak in mijn pauzes",
  "Wat kost een 24/7 boekingssysteem",
  "Werkt 24/7 boeken ook voor mijn type salon",
  "Moet ik echt 24/7 beschikbaar zijn",
  "Wat als technologie uitvalt",
];

// 2. search across pages, posts, and any faq-ish type
const restBases = ["pages", "posts", "faq", "faqs"];
for (const base of restBases) {
  for (const q of [questions[0], questions[3]]) {
    const url = `${API}/wp/v2/${base}?search=${encodeURIComponent(q)}&per_page=5&_fields=id,slug,title,type`;
    try {
      const res = await fetch(url, { headers: H });
      if (!res.ok) { continue; }
      const arr = await res.json();
      if (Array.isArray(arr) && arr.length) {
        console.log(`\n[${base}] search "${q.slice(0,30)}":`);
        arr.forEach((p) => console.log(`   ${p.type ?? base} ${p.id} ${p.slug} :: ${p.title?.rendered ?? ""}`));
      }
    } catch {}
  }
}
