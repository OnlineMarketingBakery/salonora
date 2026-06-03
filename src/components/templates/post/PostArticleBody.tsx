import { RichText } from "@/components/ui/RichText";
import "./blog-single-article.css";

/** Figma 1800:2 — Outfit + site palette; WP inline HTML; see blog-single-article.css */
export function PostArticleBody({ html }: { html: string }) {
  if (!html.trim()) return null;
  return (
    <RichText
      html={html}
      prose={false}
      className="post-article-body post-prose mt-7 w-full max-w-none"
    />
  );
}
