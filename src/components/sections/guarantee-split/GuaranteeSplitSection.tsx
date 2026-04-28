import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import { ctaVariantAt } from "@/lib/ui/ctaAlternation";
import type { GuaranteeSplitSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import type { WpImage } from "@/types/wordpress";

/** Figma: blue disc + white check (27×~23) — matches pricing package include icons */
function CheckIconFallback() {
  return (
    <svg
      className="h-[23px] w-[27px] shrink-0"
      viewBox="0 0 27 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="24" height="24" x="0" y="-0.5" rx="12" className="fill-brand" />
      <path
        d="M6 11.5l4 4 8-8"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GuaranteePoint({ icon, text }: { icon: WpImage | null; text: string }) {
  return (
    <li className="flex gap-1.5 text-left">
      {icon ? (
        <div className="flex h-[23px] w-[27px] shrink-0 items-center justify-center">
          <Media image={icon} width={27} height={24} className="h-[23px] w-[27px] object-contain" />
        </div>
      ) : (
        <CheckIconFallback />
      )}
      <span className="min-w-0 text-sm font-medium leading-[1.6] text-navy-deep">{text}</span>
    </li>
  );
}

export function GuaranteeSplitSection({ section, lang }: { section: GuaranteeSplitSectionT; lang: Locale }) {
  const imageFirst = section.mediaPosition === "left";
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const body = (
    <div className="flex w-full min-w-0 max-w-[552px] flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-3.5">
        {titleLines.length > 0 && (
          <h2 className="font-sans text-[48px] font-semibold leading-[56px] tracking-[-0.04em] text-navy">
            {titleLines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h2>
        )}
        {section.text && (
          <RichText
            html={section.text}
            className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-muted [&_p+_p]:!mt-3.5"
          />
        )}
      </div>

      {section.points.length > 0 && (
        <ul className="flex w-full min-w-0 max-w-[473px] flex-col gap-3.5">
          {section.points.map((p, i) => (
            <GuaranteePoint key={i} icon={p.icon} text={p.text} />
          ))}
        </ul>
      )}

      {section.ctas.length > 0 && (
        <div className="flex w-full min-w-0 max-w-[392px] flex-col gap-3">
          {section.ctas.map((c, i) => {
            const l = resolveLink(c.url, lang);
            if (!l?.href) return null;
            const t = c.text || l.label;
            return (
              <Button
                key={i}
                href={l.href}
                target={l.target}
                variant={ctaVariantAt(i)}
                ctaElevation={i === 0 ? "none" : "default"}
                className={
                  i === 0
                    ? "!h-12 w-full !max-w-[392px] !min-w-0 !gap-[35px] !rounded-[24px]"
                    : "h-12 w-full max-w-md rounded-[24px]"
                }
              >
                {t}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );

  const img = section.image ? (
    <div className="relative min-w-0 w-full">
      <div className="relative overflow-hidden rounded-[20px] sm:rounded-2xl">
        <Media
          image={section.image}
          width={612}
          height={456}
          className="h-auto w-full object-cover object-top"
          sizes="(min-width: 1024px) 50vw, 100vw"
          preferLargestSource
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(45%,12rem)]"
          aria-hidden
        />
      </div>
    </div>
  ) : null;

  return (
    <section className="bg-white py-20 md:py-24">
      <Container className="!max-w-[85rem]">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:items-center lg:gap-[53px]">
          {imageFirst ? (
            <>
              {img}
              {body}
            </>
          ) : (
            <>
              {body}
              {img}
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
