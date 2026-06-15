# Contributing to Salonora

## Before you open a PR

- Run **`npm run lint`** and fix new issues.
- Keep the diff focused on the task; follow patterns in **`ai-context.md`**.
- If you add or rename **environment variables**, update **`.env.example`**, **`README.md`** (env table), and **`ai-context.md`** (env names section).
- If you add an **ACF flexible layout** / section type, update **`src/lib/acf/section-registry.ts`**, normalizers, **`src/types/sections.ts`**, edit the layout in **`wordpress/wp-content/themes/omb-headless/acf-json/`** (usually `group_omb_page_builder.json`), bump the group's **`modified`** timestamp, run **`npm run validate:sections`**, then **`npm run plugins:deploy -- --with-theme`**. Sync field groups in WP Admin if prompted.

## AI-assisted changes

- Treat **`ai-context.md`** as the canonical technical brief for humans and tools.
- Cursor project rules live under **`.cursor/rules/`** (see `salonora.mdc`).

## WordPress side

PHP under **`wordpress/`** should stay compatible with the Next.js fetchers described in **`docs/wordpress-connection-guide.md`**.
