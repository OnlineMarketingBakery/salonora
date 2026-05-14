import type { WpAcfLink, WpImage } from "./wordpress";

export type HeaderSettings = {
  headerLogo: WpImage | null;
  headerLogoDark: WpImage | null;
  headerStyle: "light" | "dark" | "transparent";
  headerSticky: boolean;
  showLanguageSwitcher: boolean;
  showHeaderCta: boolean;
  headerCtaLink: WpAcfLink | null;
};

export type FooterSettings = {
  footerTitle: string;
  footerText: string;
  footerLogo: WpImage | null;
  footerCopyright: string;
  showFooterLanguageSwitcher: boolean;
  /**
   * Small line under the CTA buttons (Figma: “Live instantly. No technical knowledge…”).
   * Set in ACF as “Text under the buttons” (`footer_cta_text`); `global_cta_text` is merged from legacy.
   */
  footerCtaFootnote: string;
  footerCtaPrimaryLink: WpAcfLink | null;
  /** Secondary button in footer left column */
  footerCtaSecondaryLink: WpAcfLink | null;
};

export type ContactSocialSettings = {
  mainEmail: string;
  mainPhone: string;
  address: string;
  whatsapp: string;
  linkedinUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
};

export type SiteSettings = {
  siteNameOverride: string;
  defaultTagline: string;
  defaultOgImage: WpImage | null;
  /**
   * Trailing icon for blue marketing CTAs (`Button` `variant="ctaBrand"`).
   * ACF Site Options: `default_cta_brand_arrow`; when empty, Next uses `defaultCtaBrandArrowFallback()`.
   */
  defaultCtaBrandArrow: WpImage;
  enableAnnouncement: boolean;
  announcementText: string;
  announcementLink: WpAcfLink | null;
};

export type IntegrationsSettings = {
  gtmId: string;
  ga4Id: string;
  nextFrontendUrl: string;
  revalidationSecret: string;
  defaultContactForm: number | null;
};

export type DefaultSeoSettings = {
  defaultSeoTitlePattern: string;
  defaultSeoDescription: string;
  defaultShareImage: WpImage | null;
  allowIndexingByDefault: boolean;
};

/** WordPress Settings → Reading (static front page). Filled from OMB `/globals` or `/reading`. */
export type ReadingSettings = {
  showOnFront: string;
  /** Slug of the page set as “Homepage” when `showOnFront` is `page`; otherwise null. */
  homepageSlug: string | null;
};

export type GlobalSettings = {
  header: HeaderSettings;
  footer: FooterSettings;
  contact: ContactSocialSettings;
  site: SiteSettings;
  integrations: IntegrationsSettings;
  defaultSeo: DefaultSeoSettings;
  reading: ReadingSettings;
};
