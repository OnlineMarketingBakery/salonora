#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const SCAN_ROOTS = [
  path.join(ROOT, "wordpress/wp-content/plugins"),
  path.join(ROOT, "wordpress/wp-content/themes"),
  path.join(ROOT, "wordpress/wp-content/mu-plugins"),
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".php")) out.push(full);
  }
  return out;
}

let stripped = 0;
for (const scanRoot of SCAN_ROOTS) {
  for (const file of walk(scanRoot)) {
    const buf = fs.readFileSync(file);
    if (buf.length >= 3 && buf.subarray(0, 3).equals(BOM)) {
      fs.writeFileSync(file, buf.subarray(3));
      stripped += 1;
      console.log("Stripped BOM:", path.relative(ROOT, file));
    }
  }
}
console.log(stripped === 0 ? "No PHP BOM found." : `Stripped BOM from ${stripped} file(s).`);
