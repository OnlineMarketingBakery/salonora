import { formatHeadingLines } from "@/lib/i18n/format-heading";

type HeadingTag = "h1" | "h2" | "h3" | "h4";

type SectionHeadingProps = {
  as?: HeadingTag;
  className?: string;
  text: string;
  /** Render each line as a block span (Figma multi-line headings). */
  multiline?: boolean;
  /** Optional class on each line span (e.g. `lg:whitespace-nowrap` for Figma line locks). */
  lineClassName?: string;
  children?: never;
};

export function SectionHeading({
  as: Tag = "h2",
  className = "",
  text,
  multiline = false,
  lineClassName = "",
}: SectionHeadingProps) {
  const lines = formatHeadingLines(text);
  if (!lines.length) return null;

  const lineCls = lineClassName.trim();

  if (multiline || lines.length > 1) {
    return (
      <Tag className={className}>
        {lines.map((line, i) => (
          <span key={i} className={lineCls ? `block ${lineCls}` : "block"}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return <Tag className={className}>{lines[0]}</Tag>;
}

/** Format plain-text title lines without wrapping in a heading element. */
export function formattedTitleLines(text: string): string[] {
  return formatHeadingLines(text);
}

export type { SectionHeadingProps };
