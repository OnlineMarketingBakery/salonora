import type { FooterSectionT } from "@/types/sections";
import type { FooterSettings } from "@/types/globals";

/** Per-page footer replaces global Footer settings; blank custom fields stay blank. */
export function mergeFooterSettings(
  base: FooterSettings,
  section: FooterSectionT,
): FooterSettings {
  const overrides = section;
  return {
    isCustomFooter: true,
    footerTitle: overrides.footerTitle.trim(),
    footerText: overrides.footerText.trim(),
    footerLogo: overrides.footerLogo,
    footerCopyright: overrides.footerCopyright.trim(),
    showFooterLanguageSwitcher: section.hasLanguageSwitcherOverride
      ? overrides.showFooterLanguageSwitcher
      : base.showFooterLanguageSwitcher,
    footerCtaFootnote: overrides.footerCtaFootnote.trim(),
    footerCtaPrimaryLink: overrides.footerCtaPrimaryLink,
    footerCtaSecondaryLink: overrides.footerCtaSecondaryLink,
  };
}
