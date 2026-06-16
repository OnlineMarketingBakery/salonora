"use client";

import { useCallback, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  nl: { share: "Deel", copied: "Link gekopieerd", copyFail: "Kopiëren mislukt" },
  en: { share: "Share", copied: "Link copied", copyFail: "Copy failed" },
} as const;

/** Figma 1643:260 — filled forward/share arrow. */
function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13 14H11C7.54202 14 4.53953 15.9502 3.03239 18.8107C3.01093 18.5433 3 18.2729 3 18C3 12.4772 7.47715 8 13 8V3L23 11L13 19V14Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PostShareActions({
  lang,
  shareUrl,
  shareTitle,
  className = "",
  size = "default",
}: {
  lang: Locale;
  shareUrl: string;
  shareTitle: string;
  className?: string;
  size?: "default" | "compact";
}) {
  const t = COPY[lang];
  const [hint, setHint] = useState<string | null>(null);

  const onShare = useCallback(async () => {
    setHint(null);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setHint(t.copied);
      window.setTimeout(() => setHint(null), 2500);
    } catch {
      setHint(t.copyFail);
      window.setTimeout(() => setHint(null), 2500);
    }
  }, [shareTitle, shareUrl, t.copied, t.copyFail]);

  const isCompact = size === "compact";

  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`.trim()}>
      <button
        type="button"
        onClick={onShare}
        className={
          isCompact
            ? "inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-3.5 py-2 text-sm font-medium leading-none text-white transition hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            : "inline-flex items-center justify-center gap-[18px] rounded-[24px] bg-brand px-[18px] py-3 text-[16px] font-normal leading-none text-white transition hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        }
      >
        {t.share}
        <ShareIcon className={isCompact ? "size-5 shrink-0" : "size-6 shrink-0"} />
      </button>
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </div>
  );
}
