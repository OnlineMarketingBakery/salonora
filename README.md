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
- ACF: **`acf-import-bundle.json` at the repo root** is the canonical bulk-import file (edit this when adding flexible layouts). **`npm run acf:sync-bundle`** copies it to `wordpress/wp-content/themes/omb-headless/acf-import-bundle.json`; **`npm run acf:push`** runs that sync automatically, then POSTs to WordPress. `acf-json/group_*.json` is generated with **`npm run acf:extract-local-json`** (one file per group, per ACF Local JSON). Layouts must match `src/lib/acf/` and `src/components/sections/`.

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
| `REVALIDATION_SECRET` | Production ISR webhooks | Secret for `POST /api/revalidate` |
| `NEXT_PUBLIC_DEFAULT_CF7_FORM_ID` | Optional | Default Contact Form 7 id |
| `WORDPRESS_SERVICE_REST_BASE` / `WORDPRESS_TESTIMONIAL_REST_BASE` / `WORDPRESS_CASE_STUDY_REST_BASE` | Rare | Override REST base if CPT slug differs |
| `DEFAULT_LOCALE` / `SUPPORTED_LOCALES` | Optional | Default redirect locale; comma list (default `nl,en`) |

If `WORDPRESS_BASE_URL` / `WORDPRESS_API_URL` are unset, **Next Image** runs in `unoptimized` mode (handy for quick local tries).

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Next dev with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Serve production build (`NODE_ENV=production`) |
| `npm run lint` | ESLint |

## Key workflows & features

- **Localized routing:** `src/app/[lang]/` with `[...slug]` for inner pages; middleware sends `/` to the default locale.
- **Flexible sections:** WordPress ACF layouts are normalized in `src/lib/acf/` and rendered via `SectionRenderer` + `src/components/sections/*`.
- **Services, posts & case studies:** Dedicated fetchers and templates (`PageTemplate`, `PostTemplate`, `CaseStudyTemplate`).
- **Testimonials:** Loaded by relationship IDs from section data.
- **Forms:** CF7 via REST + server proxy (`submit-cf7-form`); embed sections use `FormEmbedSection` / `CF7Form`.
- **SEO:** Yoast fields mapped in `src/lib/seo/map-yoast-to-metadata.ts`.
- **On-demand revalidation:** `POST /api/revalidate` with JSON `{ "secret": "<REVALIDATION_SECRET>", "path": "/nl" }` (optional `tag`). Configure `REVALIDATION_SECRET` and call from WP webhooks or deploy hooks when content changes.

## Integrations

- **WordPress REST** — pages, posts, CPTs, ACF, options, menus (when exposed).
- **Polylang** — `?lang=` on requests; locale hrefs API for language switcher.
- **Yoast SEO** — metadata for App Router.
- **Contact Form 7** — list forms, render, submit (REST + custom plugin endpoints as needed).
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
