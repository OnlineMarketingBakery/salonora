import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { SECTION_SHELL_AFTER_HERO } from "@/lib/layout/section-spacing";
import type { Locale } from "@/lib/i18n/locales";
import { getImageUrl, getLargestImageUrl } from "@/lib/utils/media";
import type { ProblemSolutionSectionT } from "@/types/sections";
import type { WpImage } from "@/types/wordpress";
import type { CSSProperties, ReactNode } from "react";

/** Figma **1306:29** left card — deep navy stack + soft TR highlight. */
const PROBLEM_CARD_BG: CSSProperties = {
  backgroundImage: [
    "radial-gradient(ellipse 95% 85% at 100% 0%, color-mix(in srgb, var(--palette-brand) 16%, transparent) 0%, transparent 52%)",
    "linear-gradient(180deg, var(--palette-navy) 0%, var(--palette-navy-deep) 100%)",
  ].join(", "),
};

/** Figma **1306:29** right card — brand blues + soft TR highlight. */
const SOLUTION_CARD_BG: CSSProperties = {
  backgroundImage: [
    "radial-gradient(ellipse 95% 85% at 100% 0%, color-mix(in srgb, var(--palette-white) 14%, transparent) 0%, transparent 50%)",
    "linear-gradient(152deg, var(--palette-brand-soft) 0%, var(--palette-brand) 40%, var(--palette-brand-strong) 100%)",
  ].join(", "),
};

/** Figma **1306:29** — lead line + 14px body, 14px paragraph rhythm. */
const CARD_PROSE =
  "text-left max-w-none [&_p]:m-0 [&_p+p]:mt-3.5 [&_p:first-child]:text-[15px] [&_p:first-child]:font-medium [&_p:first-child]:leading-[1.55] !prose-p:text-[14px] !prose-p:leading-[1.6] !prose-p:text-[var(--palette-white)] !prose-strong:font-semibold !prose-strong:text-[var(--palette-white)] !prose-li:text-[var(--palette-white)] !prose-a:text-[var(--palette-white)] prose-a:underline [&_*]:text-[var(--palette-white)]";

const CARD_SHELL =
  "relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[24px] px-8 py-10 sm:px-10 sm:py-11 lg:min-h-[320px] lg:px-[46px] lg:py-[46px]";

const CARD_TITLE =
  "w-full font-sans text-[clamp(1.625rem,3.2vw,2.125rem)] font-semibold leading-[0.98] tracking-[-0.01em] text-[var(--palette-white)]";

/** `public/grid.svg` — clipped to the **top half** of the card only. */
function CardGridWash() {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-0 h-1/2 w-full overflow-hidden rounded-t-[24px]"
      aria-hidden
    >
      <div
        className="absolute right-0 top-0 h-full w-[min(100%,52%)] opacity-[0.38]"
        style={{
          backgroundImage: "url(/grid.svg)",
          backgroundPosition: "100% 0",
          backgroundRepeat: "no-repeat",
          backgroundSize: "auto min(100%, 320px)",
        }}
      />
    </div>
  );
}

function SolutionCheckRow({
  text,
  listIcon,
}: {
  text: string;
  listIcon: WpImage | null;
}) {
  const customIcon =
    listIcon != null && (getLargestImageUrl(listIcon) || getImageUrl(listIcon))
      ? listIcon
      : null;

  const defaultMarker = (
    <span
      className="relative grid size-[23px] shrink-0 place-items-center rounded-full bg-[var(--palette-white)]"
      aria-hidden
    >
      <svg
        className="size-[15px] text-[var(--palette-brand-strong)]"
        viewBox="0 0 15 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M1 6.5L5.5 11L14 1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  const marker =
    customIcon != null ? (
      <span
        className="relative flex size-[23px] shrink-0 items-end justify-center"
        aria-hidden
      >
        <Media
          image={customIcon}
          width={46}
          height={46}
          className="h-[23px] w-[23px] object-contain object-bottom"
          sizes="23px"
          preferLargestSource
          quality={95}
        />
      </span>
    ) : (
      defaultMarker
    );

  return (
    <li className="flex items-start gap-2">
      {marker}
      <p className="min-w-0 flex-1 font-sans text-[14px] leading-[1.6] text-[var(--palette-white)]">
        {text}
      </p>
    </li>
  );
}

function ProblemSolutionCard({
  title,
  backgroundStyle,
  children,
}: {
  title: string | null;
  backgroundStyle: CSSProperties;
  children: ReactNode;
}) {
  return (
    <article className={`${REVEAL_ITEM} ${CARD_SHELL}`} style={backgroundStyle}>
      <CardGridWash />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-[22px]">
        {title ? <h2 className={CARD_TITLE}>{title}</h2> : null}
        <div className="flex min-h-0 flex-1 flex-col gap-[14px] [overflow-wrap:anywhere]">
          {children}
        </div>
      </div>
    </article>
  );
}

export function ProblemSolutionSection({
  section,
  lang,
}: {
  section: ProblemSolutionSectionT;
  lang: Locale;
}) {
  void lang;
  const listIcon = section.solution_list_icon;
  const hasChecklist = section.solution_list.length > 0;

  return (
    <section className={`bg-[var(--palette-white)] ${SECTION_SHELL_AFTER_HERO}`}>
      <Container>
        <div className="mx-auto grid w-full max-w-[1300px] grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-6">
          <ProblemSolutionCard
            title={section.problem_title}
            backgroundStyle={PROBLEM_CARD_BG}
          >
            {section.problem_text ? (
              <RichText html={section.problem_text} className={CARD_PROSE} />
            ) : null}
          </ProblemSolutionCard>

          <ProblemSolutionCard
            title={section.solution_title}
            backgroundStyle={SOLUTION_CARD_BG}
          >
            {section.solution_text ? (
              <RichText html={section.solution_text} className={CARD_PROSE} />
            ) : null}
            {hasChecklist ? (
              <div className="mt-1 rounded-[16px] bg-[color-mix(in_srgb,var(--palette-white)_14%,transparent)] p-5 sm:p-6">
                <ul className="flex flex-col gap-3">
                  {section.solution_list.map((row, i) => (
                    <SolutionCheckRow
                      key={`${row.text}-${i}`}
                      text={row.text}
                      listIcon={listIcon}
                    />
                  ))}
                </ul>
              </div>
            ) : null}
            {section.solution_bottom_text ? (
              <RichText html={section.solution_bottom_text} className={CARD_PROSE} />
            ) : null}
          </ProblemSolutionCard>
        </div>
      </Container>
    </section>
  );
}
