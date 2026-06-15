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
    // Per-page footers rarely set their own badge; keep the global footer logo so the
    // notch + centered logo badge still render instead of collapsing to the flat top.
    footerLogo: overrides.footerLogo ?? base.footerLogo,
    footerCopyright: overrides.footerCopyright.trim(),
    showFooterLanguageSwitcher: section.hasLanguageSwitcherOverride
      ? overrides.showFooterLanguageSwitcher
      : base.showFooterLanguageSwitcher,
    footerCtaFootnote: overrides.footerCtaFootnote.trim(),
    footerCtaPrimaryLink: overrides.footerCtaPrimaryLink,
    footerCtaSecondaryLink: overrides.footerCtaSecondaryLink,
  };
}
