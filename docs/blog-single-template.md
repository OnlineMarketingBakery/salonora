# Blog single — Global Templates

Shared sections (FAQ, etc.) for every blog post come from **Global Settings → Templates** in WordPress.

## WordPress setup

1. **Plugin** — Deploy `wordpress/wp-content/plugins/omb-headless-core` (includes **Templates** menu + `/globals` → `templates`).
2. **ACF** — From repo root: `npm run acf:push` (imports `group_omb_templates_settings`).
3. **Content** — Open **Global Settings → Templates** (NL + EN via Polylang). In **Blog single sections**, add layouts (e.g. `faq_contact_split`). Save.
4. **Per post** — Optional: `post_lead`, `show_toc`, `show_related_posts`, `breadcrumb_parent`. Article body stays in post `content` (n8n).

## Fallback

If Templates is empty, Next uses the layout page with ACF `is_blog_single_layout` (slug `blog-single-layout` by default).

## Next.js

- `fetchBlogSingleTailSections` → `PostDocument.layoutSections`
- `PostTemplate`: article → FAQ (`#post-faq`) → related posts → other tail sections
