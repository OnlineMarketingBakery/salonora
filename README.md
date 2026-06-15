# Salonora

**Headless marketing site for Salonora** — a fast, multilingual (Dutch / English) Next.js frontend backed by WordPress (ACF flexible content, services, blog, testimonials, forms, and SEO).

## Purpose

Salonora solves the split between **flexible editorial control** and a **modern, animated web experience**: marketers and translators work in WordPress (layouts, copy, media, Polylang); visitors get an App Router site with server-rendered pages, ISR-friendly revalidation, and a mapped component for each ACF layout. The repo also ships **OMB headless WordPress** glue (theme + plugin + mu-plugin) so the backend matches what the app expects.

> **Brand & positioning:** Tone, audience, and value pillars for Salonora the *product* should stay aligned with your marketing brief. The UI follows the in-repo palette (navy / brand blues, Outfit) and section-driven storytelling (hero, pricing, guarantees, FAQs, etc.). If you own that brief, drop it into this section so newcomers are not guessing.

## Tech stack

| Layer | Choice |
|--------|--------|
| Framework | **Next.js** 15 (App Router), **React** 19 |
| Language | **TypeScript** 5 |
| Styling | **Tailwind CSS** 4, CSS variables in `src/app/globals.css` |
| Motion | **GSAP** 3 + `@gsap/react` |
| CMS | **WordPress** (REST), **ACF**, **Polylang**, **Yoast SEO**, **Contact Form 7** |
| Lint | **ESLint** 9 + `eslint-config-next` |

Node: use a current **LTS** (e.g. 20.x) — match what you run on Ploi / CI.

## Project structure

```
salonora/
├── AGENTS.md                           # Pointer for coding agents → ai-context.md
├── ai-context.md                      # Canonical stack/conventions for humans & AI
├── CONTRIBUTING.md                    # PR checklist, doc updates
├── .cursor/rules/salonora.mdc         # Cursor project rules (always apply)
├── docs/
│   └── wordpress-connection-guide.md   # WP requirements, REST checks, troubleshooting
├── public/                             # Static assets (SVGs, hero gradient image, etc.)
├── src/
│   ├── app/
│   │   ├── [lang]/                     # Localized routes: home, catch-all pages, layout, metadata
│   │   ├── api/
│   │   │   ├── revalidate/             # POST: on-demand ISR (secret + path/tag)
│   │   │   └── locale-hrefs/           # GET: hreflang / locale switch data for a pathname
│   │   ├── globals.css                 # Tailwind + design tokens (palette, font)
│   │   └── ...
│   ├── components/
│   │   ├── sections/                   # One folder per ACF flexible layout
│   │   ├── layout/                     # Header, footer, nav, announcement bar
│   │   ├── templates/                  # Page / post shells
│   │   ├── forms/                      # CF7 embed + field rendering
│   │   └── ui/                         # Buttons, cards, media, typography primitives
│   ├── lib/
│   │   ├── wordpress/                  # REST client, fetchers, menus, CF7 submit, route resolution
│   │   ├── acf/                        # Section registry, normalizers, enrichment
│   │   ├── i18n/                       # Locales, alternates, middleware default
│   │   └── seo/                        # Yoast → Next metadata mapping
│   ├── types/                          # ACF, sections, globals, SEO types
│   └── middleware.ts                   # `/` → default locale; passes pathname header
├── wordpress/                          # OMB headless theme, core plugin, Polylang mu-plugin
│   └── wp-content/
│       ├── themes/omb-headless/        # Headless theme + ACF JSON bundle
│       ├── plugins/omb-headless-core/  # CPTs, options, REST, CF7 helpers
│       └── mu-plugins/                 # Salonora Polylang tweaks
├── next.config.ts                      # Image remotePatterns from WP base URL
├── package.json
├── postcss.config.mjs
└── eslint.config.mjs
```

## Prerequisites

- **WordPress** with the stack described in [`docs/wordpress-connection-guide.md`](docs/wordpress-connection-guide.md) (ACF Pro, Polylang `nl`/`en`, Yoast, CF7, custom post types `service`, `testimonial`, and `case_study`, option pages, menus).
- ACF: flexible layouts are defined in **`wordpress/wp-content/themes/omb-headless/acf-json/group_*.json`** (Local JSON). Deploy theme JSON with **`npm run plugins:deploy -- --with-theme`**, then sync field groups in WP Admin → **Custom Fields → Sync available** if prompted. Plugin-only changes use **`npm run plugins:deploy`** (core + form builder). Layouts must match `src/lib/acf/` and `src/components/sections/`. Run **`npm run validate:sections`** after pipeline changes.

## Setup & installation

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Copy environment template and fill values (see next section):

   ```bash
   cp .env.example .env.local
   ```

