import type { FooterSectionT } from "@/types/sections";
import type { FooterSettings } from "@/types/globals";

/** Per-page footer section overrides global Footer settings; empty strings fall back to globals. */
export function mergeFooterSettings(
  base: FooterSettings,
  section: FooterSectionT,
): FooterSettings {
  const overrides = section;
  return {
    footerTitle: overrides.footerTitle.trim() || base.footerTitle,
    footerText: overrides.footerText.trim() || base.footerText,
    footerLogo: overrides.footerLogo ?? base.footerLogo,
    footerCopyright: overrides.footerCopyright.trim() || base.footerCopyright,
    showFooterLanguageSwitcher: section.hasLanguageSwitcherOverride
      ? overrides.showFooterLanguageSwitcher
      : base.showFooterLanguageSwitcher,
    footerCtaFootnote: overrides.footerCtaFootnote.trim() || base.footerCtaFootnote,
    footerCtaPrimaryLink: overrides.footerCtaPrimaryLink ?? base.footerCtaPrimaryLink,
    footerCtaSecondaryLink: overrides.footerCtaSecondaryLink ?? base.footerCtaSecondaryLink,
  };
}
