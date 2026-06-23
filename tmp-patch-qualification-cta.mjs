import fs from "fs";

const p = "scripts/lib/site-links-shared.mjs";
let t = fs.readFileSync(p, "utf8");

if (!t.includes("labelImpliesCampaignQualification")) {
  t = t.replace(
    "function labelImpliesPurchase(label) {",
    `function labelImpliesCampaignQualification(label) {
  const lower = String(label || "").trim().toLowerCase();
  return /^ja,? dit is voor mij$|^yes,? this is for me$|^dit is voor mij$|^this is for me$/i.test(lower);
}

function labelImpliesPurchase(label) {`
  );

  t = t.replace(
    /dit is voor mij\|this is for me\|ja,\? dit is voor mij\|yes,\? this is for me\|/,
    ""
  );
}

const detectAnchor = "  if (labelImpliesPurchase(lower)) {";
if (!t.includes("labelImpliesCampaignQualification(lower)")) {
  t = t.replace(
    detectAnchor,
    `  if (labelImpliesCampaignQualification(lower)) return "campaign";
  if (labelImpliesPurchase(lower)) {`
  );
}

const tierAnchor = "  if (isServiceSlug(slug) && labelImpliesPurchase(label)) {";
if (!t.includes("labelImpliesCampaignQualification(label)")) {
  t = t.replace(
    tierAnchor,
    `  if (isServiceSlug(slug) && labelImpliesCampaignQualification(label)) {
    return CAMPAIGN_PATH[lang] || CAMPAIGN_PATH.nl;
  }
  if (isServiceSlug(slug) && labelImpliesPurchase(label)) {`
  );
}

const classifyAnchor =
  '  if (link.type === "service" && isSelfReferencingServiceUrl(link) && labelImpliesPurchase(link.title)) {';
if (t.includes(classifyAnchor) && !t.includes("labelImpliesCampaignQualification(link.title)")) {
  t = t.replace(
    classifyAnchor,
    `  if (
    link.type === "service" &&
    isSelfReferencingServiceUrl(link) &&
    (labelImpliesPurchase(link.title) || labelImpliesCampaignQualification(link.title))
  ) {`
  );
}

fs.writeFileSync(p, t);
console.log("patched qualification -> campaign routing");
