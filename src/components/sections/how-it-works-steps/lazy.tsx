import type { HowItWorksStepsSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export async function HowItWorksStepsSectionLazy(props: {
  section: HowItWorksStepsSectionT;
  lang: Locale;
}) {
  const { HowItWorksStepsSection } = await import("./index");
  return <HowItWorksStepsSection {...props} />;
}
