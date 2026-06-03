# Blog single layout page (shared FAQ)

Headless pattern: **articles stay WordPress Posts** (n8n publishes to `/wp/v2/posts`). A separate **Page** per locale holds shared tail content (typically `faq_contact_split`), not the article URL.

## Architecture

| Layer | Responsibility |
|--------|----------------|
| **Next.js PostTemplate** | Shell: TOC, meta, share, body, render order |
| **WordPress Post** | Title, HTML body, categories, show_related_posts, post_lead, etc. |
| **Layout page** | is_blog_single_layout + page_sections (FAQ + contact) |

Related posts are not on the layout page. They use the current post categories when show_related_posts is enabled.

## WordPress setup

1. ACF (Pages): boolean is_blog_single_layout.
2. One page per locale (e.g. slug blog-single-layout), flag on, add faq_contact_split in page_sections.
3. Optional env: WORDPRESS_BLOG_SINGLE_LAYOUT_SLUG_NL / _EN.
4. Posts: n8n body + categories; ACF show_related_posts, post_lead, show_toc, breadcrumb_parent.

## Code

- getBlogSingleLayoutSlug in src/lib/wordpress/config.ts
- fetchBlogSingleLayoutSections in src/lib/wordpress/fetch-blog-single-layout.ts
- fetch-post.ts attaches layoutSections; PostTemplate renders FAQ then PostRelatedGrid.
