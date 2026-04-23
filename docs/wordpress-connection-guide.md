# WordPress connection guide (Salonora / OMB)

This Next.js app expects a headless WordPress site with the OMB ACF field groups, Polylang, Yoast SEO, and Contact Form 7.

## WordPress requirements

- ACF Pro active, with all import groups from `required/omb-starter-pack/acf-import-bundle.json` applied
- Polylang (or compatible) for `nl` and `en`, with translated content and menus
- Yoast SEO
- Contact Form 7 (5.4+ with REST API for forms and feedback)
- Custom post types: `service`, `testimonial` (exposed in REST)
- ACF `show_in_rest` on options and field groups where needed
- Option pages filled: header, footer, site, contact & social, integrations, default SEO

## Environment on the Next app

1. Copy `.env.example` to `.env.local` and set `WORDPRESS_API_URL` to your REST root (e.g. `https://yoursite.com/wp-json`).
2. Set `WORDPRESS_BASE_URL` to the public site root (no `/wp-json`) for media and CF7.
3. Set `NEXT_PUBLIC_SITE_URL` to the public Next.js URL (e.g. Ploi app URL or production domain).
4. Set `HOMEPAGE_SLUG` / per-locale slugs to the page that should render at `/{lang}/`.
5. Set `WP_MENU_*` env vars to the numeric menu IDs for each language and location (primary, footer, legal), if the REST `menu-items` route is used.

## Setup steps

1. Open `https://your-wordpress.test/wp-json` in a browser; you should see the REST index.
2. Open `https://your-wordpress.test/wp-json/wp/v2/pages?lang=nl&per_page=1` and confirm ACF `acf` keys when ACF-to-REST is enabled.
3. Confirm `https://your-wordpress.test/wp-json/wp/v2/service?lang=nl&per_page=1` and `.../testimonial?...` return data.
4. Test options: `https://your-wordpress.test/wp-json/acf/v3/options/omb-header-settings?lang=nl` (or `acf/v1` depending on ACF version). If 404, ensure ACF REST is enabled and the options page slug matches.
5. Test CF7: `https://your-wordpress.test/wp-json/contact-form-7/v1/contact-forms` lists forms.
6. Create menus for each language and set their IDs in env.
7. In production, call `POST /api/revalidate` with `{"secret":"REVALIDATION_SECRET","path":"/nl"}` when content changes (or wire a WordPress webhook).

## Troubleshooting

- **ACF missing in JSON**: enable REST for the field group; check `acf` in the `pages` response.
- **Empty menus**: ensure `menu-items` REST is available; set correct `WP_MENU_*` ids; some hosts require a small plugin to expose menus.
- **CF7 404 on submit**: check CF7 version, permalinks, and that the feedback URL is not blocked.
- **Images broken**: set `WORDPRESS_BASE_URL` and allow the host in `next.config` image `remotePatterns` (or use `unoptimized` in dev when no base URL is set).
- **Polylang `lang`**: this app passes `?lang=nl` on API calls; if your stack uses a different filter, add a small proxy or filter on WordPress.
- **Testimonials empty**: the relationship must return post objects with `id`; the app then loads `testimonial` posts by id.

## Reverse proxy (Ploi / Nginx)

Point the public domain to the Node process; forward `X-Forwarded-*` headers. The Next app does not need to serve `/wp-json`; only the browser and server fetch WordPress over HTTPS.
