# Salonora — AI project context

Read this file before large edits so you do not need to re-scan the whole repo. **Cursor** loads **`.cursor/rules/salonora.mdc`** (`alwaysApply: true`). **`AGENTS.md`** is the portable pointer for other agent tools. Authoritative env list: `.env.example`. Human overview: `README.md`. WordPress setup: `docs/wordpress-connection-guide.md`.

## Summary

Salonora is a **multilingual (nl/en) Next.js 15 App Router** marketing site that renders **WordPress** content: ACF flexible sections, pages, posts, CPTs (`service`, `testimonial`), globals (header/footer/options), **Yoast** metadata, **Polylang** locales, and **Contact Form 7**. The repo includes **OMB headless** PHP (`wordpress/`: theme, plugin, mu-plugin) aligned with the Next fetchers.

## Brand voice & UI (from codebase)

- **Visual system:** Outfit (Google Font), palette in `src/app/globals.css` — brand blue, navy, muted blue-gray; Figma horizontal brand gradient uses `--palette-brand` → `--palette-brand-strong`; page `--background` is white (`--palette-white`); light blue-gray surfaces (`--palette-surface`, etc.) for cards/UI (`--palette-*`, Tailwind `@theme inline`).
- **Motion:** GSAP + `@gsap/react`; reveal classes in `src/lib/animation-classes.ts`, page-level patterns in `src/components/animations/`.
- **Copy & positioning:** Lives in WordPress, not hardcoded brand manifestos. UI sections are conversion-oriented (hero, pricing, FAQ, testimonials carousel with configurable items-per-slide, guarantees). Do not invent product claims; match existing component tone (clear, professional, benefit-led).

## Tech stack (versions from package.json)

| Package | Version (caret) |
|---------|-----------------|
| next | ^15.5.15 |
| react / react-dom | ^19.0.0 |
| typescript | ^5 |
| tailwindcss | ^4 |
| @tailwindcss/postcss | ^4 |
| gsap | ^3.15.0 |
| @gsap/react | ^2.1.2 |
| eslint | ^9 |
| eslint-config-next | 15.2.3 |

Node: **20.x LTS** (match Ploi/CI). Dev server: **`npm run dev`** uses **Turbopack**.

## Folder map (compact)

```
src/app/[lang]/          # layout, page, [...slug], not-found
src/app/api/revalidate/  # POST ISR (REVALIDATION_SECRET + path|tag)
src/app/api/locale-hrefs/ # GET ?pathname= — Polylang alternates for language switcher
src/components/sections/<acf-layout>/  # one folder per flexible layout
src/components/layout/   # header, footer, nav, drawers, announcement
src/components/templates/ # PageTemplate, PostTemplate
src/components/forms/    # CF7Form, CF7FieldRenderer
src/components/ui/       # Button, Container, Media, RichText, etc.
src/lib/wordpress/       # wpFetch, config, fetch-*, resolve-route, menus, CF7 submit
src/lib/acf/             # section-registry, normalize-*-sections, enrich-sections, field-mappers
src/lib/i18n/            # locales, get-alternates, config (DEFAULT_LOCALE, SUPPORTED_LOCALES)
src/lib/seo/             # map-yoast-to-metadata
src/types/               # sections, acf, globals, seo, wordpress
src/middleware.ts        # / → default locale; sets x-pathname header
wordpress/wp-content/    # omb-headless theme, omb-headless-core plugin, mu-plugins
public/                  # static assets (SVGs, hero-gradiant.png, etc.)
```

## Conventions

