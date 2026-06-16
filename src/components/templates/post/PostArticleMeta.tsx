import type { PostAuthorT } from "@/types/documents";
import type { Locale } from "@/lib/i18n/locales";
import { BlogPostMetaRow } from "@/components/blog/BlogPostMetaRow";

export function PostArticleMeta({
  author,
  dateLabel,
  readMinutes,
  lang,
}: {
  author: PostAuthorT;
  dateLabel: string;
  readMinutes: number;
  lang: Locale;
}) {
  return (
    <BlogPostMetaRow
      authorName={author.name}
      authorAvatarUrl={author.avatarUrl}
      dateLabel={dateLabel}
      readMinutes={readMinutes}
      lang={lang}
      variant="featured"
    />
  );
}
