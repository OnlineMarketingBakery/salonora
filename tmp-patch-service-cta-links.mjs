import fs from "fs";

const p = "scripts/lib/site-links-shared.mjs";
let t = fs.readFileSync(p, "utf8");

if (!t.includes("labelImpliesPurchase")) {
  const anchor = "export const PATHS = {";
  const helpers = `
export function isServiceSlug(slug) {
  if (!slug) return false;
  return Object.values(SERVICE_SLUGS).some((byLang) => Object.values(byLang).includes(slug));
}

export function isSelfReferencingServiceUrl(link) {
  if (link.type !== "service" || !link.slug) return false;
  const u = normalizeUrl(link.url);
  if (!u || u === "/") return false;
  const expected = buildCmsPath(link.lang, link.slug);
  if (u === expected || u === \`\${expected}/\`) return true;
  return u.endsWith(\`/\${link.slug}\`) || u.endsWith(\`/\${link.slug}/\`);
}

function labelImpliesPurchase(label) {
  const lower = String(label || "").trim().toLowerCase();
  return (
    /start nu|start now|begin nu|begin met boeken|start taking bookings|start today|start vandaag|ja,? ik wil|yes,? i want|wil dit|want this|dit wil ik|complete oplossing|complete solution|aan de slag|begin vandaag|dit is voor mij|this is for me|ja,? dit is voor mij|yes,? this is for me|€\\s*10|€\\s*50|10\\/maand|50\\/maand|boekingsmodule|website op maat|complete pakket/i.test(
      lower
    )
  );
}

`;
  t = t.replace(anchor, helpers + anchor);
}

const oldDetect = t.match(/function detectIntent\([\s\S]*?^}/m)?.[0];
if (oldDetect && !oldDetect.includes("labelImpliesPurchase(lower)")) {
  const newDetect = `function detectIntent(label, fieldPath = "") {
  const lower = String(label || "").trim().toLowerCase();
  const fp = fieldPath.toLowerCase();
  if (fp.includes("contact_ctas")) {
    if (/mail|bericht|message|stuur/i.test(lower)) return "contact-email";
    if (/gesprek|meeting|plan een|bel|call|phone/i.test(lower) && !/€/i.test(lower)) return "contact-phone";
  }
  if (/demo|bekijk eerst/i.test(lower) && !/gratis demo/i.test(lower)) return "demo";
  if (/gratis demo|free demo|stuur mij de demo|send me the demo/i.test(lower)) return "demo-form";
  if (/bekijk ons werk|view our work/i.test(lower)) return "case-studies";
  if (/bekijk mijn branche|view my industry/i.test(lower)) return "industry-hub";
  if (labelImpliesPurchase(lower)) {
    if (/demo/i.test(lower)) return "demo-form";
    if (/download|gids|guide|garanties|guarantees/i.test(lower)) return "keep";
    return "purchase";
  }
  if (/barbershop/i.test(lower)) return "service-barbershop";
  if (/kapperszaak|hair salon/i.test(lower)) return "service-hair";
  if (/nagelstudio|nail salon/i.test(lower)) return "service-nail";
  if (/pedicure/i.test(lower) && !/salon/i.test(lower)) return "service-pedicure";
  if (/massagesalon|massage salon/i.test(lower)) return "service-massage";
  if (/download/i.test(lower) && !/demo/i.test(lower)) return "keep";
  return null;
}`;
  t = t.replace(oldDetect, newDetect);
}

if (!t.includes("isServiceSlug(slug) && labelImpliesPurchase")) {
  t = t.replace(
    "  if (isSalesFunnelSlug(slug)) {",
    `  if (isServiceSlug(slug) && labelImpliesPurchase(label)) {
    return CHECKOUT_BOOKING_URL;
  }
  if (isSalesFunnelSlug(slug)) {`
  );
}

if (!t.includes("self-link-on-service")) {
  t = t.replace(
    '  if (recommended && recommended !== u) issues.push("needs-fix");',
    `  if (link.type === "service" && isSelfReferencingServiceUrl(link) && labelImpliesPurchase(link.title)) {
    issues.push("self-link-on-service");
  }
  if (recommended && recommended !== u) issues.push("needs-fix");`
  );
}

fs.writeFileSync(p, t);
console.log("patched", p);