- **Imports:** `@/` → `src/` (see `tsconfig.json`).
- **Sections:** ACF layout → normalized `type` (snake_case, e.g. `faq_contact_split`) in `src/types/sections.ts` → **`sectionRegistry`** in `src/lib/acf/section-registry.ts` maps to a component. New layout = new type + normalizer + registry entry + `src/components/sections/<kebab-name>/`.
- **Section props:** `{ section, lang }` where `lang` is `Locale` (`nl` | `en`).
- **WordPress HTTP:** Use **`wpFetch` / `wpFetchOptional`** from `src/lib/wordpress/client.ts` — appends `?lang=` when `lang` passed; adds Application Password **Basic** auth from env when set.
- **Config:** `src/lib/wordpress/config.ts` — API URL, base URL, site URL, homepage slugs, menu IDs, revalidation secret, default CF7 id, CPT REST bases.
- **i18n:** `src/lib/i18n/config.ts` — `defaultLocale`, `supportedLocales` from env. `src/lib/i18n/locales.ts` — `Locale` type. Middleware redirect uses `defaultLocale`.
- **Links:** `src/lib/utils/links.ts` (`resolveLink`, etc.) for internal vs external URLs from ACF.
- **Logging:** `src/lib/utils/logger.ts` (dev-aware).
- **Images:** `next.config.ts` builds `remotePatterns` from `WORDPRESS_BASE_URL` or `WORDPRESS_API_URL`; missing env → `unoptimized: true`.

## Important files

| File | Role |
|------|------|
| `src/lib/acf/section-registry.ts` | Maps section `type` → React component |
| `src/components/sections/SectionRenderer.tsx` | Renders section list |
| `src/lib/wordpress/client.ts` | All REST calls |
| `src/lib/wordpress/config.ts` | Env accessors |
| `src/lib/acf/normalize-*-sections.ts` | Page vs service ACF → typed sections |
| `src/lib/acf/enrich-sections.ts` | Extra loads (e.g. testimonials by ID, `design_showcase_grid` services + featured media, paginated if rows×columns exceeds REST batch size) |
| `src/app/[lang]/page.tsx` | Home: homepage slug per lang |
| `src/app/[lang]/[...slug]/page.tsx` | Catch-all pages |
| `src/app/[lang]/layout.tsx` | Globals, metadata shell |
| `src/middleware.ts` | Root redirect, pathname header |
| `src/lib/seo/map-yoast-to-metadata.ts` | Yoast → Next Metadata |

## Commands

```bash
npm run dev      # next dev --turbopack
npm run build    # production build
npm run start    # next start (NODE_ENV=production)
npm run lint     # next lint
```

## Globals (footer)

- **Footer background** (tab on OMB Footer options): `footer_background_image` (full-bleed cover), `footer_background_color` (hex text), `footer_background_gradient` (CSS `background-image` value). Precedence: image → gradient → color → default `bg-navy-deep`. Legacy `footer_top_shape_image` is still read and merged into the image if the new field is empty.
- **OMB `/omb-headless/v1/globals`:** the WordPress plugin merges every `footer_*` key from the flat options record into the `footer` object (so new ACF fields are not dropped if the allowlist lags) and normalizes `footer_background_image` / `footer_logo` / `footer_top_shape_image` to absolute URLs when possible. Next.js absolutizes root-relative paths via `WORDPRESS_BASE_URL`, renders the footer background with a plain `<img>` when a URL resolves, and falls back to a second ACF options fetch if the image URL is still missing after OMB.

## Integrations

- **WordPress REST** — pages, posts, CPTs, ACF in JSON, ACF options (`acf/v3` or `acf/v1` per WP). Menus: `wp/v2/menu-items` when env IDs are set, otherwise public fallback `/omb-headless/v1/menu?location=…&lang=…` (resolves theme location server-side; no env IDs required).
- **Polylang** — `lang` query on `wpFetch`; `src/lib/wordpress/polylang-locale-hrefs.ts` + `/api/locale-hrefs`.
- **Yoast** — fetched with content; mapped in `src/lib/seo/`.
- **CF7** — REST list/submit; `src/lib/wordpress/submit-cf7-form.ts`, `FormEmbedSection`, `CF7Form`.
- **ISR:** `POST /api/revalidate` body `{ "secret", "path"? , "tag"? }` — requires `REVALIDATION_SECRET`.

## What to avoid

