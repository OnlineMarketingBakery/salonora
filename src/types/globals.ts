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
  /** Optional second CTA in footer left column (e.g. "Or start complete…") */
  footerCta2Link: WpAcfLink | null;
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
  globalCtaTitle: string;
  globalCtaText: string;
  globalCtaLink: WpAcfLink | null;
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
