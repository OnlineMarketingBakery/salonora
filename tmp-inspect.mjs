import fs from "node:fs";
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const API = env.WORDPRESS_API_URL;
const auth = "Basic " + Buffer.from(`${env.WORDPRESS_APPLICATION_USER}:${env.WORDPRESS_APPLICATION_PASSWORD}`).toString("base64");

async function inspect(id) {
  const res = await fetch(`${API}/wp/v2/posts/${id}?context=edit`, { headers: { Authorization: auth } });
  const p = await res.json();
  const out = {
    id: p.id,
    slug: p.slug,
    contentLen: (p.content?.raw ?? "").length,
    acfKeys: p.acf ? Object.keys(p.acf) : null,
    metaKeys: p.meta ? Object.keys(p.meta) : null,
  };
  console.log(JSON.stringify(out, null, 2));
  fs.writeFileSync(`tmp-acf-${id}.json`, JSON.stringify(p.acf ?? p.meta ?? {}, null, 2), "utf8");
}
for (const id of process.argv.slice(2)) await inspect(id);