3. Ensure WordPress REST is reachable from this machine (HTTPS in production).

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) — the app redirects `/` to the default locale (see `DEFAULT_LOCALE`, usually `/nl`).

## Environment variables

All keys are documented in **`.env.example`** at the repo root. Summary:

| Variable | Required | Role |
|----------|----------|------|
| `WORDPRESS_API_URL` | Yes (for real data) | REST root, e.g. `https://example.com/wp-json` |
| `WORDPRESS_BASE_URL` | Recommended | Public WP origin (no `/wp-json`) — media URLs, CF7 |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public URL of this Next app (canonical, sitemap, links) |
| `HOMEPAGE_SLUG` / `HOMEPAGE_SLUG_NL` / `HOMEPAGE_SLUG_EN` | Optional | Page slug for `/{lang}/` |
| `WORDPRESS_BLOG_PAGE_SLUG` / `*_NL` / `*_EN` | Optional | Blog archive segment for post breadcrumbs (default `blog`) |
| `WORDPRESS_CASE_STUDY_PAGE_SLUG` / `*_NL` / `*_EN` | Optional | Case study archive segment for single-case-study breadcrumbs (default `case-studies`) |
| `WP_MENU_*` / `WORDPRESS_MENU_*` | If using REST menus | Numeric menu IDs per location (`primary`, `footer`, `legal`) and locale |
| `WORDPRESS_APPLICATION_USER` / `WORDPRESS_APPLICATION_PASSWORD` | If WP returns 401 | Application Password basic auth for server fetches |
| `REVALIDATION_SECRET` | Production ISR webhooks | Secret for `POST /api/revalidate`; also used as OMB Form Builder headless Bearer when `OMB_*` / `CFB_*` submit env vars are unset (must match `CFB_HEADLESS_SUBMIT_SECRET` in `wp-config.php`) |
| `NEXT_PUBLIC_DEFAULT_CF7_FORM_ID` | Optional | Default Contact Form 7 id |
| `OMB_FORM_BUILDER_SUBMIT_SECRET` (or `CFB_HEADLESS_SUBMIT_SECRET`) | Optional if `REVALIDATION_SECRET` or WP Integrations secrets set | Dedicated Bearer for OMB Form Builder headless `POST …/public/forms/{id}/submit` (match `wp-config.php`) |
| `NEXT_PUBLIC_DEFAULT_CTA_BRAND_ARROW_URL` | Optional | Absolute image URL for blue CTA trailing icon when WordPress Site Options image is unset |
| `WORDPRESS_SERVICE_REST_BASE` / `WORDPRESS_TESTIMONIAL_REST_BASE` / `WORDPRESS_CASE_STUDY_REST_BASE` | Rare | Override REST base if CPT slug differs |
| `DEFAULT_LOCALE` / `SUPPORTED_LOCALES` | Optional | Default redirect locale; comma list (default `nl,en`) |
| `PLOI_SSH_HOST` / `PLOI_SSH_USER` / `PLOI_PLUGINS_PATH` / `PLOI_THEMES_PATH` / `PLOI_MU_PLUGINS_PATH` | For `plugins:deploy` | Ploi SSH deploy (`PLOI_PLUGINS_PATH` required; theme/mu paths only for `--with-theme` / `--with-mu-plugin`) |

If `WORDPRESS_BASE_URL` / `WORDPRESS_API_URL` are unset, **Next Image** runs in `unoptimized` mode (handy for quick local tries).

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Next dev with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Serve production build (`NODE_ENV=production`) |
| `npm run lint` | ESLint |
| `npm run validate:sections` | Verify section pipeline (types, normalizer, registry, renderer) |
| `npm run strip:php-bom` | Strip UTF-8 BOM from PHP under `wordpress/` |
| `npm run plugins:package` | Zip OMB plugins into `dist/` (add `-- --with-theme` or `--with-mu-plugin` when needed) |
| `npm run plugins:deploy` | Deploy **omb-headless-core** + **omb-form-builder** via SSH (add `-- --with-theme` for ACF JSON / theme changes) |
| `npm run backup:wp` | WPvivid full backup on Ploi (deletes oldest backup first). Use before risky CMS/plugin deploys. Add `-- --dry-run` to preview. |

## Key workflows & features

