import { sectionRegistry, getSectionKey } from "@/lib/acf/section-registry";
import type { AnySectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function SectionRenderer({ sections, lang }: { sections: AnySectionT[]; lang: Locale }) {
  return (
    <>
      {sections.map((section) => {
        if (!getSectionKey(section.type)) return null;
        const Comp = sectionRegistry[section.type];
        return <Comp key={section.id} section={section} lang={lang} />;
      })}
    </>
  );
}
