# n8n and WordPress blog publishing (Salonora)

Salonora reads **posts** from the WordPress REST API. Automated publishing should create or update posts in WordPress, then optionally trigger **Next.js on-demand revalidation** so new content appears without waiting for cache TTL.

See also: [wordpress-connection-guide.md](./wordpress-connection-guide.md), `.env.example`, and `ai-context.md`.

## Authentication (Application Password)

Use a dedicated WordPress user with **Editor** (or **Author**) role and an **Application Password** (Users → Profile → Application Passwords).

In n8n **HTTP Request** node:

- **Authentication**: Generic Credential Type → Header Auth, or set manually:
- **Header**: `Authorization: Basic <base64(username:application_password)>`

The password must be copied **without spaces** (WordPress shows spaced groups for readability only).

The Next.js server uses the same pattern via `WORDPRESS_APPLICATION_USER` and `WORDPRESS_APPLICATION_PASSWORD` (see `.env.example`).

## Create or update a post

**Endpoint:** `POST {WORDPRESS_API_URL}/wp/v2/posts`  
**Update:** `PUT {WORDPRESS_API_URL}/wp/v2/posts/{id}`

Always pass the Polylang language the site expects, e.g. query **`?lang=nl`** or **`?lang=en`** (Salonora’s `wpFetch` appends `lang` the same way).

**Minimal JSON body (create):**

```json
{
  "title": "Your title",
  "slug": "your-url-slug",
  "status": "publish",
  "excerpt": "Short intro shown under the title (plain text or simple HTML).",
  "content": "<p>HTML body…</p>",
  "categories": [3]
}
```

- **`categories`**: array of **category term IDs**. Used when **Show Related Posts** is enabled in WordPress: related items are loaded from the **first** category ID in this list.
- **`featured_media`**: set to a **media ID** after uploading an image (see below).

### Featured image

1. `POST {WORDPRESS_API_URL}/wp/v2/media` with the binary file (`Content-Disposition: attachment; filename="hero.jpg"`).
2. Read `id` from the response.
3. Set `"featured_media": <id>` on the post create/update request.

### ACF fields (optional)

If ACF REST exposes post fields (this project uses `acf_format=standard` when reading), you can send an `acf` object matching your field names, for example:

- **`show_related_posts`**: `true` to show the “Gerelateerde blogs” row on the Next template (same-language posts sharing the first `categories` ID).
- **`post_lead`**: HTML string (WYSIWYG) for the **on-page intro** under the title. When set, it replaces the plain-text excerpt lead. Useful when the excerpt must stay short for cards/SEO.
- **`breadcrumb_parent`**: link-shaped object `{ "title": "Educatie", "url": "https://…", "target": "" }` for an optional breadcrumb **before** “Blog”.
- **`show_toc`**: `false` to hide the table of contents sidebar block.
- **`post_sections`**: flexible rows (e.g. CTA, form embed, latest posts) — complex; prefer editing in WP admin unless you have stable JSON from your ACF export.

Example `acf` fragment on `POST /wp/v2/posts`:

```json
"acf": {
  "show_related_posts": true,
  "show_toc": true,
  "post_lead": "<p>Longer intro only for the article page.</p>",
  "breadcrumb_parent": { "title": "Educatie", "url": "https://example.com/nl/educatie", "target": "" }
}
```

REST shape for ACF can vary by ACF version; confirm with `GET .../posts/{id}?acf_format=standard&lang=nl`.

## HTML contract (post body)

The single-post template injects **`id`** attributes on **`<h2>`** and **`<h3>`** for the table of contents. You can also set `id` yourself in HTML.

Use these **wrapper classes** inside `content` so global styles in `src/app/globals.css` apply (Figma-aligned callouts, tables, checklists):

| Pattern            | Markup |
|--------------------|--------|
| Tip / callout      | Prefer `<div class="salonora-tip"><p class="salonora-tip-title">Tip van Salonora</p><p>…</p></div>` (title as **`<p>`**, not `<h2>`). Same idea for `salonora-callout` + `salonora-callout-title`. Headings **`h2` / `h3` inside** these wrappers — `salonora-tip`, `salonora-callout`, `salonora-warn`, `salonora-checklist`, `salonora-inline-cta`, `salonora-cta-panel`, **`salonora-tinted`** — get **no** section pill and are **omitted from the TOC** (`stripCalloutBlocksForToc` in `post-html.ts`). **WordPress:** if the title is a separate **Heading** block *before* a Custom HTML block, put the heading and the wrapper in one Custom HTML block, *or* rely on `globals.css`: an **`h2`/`h3` immediately before** that wrapper (or before a block that **directly contains** it, e.g. `wp-block-html`) also gets **no** section pill. **Plain text without these classes is not styled as a card** — use the wrappers in `content` HTML. |
| Tinted / custom band | `<div class="salonora-tinted">…</div>` for **any** block with a non-white background not covered above. Same TOC + numbering rules as other wrappers. Use **alone** for a default pale surface, or combine with your own classes / inline `style` for a custom colour. Must be a **`<div>`** (TOC stripping matches `div` + class). **Auto:** if a `<div>` has inline `style` with `background` / `background-color` that is not (near-)white and no Salonora wrapper class yet, the app injects `salonora-tinted` while mapping the WordPress post (`markStyleTintedDivs` in `post-html.ts`, called from `fetch-post.ts`).
| Warning            | `<div class="salonora-warn"><p class="salonora-warn-title">LET OP</p><p>…</p></div>` |
| Checklist box      | `<div class="salonora-checklist"><ul><li>…</li></ul></div>` |
| Tables             | Standard `<table><thead>…</thead><tbody>…</tbody></table>` |
| Mid-article CTA    | See **snippet** below (compact strip; place anywhere inside `content`) |
| Bottom CTA card    | See **snippet** below (`salonora-cta-panel`): same rules as other cards — **no** section numbers on headings inside; **not** listed in the TOC |

