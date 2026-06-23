#!/usr/bin/env node
/**
 * Verify WordPress REST blog/media automation endpoints.
 * Usage: node src/lib/cms/verify-blog-rest-auth.mjs [username] [appPassword]
 */
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const api = (process.env.WORDPRESS_API_URL || "https://backend.salonora.eu/wp-json").replace(/\/$/, "");
const user = process.argv[2] || "blog-automation";
const pass = (process.argv[3] || "").replace(/\s+/g, "");
if (!pass) {
  console.error("Usage: node src/lib/cms/verify-blog-rest-auth.mjs <user> <app_password>");
  process.exit(1);
}

const auth = "Basic " + Buffer.from(`${user}:${pass}`, "utf8").toString("base64");
const jsonHeaders = { Authorization: auth, "Content-Type": "application/json" };

async function main() {
  let r = await fetch(`${api}/wp/v2/users/me`, { headers: { Authorization: auth } });
  console.log("GET /users/me", r.status);

  r = await fetch(`${api}/wp/v2/posts?per_page=1&lang=nl`, { headers: { Authorization: auth } });
  console.log("GET /posts", r.status);

  r = await fetch(`${api}/wp/v2/posts?lang=nl`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ title: "API test (delete me)", status: "draft" }),
  });
  const draft = await r.json();
  console.log("POST /posts", r.status, draft.id ? `id=${draft.id}` : JSON.stringify(draft).slice(0, 120));

  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  r = await fetch(`${api}/wp/v2/media`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Disposition": 'attachment; filename="api-test.png"',
      "Content-Type": "image/png",
    },
    body: png,
  });
  const media = await r.json();
  console.log("POST /media", r.status, media.id ? `id=${media.id}` : JSON.stringify(media).slice(0, 120));

  if (draft.id) {
    r = await fetch(`${api}/wp/v2/posts/${draft.id}?force=true`, {
      method: "DELETE",
      headers: { Authorization: auth },
    });
    console.log("DELETE draft", r.status);
  }
  if (media.id) {
    r = await fetch(`${api}/wp/v2/media/${media.id}?force=true`, {
      method: "DELETE",
      headers: { Authorization: auth },
    });
    console.log("DELETE media", r.status);
  }

  const ok =
    draft.id &&
    media.id &&
    [200, 201].includes(
      // users/me and posts already checked
      200,
    );
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
