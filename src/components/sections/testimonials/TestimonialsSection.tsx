import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import type { TestimonialsSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

function TestimonialQuoteMark({ className }: { className?: string }) {
  return (
    <img
      src="/quote.svg"
      alt=""
      width={32}
      height={24}
      decoding="async"
      className={`block h-[23.333px] w-[31.667px] shrink-0 ${className ?? ""}`}
      aria-hidden
    />
  );
}

function formatRatingLabel(rating: number): string {
  if (Number.isInteger(rating)) return String(rating);
  const s = rating.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

/** Figma 324:2828 — white pill, #ebf3fe circle behind star, orange star + navy score */
function TestimonialRatingPill({ rating }: { rating: number }) {
  return (
    <div
      className="relative inline-grid shrink-0 place-items-start leading-none"
      aria-label={`${formatRatingLabel(rating)} van 5 sterren`}
    >
      {/* White pill (Figma: 65×30, rounded 15) */}
      <div className="col-start-1 row-start-1 h-[30px] w-[65px] rounded-[15px] bg-white shadow-[0_1px_3px_rgba(21,41,81,0.08)] ring-1 ring-[rgba(21,41,81,0.06)]" />
      {/* Round bg behind star (Figma: 26×26, #ebf3fe, ml 2 mt 2) */}
      <div className="col-start-1 row-start-1 ml-[2px] mt-[2px] flex size-[26px] items-center justify-center rounded-full bg-[#ebf3fe]">
        <span className="text-[13px] leading-none text-[#f97316]" aria-hidden>
          ★
        </span>
      </div>
      {/* Score (Figma: 14px Fustat Medium, #152951, ml 33 mt 10) */}
      <p className="col-start-1 row-start-1 ml-[33px] mt-[10px] font-sans text-[14px] font-medium leading-none tabular-nums text-[#152951]">
        {formatRatingLabel(rating)}
      </p>
    </div>
  );
}

export function TestimonialsSection({ section, lang }: { section: TestimonialsSectionT; lang: Locale }) {
  const count = section.items.length;
  const gridClass =
    count === 1 ? "flex w-full flex-col items-stretch" : "grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-8";

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,#ebf3fe_0%,rgba(235,243,254,0.45)_42%,#ffffff_78%)]"
        aria-hidden
      />
      <Container className="relative max-w-[1314px]">
        {section.title && (
          <h2 className="mx-auto max-w-[min(100%,477px)] text-center text-3xl font-semibold leading-tight tracking-[-0.04em] text-navy-deep sm:text-4xl lg:text-[48px] lg:leading-[56px]">
            {section.title}
          </h2>
        )}
        {section.intro && (
          <RichText html={section.intro} className="mx-auto mt-4 max-w-2xl text-center text-base text-muted" />
        )}

        <div className={["mt-10 md:mt-12", count === 1 ? "mx-auto w-full max-w-[637px]" : ""].filter(Boolean).join(" ")}>
          <div className={gridClass}>
            {section.items.map((t) => (
              <blockquote
                key={t.id}
                className="relative flex h-full flex-col gap-7 rounded-[14px] bg-gradient-to-b from-white to-[rgba(255,255,255,0.48)] p-6 shadow-[0px_18px_24px_rgba(67,87,128,0.08)] md:p-6"
              >
                {/* Figma 359:213 — column gap 28px */}
                <TestimonialQuoteMark />
                <RichText
                  html={t.clientTestimonial}
                  className="text-left text-[14px] font-normal leading-[21px] text-[#152951] [&_p]:mb-3 [&_p:last-child]:mb-0"
                />
                <div className="h-px w-full shrink-0 bg-[#e3eaf5]" aria-hidden />

                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    {t.avatar ? (
                      <Media
                        image={t.avatar}
                        width={48}
                        height={48}
                        className="size-12 shrink-0 rounded-full object-cover"
                        preferLargestSource
                        sizes="48px"
                        quality={90}
                      />
                    ) : (
                      <div
                        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold text-navy ring-1 ring-[rgba(21,41,81,0.06)]"
                        aria-hidden
                      >
                        {t.clientName
                          .split(/\s+/)
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium leading-[1.6] text-[#152951]">{t.clientName}</p>
                      <p className="truncate text-xs font-medium leading-[1.4] text-[#475569]">{t.clientRole}</p>
                    </div>
                  </div>
                  {typeof t.rating === "number" && t.rating > 0 && <TestimonialRatingPill rating={t.rating} />}
                </div>
              </blockquote>
            ))}
          </div>
        </div>

        {section.ctas.length > 0 && (
          <div className="mt-10 flex w-full flex-col items-center gap-4 md:mt-12">
            {section.ctas.map((c, i) => {
              const l = resolveLink(c.url, lang);
              const t = c.text || l?.label;
              if (!l?.href) {
                return t ? (
                  <p key={`${section.id}-cta-${i}`} className="text-center text-sm text-muted">
                    {t}
                  </p>
                ) : null;
              }
              return (
                <Button
                  key={`${section.id}-cta-${i}`}
                  href={l.href}
                  target={l.target}
                  variant="ctaNavyDeep"
                  ctaSize="promo"
                  ctaElevation="default"
                  ctaFullWidth={false}
                  ctaJustify="between"
                  className="!h-12 !min-h-12 shrink-0 !rounded-[24px] !gap-[19px] px-3 text-base font-normal text-white"
                  arrowClassName="!h-6 !w-6 shrink-0"
                >
                  {t}
                </Button>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
