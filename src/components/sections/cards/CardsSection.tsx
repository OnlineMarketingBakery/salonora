import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
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
    <section className="bg-white/90 py-16 md:py-20">
      <Container>
        {section.title && (
          <h2 className="mb-12 text-center text-3xl font-bold leading-tight tracking-[-0.04em] text-navy sm:text-4xl lg:mb-14 lg:text-[48px] lg:leading-[56px]">
            {section.title}
          </h2>
        )}
        <div className={`grid gap-6 ${g}`}>
          {section.items.map((c, i) => {
            const l = resolveLink(c.link, lang);
            return (
              <Card key={i} highlight={c.highlight}>
                <div className="flex h-full flex-col">
                  {c.icon && <Media image={c.icon} width={48} height={48} className="mb-3 h-12 w-12 object-contain" />}
                  <h3 className="text-lg font-bold text-inherit">{c.title}</h3>
                  {c.text && (
                    <RichText html={c.text} className={`mt-2 flex-1 text-sm ${c.highlight ? "text-inherit opacity-90" : "text-muted"}`} />
                  )}
                  {c.ctaText && l && (
                    <Button href={l.href} variant="primary" className="mt-4 self-start" target={l.target}>
                      {c.ctaText}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
