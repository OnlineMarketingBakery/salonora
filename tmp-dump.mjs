import fs from "node:fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const API = env.WORDPRESS_API_URL;
const auth =
  "Basic " +
  Buffer.from(`${env.WORDPRESS_APPLICATION_USER}:${env.WORDPRESS_APPLICATION_PASSWORD}`).toString("base64");

async function dump(id) {
  const res = await fetch(`${API}/wp/v2/posts/${id}?context=edit`, {
    headers: { Authorization: auth },
  });
  if (!res.ok) {
    console.log(`FAIL ${id}: ${res.status}`);
    return;
  }
  const p = await res.json();
  const raw = p.content?.raw ?? p.content?.rendered ?? "";
  fs.writeFileSync(`tmp-post-${id}.html`, raw, "utf8");
  console.log(`OK ${id} (${p.slug}) lang? -> ${raw.length} bytes`);
}

const ids = process.argv.slice(2);
for (const id of ids) await dump(id);
