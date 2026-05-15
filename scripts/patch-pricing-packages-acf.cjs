const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const targets = [
  path.join(root, "acf-import-bundle.json"),
  path.join(root, "wordpress/wp-content/themes/omb-headless/acf-import-bundle.json"),
];

function layoutEntries(layouts) {
  if (!layouts || typeof layouts !== "object") return [];
  return Object.values(layouts);
}

function walkFields(fields, fn) {
  if (!Array.isArray(fields)) return;
  for (const f of fields) {
    fn(f);
    if (f.sub_fields) walkFields(f.sub_fields, fn);
    for (const L of layoutEntries(f.layouts)) {
      if (L.sub_fields) walkFields(L.sub_fields, fn);
    }
  }
}

function patchBundle(data) {
  if (!Array.isArray(data)) return;
  for (const group of data) {
    if (group.fields) walkFields(group.fields, (f) => {
      if (f.key === "field_pricing_packages_items" && Array.isArray(f.sub_fields)) {
        f.sub_fields = patchPackageItems(f.sub_fields);
      }
    });
  }
}

function patchPackageItems(subFields) {
  if (!Array.isArray(subFields)) return subFields;
  const filtered = subFields.filter(
    (f) => f && f.name !== "solves_title" && f.name !== "solves_items",
  );
  for (const f of filtered) {
    if (f.name === "price_line") {
      f.label = "Pricing title";
      f.instructions =
        "Accent line (e.g. opstartkosten / maandprijs). Renders in accent colour on the site.";
    }
    if (f.name === "note") {
      f.label = "Secondary title";
      f.instructions =
        "Second headline (e.g. Stap je nu in?). Renders in navy-deep on the site.";
    }
    if (f.name === "small_print") {
      f.label = "Pricing paragraph (optional)";
      f.instructions =
        "Optional body under the titles (e.g. vergelijkingstekst). Leave empty if not needed.";
      f.type = "wysiwyg";
      f.tabs = "all";
      f.toolbar = "full";
      f.media_upload = 1;
      f.delay = 0;
      delete f.maxlength;
      delete f.placeholder;
      delete f.prepend;
      delete f.append;
    }
  }
  const order = [
    "badge",
    "title",
    "intro",
    "includes",
    "price_line",
    "note",
    "small_print",
    "ctas",
    "featured",
  ];
  const byName = Object.fromEntries(filtered.map((f) => [f.name, f]));
  const reordered = order.map((n) => byName[n]).filter(Boolean);
  const extras = filtered.filter((f) => !order.includes(f.name));
  return reordered.concat(extras);
}

for (const file of targets) {
  if (!fs.existsSync(file)) {
    console.warn("skip missing", file);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  patchBundle(data);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("patched", file);
}
