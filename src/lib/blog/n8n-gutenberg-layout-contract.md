# n8n Gutenberg body — layout contract (Figma 1800:2)

Full paste-ready sample: **`docs/n8n-blog-post-gutenberg-reference.html`** (same content as **`n8n-blog-post-gutenberg-skeleton.html`**).

## Paste instructions

1. Open file in **Cursor/VS Code** (or use **`.txt`** copy) — do not copy from browser preview of `.html`.
2. WordPress post → **Code editor** → select all → paste from first `<!-- wp:paragraph -->` (skip top comment).
3. Update post.

## Figma tokens (blog article body)

| Token | Hex |
|-------|-----|
| Navy (H2, labels) | `#152951` |
| Brand (H3 objections, pills, buttons) | `#3990f0` |
| Surface (cards, zebra rows) | `#ebf3fe` |
| Body text | `#435780` |
| Table border | `#acc6ea` |

| Element | Size |
|---------|------|
| Section H2 | `48px` / `600` |
| Subsection H3 (flow) | `18px` brand or `24px` navy |
| Answer / tip box title | `34px` uppercase brand |
| Body | `16px` / `line-height: 1.4` |

## Block types

| Content | Block |
|---------|--------|
| Body copy | `wp:paragraph`, `wp:list` |
| TOC chapters | `wp:heading` level 2 — JSON + inline `style` on `<h2>` |
| Subsections | `wp:heading` level 3 |
| Cards, tables, CTAs | `wp:html` — inline CSS only |

Answer / CTA callout: `background:#ebf3fe; border-radius:12px; border-bottom:6px solid #3990f0; padding:30px 32px; margin:28px 0`. Title: `34px` / `600` / uppercase / `#3990f0`. No `<hr>` between sections (spacing via H2 margins).

Pill row (Reden / Stap / Fout): flex `gap:24px`; pill `min-height:46px`, `background:#ebf3fe`, label `24px` brand `600`; title `24px` navy `600`.

Numbered row: `28×28px` circle `border-radius:14px`, `background:#3990f0`, `gap:8px`, body `16px` `#435780`.

Objection quotes: `wp:heading` level 2, `24px` `#3990f0` (not a `<div>`).

Section dividers: do not use `<!-- wp:html --><hr>…` blocks.

## Not in `content`

Eyebrow, H1, hero, sidebar TOC, FAQ, Tot slot, related posts — Salonora template / ACF.
