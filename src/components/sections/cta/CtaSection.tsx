import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import type { CtaSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const themeClass: Record<NonNullable<CtaSectionT["theme"]>, string> = {
  light: "bg-surface text-foreground",
  dark: "bg-navy-deep text-white",
  brand: "bg-gradient-to-r from-brand to-navy-deep text-white",
};

export function CtaSection({ section, lang }: { section: CtaSectionT; lang: Locale }) {
  const align = section.alignment === "left" ? "text-left" : "text-center";
  const theme = section.theme || "brand";
  const hasBg = section.backgroundImage;
  return (
    <section className="relative py-12 md:py-16">
      {hasBg && section.backgroundImage?.url && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${section.backgroundImage.url})` }}
          aria-hidden
        />
      )}
      <Container className={`relative rounded-2xl p-8 md:p-10 ${!hasBg ? themeClass[theme] : "bg-navy-deep/80 text-white"}`}>
        <div className={align}>
          {section.title && (
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.04em] text-navy sm:text-4xl lg:text-[48px] lg:leading-[56px]">
              {section.title}
            </h2>
          )}
          {section.text && <RichText html={section.text} className={`mt-3 text-sm opacity-90 ${align === "text-center" ? "mx-auto max-w-2xl" : ""}`} />}
          <div className={`mt-6 flex flex-wrap gap-3 ${section.alignment === "center" ? "justify-center" : ""}`}>
            {section.ctas.map((c, i) => {
              const l = resolveLink(c.url, lang);
              if (!c.text && !l) return null;
              return (
                <Button key={i} href={l?.href} variant="white" target={l?.target} className={theme === "light" ? "border-foreground text-foreground hover:bg-surface" : ""}>
                  {c.text || l?.label}
                </Button>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
