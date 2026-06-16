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
    <span
      className={`relative z-10 inline-flex items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--palette-rose-soft)_80%,transparent)] ${className ?? ""}`}
      aria-hidden
    >
      <svg className="ml-0.5 size-5" viewBox="0 0 20 20" fill="none">
        <path d="M7 5v10l8-5-8-5z" fill="var(--palette-white)" />
      </svg>
    </span>
  );
}

function VideoPlayOverlay({
  hasVideoLink,
  videoUrl,
  playLabel,
}: {
  hasVideoLink: boolean;
  videoUrl: string;
  playLabel: string;
}) {
  const button = <PlayIcon className="size-[57px]" />;

  if (hasVideoLink) {
    return (
      <Link
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-[1] flex items-center justify-center transition hover:opacity-95"
        aria-label={playLabel}
      >
        {button}
      </Link>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center" aria-hidden>
      {button}
    </div>
  );
}

function QuoteMarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`h-10 w-[55px] shrink-0 text-brand ${className ?? ""}`}
      viewBox="0 0 55 40"
      fill="currentColor"
      aria-hidden
    >
      <path d="M0 0H24.6053V21.8571L11.6311 40H3.74868L11.4661 22.8571H0V0ZM30.3947 0H55V21.8571L42.0258 40H34.1434L41.8608 22.8571H30.3947V0Z" />
    </svg>
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
  const videoUrl = section.videoUrl.trim();
  const hasVideoLink = Boolean(videoUrl);
  const poster = section.videoPoster?.url;

  const playOverlay = (
    <VideoPlayOverlay hasVideoLink={hasVideoLink} videoUrl={videoUrl} playLabel={t.playLabel} />
  );

  return (
    <section className="border-b border-[color-mix(in_srgb,var(--palette-navy)_12%,transparent)] pb-8">
      <h2
        id={section.tocAnchorId}
        className="scroll-mt-28 text-[34px] font-semibold leading-[1.1] text-navy"
      >
        {heading}
      </h2>
      <div className="relative mt-[34px] aspect-[859/401] w-full overflow-hidden rounded-[14px] bg-[color-mix(in_srgb,var(--palette-navy)_18%,transparent)]">
        <div className="absolute inset-x-0 bottom-0 top-[11px] overflow-hidden rounded-[14px]">
          <div className="relative h-full w-full">
            {poster ? (
              <Image
                src={poster}
                alt=""
                fill
                className="rounded-[14px] object-cover"
                sizes="(max-width: 1024px) 100vw, 864px"
              />
            ) : null}
            <div
              className="pointer-events-none absolute inset-0 rounded-[14px] bg-[color-mix(in_srgb,#000_38%,transparent)]"
              aria-hidden
            />
            {playOverlay}
          </div>
        </div>
      </div>
      {section.quote ||
      section.personName ||
      section.personRole ||
      section.personPhoto?.url ? (
        <div className="mt-[21px] flex flex-col gap-6">
          {section.quote ? (
            <div className="flex items-start gap-5">
              <QuoteMarkIcon />
              <RichText
                html={section.quote}
                className="post-article-body post-prose max-w-none flex-1 text-base font-normal leading-[1.4] text-muted prose-p:my-0 prose-p:leading-[1.4] prose-strong:text-navy prose-a:text-brand"
              />
            </div>
          ) : null}
          {(section.personName || section.personRole || section.personPhoto?.url) && (
            <div className="flex items-center gap-2">
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
                  <p className="text-base font-semibold leading-[1.6] text-navy">{section.personName}</p>
                ) : null}
                {section.personRole ? (
                  <p className="text-xs font-normal leading-[1.4] text-muted">{section.personRole}</p>
                ) : null}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
