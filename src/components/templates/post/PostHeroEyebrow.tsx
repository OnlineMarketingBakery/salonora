import { decodeHtmlEntitiesPlain } from "@/lib/utils/decode-html-entities-plain";

/** Figma 1643:234 — brand category line above the post title. */
export function PostHeroEyebrow({ text }: { text: string }) {
  const label = decodeHtmlEntitiesPlain(text).trim();
  if (!label) return null;
  return (
    <p className="text-[24px] font-medium leading-[1.6] text-brand">{label}</p>
  );
}
