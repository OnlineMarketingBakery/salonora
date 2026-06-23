#!/usr/bin/env node
/**
 * Check salonora.eu email DNS (SPF, DKIM, DMARC) for visitor form mail delivery.
 * Usage: node src/lib/cms/verify-salonora-dns.mjs
 */
import { Resolver } from "node:dns/promises";

const resolver = new Resolver();
resolver.setServers(["8.8.8.8", "1.1.1.1"]);

async function txtRecords(name) {
  try {
    const rows = await resolver.resolveTxt(name);
    return rows.map((parts) => parts.join(""));
  } catch {
    return [];
  }
}

const root = await txtRecords("salonora.eu");
const dmarc = await txtRecords("_dmarc.salonora.eu");
const dkimGoogle = await txtRecords("google._domainkey.salonora.eu");

const spf = root.filter((r) => r.startsWith("v=spf1"));
const hasGoogleDkim = dkimGoogle.some((r) => r.includes("v=DKIM1") || r.includes("k=rsa"));

console.log("=== salonora.eu email DNS audit ===\n");

console.log("SPF (root TXT):");
if (spf.length) {
  spf.forEach((r) => console.log("  OK  ", r));
} else {
  console.log("  MISSING — add at Vmaxx:");
  console.log("        Host: @");
  console.log("        Type: TXT");
  console.log("        Value: v=spf1 include:_spf.google.com ~all");
}

console.log("\nDKIM (google._domainkey):");
if (hasGoogleDkim) {
  console.log("  OK   Google DKIM record found");
} else {
  console.log("  MISSING — in Google Workspace Admin:");
  console.log("        Apps → Google Workspace → Gmail → Authenticate email");
  console.log("        Generate DKIM for salonora.eu, then add the TXT at Vmaxx");
}

console.log("\nDMARC (_dmarc):");
if (dmarc.length) {
  dmarc.forEach((r) => console.log("  ", r));
  if (dmarc.some((r) => r.includes("p=reject"))) {
    console.log("  NOTE: p=reject requires SPF + DKIM pass for external delivery (Gmail visitors).");
  }
} else {
  console.log("  MISSING");
}

console.log("\n--- Vmaxx checklist ---");
console.log("1. TXT @  → v=spf1 include:_spf.google.com ~all");
console.log("2. TXT google._domainkey → (paste from Google Workspace Admin)");
console.log("3. Keep existing DMARC after SPF+DKIM verify");

process.exit(spf.length && hasGoogleDkim ? 0 : 1);
