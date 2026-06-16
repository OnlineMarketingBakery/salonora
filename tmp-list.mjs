import fs from "node:fs";
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const API = env.WORDPRESS_API_URL;
const auth = "Basic " + Buffer.from(`${env.WORDPRESS_APPLICATION_USER}:${env.WORDPRESS_APPLICATION_PASSWORD}`).toString("base64");
for (const lang of ["nl", "en"]) {
  const res = await fetch(`${API}/wp/v2/posts?per_page=100&status=publish,draft,private&lang=${lang}&_fields=id,slug,title`, { headers: { Authorization: auth } });
  const arr = await res.json();
  console.log(`-- ${lang} (${Array.isArray(arr) ? arr.length : "?"})`);
  if (Array.isArray(arr)) for (const p of arr) console.log(`${p.id}\t${p.slug}`);
}
