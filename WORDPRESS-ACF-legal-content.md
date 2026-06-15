# WordPress ACF: `legal_content` and `faq` layouts

These layouts live in **`wordpress/wp-content/themes/omb-headless/acf-json/group_omb_page_builder.json`** (`layout_omb_legal_content`, `layout_omb_faq`).

**Deploy to WordPress:**

```bash
npm run plugins:deploy -- --with-theme
```

Then in WP Admin → **Custom Fields → Sync available** (if ACF shows pending sync for the page builder group).

PHP must be **UTF-8 without BOM** — a BOM breaks REST JSON and Gutenberg saves. `npm run plugins:deploy` runs `strip:php-bom` before packaging.

In the page editor: **OMB Page Builder → Flexible Sections** (field `page_sections`), not Page footer sections.

After deploy: **Ctrl+F5** in WP admin.

**Manual:** add the layouts below to **Page sections** in ACF if you cannot run the deploy script.

| Setting | Value |
|---------|--------|
### `legal_content`

| Setting | Value |
|---------|--------|
| Layout name | `legal_content` (must match exactly) |
| Field: `body` | WYSIWYG |
| Field: `content_width` | Select: `default`, `narrow`, `wide` (optional; default `narrow`) |

### `faq`

| Setting | Value |
|---------|--------|
| Layout name | `faq` |
| Field: `title` | Text (optional) |
| Field: `items` | Repeater: `question` (text), `answer` (WYSIWYG) |

Optional page field on **Pages**: `is_legal_page` (True/False) — already supported by Next.

## Page setup

| Slug | Sections |
|------|----------|
| `privacy-policy` | One `legal_content` row |
| `terms-conditions` | One `legal_content` row |
| `faq` | One `faq` row (Q&A repeater) |

Link NL/EN translations in Polylang. Add URLs to **Legal** menus.

## Import default copy

```bash
node src/lib/legal/seed-legal-pages.mjs
node src/lib/legal/seed-legal-pages.mjs --force
node src/lib/legal/seed-legal-pages.mjs --faq
```

Use **`--force`** to replace WP boilerplate in the block editor and push Salonora HTML into `legal_content` (clears `post_content`).

Requires `WORDPRESS_API_URL`, `WORDPRESS_APPLICATION_USER`, `WORDPRESS_APPLICATION_PASSWORD` in `.env.local`.
