import { decodeHtmlEntitiesPlain } from "@/lib/utils/decode-html-entities-plain";

/** Figma 1643:234 — brand category line above the post title. */
export function PostHeroEyebrow({ text }: { text: string }) {
  const label = decodeHtmlEntitiesPlain(text).trim();
  if (!label) return null;
  return (
    <p className="text-sm font-medium leading-snug tracking-wide text-brand sm:text-base lg:text-[24px] lg:leading-[1.6]">
      {label}
    </p>
  );
}