- **Localized routing:** `src/app/[lang]/` with `[...slug]` for inner pages; middleware sends `/` to the default locale.
- **Legal & FAQ pages:** Manage in WordPress with ACF layouts **`legal_content`** (privacy/terms) and **`faq`**. See [WORDPRESS-ACF-legal-content.md](WORDPRESS-ACF-legal-content.md). Empty CMS pages fall back to copy in `src/lib/legal/`. Consolidated FAQ Q&A: `src/lib/legal/faq-data.json` (homepage + product questions). Import: `node src/lib/legal/seed-legal-pages.mjs --faq` (add `--force` to refresh). Privacy/terms use `LegalPageTemplate`; FAQ uses `PageTemplate` + `faq` section.
- **Flexible sections:** WordPress ACF layouts are normalized in `src/lib/acf/` and rendered via `SectionRenderer` + `src/components/sections/*`.
- **Services, posts & case studies:** Dedicated fetchers and templates (`PageTemplate`, `PostTemplate`, `CaseStudyTemplate`). Blog singles use **Global Templates** options (`blog_single_sections`) for shared FAQ; see [docs/blog-single-template.md](docs/blog-single-template.md).
- **Testimonials:** Loaded by relationship IDs from section data.
- **Forms:** CF7 via REST + server proxy (`submit-cf7-form`) for `form_embed` and featured post/case forms; **Free demo** uses a fixed UI and `POST /api/forms/free-demo`, which forwards to **OMB Form Builder** `POST {WORDPRESS_API_URL}/custom-form-builder/v1/public/forms/{ombFormId}/submit` with JSON `{ cfb, cfb_visible_fields, cfb_post_id }` and `Authorization: Bearer` resolved by `resolveOmbFormBuilderBearerSecret` (env: `OMB_FORM_BUILDER_SUBMIT_SECRET`, `CFB_HEADLESS_SUBMIT_SECRET`, or `REVALIDATION_SECRET`; else WordPress **Integrations** ACF: `omb_form_builder_submit_secret`, then `revalidation_secret` — must match `CFB_HEADLESS_SUBMIT_SECRET` in `wp-config.php`). The **`free_demo_form`** layout uses ACF **`omb_form`** only (published `cfb_form` id) — **not** the CF7 **`form`** field. CFB field **`name`** values on the linked `cfb_form` must align with `submit-omb-free-demo-lead.ts` (`first_name`, `last_name`, `email`, `phone`, `salon_type`, `do_you_have_any_current_website`, `current_website_url`); Next maps those to field **`id`** keys (`field_1`, …) in the POST `cfb` object.
- **SEO:** Yoast fields mapped in `src/lib/seo/map-yoast-to-metadata.ts`.
- **On-demand revalidation:** `POST /api/revalidate` with JSON `{ "secret": "<REVALIDATION_SECRET>", "path": "/nl" }` (optional `tag`). Configure `REVALIDATION_SECRET` and call from WP webhooks or deploy hooks when content changes.

## Integrations

- **WordPress REST** — pages, posts, CPTs, ACF, options, menus (when exposed).
- **Polylang** — `?lang=` on requests; locale hrefs API for language switcher.
- **Yoast SEO** — metadata for App Router.
- **Contact Form 7** — list forms, render, submit (REST + custom plugin endpoints as needed).
- **OMB Form Builder (free demo):** In WordPress **Global Settings → Integrations**, you can store an optional **OMB form submit secret** (ACF field key `omb_form_builder_submit_secret`). If that field is empty, Next falls back to the existing **revalidation secret** field (`revalidation_secret`) for the Bearer token when no submit-specific env vars are set. `define('CFB_HEADLESS_SUBMIT_SECRET', …)` in `wp-config.php` must use the same value.
- **Hosting (e.g. Ploi):** Node process behind reverse proxy; forward `X-Forwarded-Proto` / `X-Forwarded-*` for correct URLs. See README section below.

## Production (Ploi / Node)

- **Install:** `npm ci` (or `npm install`)
- **Build:** `npm run build`
- **Start:** `npm run start` with `NODE_ENV=production` and the same env vars as locally (especially HTTPS WordPress URLs).
- **Reverse proxy:** Point the public domain at the Node port; allow large headers if needed; forward `X-Forwarded-Proto`.
- **Images:** `next.config.ts` whitelists the host derived from `WORDPRESS_BASE_URL` / `WORDPRESS_API_URL`. If production media uses another host, extend `remotePatterns` there.

## Developer and AI-assisted coding

- **[`ai-context.md`](ai-context.md)** — Canonical stack, folder map, conventions, integrations, anti-patterns, and env var names (read this before large refactors).
- **[`AGENTS.md`](AGENTS.md)** — Short entry point for coding agents (points to `ai-context.md`).
- **[`.cursor/rules/salonora.mdc`](.cursor/rules/salonora.mdc)** — Cursor **project rules** with `alwaysApply: true` (current Cursor recommendation instead of legacy repo-root rules files).

## Contributing

See **[`CONTRIBUTING.md`](CONTRIBUTING.md)** for PR expectations, when to update `ai-context.md` / `.env.example`, and WordPress compatibility notes.

## More documentation

- **[WordPress connection guide](docs/wordpress-connection-guide.md)** — API checks, menu IDs, CF7, Polylang, troubleshooting.
