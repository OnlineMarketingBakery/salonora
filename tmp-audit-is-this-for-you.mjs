import fs from "fs";

const envPath = process.argv[2] || "/home/ploi/salonora.eu/.env";
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
    })
);

const auth =
  "Basic " +
  Buffer.from(
    `${env.WORDPRESS_APPLICATION_USER}:${env.WORDPRESS_APPLICATION_PASSWORD.replace(/\s+/g, "")}`
  ).toString("base64");

(async () => {
  for (const lang of ["en", "nl"]) {
    const r = await fetch(
      `${env.WORDPRESS_API_URL}/wp/v2/service?lang=${lang}&per_page=30&_fields=slug,acf`,
      { headers: { Authorization: auth } }
    );
    const items = await r.json();
    for (const p of items) {
      for (const s of p.acf?.page_sections || []) {
        if (s.acf_fc_layout === "is_this_for_you" && s.button?.url) {
          console.log(`${lang}\t${p.slug}\t${s.button.title}\t${s.button.url}`);
        }
      }
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
