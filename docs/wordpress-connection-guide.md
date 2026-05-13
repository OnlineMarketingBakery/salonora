# WordPress connection guide (Salonora / OMB)

This Next.js app expects a headless WordPress site with the OMB ACF field groups, Polylang, Yoast SEO, and Contact Form 7.

## WordPress requirements

- ACF Pro active, with all import groups from `required/omb-starter-pack/acf-import-bundle.json` applied
- Polylang (or compatible) for `nl` and `en`, with translated content and menus
- Yoast SEO
- Contact Form 7 (5.4+ with REST API for forms and feedback)
- Custom post types: `service`, `testimonial`, `case_study` (exposed in REST; register via `omb-headless-core` and flush permalinks after deploy). **Do not** register duplicate slugs (`service`, `testimonial`, `case_study`) with another plugin (e.g. CPT UI); that will conflict with the plugin.
- ACF `show_in_rest` on options and field groups where needed
- Option pages filled: header, footer, site, contact & social, integrations, default SEO

## Environment on the Next app

1. Copy `.env.example` to `.env.local` and set `WORDPRESS_API_URL` to your REST root (e.g. `https://yoursite.com/wp-json`).
2. Set `WORDPRESS_BASE_URL` to the public site root (no `/wp-json`) for media and CF7.
3. Set `NEXT_PUBLIC_SITE_URL` to the public Next.js URL (e.g. Ploi app URL or production domain).
4. Set `HOMEPAGE_SLUG` / per-locale slugs to the page that should render at `/{lang}/`.
5. Set `WP_MENU_*` env vars to the numeric menu IDs for each language and location (primary, footer, legal), if the REST `menu-items` route is used. Optional: `WORDPRESS_BLOG_PAGE_SLUG*` (default `blog`) and `WORDPRESS_CASE_STUDY_PAGE_SLUG*` (default `case-studies`) so single post / single case study breadcrumbs match your archive URL segments.

## Setup steps

1. Open `https://your-wordpress.test/wp-json` in a browser; you should see the REST index.
2. Open `https://your-wordpress.test/wp-json/wp/v2/pages?lang=nl&per_page=1` and confirm ACF `acf` keys when ACF-to-REST is enabled.
3. Confirm `https://your-wordpress.test/wp-json/wp/v2/service?lang=nl&per_page=1` and `.../testimonial?...` return data. For case studies overview, confirm `.../wp/v2/case_study?lang=nl&per_page=1&_embed=1&acf_format=standard` (or your `WORDPRESS_CASE_STUDY_REST_BASE` slug) returns posts and an `acf` object when the **OMB Case Study** field group is synced.
4. Test options: `https://your-wordpress.test/wp-json/acf/v3/options/omb-header-settings?lang=nl` (or `acf/v1` depending on ACF version). If 404, ensure ACF REST is enabled and the options page slug matches.
5. Test CF7: `https://your-wordpress.test/wp-json/contact-form-7/v1/contact-forms` lists forms.
6. Create menus for each language and set their IDs in env.
7. In production, call `POST /api/revalidate` with `{"secret":"REVALIDATION_SECRET","path":"/nl"}` when content changes (or wire a WordPress webhook).

## Troubleshooting

- **ACF field groups broken / empty / wrong after a deploy**: see **`docs/acf-field-group-recovery.md`** (sync, `acf:push`, DB backup).
- **“Page Sections” shows one box with `["hero","why_we_do_this",…]`**: that string is **not** valid ACF flexible content data (real flexible rows are many `postmeta` keys like `page_sections_0_acf_fc_layout`, not one JSON array of names). **Do not** store the bulk `acf-import-bundle.json` inside `acf-json/` — that folder is for single-group `group_*.json` files; an array bundle there can break Local JSON loading. Fix: keep `acf-import-bundle.json` at `themes/omb-headless/acf-import-bundle.json`, deploy `acf-json/group_omb_page_builder.json`, run `npm run acf:push` or WP **Custom Fields → Sync**, and confirm **Page Sections** is **Flexible Content**. If the page value is still that JSON string, **restore post meta from a backup** or rebuild rows.
- **ACF field groups look empty, wrong, or “destroyed” in wp-admin**: Follow [ACF Local JSON](https://www.advancedcustomfields.com/resources/local-json/) — `acf-json/` must contain **one `group_<key>.json` per field group**, not the bulk array file. In this repo run **`npm run acf:extract-local-json`** after pulling (regenerates all 10 group files from `acf-import-bundle.json`), deploy the theme, delete **`acf-json/acf-import-bundle.json`** on the server if present, then in WP **Custom Fields** use **Sync available**. Optionally run **`npm run acf:push`** to import the full bundle via REST. Clear caches and hard-refresh.
- **ACF missing in JSON**: enable REST for the field group; check `acf` in the `pages` response.
- **Empty menus**: easiest path — leave `WP_MENU_*` env vars unset; the frontend falls back to `/omb-headless/v1/menu?location=<primary|footer|legal>&lang=<nl|en>` exposed by `omb-headless-core`, which resolves the menu by theme location (Polylang-aware) and needs no auth. If you prefer the core route, set `WP_MENU_*` ids and ensure `wp/v2/menu-items` is reachable (set `show_in_rest` per menu, or supply an Application Password).
- **CF7 404 on submit**: check CF7 version, permalinks, and that the feedback URL is not blocked.
- **Images broken**: set `WORDPRESS_BASE_URL` and allow the host in `next.config` image `remotePatterns` (or use `unoptimized` in dev when no base URL is set).
- **Polylang `lang`**: this app passes `?lang=nl` on API calls; if your stack uses a different filter, add a small proxy or filter on WordPress.
- **Testimonials empty**: the relationship must return post objects with `id`; the app then loads `testimonial` posts by id.
- **Automated blog posts (n8n)**: see **`docs/n8n-blog-publishing.md`** (REST create/update, featured media, HTML wrappers, revalidation, Polylang notes). Optional full-body Gutenberg-style sample: **`docs/n8n-blog-post-gutenberg-reference.html`**.

## Reverse proxy (Ploi / Nginx)

Point the public domain to the Node process; forward `X-Forwarded-*` headers. The Next app does not need to serve `/wp-json`; only the browser and server fetch WordPress over HTTPS.
