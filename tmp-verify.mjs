import fs from "node:fs";
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const API = env.WORDPRESS_API_URL;
const auth = "Basic " + Buffer.from(`${env.WORDPRESS_APPLICATION_USER}:${env.WORDPRESS_APPLICATION_PASSWORD}`).toString("base64");
const id = process.argv[2];
const res = await fetch(`${API}/wp/v2/posts/${id}`, { headers: { Authorization: auth } });
const p = await res.json();
const r = p.content?.rendered ?? "";
const classes = ["salonora-band", "salonora-band__title", "salonora-band__footer", "salonora-step-head", "salonora-step-pill", "salonora-num-list", "salonora-num-badge", "salonora-subhead", "salonora-table"];
for (const c of classes) {
  const n = (r.match(new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  console.log(`${c}: ${n}`);
}
console.log("leftover inline #3990f0:", (r.match(/#3990f0/g) || []).length);
console.log("leftover style= count:", (r.match(/style=/g) || []).length);