Headings **`h2` / `h3`** in the main article flow (outside the wrappers in the table above) get numbered decoration via CSS counters.

### Mid-article CTA (HTML snippet)

Use inside the post `content` where Figma shows the light banner with primary + secondary actions:

```html
<div class="salonora-inline-cta">
  <p class="salonora-inline-cta-title">Klanten moeten jou kunnen vinden.</p>
  <div class="salonora-inline-cta-actions">
    <a class="salonora-inline-cta-primary" href="https://example.com/signup">Start nu gratis</a>
    <a class="salonora-inline-cta-secondary" href="https://example.com/demo">Bekijk demo</a>
  </div>
</div>
```

### Bottom CTA card (wide panel, Figma-aligned)

Use near the end of `content` when you want a pale card with a **left brand bar**, a **heading** (usually **`h2`**), body copy, and **pill buttons** (primary + two outline). Headings inside the panel have **no** section pill and are **not** included in the TOC (`salonora-cta-panel` is stripped like other callout wrappers). Primary link reuses `salonora-inline-cta-primary`; secondary pills use `salonora-cta-panel-secondary`.

```html
<p>Doe het direct goed. Bouw jouw eigen online aanwezigheid. Eigen klanten. Eigen data. Eigen naam.</p>
<div class="salonora-cta-panel">
  <h2 id="klaar-om-te-starten">Klaar om te starten met jouw eigen salon?</h2>
  <p>Salonora geeft je een professionele salonwebsite. Met online boeken. Lokaal vindbaar in Google. Zonder commissies.</p>
  <div class="salonora-cta-panel-actions">
    <a class="salonora-inline-cta-primary" href="https://salonora.nl/">Ontdek Salonora →</a>
    <a class="salonora-cta-panel-secondary" href="https://salonora.nl/signup">start vandaag →</a>
    <a class="salonora-cta-panel-secondary" href="https://salonora.nl/">Salonora.nl →</a>
  </div>
</div>
```

## Revalidate Next.js

After publish or update, call the Next app:

`POST {NEXT_PUBLIC_SITE_URL}/api/revalidate`

```json
{
  "secret": "<REVALIDATION_SECRET>",
  "path": "/nl/blog/your-url-slug"
}
```

Revalidate at least:

- The **post URL**: `/{lang}/{slug}` (Salonora uses a single segment for posts, e.g. `/nl/your-url-slug`).
- The **blog archive** page if the index should refresh immediately: `/{lang}/{blog-archive-slug}` (default slug segment is `blog`; override with `WORDPRESS_BLOG_PAGE_SLUG_NL` / `WORDPRESS_BLOG_PAGE_SLUG_EN` in `.env` if your WordPress page slug differs).

Use one request per `path`, or run multiple HTTP nodes.

## Polylang and translations

Salonora passes **`?lang=`** on WordPress requests. For multilingual content:

1. **Create one post per language** with the correct `lang` query parameter (or your Polylang REST workflow).
2. **Link translations** in WordPress (Polylang UI or REST, depending on your Polylang version and addons). The Next app uses `translations` on REST objects when present for the language switcher (see `src/lib/wordpress/polylang-locale-hrefs.ts`).
3. In n8n, after publishing both languages, **revalidate both paths** (e.g. `/nl/slug-nl` and `/en/slug-en`).

Exact Polylang REST fields vary (Free vs Pro, plugins). Inspect:

`GET {WORDPRESS_API_URL}/wp/v2/posts?lang=nl&per_page=1&_embed=1`

and confirm `translations`, `lang`, or linked post IDs for your stack.

## Author sidebar (“Over de auteur”)

The template uses the **embedded author** from WordPress (`_embed=1`): display name, avatar, bio (`description`), and **URL** (if it is a LinkedIn URL, a LinkedIn icon is shown). Fill these in the WordPress user profile for consistent automation.

## Security

- Use a **dedicated** WordPress user and application password for n8n with minimal capabilities (`edit_posts`, `upload_files` if needed).
- Store secrets in n8n credentials or environment variables, not in workflow JSON exports.
