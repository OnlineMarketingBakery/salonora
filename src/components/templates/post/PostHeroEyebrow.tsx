/** Figma 1643:234 — brand category line above the post title. */
export function PostHeroEyebrow({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <p className="text-2xl font-medium leading-[1.6] text-brand">{text}</p>
  );
}
