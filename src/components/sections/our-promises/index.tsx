/** @see Figma **693:395** (“Frame 2147229263”) — centered heading + four promise columns (circular icon, title, description). */
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import type { OurPromisesSectionT, WhoWeAreForItemAccentT } from "@/types/sections";

function iconDiscClass(accent: WhoWeAreForItemAccentT): string {
  return accent === "rose" ? "bg-[var(--palette-rose)]" : "bg-[var(--palette-brand)]";
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
    <section lang={lang} className="bg-[var(--palette-white)] py-16 md:py-20 lg:py-[4.5rem]">
      <Container className="!max-w-[85rem]">
        <div
          className={`${REVEAL_ITEM} mx-auto flex w-full max-w-[76.8125rem] flex-col items-center gap-12 md:gap-16 lg:gap-[4.8125rem]`}
        >
          {titleLines.length > 0 ? (
            <h2 className="m-0 w-full text-center font-sans text-[clamp(1.75rem,4.2vw,3rem)] font-semibold leading-[1.15] tracking-[-0.04em] text-[var(--palette-navy)]">
              {titleLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>
          ) : null}

          {items.length > 0 ? (
            <ul className="m-0 grid w-full list-none grid-cols-1 gap-x-8 gap-y-12 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-[3.75rem]">
              {items.map((item, index) => (
                <li
                  key={`${section.id}-promise-${index}`}
                  className="flex flex-col items-center gap-[0.9375rem] text-center text-[var(--palette-navy)]"
                >
                  <div
                    className={`flex size-[5.25rem] shrink-0 items-center justify-center rounded-full p-[1.3125rem] ${iconDiscClass(item.icon_accent)}`}
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
                  {item.title.trim() ? (
                    <p className="m-0 w-full max-w-[17rem] font-sans text-xl font-semibold leading-[1.1] text-[var(--palette-navy)] sm:text-2xl">
                      {item.title.trim()}
                    </p>
                  ) : null}
                  {item.description.trim() ? (
                    <RichText
                      html={item.description}
                      className="w-full max-w-[17.125rem] [&_p]:m-0 [&_p+p]:mt-1 [&_p]:text-center [&_p]:text-sm [&_p]:font-normal [&_p]:leading-[1.4] [&_p]:text-[var(--palette-navy)] prose-strong:font-semibold prose-strong:text-[var(--palette-navy)]"
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
