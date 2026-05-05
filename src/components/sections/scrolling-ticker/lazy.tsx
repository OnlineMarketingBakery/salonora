import type { ScrollingTickerSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export async function ScrollingTickerSectionLazy(props: {
  section: ScrollingTickerSectionT;
  lang: Locale;
}) {
  const { ScrollingTickerSection } = await import("./index");
  return <ScrollingTickerSection {...props} />;
}
