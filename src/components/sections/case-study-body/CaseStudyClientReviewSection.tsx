import Image from "next/image";
import Link from "next/link";
import { RichText } from "@/components/ui/RichText";
import type { CaseStudyClientReviewSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  nl: { defaultHeading: "Klantenrecensie", playLabel: "Video bekijken" },
  en: { defaultHeading: "Client review", playLabel: "Watch video" },
} as const;

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="32" r="30" fill="rgba(255,255,255,0.92)" />
      <path d="M28 22v20l16-10-16-10z" fill="var(--palette-brand)" />
    </svg>
  );
}

function QuoteMark({ className }: { className?: string }) {
  return (
    <span
      className={`shrink-0 select-none font-serif text-[3.25rem] font-bold leading-none text-[color-mix(in_srgb,var(--palette-brand)_38%,transparent)] ${className ?? ""}`}
      aria-hidden
    >
      &ldquo;
    </span>
  );
}

export function CaseStudyClientReviewSection({
  section,
  lang,
}: {
  section: CaseStudyClientReviewSectionT;
  lang: Locale;
}) {
  const t = COPY[lang];
  const heading = section.sectionHeading.trim() || t.defaultHeading;
  const hasVideo = Boolean(section.videoUrl);
  const poster = section.videoPoster?.url;

  return (
    <section className="border-b border-[color-mix(in_srgb,var(--palette-navy)_12%,transparent)] pb-8">
      <h2
        id={section.tocAnchorId}
        className="scroll-mt-28 text-[34px] font-semibold leading-[1.1] text-[var(--palette-navy)]"
      >
        {heading}
      </h2>
      {hasVideo ? (
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-[14px] bg-[color-mix(in_srgb,var(--palette-navy)_18%,transparent)]">
          {poster ? (
            <Image src={poster} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 864px" />
          ) : null}
          <Link
            href={section.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--palette-navy)_25%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--palette-navy)_35%,transparent)]"
            aria-label={t.playLabel}
          >
            <PlayIcon className="size-16 sm:size-[4.5rem]" />
          </Link>
        </div>
      ) : null}
      {section.quote ? (
        <div className="mt-6 flex gap-5">
          <QuoteMark className="mt-1" />
          <RichText
            html={section.quote}
            className="post-article-body post-prose max-w-none flex-1 text-base font-normal italic leading-[1.4] text-[var(--palette-muted)] prose-p:my-0 prose-p:leading-[1.4] prose-strong:text-[var(--palette-navy)] prose-a:text-[var(--palette-brand)]"
          />
        </div>
      ) : null}
      {(section.personName || section.personRole || section.personPhoto?.url) && (
        <div className="mt-6 flex items-center gap-2">
          {section.personPhoto?.url ? (
            <Image
              src={section.personPhoto.url}
              alt=""
              width={46}
              height={46}
              className="size-[46px] shrink-0 rounded-full object-cover"
            />
          ) : null}
          <div className="flex min-w-0 flex-col gap-2.5">
            {section.personName ? (
              <p className="text-base font-semibold leading-[1.6] text-[var(--palette-navy)]">{section.personName}</p>
            ) : null}
            {section.personRole ? (
              <p className="text-xs font-normal leading-[1.4] text-[#475569]">{section.personRole}</p>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
