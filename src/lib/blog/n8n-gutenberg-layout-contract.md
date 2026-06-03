# n8n Gutenberg body — layout contract (canonical)

Use this pattern for automated blog posts (see `n8n-gutenberg-reference.source.html` for a full paste-ready example).

## Block types

| Content | Block | Notes |
|---------|-------|--------|
| Body copy | `wp:paragraph` | Plain `<p>` — no inline styles on paragraphs |
| Bullet lists | `wp:list` + `wp:list-item` | Native list blocks |
| Section title (TOC chapter) | `wp:heading` level 2 | JSON `style` **and** matching `style=""` on `<h2>` |
| Subsection title | `wp:heading` level 3 | JSON `style` **and** matching `style=""` on `<h3>` |
| Cards, tables, CTAs, checklists | `wp:html` | Single wrapper `<div style="...">` — **inline CSS only**, no classes |

## Design tokens (standard guide layout)

- Navy: `#0D1B3E`
- Brand: `#1B6FDB`
- Pale blue surface: `#EFF6FF`
- Body text: `#374151`
- H2 section: `24px` / `700`, `margin-top:40px`
- H3 subsection: `18px` / `700`, color brand

## wp:html component recipes

1. **Tip (left bar)** — `background:#EFF6FF; border-left:4px solid #1B6FDB; border-radius:16px; padding:28px 28px 28px 24px`
   - Title: `<h2 style="...26px...">` inside the div (not a separate Heading block)
2. **Checklist card** — pale blue box + flex rows + inline SVG checkmark
3. **Cost rows** — flex `space-between` rows, alternating `#EFF6FF` / `#fff`, last row brand border
4. **Inline CTA** — tip box + pill `<a style="border-radius:50px...">` buttons
5. **Green micro-tip** — `#F0FDF4` / `#166534`
6. **Warning** — `#FFFBEB` / `#F59E0B` left border
7. **Dark promo** — `#1B4F8A` panel + white text

## Next.js behaviour

- `markStyleTintedDivs` adds `salonora-tinted` to non-white `wp:html` wrappers → headings **inside** cards skip counter pills; those blocks are omitted from the sidebar TOC.
- `wp:heading` with inline `style` on `<h2>`/`<h3>` skips theme counter pills (`globals.css`).
- Section `h2` ids are injected in `fetch-post.ts` for TOC anchors.

## Do not put in `content`

FAQ, conclusion panel, related posts — use Templates → `blog_single_sections`.
