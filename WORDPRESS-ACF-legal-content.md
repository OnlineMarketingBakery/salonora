# WordPress ACF: `legal_content` and `faq` layouts

These layouts are in **repo-root** `acf-import-bundle.json` (`layout_omb_legal_content`, `layout_omb_faq`).

**Recommended (safe merge — does not reset existing page-builder layouts):**

```bash
npm run acf:sync-bundle
npm run acf:push
```

Or push only new layouts by name: `npm run acf:push -- --only=legal_content`

**Warning:** Do not use chunked partial imports on production. Always use `npm run acf:push` (merge-only). If duplicates accumulate in ACF admin, run `npm run acf:cleanup-duplicates` first.

Uses **merge import** (`X-Acf-Merge-Layouts`) so layouts appear in the WP admin picker (append-only `acf_update_field` is not enough).

Requires deployed `omb-headless-core` (`acf-sync.php`, `rest.php` — UTF-8 **without BOM**). Check: open `/wp-json/omb-headless/v1/acf-sync-status` — should list `page_sections_layouts` including `legal_content` and `faq`.

In the page editor: **OMB Page Builder → Flexible Sections** (field `page_sections`), not Page footer sections.

After push: **Ctrl+F5** in WP admin. If still missing: **ACF → Field Groups → OMB Page Builder → Sync** (if offered).

**Manual:** add the layouts below to **Page sections** in ACF if you cannot run the push script.

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
