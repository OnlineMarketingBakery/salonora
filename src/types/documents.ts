import type { AnySectionT, BlogPostOverviewCardT } from "./sections";
import type { SeoPayload } from "./seo";

export type PageDocument = {
  kind: "page";
  id: number;
  slug: string;
  title: string;
  content: string;
  hidePageTitle: boolean;
  /** When true, primary header nav links are hidden; logo, language switcher, and CTA stay (ACF: hide_site_navigation). */
  hidePrimaryMenu: boolean;
  /** When true, `?page=` and `?s=` query params drive the Blog post overview section (ACF: is_blog_archive). */
  isBlogArchive?: boolean;
  sections: AnySectionT[];
  seo: SeoPayload;
};

export type ServiceDocument = {
  kind: "service";
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  serviceIntro: string;
  serviceHighlights: string[];
  sections: AnySectionT[];
  seo: SeoPayload;
};

export type PostAuthorT = {
  name: string;
  avatarUrl: string | null;
  /** Plain text from WordPress user bio */
  bio: string;
  /** Author website or primary URL from WordPress */
  profileUrl: string | null;
  linkedinUrl: string | null;
};

export type PostBreadcrumbParentT = {
  label: string;
  href: string;
};

export type PostDocument = {
  kind: "post";
  id: number;
  slug: string;
  title: string;
  /** Body HTML with stable heading `id`s for TOC anchors */
  content: string;
  excerpt: string;
  /** Optional ACF WYSIWYG intro; when null, template falls back to excerpt plain text */
  postLeadHtml: string | null;
  featuredImage: string | null;
  featuredImageAlt: string;
  featuredFormId: number | null;
  sections: AnySectionT[];
  seo: SeoPayload;
  /** ISO8601 from WordPress `date` */
  publishedAt: string;
  /** Localized month+year for meta row */
  dateLabel: string;
  readMinutes: number;
  author: PostAuthorT;
  /** When true, `relatedPosts` are loaded by shared category */
  showRelatedPosts: boolean;
  relatedPosts: BlogPostOverviewCardT[];
  /** Slug path to blog archive page (breadcrumb parent), e.g. `blog` */
  blogArchivePath: string;
  /** Optional crumb before the blog archive link (ACF link) */
  breadcrumbParent: PostBreadcrumbParentT | null;
  /** When false, TOC is hidden */
  showToc: boolean;
};

export type ContentDocument = PageDocument | ServiceDocument | PostDocument;
