type Props = { html: string; className?: string };

export function RichText({ html, className = "" }: Props) {
  if (!html) return null;
  return (
    <div
      className={`prose max-w-none font-sans prose-p:leading-relaxed prose-headings:font-semibold prose-headings:text-foreground prose-p:text-muted prose-li:text-muted prose-strong:text-foreground prose-a:text-brand ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
