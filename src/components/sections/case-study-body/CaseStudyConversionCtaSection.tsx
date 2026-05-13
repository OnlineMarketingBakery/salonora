import Link from "next/link";
import { RichText } from "@/components/ui/RichText";
import { resolveLink } from "@/lib/utils/links";
import type { CaseStudyConversionCtaSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma 879:27 / 892:544 — navy CTA band, radial glow, 34px title, 16px subtitle, brand pill + white disc arrow. */
export function CaseStudyConversionCtaSection({
  section,
  lang,
}: {
  section: CaseStudyConversionCtaSectionT;
  lang: Locale;
}) {
  void lang;
  const resolved = resolveLink(section.cta, lang);
  if (!section.title.trim() && !section.subtitle.trim() && !resolved) return null;

  return (
    <section className="relative overflow-hidden rounded-[24px] bg-[var(--palette-navy-deep)] px-6 py-12 text-white sm:px-12 sm:py-14 md:px-[117px] md:py-15">
      {/** Figma: `#002752` base + soft brand glows top-left & bottom-right (mesh-style depth) */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]"
        aria-hidden
        style={{
          background: [
            "radial-gradient(ellipse 78% 62% at 0% 0%, color-mix(in srgb, var(--palette-brand) 48%, transparent) 0%, transparent 56%)",
            "radial-gradient(ellipse 75% 58% at 100% 100%, color-mix(in srgb, var(--palette-brand) 44%, transparent) 0%, transparent 54%)",
          ].join(","),
        }}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px] blur-3xl opacity-40" aria-hidden>
        <div
          className="absolute -left-[22%] -top-[42%] size-[min(85%,28rem)] rounded-full"
          style={{
            background: "radial-gradient(closest-side, color-mix(in srgb, var(--palette-brand) 50%, transparent), transparent 72%)",
          }}
        />
        <div
          className="absolute -bottom-[38%] -right-[20%] size-[min(78%,26rem)] rounded-full"
          style={{
            background: "radial-gradient(closest-side, color-mix(in srgb, var(--palette-brand) 45%, transparent), transparent 70%)",
          }}
        />
      </div>
      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[53.6875rem] flex-col items-center text-center">
        {section.title.trim() ? (
          <h2 className="text-[34px] font-semibold leading-[1.1] text-white">{section.title.trim()}</h2>
        ) : null}
        {section.subtitle ? (
          <div className={section.title.trim() ? "mt-4 w-full" : "w-full"}>
            <RichText
              html={section.subtitle}
              className="max-w-none text-base font-normal leading-[1.4] text-white prose-p:my-0 prose-p:text-base prose-p:leading-[1.4] prose-p:text-white prose-a:text-white prose-strong:text-white"
            />
          </div>
        ) : null}
        {resolved ? (
          <Link
            href={resolved.href}
            target={resolved.target}
            rel={resolved.target === "_blank" ? "noopener noreferrer" : undefined}
            className="mt-5 inline-flex h-[42px] min-w-[10rem] shrink-0 items-center justify-center gap-[18px] rounded-[24px] bg-[var(--palette-brand)] pl-5 pr-3 text-base font-normal text-white shadow-[0px_6px_10px_rgba(57,144,240,0.54)] transition hover:brightness-105"
          >
            <span>{resolved.label}</span>
            <span
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-[var(--palette-brand)]"
              aria-hidden
            >
              <ArrowRightIcon className="size-3.5" />
            </span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
