type Props = {
  html: string;
  className?: string;
  /**
   * When false, skips Tailwind `prose` so CMS blocks (p, h2, div) do not inherit
   * `prose-headings:text-foreground` / `prose-p:text-muted`, which breaks strict Figma colours.
   */
  prose?: boolean;
};

export function RichText({ html, className = "", prose = true }: Props) {
  if (!html) return null;
  const proseClasses = prose
    ? "prose max-w-none font-sans prose-p:leading-relaxed prose-headings:font-semibold prose-headings:text-foreground prose-p:text-muted prose-li:text-muted prose-strong:text-foreground prose-a:text-brand"
    : "max-w-none font-sans";
  return (
    <div
      className={`${proseClasses} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
