/** Shared legal body typography hook (full rules in globals.css `.legal-prose`). */
export const LEGAL_PROSE_CLASS = "legal-prose";

export const LEGAL_CONTENT_MAX_WIDTH = "max-w-[50rem]";

/** @deprecated Width is controlled by `.legal-page-article` in the legal layout. */
export const LEGAL_WIDTH_CLASS: Record<"default" | "narrow" | "wide", string> = {
  default: "max-w-3xl",
  narrow: "max-w-5xl",
  wide: "max-w-6xl",
};
