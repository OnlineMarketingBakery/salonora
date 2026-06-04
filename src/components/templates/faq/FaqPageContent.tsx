import { FaqPageShell } from "@/components/templates/faq/FaqPageShell";
import type { FaqEntry } from "@/lib/legal/faq-items";
import type { Locale } from "@/lib/i18n/locales";

export function FaqPageContent({
  items,
  lang,
  title,
  showHero = true,
}: {
  items: FaqEntry[];
  lang: Locale;
  title: string;
  showHero?: boolean;
}) {
  return <FaqPageShell items={items} lang={lang} title={title} showHero={showHero} />;
}
