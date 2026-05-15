/** @see Figma **599:1448** — centered heading, four columns, icon connector lines between discs. */
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import type { OurPromisesSectionT, WhoWeAreForItemAccentT } from "@/types/sections";

const ICON_SIZE_REM = "5.25rem";
const ICON_HALF_REM = "2.625rem";
const ICON_GAP_REM = "0.375rem";
const COL_GAP_LG = "3.75rem";

function iconDiscClass(accent: WhoWeAreForItemAccentT): string {
  return accent === "rose" ? "bg-rose" : "bg-brand";
}

function IconConnector({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      className="pointer-events-none absolute top-1/2 z-0 hidden h-px -translate-y-1/2 bg-navy-deep/12 lg:block"
      style={{
        left: `calc(50% + ${ICON_HALF_REM} + ${ICON_GAP_REM})`,
        width: `calc(100% + ${COL_GAP_LG} - ${ICON_SIZE_REM} - ${ICON_GAP_REM} - ${ICON_GAP_REM})`,
      }}
      aria-hidden
    />
  );
}

export function OurPromisesSection({
  section,
  lang,
}: {
  section: OurPromisesSectionT;
  lang: Locale;
}) {
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const items = section.items.filter(
    (item) =>
      item.title.trim() !== "" ||
      item.description.trim() !== "" ||
      (item.icon != null && (item.icon.url || item.icon.id)),
  );

  return (
    <section lang={lang} className="bg-white py-16 md:py-20 lg:py-[4.5rem]">
      <Container className="!max-w-[85rem]">
        <div
          className={`${REVEAL_ITEM} mx-auto flex w-full max-w-[76.8125rem] flex-col items-center gap-10 sm:gap-14 lg:gap-[4.8125rem]`}
        >
          {titleLines.length > 0 ? (
            <h2 className="m-0 w-full text-center font-sans text-3xl font-bold leading-tight tracking-[-0.04em] text-navy-deep sm:text-4xl lg:text-[3rem] lg:leading-[3.5rem]">
              {titleLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>
          ) : null}

          {items.length > 0 ? (
            <ul className="relative m-0 grid w-full list-none grid-cols-1 gap-y-12 p-0 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-[3.75rem] lg:gap-y-0">
              {items.map((item, index) => (
                <li
                  key={`${section.id}-promise-${index}`}
                  className="relative flex flex-col items-center gap-[0.9375rem] text-center"
                >
                  <div className="relative flex w-full justify-center">
                    <IconConnector show={index < items.length - 1} />
                    <div
                      className={`relative z-10 flex size-[5.25rem] shrink-0 items-center justify-center rounded-full p-[1.3125rem] ${iconDiscClass(item.icon_accent)}`}
                    >
                      {item.icon ? (
                        <Media
                          image={item.icon}
                          width={84}
                          height={84}
                          className="size-[2.625rem] object-contain"
                          sizes="42px"
                          preferLargestSource
                        />
                      ) : null}
                    </div>
                  </div>
                  {item.title.trim() ? (
                    <p className="m-0 w-full font-sans text-2xl font-semibold leading-[1.1] text-navy-deep">
                      {item.title.trim()}
                    </p>
                  ) : null}
                  {item.description.trim() ? (
                    <RichText
                      html={item.description}
                      className="w-full max-w-[17.125rem] [&_p]:m-0 [&_p+p]:mt-1 [&_p]:text-center [&_p]:font-sans [&_p]:text-sm [&_p]:font-normal [&_p]:leading-[1.4] [&_p]:text-navy-deep prose-strong:font-semibold prose-strong:text-navy-deep"
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
