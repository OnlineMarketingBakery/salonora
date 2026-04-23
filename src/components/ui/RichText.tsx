type Props = { html: string; className?: string };

export function RichText({ html, className = "" }: Props) {
  if (!html) return null;
  return (
    <div
      className={`prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-[#1e5bb8] ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
