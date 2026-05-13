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

export type GlobalSettings = {
  header: HeaderSettings;
  footer: FooterSettings;
  contact: ContactSocialSettings;
  site: SiteSettings;
  integrations: IntegrationsSettings;
  defaultSeo: DefaultSeoSettings;
};
