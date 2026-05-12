"use client";

import { useCallback, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  nl: { share: "Deel", copied: "Link gekopieerd", copyFail: "Kopiëren mislukt" },
  en: { share: "Share", copied: "Link copied", copyFail: "Copy failed" },
} as const;

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M12.5 4.5a2 2 0 11-1.06 1.77L7.8 8.45a2 2 0 010 3.1l3.64 2.18a2 2 0 11-.94 1.74L6.86 13.3a3.5 3.5 0 010-5.6l4.64-2.78A2 2 0 0112.5 4.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PostShareActions({
  lang,
  shareUrl,
  shareTitle,
}: {
  lang: Locale;
  shareUrl: string;
  shareTitle: string;
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

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onShare}
        className="inline-flex h-[47px] min-w-[111px] shrink-0 items-center justify-center gap-[18px] rounded-[24px] bg-[var(--palette-brand)] px-3 text-[16px] font-normal text-white shadow-[0_6px_10px_rgba(57,144,240,0.35)] transition hover:opacity-[0.94]"
      >
        {t.share}
        <ShareIcon className="size-6 shrink-0 text-white" />
      </button>
      {hint ? <span className="text-xs text-[var(--palette-muted)]">{hint}</span> : null}
    </div>
  );
}