- **Bypassing `wpFetch`** for WordPress (loses lang + auth + consistent errors).
- **New section types** without updating `section-registry`, normalizers, and `AnySectionT` / discriminated unions in `src/types/sections.ts`.
- **Hardcoding WordPress URLs** — use `getWordpressBaseUrl()` / `getSiteUrl()` / link resolvers.
- **Client-only data fetch** for SEO-critical page body — prefer RSC / server components pattern already used in `page.tsx` / templates.
- **Assuming ACF REST shape** without checking normalizers — WP can return null/variant shapes; use `field-mappers` helpers.
- **Ignoring `.env.example`** when adding env-dependent behavior.
- **Large drive-by refactors** — user preference is minimal, focused diffs.

## Env vars (names only; values in `.env.example`)

`WORDPRESS_API_URL`, `WORDPRESS_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, `HOMEPAGE_SLUG` / `HOMEPAGE_SLUG_NL` / `HOMEPAGE_SLUG_EN`, `WP_MENU_{PRIMARY|FOOTER|LEGAL}_{NL|EN}` (or `WORDPRESS_MENU_*`), `WORDPRESS_APPLICATION_USER`, `WORDPRESS_APPLICATION_PASSWORD`, `REVALIDATION_SECRET`, `NEXT_PUBLIC_DEFAULT_CF7_FORM_ID`, `WORDPRESS_SERVICE_REST_BASE`, `WORDPRESS_TESTIMONIAL_REST_BASE`, `DEFAULT_LOCALE`, `SUPPORTED_LOCALES`.

## Section registry keys (reference)

`hero`, `cards`, `combined_strengths`, `cost_comparison`, `benefits_grid`, `pricing_packages`, `guarantee_split`, `guarantees_promise_split`, `story_split`, `why_we_do_this`, `partner_intro_split`, `origin_story_split`, `founder_story_split`, `image_intro_split`, `salon_value_proposition`, `why_owners_choose`, `why_salonora_different`, `why_salonora_anders`, `testimonials`, `announcement_bar`, `process_steps`, `how_it_works_steps`, `scrolling_ticker`, `design_showcase_grid`, `feature_highlight_grid`, `feature_highlight_split`, `team_behind_salonora`, `faq_contact_split`, `form_embed`, `latest_posts`, `cta`, `pricing_cta`, `pricing_dual_cards`, `rich_text`, `faq` — must stay in sync with `section-registry.ts`.

- **`team_behind_salonora`** — About page “Het Team Achter Salonora”: two (or more) team member cards with social links, plus a bordered bottom tagline; optional decorative background/wordmark assets.

- **`guarantees_promise_split`** — Figma **1127:55** (“Group 596”): portrait + floating badges; checklist + download CTA. Icons from CMS: **`list_default_icon`** or per-row **`points[].icon`**; **`cta_trailing_icon`** on the download pill (avoid hardcoded SVG conversions).

- **`combined_strengths`** — Figma **1090:47** (“Group 595”): solid brand panel + `left_rows`; white cards use TR/BL corner-emphasis gradient border (brand/rose via CMS `accent`) + Figma shadow `0 6px 20px rgba(129,154,205,.26)`. Footer **`597:3051`**: horizontal gradient **brand → `navy-deep` → brand**, inset highlight, white footer text, **`min-h-[111px]`**. Section background `palette-white`.
- **`partner_intro_split`** — Figma 1072:29 (“Partner intro split”): navy visual column with layered brand arc + optional duo image; pale `--palette-surface` copy column (`title`, `body`, divider, brand `highlight_line`, optional CTAs).
- **`founder_story_split`** — About-style gradient card: `avatar`, `title`, `subtitle`, WYSIWYG `content`, `conclusion`, `main_image` (Figma **1083:46** “Group 594”; bg texture **`597:2281`** → `public/founder-story-card-bg.png` + **`597:2282`** brand `mix-blend-color`; **`597:2283`**: `FounderStorySparkMark` (inline SVG, brand stroke); photo stack **`597:2287`**/**`597:2288`**; copy **`597:2954`** — lg grid `528 + 118 + 460` inside **1298×756** card, `rounded-[20px]`).
