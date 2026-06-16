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

/** Transform bespoke inline-styled blog blocks -> design-system semantic classes. */
export function transform(html) {
  let s = html;
  const counts = {};
  const bump = (k, n) => (counts[k] = (counts[k] || 0) + n);

  // 1. Callout band: brand wrapper > surface body > uppercase heading + body
  s = s.replace(
    /<div style="background:#3990f0;[^"]*">\s*<div style="background:#ebf3fe;[^"]*">\s*<p style="[^"]*">([\s\S]*?)<\/p>\s*<p style="[^"]*">([\s\S]*?)<\/p>\s*<\/div>\s*<\/div>/g,
    (_m, head, body) => {
      bump("band", 1);
      return (
        `<div class="salonora-band">\n` +
        `<div class="salonora-band__body">\n` +
        `<p class="salonora-band__title">${head.trim()}</p>\n` +
        `<p>${body.trim()}</p>\n` +
        `</div>\n` +
        `<div class="salonora-band__footer"></div>\n` +
        `</div>`
      );
    }
  );

  // 2. Pill section heading: #d8e8ff label pill + bold title
  s = s.replace(
    /<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin:32px 0 8px">\s*<span style="background:#d8e8ff;[^"]*">([\s\S]*?)<\/span>\s*<span style="[^"]*">([\s\S]*?)<\/span>\s*<\/div>/g,
    (_m, label, title) => {
      bump("pill", 1);
      return `<div class="salonora-step-head"><span class="salonora-step-pill">${label.trim()}</span><span class="salonora-step-title">${title.trim()}</span></div>`;
    }
  );

  // 3a. Numbered rows (badge + text)
  s = s.replace(
    /<div style="display:flex;gap:14px;margin-bottom:11px;align-items:flex-start">\s*<div style="flex:0 0 28px;[^"]*">([\s\S]*?)<\/div>\s*<div style="[^"]*">([\s\S]*?)<\/div>\s*<\/div>/g,
    (_m, num, text) => {
      bump("numRow", 1);
      return `<div class="salonora-num-row"><span class="salonora-num-badge">${num.trim()}</span><span>${text.trim()}</span></div>`;
    }
  );
  // 3b. Numbered list wrapper
  s = s.replace(/<div style="margin:18px 0">/g, (_m) => {
    bump("numList", 1);
    return `<div class="salonora-num-list">`;
  });

  // 4. Brand sub-heading (objection titles)
  s = s.replace(
    /<div style="font-size:20px;font-weight:700;color:#2f86f5;[^"]*">([\s\S]*?)<\/div>/g,
    (_m, text) => {
      bump("subhead", 1);
      return `<div class="salonora-subhead">${text.trim()}</div>`;
    }
  );

  // 5. Tables: drop inline styles, add wrapper class (CSS drives the look)
  s = s.replace(
    /<div style="border:1px solid #e7ebf2;border-radius:14px;overflow:hidden;margin:22px 0">/g,
    () => {
      bump("table", 1);
      return `<div class="salonora-table">`;
    }
  );
  s = s.replace(/<table style="[^"]*">/g, "<table>");
  s = s.replace(/<thead><tr>/g, "<thead><tr>");
  s = s.replace(/<tr style="[^"]*">/g, "<tr>");
  s = s.replace(/<th style="[^"]*">/g, "<th>");
  s = s.replace(/<td style="[^"]*">/g, "<td>");

  // 6. Headings: strip inline style so CSS 48px navy applies
  s = s.replace(/<h2 class="wp-block-heading has-text-color" style="[^"]*">/g, '<h2 class="wp-block-heading">');
  s = s.replace(/<!-- wp:heading [^>]*-->/g, "<!-- wp:heading -->");

  // 7. HR: plain rule (CSS styles it)
  s = s.replace(/<hr style="[^"]*"\s*\/?>/g, "<hr>");

  // 8. Links: drop inline style
  s = s.replace(/<a (href="[^"]*")\s+style="[^"]*">/g, "<a $1>");

  return { html: s, counts };
}

async function run(id, save) {
  const res = await fetch(`${API}/wp/v2/posts/${id}?context=edit`, { headers: { Authorization: auth } });
  if (!res.ok) {
    console.log(`FAIL fetch ${id}: ${res.status}`);
    return;
  }
  const p = await res.json();
  const raw = p.content?.raw ?? "";
  const { html, counts } = transform(raw);
  fs.writeFileSync(`tmp-rewritten-${id}.html`, html, "utf8");
  console.log(`${id} (${p.slug}) replacements:`, JSON.stringify(counts), `| ${raw.length} -> ${html.length}`);
  if (!save) return;
  const put = await fetch(`${API}/wp/v2/posts/${id}`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ content: html }),
  });
  console.log(`  saved ${id}: ${put.status}`);
}

const save = process.argv.includes("--save");
const ids = process.argv.filter((a) => /^\d+$/.test(a));
for (const id of ids) await run(id, save);
