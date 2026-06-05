import { FaqPageShell } from "@/components/templates/faq/FaqPageShell";
import type { FaqEntry } from "@/lib/legal/faq-items";
import type { ContactSocialSettings } from "@/types/globals";
import type { Locale } from "@/lib/i18n/locales";

export function FaqPageContent({
  items,
  lang,
  title,
  contact,
  showHero = true,
}: {
  items: FaqEntry[];
  lang: Locale;
  title: string;
  contact: ContactSocialSettings;
  showHero?: boolean;
}) {
  return (
    <FaqPageShell items={items} lang={lang} title={title} contact={contact} showHero={showHero} />
  );
}
