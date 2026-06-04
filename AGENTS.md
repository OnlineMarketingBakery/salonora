# Agent instructions (Salonora)

Coding agents should start with **`ai-context.md`** for architecture, conventions, and integrations before editing multiple files.

Supporting docs: **`README.md`**, **`.env.example`**, **`WORDPRESS-ACF-legal-content.md`**, **`docs/wordpress-connection-guide.md`**, **`docs/n8n-blog-publishing.md`**, **`docs/blog-single-template.md`**. Legal CMS: ACF **`legal_content`** + **`faq`**; fallbacks **`src/lib/legal/`**; seed **`src/lib/legal/seed-legal-pages.mjs`**.

Cursor loads committed rules from **`.cursor/rules/salonora.mdc`** (`alwaysApply: true`).
