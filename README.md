# Salonora (Next.js + headless WordPress)

Multilingual (nl/en) App Router frontend for the OMB WordPress backend: ACF flexible sections, services, posts, testimonials, Contact Form 7, Yoast, and option pages.

## Development

1. `cp .env.example .env.local` and set `WORDPRESS_API_URL`, `WORDPRESS_BASE_URL`, and `NEXT_PUBLIC_SITE_URL`.
2. `npm install`
3. `npm run dev` — open `http://localhost:3000` (redirects to `/nl`).

See `docs/wordpress-connection-guide.md` for API checks and troubleshooting.

## Build and run (Ploi / Node)

- **Install:** `npm ci` (or `npm install`)
- **Build:** `npm run build`
- **Start:** `npm run start` (set `NODE_ENV=production`)
- **Env:** all variables in `.env.example` that apply to your environment; the Node app must reach WordPress over HTTPS for server-side fetches and the CF7 proxy.
- **Reverse proxy:** point your public domain to the Node port; allow large headers if needed; forward `X-Forwarded-Proto` for correct URLs.
- **Images:** `next.config.ts` whitelists the `WORDPRESS_BASE_URL` host; add production WordPress host there if it differs.
- **Cache / revalidation:** use `POST /api/revalidate` with `REVALIDATION_SECRET` and a `path` (or `tag` if you add tags) when content changes in WordPress.

## Project layout

- `src/app/[lang]/` — routes and metadata
- `src/lib/wordpress/` — fetchers and route resolution
- `src/lib/acf/` — section normalizers, registry, enrichment
- `src/components/sections/` — one component per ACF layout
- `docs/wordpress-connection-guide.md` — WordPress requirements and setup
