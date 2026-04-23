import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import type { CtaSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const themeClass: Record<NonNullable<CtaSectionT["theme"]>, string> = {
  light: "bg-slate-50 text-[#0c1d3a]",
  dark: "bg-[#0c1d3a] text-white",
  brand: "bg-gradient-to-r from-[#1e5bb8] to-sky-500 text-white",
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
      <Container className={`relative rounded-2xl p-8 md:p-10 ${!hasBg ? themeClass[theme] : "bg-slate-900/80 text-white"}`}>
        <div className={align}>
          {section.title && <h2 className="text-2xl font-bold sm:text-3xl">{section.title}</h2>}
          {section.text && <RichText html={section.text} className={`mt-3 text-sm opacity-90 ${align === "text-center" ? "mx-auto max-w-2xl" : ""}`} />}
          <div className={`mt-6 flex flex-wrap gap-3 ${section.alignment === "center" ? "justify-center" : ""}`}>
            {section.ctas.map((c, i) => {
              const l = resolveLink(c.url, lang);
              if (!c.text && !l) return null;
              return (
                <Button key={i} href={l?.href} variant="white" target={l?.target} className={theme === "light" ? "border-[#0c1d3a] text-[#0c1d3a] hover:bg-slate-100" : ""}>
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
