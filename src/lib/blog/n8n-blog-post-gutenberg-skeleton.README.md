# How to paste the skeleton into WordPress

**Use `n8n-blog-post-gutenberg-skeleton.txt` or open the `.html` in Cursor/VS Code** (View Source). Do **not** open the `.html` file in Chrome/Edge and copy from the preview — the browser hides the `<!-- wp:... -->` markers and you only copy plain text.

## Steps

1. WordPress post → ⋮ menu → **Code editor** (not Visual).
2. Select all existing content (`Ctrl+A`) and delete.
3. In Cursor, open `docs/n8n-blog-post-gutenberg-skeleton.txt` → Select all → Copy.
4. Paste into the Code editor → Update.

You should see separate blocks (Paragraph, Heading, Custom HTML), not literal `<!-- wp:paragraph -->` text.

Full **24/7 boeken** article (Figma **1800:2**): `docs/n8n-blog-post-gutenberg-reference.html` — paste from the first `<!-- wp:html -->` block; **skip** the file header comment at the top. Tokens and block rules: `src/lib/blog/n8n-gutenberg-layout-contract.md`.
