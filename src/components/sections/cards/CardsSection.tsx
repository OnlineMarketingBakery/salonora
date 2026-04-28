import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { CardsSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const colMap: Record<string, string> = {
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-2 lg:grid-cols-3",
  "4": "md:grid-cols-2 lg:grid-cols-4",
  "6": "md:grid-cols-3 lg:grid-cols-6",
};

export function CardsSection({ section, lang }: { section: CardsSectionT; lang: Locale }) {
  const g = colMap[section.columns] || colMap["3"];
  return (
    <section className="bg-white py-20 md:py-24">
      <Container>
        {section.title && (
          <h2
            className={`${REVEAL_ITEM} mb-10 text-center text-3xl font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl lg:mb-12 lg:text-[48px] lg:leading-[56px]`}
          >
            {section.title}
          </h2>
        )}
        <div className={`grid w-full auto-rows-[minmax(0,1fr)] justify-items-center gap-6 ${g}`}>
          {section.items.map((c, i) => {
            const l = resolveLink(c.link, lang);
            if (c.highlight) {
              return (
                <Card key={i} highlight className={REVEAL_ITEM}>
                  <div className="mx-auto flex w-full max-w-[248px] flex-col items-center gap-5 text-center">
                    <h3 className="w-full text-2xl font-semibold leading-[1.24] text-white">{c.title}</h3>
                    {c.text && (
                      <RichText
                        html={c.text}
                        className="w-full text-center text-base font-normal leading-[1.4] text-white/90 prose-p:text-center prose-p:leading-[1.4] prose-p:text-white/90 first:prose-p:mt-0 prose-headings:text-white [&_a]:text-white [&_a]:underline"
                      />
                    )}
                    {c.ctaText && l && (
                      <Button href={l.href} target={l.target} variant="ctaBrand" className="w-full" ctaElevation="none">
                        {c.ctaText}
                      </Button>
                    )}
                    {c.ctaSubtext && (
                      <div
                        className="w-full max-w-[12.5rem] text-balance text-center text-base font-semibold leading-[1.24] text-white"
                      >
                        {c.ctaSubtext
                          .split("\n")
                          .filter((line) => line.trim() !== "")
                          .map((line, idx) => (
                            <p key={idx} className="[&:not(:last-child)]:mb-1.5 last:mb-0">
                              {line}
                            </p>
                          ))}
                      </div>
                    )}
                  </div>
                </Card>
              );
            }
            return (
              <Card key={i} highlight={false} className={REVEAL_ITEM}>
                <div className="flex w-full min-w-0 flex-1 flex-col items-stretch gap-10">
                  {c.icon && (
                    <div className="box-border flex size-[54px] shrink-0 items-center justify-center self-start rounded-[10px] border border-[#dde9f9] bg-white p-[15px]">
                      <Media
                        image={c.icon}
                        width={24}
                        height={24}
                        className="size-6 object-contain"
                      />
                    </div>
                  )}
                  <div className="flex min-w-0 w-full flex-1 flex-col items-start gap-2.5">
                    <h3 className="w-full min-w-0 text-2xl font-semibold leading-[1.1] text-navy">{c.title}</h3>
                    {c.text && (
                      <RichText
                        html={c.text}
                        className="w-full text-base font-normal leading-[1.4] !prose-p:mt-0 !prose-p:leading-[1.4] !prose-p:text-muted first:prose-p:mt-0 !prose-strong:font-bold !prose-strong:text-navy [&_a]:text-brand"
                      />
                    )}
                    {c.ctaText && l && (
                      <Button href={l.href} target={l.target} variant="ctaBrand" className="mt-1 self-start">
                        {c.ctaText}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
