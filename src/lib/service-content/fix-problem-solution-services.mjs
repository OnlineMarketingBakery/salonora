#!/usr/bin/env node
/**
 * Repair problem_solution WYSIWYG copy and wire portrait cutouts on all service CPTs (NL + EN).
 *
 * Usage:
 *   node --experimental-strip-types src/lib/service-content/fix-problem-solution-services.mjs
 *   node --experimental-strip-types src/lib/service-content/fix-problem-solution-services.mjs --apply
 */
import dotenv from "dotenv";
import {
  repairProblemSolutionHtml,
  repairSolutionListItems,
} from "../acf/repair-problem-solution-html.ts";

dotenv.config({ path: ".env.local" });

const apiBase = (process.env.WORDPRESS_API_URL || "").replace(/\/$/, "");
const user = process.env.WORDPRESS_APPLICATION_USER;
const pass = process.env.WORDPRESS_APPLICATION_PASSWORD;
const apply = process.argv.includes("--apply");

/** WP media IDs — mask-group / vertical portrait = problem; group-58* / rubin = solution. */
const PROBLEM_SOLUTION_IMAGES = {
  "pedicure-salon": { problem_image: 44855, solution_image: 44856 },
  pedicures: { problem_image: 44855, solution_image: 44856 },
  massagesalon: { problem_image: 77793, solution_image: 77791 },
  "massage-salons": { problem_image: 77793, solution_image: 77791 },
  nagelsalons: { problem_image: 77774, solution_image: 77780 },
  "nail-salons": { problem_image: 77881, solution_image: 77780 },
  kapperszaken: { problem_image: 77762, solution_image: 77763 },
  "hair-salons": { problem_image: 77883, solution_image: 78633 },
  barbershops: { problem_image: 77099, solution_image: 77755 },
  barbershop: { problem_image: 77099, solution_image: 77755 },
};

const LOCALES = ["nl", "en"];

if (!apiBase || !user || !pass) {
  console.error(
    "Set WORDPRESS_API_URL, WORDPRESS_APPLICATION_USER, and WORDPRESS_APPLICATION_PASSWORD in .env.local",
  );
  process.exit(1);
}

const auth = Buffer.from(`${user}:${pass.replace(/\s+/g, "")}`).toString("base64");

function sanitizeAcfForRest(value, key = "") {
  if (value === false) return null;
  if (value === "") {
    if (/padding|_id$|per_page|grid_|columns|rows|count/i.test(key)) return null;
    return "";
  }
  if (value == null) return value;
  if (Array.isArray(value)) return value.map((item) => sanitizeAcfForRest(item, key));
  if (typeof value === "object") {
    const id = value.ID ?? value.id;
    if (
      typeof id === "number" &&
      ("post_type" in value || "mime_type" in value || "guid" in value)
    ) {
      return id;
    }
    const out = {};
    for (const [childKey, child] of Object.entries(value)) {
      out[childKey] = sanitizeAcfForRest(child, childKey);
    }
    return out;
  }
  return value;
}

function mediaId(value) {
  if (value == null || value === false) return null;
  if (typeof value === "number") return value;
  if (typeof value === "object") {
    const id = value.ID ?? value.id;
    return typeof id === "number" ? id : null;
  }
  return null;
}

async function wpFetch(path, { method = "GET", body, lang = "nl" } = {}) {
  const separator = path.includes("?") ? "&" : "?";
  const localizedPath = `${path}${separator}lang=${lang}`;
  const res = await fetch(`${apiBase}${localizedPath}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      "X-Polylang-Language": lang,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`${method} ${localizedPath} ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }
  return res.json();
}

function repairProblemSolutionRow(row, slug) {
  if (row.acf_fc_layout !== "problem_solution") return row;

  const solutionListRaw = Array.isArray(row.solution_list)
    ? row.solution_list.map((r) => ({ text: String(r.item ?? "") })).filter((r) => r.text.trim())
    : [];

  const repairedList = repairSolutionListItems(solutionListRaw);
  const imageMap = PROBLEM_SOLUTION_IMAGES[slug];

  const next = {
    ...row,
    problem_text: repairProblemSolutionHtml(String(row.problem_text ?? "")),
    solution_text: repairProblemSolutionHtml(String(row.solution_text ?? "")),
    solution_bottom_text: repairProblemSolutionHtml(String(row.solution_bottom_text ?? "")),
    solution_list: repairedList.map((r) => ({ item: r.text })),
  };

  if (imageMap) {
    next.problem_image = imageMap.problem_image;
    next.solution_image = imageMap.solution_image;
  }

  return next;
}

async function main() {
  let updated = 0;

  for (const lang of LOCALES) {
    console.log(`\n========== locale: ${lang} ==========`);

    const services = await wpFetch(
      "/wp/v2/service?per_page=100&acf_format=standard&_fields=id,slug,acf",
      { lang },
    );

    for (const service of services) {
      const sections = service.acf?.page_sections;
      if (!Array.isArray(sections)) continue;

      const hasProblem = sections.some((s) => s?.acf_fc_layout === "problem_solution");
      if (!hasProblem) continue;

      const imageMap = PROBLEM_SOLUTION_IMAGES[service.slug];
      if (!imageMap) {
        console.log(`\n--- ${service.slug} (${lang}) SKIP: no image map ---`);
        continue;
      }

      const nextSections = sections.map((row) => repairProblemSolutionRow(row, service.slug));
      const psIndex = sections.findIndex((s) => s?.acf_fc_layout === "problem_solution");
      const before = sections[psIndex];
      const after = nextSections[psIndex];
      const changed = JSON.stringify(before) !== JSON.stringify(after);

      const problemImgBefore = mediaId(before?.problem_image);
      const solutionImgBefore = mediaId(before?.solution_image);

      console.log(
        `\n--- ${service.slug} (${lang}, id ${service.id}) ${changed ? "CHANGED" : "unchanged"} ---`,
      );
      console.log(
        `  images: problem ${problemImgBefore ?? "none"} → ${imageMap.problem_image}, solution ${solutionImgBefore ?? "none"} → ${imageMap.solution_image}`,
      );

      if (changed && apply) {
        await wpFetch(`/wp/v2/service/${service.id}`, {
          method: "POST",
          body: { acf: { page_sections: sanitizeAcfForRest(nextSections) } },
          lang,
        });
        console.log(`  Applied ${service.slug} (${lang})`);
        updated++;
      } else if (changed) {
        updated++;
      }
    }
  }

  console.log(
    `\n${apply ? "Updated" : "Would update"} ${updated} service(s).${apply ? "" : " Re-run with --apply to write."}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
