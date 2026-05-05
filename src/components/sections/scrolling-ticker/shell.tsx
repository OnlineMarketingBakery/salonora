import { Suspense } from "react";
import type { AnySectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import { ScrollingTickerSectionLazy } from "./lazy";

export function ScrollingTickerSectionShell(props: { section: AnySectionT; lang: Locale }) {
  if (props.section.type !== "scrolling_ticker") return null;
  return (
    <Suspense fallback={null}>
      <ScrollingTickerSectionLazy section={props.section} lang={props.lang} />
    </Suspense>
  );
}
