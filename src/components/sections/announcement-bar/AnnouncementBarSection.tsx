import { RichText } from "@/components/ui/RichText";
import type { AnnouncementBarSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function AnnouncementBarSection({ section }: { section: AnnouncementBarSectionT; lang: Locale }) {
  if (!section.items.length) return null;
  return (
    <div className="bg-brand py-2 text-center text-sm text-white">
      {section.items.map((it, i) => (
        <RichText key={i} html={it.text} className="inline-block px-2" />
      ))}
    </div>
  );
}
