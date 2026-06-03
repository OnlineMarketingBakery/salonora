/**
 * Re-apply Figma 1800:2 tokens to docs + src copies of the n8n Gutenberg reference.
 * Run from repo root: node src/lib/blog/normalize-n8n-gutenberg-figma.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const targets = [
  path.join(root, "docs/n8n-blog-post-gutenberg-reference.html"),
  path.join(root, "src/lib/blog/n8n-gutenberg-reference.source.html"),
  path.join(root, "src/lib/blog/n8n-blog-post-gutenberg-skeleton.html"),
];

const header = `<!--
  Salonora — paste into WordPress Code editor (REST). Matches Figma blog body 1800:2 / 1643:54.
  COPY from first <!-- wp:html --> below (do not paste this comment into WordPress).
  Not in content: eyebrow, H1, hero, TOC, FAQ, Tot slot, related posts.
-->

`;

function normalize(html) {
  let out = html
    .replace(/AcAcn/g, "één")
    .replace(/categorieAn/g, "categorieën")
    .replace(/geA_ntegreerd/g, "geïntegreerd");
  out = out.replace(/<!-- wp:html -->\s*<hr[^>]*>\s*<!-- \/wp:html -->\s*/gi, "");
  out = out
    .replace(/#ecf4ff/gi, "#ebf3fe")
    .replace(/#2f86f5/gi, "#3990f0")
    .replace(/#162951/gi, "#152951")
    .replace(/#444b58/gi, "#435780")
    .replace(/#e7ebf2/gi, "#acc6ea")
    .replace(/#d8e8ff/gi, "#ebf3fe");
  out = out.replace(/;font-family:'Quicksand',-apple-system,Segoe UI,Roboto,sans-serif/gi, "");
  out = out.replace(
    /\s*<div style="height:6px;border-radius:4px;background:linear-gradient\([^"]*\)[^>]*><\/div>/gi,
    ""
  );
  out = out.replace(
    /position:relative;background:#ebf3fe;border-radius:16px;padding:26px 30px 0;margin:30px 0/gi,
    "background:#ebf3fe;border-radius:12px;border-bottom:6px solid #3990f0;padding:30px 32px;margin:28px 0"
  );
  out = out.replace(
    /margin:0 0 12px;font-size:20px;font-weight:700;text-transform:uppercase;color:#3990f0;line-height:1\.2/gi,
    "margin:0 0 14px;color:#3990f0;font-size:34px;font-weight:600;line-height:1.1;text-transform:uppercase"
  );
  out = out.replace(/line-height:1\.65/gi, "line-height:1.4");
  out = out.replace(/>Antwoord in 1 minuut</gi, ">ANTWOORD IN 1 MINUUT<");
  out = out.replace(/>Maak je salon avond-proof</gi, ">MAAK JE SALON AVOND-PROOF<");
  out = out.replace(/>Pro tip</gi, ">PRO TIP<");
  out = out.replace(/"fontSize":"24px"/g, (m, offset, s) => {
    const slice = s.slice(Math.max(0, offset - 120), offset + 40);
    return slice.includes("#3990f0") ? m : '"fontSize":"48px"';
  });
  out = out.replace(
    /"fontWeight":"700","fontSize":"48px"\},"color":\{"text":"#152951"\},"spacing":\{"margin":\{"top":"44px","bottom":"14px"\}\}\}/g,
    '"fontWeight":"600","fontSize":"48px"},"color":{"text":"#152951"},"spacing":{"margin":{"top":"48px","bottom":"12px"}}}'
  );
  out = out.replace(
    /color:#152951;font-size:24px;font-weight:700;margin-top:44px;margin-bottom:14px/gi,
    "color:#152951;font-size:48px;font-weight:600;margin-top:48px;margin-bottom:12px"
  );
  out = out.replace(
    /background:#ebf3fe;color:#3990f0;font-weight:700;font-size:14px;padding:6px 16px;border-radius:8px/gi,
    "display:inline-flex;min-height:46px;align-items:center;padding:10px 16px;border-radius:10px;background:#ebf3fe;color:#3990f0;font-size:24px;font-weight:600;line-height:1.1"
  );
  out = out.replace(
    /font-size:20px;font-weight:700;color:#152951/gi,
    "font-size:24px;font-weight:600;color:#152951;line-height:1.1"
  );
  out = out.replace(
    /<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin:32px 0 8px">/gi,
    '<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;margin:32px 0 8px">'
  );
  out = out.replace(
    /flex:0 0 28px;width:28px;height:28px;border-radius:50%;background:linear-gradient\(180deg,#3d97ff,#1c79ea\);color:#fff;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;line-height:1/gi,
    "flex:0 0 28px;width:28px;height:28px;border-radius:14px;background:#3990f0;color:#fff;font-weight:700;font-size:16px;display:flex;align-items:center;justify-content:center;line-height:1.4"
  );
  out = out.replace(
    /<div style="display:flex;gap:14px;margin-bottom:11px;align-items:flex-start">/gi,
    '<div style="display:flex;gap:8px;margin-bottom:11px;align-items:center">'
  );
  out = out.replace(
    /font-size:16px;color:#435780;line-height:1\.6;padding-top:3px/gi,
    "font-size:16px;color:#435780;line-height:1.4"
  );
  out = out.replace(
    /<!-- wp:html -->\s*<div style="font-size:20px;font-weight:700;color:#3990f0;margin:30px 0 12px">&quot;([^&]+)&quot;<\/div>\s*<!-- \/wp:html -->/gi,
    (_, q) =>
      `<!-- wp:heading {"level":2,"style":{"typography":{"fontWeight":"600","fontSize":"24px"},"color":{"text":"#3990f0"},"spacing":{"margin":{"top":"30px","bottom":"12px"}}}} -->\n<h2 class="wp-block-heading has-text-color" style="color:#3990f0;font-size:24px;font-weight:600;margin-top:30px;margin-bottom:12px">&quot;${q}&quot;</h2>\n<!-- /wp:heading -->`
  );
  out = out.replace(/border-radius:14px/gi, "border-radius:12px");
  out = out.replace(
    /background:#152951;color:#fff;font-weight:700;text-align:left;padding:15px 22px;font-size:15px/gi,
    "background:#152951;color:#fff;font-weight:600;text-align:left;padding:15px 22px;font-size:16px"
  );
  out = out.replace(
    /padding:14px 22px;border-top:1px solid #acc6ea;color:#152951;font-weight:700;font-size:15px/gi,
    "padding:14px 22px;border-top:1px solid #acc6ea;color:#152951;font-weight:600;font-size:16px"
  );
  out = out.replace(
    /padding:14px 22px;border-top:1px solid #acc6ea;color:#435780;font-size:15px;line-height:1\.55/gi,
    "padding:14px 22px;border-top:1px solid #acc6ea;color:#435780;font-size:16px;line-height:1.4"
  );
  out = out.replace(
    /<a href="#" style="color:#3990f0;font-weight:700;text-decoration:underline">/gi,
    '<a href="https://salonora.eu/salonora-is-voor/" style="color:#3990f0;font-weight:600;text-decoration:underline">'
  );
  out = out.replace(/<h2 class="has-text-color"/g, '<h2 class="wp-block-heading has-text-color"');
  return `${out.trim()}\n`;
}

for (const file of targets) {
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/^<!--[\s\S]*?Salonora[\s\S]*?-->\s*/i, "");
  const next = header + normalize(html);
  fs.writeFileSync(file, next, "utf8");
  console.log("Updated", path.relative(root, file));
}
