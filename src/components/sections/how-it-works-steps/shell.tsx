import { Suspense } from "react";
import type { AnySectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import { HowItWorksStepsSectionLazy } from "./lazy";

export function HowItWorksStepsSectionShell(props: { section: AnySectionT; lang: Locale }) {
  if (props.section.type !== "how_it_works_steps") return null;
  return (
    <Suspense fallback={null}>
      <HowItWorksStepsSectionLazy section={props.section} lang={props.lang} />
    </Suspense>
  );
}
