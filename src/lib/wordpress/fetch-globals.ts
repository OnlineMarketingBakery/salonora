import { getWordpressApiUrl } from "./config";
import type { GlobalSettings } from "@/types/globals";
import { asBool, asImage, asString } from "@/lib/acf/field-mappers";
import type { WpAcfLink } from "@/types/wordpress";
import { logger } from "@/lib/utils/logger";
import type { Locale } from "@/lib/i18n/locales";

function asLink(v: unknown): WpAcfLink | null {
  if (!v || typeof v !== "object" || !("url" in v)) return null;
  return (v as { url: string; title?: string; target?: string }).url
    ? (v as WpAcfLink)
    : null;
}

async function fetchAcfOptions(path: string, lang: Locale): Promise<Record<string, unknown> | null> {
  const base = getWordpressApiUrl();
  if (!base) return null;
  const tryPaths = [
    `${base}/acf/v1/options/${path}`,
    `${base}/acf/v3/options/${path}`,
  ];
  for (const p of tryPaths) {
    try {
      const res = await fetch(`${p}?lang=${lang}`, { next: { revalidate: 60 } });
      if (res.ok) {
        return (await res.json()) as Record<string, unknown>;
      }
    } catch (e) {
      logger.warn("ACF options fetch", p, e);
    }
  }
  return null;
}

function fromHeader(o: Record<string, unknown> | null) {
  if (!o) {
    return {
      headerLogo: null,
      headerLogoDark: null,
      headerStyle: "light" as const,
      headerSticky: false,
      showLanguageSwitcher: true,
      showHeaderCta: true,
      headerCtaLink: null,
    };
  }
  return {
    headerLogo: asImage(o.header_logo),
    headerLogoDark: asImage(o.header_logo_dark),
    headerStyle: (asString(o.header_style) as "light" | "dark" | "transparent") || "light",
    headerSticky: asBool(o.header_sticky),
    showLanguageSwitcher: asBool(o.show_language_switcher),
    showHeaderCta: asBool(o.show_header_cta),
    headerCtaLink: asLink(o.header_cta_link),
  };
}

function fromFooter(o: Record<string, unknown> | null) {
  if (!o) {
    return {
      footerTitle: "",
      footerText: "",
      footerLogo: null,
      footerCopyright: "",
      showFooterLanguageSwitcher: true,
    };
  }
  return {
    footerTitle: asString(o.footer_title),
    footerText: asString(o.footer_text),
    footerLogo: asImage(o.footer_logo),
    footerCopyright: asString(o.footer_copyright),
    showFooterLanguageSwitcher: asBool(o.show_footer_language_switcher),
  };
}

function fromContact(o: Record<string, unknown> | null) {
  if (!o) {
    return {
      mainEmail: "",
      mainPhone: "",
      address: "",
      whatsapp: "",
      linkedinUrl: "",
      instagramUrl: "",
      facebookUrl: "",
      youtubeUrl: "",
    };
  }
  return {
    mainEmail: asString(o.main_email),
    mainPhone: asString(o.main_phone),
    address: asString(o.address),
    whatsapp: asString(o.whatsapp),
    linkedinUrl: asString(o.linkedin_url),
    instagramUrl: asString(o.instagram_url),
    facebookUrl: asString(o.facebook_url),
    youtubeUrl: asString(o.youtube_url),
  };
}

function fromSite(o: Record<string, unknown> | null) {
  if (!o) {
    return {
      siteNameOverride: "",
      defaultTagline: "",
      defaultOgImage: null,
      globalCtaTitle: "",
      globalCtaText: "",
      globalCtaLink: null,
      enableAnnouncement: false,
      announcementText: "",
      announcementLink: null,
    };
  }
  return {
    siteNameOverride: asString(o.site_name_override),
    defaultTagline: asString(o.default_tagline),
    defaultOgImage: asImage(o.default_og_image),
    globalCtaTitle: asString(o.global_cta_title),
    globalCtaText: asString(o.global_cta_text),
    globalCtaLink: asLink(o.global_cta_link),
    enableAnnouncement: asBool(o.enable_announcement),
    announcementText: asString(o.announcement_text),
    announcementLink: asLink(o.announcement_link),
  };
}

function asDefaultForm(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && v > 0) return v;
  if (typeof v === "object" && "ID" in v && typeof (v as { ID: unknown }).ID === "number")
    return (v as { ID: number }).ID;
  if (typeof v === "object" && "id" in v && typeof (v as { id: unknown }).id === "number")
    return (v as { id: number }).id;
  return null;
}

function fromIntegrations(o: Record<string, unknown> | null) {
  if (!o) {
    return { gtmId: "", ga4Id: "", nextFrontendUrl: "", revalidationSecret: "", defaultContactForm: null as number | null };
  }
  return {
    gtmId: asString(o.gtm_id),
    ga4Id: asString(o.ga4_id),
    nextFrontendUrl: asString(o.next_frontend_url),
    revalidationSecret: asString(o.revalidation_secret),
    defaultContactForm: asDefaultForm(o.default_contact_form),
  };
}

function fromDefaultSeo(o: Record<string, unknown> | null) {
  if (!o) {
    return {
      defaultSeoTitlePattern: "",
      defaultSeoDescription: "",
      defaultShareImage: null,
      allowIndexingByDefault: true,
    };
  }
  return {
    defaultSeoTitlePattern: asString(o.default_seo_title_pattern),
    defaultSeoDescription: asString(o.default_seo_description),
    defaultShareImage: asImage(o.default_share_image),
    allowIndexingByDefault: asBool(o.allow_indexing_by_default),
  };
}

export async function fetchGlobals(lang: Locale): Promise<GlobalSettings> {
  const [headerRaw, footerRaw, contactRaw, siteRaw, integrationsRaw, defaultSeoRaw] = await Promise.all([
    fetchAcfOptions("omb-header-settings", lang),
    fetchAcfOptions("omb-footer-settings", lang),
    fetchAcfOptions("omb-contact-social", lang),
    fetchAcfOptions("omb-site-settings", lang),
    fetchAcfOptions("omb-integrations", lang),
    fetchAcfOptions("omb-default-seo", lang),
  ]);

  return {
    header: fromHeader(headerRaw),
    footer: fromFooter(footerRaw),
    contact: fromContact(contactRaw),
    site: fromSite(siteRaw),
    integrations: fromIntegrations(integrationsRaw),
    defaultSeo: fromDefaultSeo(defaultSeoRaw),
  };
}
