import { getWordpressApiUrl, getWordpressAuthorizationHeader } from "./config";
import { wpFetchOptional } from "./client";
import type { FooterSettings, GlobalSettings } from "@/types/globals";
import { asBool, asImage, asLink, asString } from "@/lib/acf/field-mappers";
import { logger } from "@/lib/utils/logger";
import type { Locale } from "@/lib/i18n/locales";

/** OMB REST / some stacks expose ACF keys as camelCase; WP REST uses snake_case. */
function acfPick(o: Record<string, unknown>, snake: string, camel: string): unknown {
  if (Object.prototype.hasOwnProperty.call(o, snake)) return o[snake];
  if (Object.prototype.hasOwnProperty.call(o, camel)) return o[camel];
  return undefined;
}

/**
 * ACF options GET responses may expose fields at the JSON root or under `acf`
 * (same pattern as `wp/v2/*` objects). Merge `acf` onto the payload so OMB
 * field names (`header_logo`, etc.) resolve whether the API nests them or not,
 * without dropping root-level fields when `acf` is an empty object.
 */
function unwrapAcfOptionsPayload(data: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!data) return null;
  const acf = data.acf;
  const acfRecord =
    acf && typeof acf === "object" && !Array.isArray(acf) ? (acf as Record<string, unknown>) : null;
  if (!acfRecord) return data;
  return { ...data, ...acfRecord };
}

type OmbGlobalsRestPayload = {
  header?: Record<string, unknown>;
  footer?: Record<string, unknown>;
  contact?: Record<string, unknown>;
  site?: Record<string, unknown>;
  integrations?: Record<string, unknown>;
  defaultSeo?: Record<string, unknown>;
};

/**
 * Loads all ACF option groups in one request via OMB Headless Core. Use this when
 * WordPress does not register the `acf` REST namespace (common); native
 * `acf/v1/options/…` and `acf/v3/options/…` routes then return 404 and globals stay empty.
 */
async function fetchGlobalsViaOmbRest(lang: Locale): Promise<OmbGlobalsRestPayload | null> {
  const base = getWordpressApiUrl();
  if (!base) return null;
  const url = new URL(`${base}/omb-headless/v1/globals`);
  url.searchParams.set("lang", lang);
  const headers = new Headers();
  const auth = getWordpressAuthorizationHeader();
  if (auth) {
    headers.set("Authorization", auth);
  }
  try {
    const res = await fetch(url.toString(), { headers, next: { revalidate: 60 } });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      logger.warn("omb-headless globals", url.toString(), res.status);
      return null;
    }
    const body = (await res.json()) as OmbGlobalsRestPayload;
    if (!body || typeof body !== "object") {
      return null;
    }
    return body;
  } catch (e) {
    logger.warn("omb-headless globals fetch", url.toString(), e);
    return null;
  }
}

async function fetchAcfOptions(path: string, lang: Locale): Promise<Record<string, unknown> | null> {
  const base = getWordpressApiUrl();
  if (!base) return null;
  const tryPaths = [
    `${base}/acf/v1/options/${path}`,
    `${base}/acf/v3/options/${path}`,
  ];
  const headers = new Headers();
  const auth = getWordpressAuthorizationHeader();
  if (auth) {
    headers.set("Authorization", auth);
  }
  for (const p of tryPaths) {
    try {
      const url = new URL(p);
      url.searchParams.set("lang", lang);
      // Ensures image/link fields match WpImage / app expectations (url, not bare attachment ID).
      url.searchParams.set("acf_format", "standard");
      const res = await fetch(url.toString(), { headers, next: { revalidate: 60 } });
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
    headerLogo: asImage(acfPick(o, "header_logo", "headerLogo")),
    headerLogoDark: asImage(acfPick(o, "header_logo_dark", "headerLogoDark")),
    headerStyle:
      (asString(acfPick(o, "header_style", "headerStyle")) as "light" | "dark" | "transparent") || "light",
    headerSticky: asBool(acfPick(o, "header_sticky", "headerSticky")),
    showLanguageSwitcher: asBool(acfPick(o, "show_language_switcher", "showLanguageSwitcher")),
    showHeaderCta: asBool(acfPick(o, "show_header_cta", "showHeaderCta")),
    headerCtaLink: asLink(acfPick(o, "header_cta_link", "headerCtaLink")),
  };
}

function fromFooter(o: Record<string, unknown> | null) {
  if (!o) {
    return {
      footerTitle: "",
      footerText: "",
      footerLogo: null,
      footerBackgroundImage: null,
      footerBackgroundColor: "",
      footerBackgroundGradient: "",
      footerCopyright: "",
      showFooterLanguageSwitcher: true,
      footerCtaFootnote: "",
      footerCtaPrimaryLink: null,
      footerCtaSecondaryLink: null,
    };
  }
  return {
    footerTitle: asString(o.footer_title),
    footerText: asString(o.footer_text),
    footerLogo: asImage(o.footer_logo),
    /** Same lookup pattern as `footer_logo`: direct keys first, then camel/snake picks + legacy field. */
    footerBackgroundImage:
      asImage(o.footer_background_image) ??
      asImage(o.footerBackgroundImage) ??
      asImage(acfPick(o, "footer_background_image", "footerBackgroundImage")) ??
      asImage(acfPick(o, "footer_top_shape_image", "footerTopShapeImage")),
    footerBackgroundColor: asString(acfPick(o, "footer_background_color", "footerBackgroundColor")),
    footerBackgroundGradient: asString(acfPick(o, "footer_background_gradient", "footerBackgroundGradient")),
    footerCopyright: asString(o.footer_copyright),
    showFooterLanguageSwitcher: asBool(o.show_footer_language_switcher),
    footerCtaFootnote: asString(acfPick(o, "footer_cta_text", "footerCtaText")),
    footerCtaPrimaryLink: asLink(acfPick(o, "footer_cta_primary_link", "footerCtaPrimaryLink")),
    footerCtaSecondaryLink:
      asLink(acfPick(o, "footer_cta_secondary_link", "footerCtaSecondaryLink")) ??
      asLink(o.footer_cta_2_link) ??
      asLink(o.footer_cta2_link),
  };
}

/** Until WP content is re-saved under the new ACF field names, use legacy `global_cta_*` (still returned in site options). */
function mergeFooterCtaMigrations(
  footer: ReturnType<typeof fromFooter>,
  siteRaw: Record<string, unknown> | null
): ReturnType<typeof fromFooter> {
  if (!siteRaw) return footer;
  return {
    ...footer,
    footerTitle: footer.footerTitle.trim() || asString(siteRaw.global_cta_title),
    footerCtaFootnote: footer.footerCtaFootnote || asString(siteRaw.global_cta_text),
    footerCtaPrimaryLink: footer.footerCtaPrimaryLink ?? asLink(siteRaw.global_cta_link),
  };
}

/** When ACF stores only an attachment ID, resolve URL via WP REST. */
async function resolveFooterBackgroundFromAttachmentId(
  lang: Locale,
  raw: Record<string, unknown> | null,
  footer: FooterSettings
): Promise<FooterSettings> {
  if (footer.footerBackgroundImage) return footer;
  if (!raw) return footer;
  const candidates = [
    acfPick(raw, "footer_background_image", "footerBackgroundImage"),
    acfPick(raw, "footer_top_shape_image", "footerTopShapeImage"),
  ];
  let id: number | null = null;
  for (const v of candidates) {
    if (typeof v === "number" && v > 0) {
      id = v;
      break;
    }
    if (typeof v === "string" && /^\d+$/.test(v.trim())) {
      id = parseInt(v.trim(), 10);
      break;
    }
  }
  if (!id) return footer;
  const media = await wpFetchOptional<Record<string, unknown>>(`/wp/v2/media/${id}`, {
    lang,
    revalidate: 60,
  });
  const img = asImage(media);
  if (!img) return footer;
  return { ...footer, footerBackgroundImage: img };
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
      enableAnnouncement: false,
      announcementText: "",
      announcementLink: null,
    };
  }
  return {
    siteNameOverride: asString(o.site_name_override),
    defaultTagline: asString(o.default_tagline),
    defaultOgImage: asImage(o.default_og_image),
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
  const omb = await fetchGlobalsViaOmbRest(lang);
  if (omb != null) {
    const siteUnwrapped = unwrapAcfOptionsPayload(omb.site ?? null);
    const footerRaw = unwrapAcfOptionsPayload(omb.footer ?? null) as Record<string, unknown> | null;
    const footerMerged = mergeFooterCtaMigrations(fromFooter(footerRaw), siteUnwrapped);
    const footer = await resolveFooterBackgroundFromAttachmentId(lang, footerRaw, footerMerged);
    return {
      header: fromHeader(unwrapAcfOptionsPayload(omb.header ?? null)),
      footer,
      contact: fromContact(unwrapAcfOptionsPayload(omb.contact ?? null)),
      site: fromSite(siteUnwrapped),
      integrations: fromIntegrations(unwrapAcfOptionsPayload(omb.integrations ?? null)),
      defaultSeo: fromDefaultSeo(unwrapAcfOptionsPayload(omb.defaultSeo ?? null)),
    };
  }

  const [headerRaw, footerRaw, contactRaw, siteRaw, integrationsRaw, defaultSeoRaw] = await Promise.all([
    fetchAcfOptions("omb-header-settings", lang),
    fetchAcfOptions("omb-footer-settings", lang),
    fetchAcfOptions("omb-contact-social", lang),
    fetchAcfOptions("omb-site-settings", lang),
    fetchAcfOptions("omb-integrations", lang),
    fetchAcfOptions("omb-default-seo", lang),
  ]);

  const siteUnwrapped = unwrapAcfOptionsPayload(siteRaw);
  const footerRawFlat = unwrapAcfOptionsPayload(footerRaw) as Record<string, unknown> | null;
  const footerMerged = mergeFooterCtaMigrations(fromFooter(footerRawFlat), siteUnwrapped);
  const footer = await resolveFooterBackgroundFromAttachmentId(lang, footerRawFlat, footerMerged);
  return {
    header: fromHeader(unwrapAcfOptionsPayload(headerRaw)),
    footer,
    contact: fromContact(unwrapAcfOptionsPayload(contactRaw)),
    site: fromSite(siteUnwrapped),
    integrations: fromIntegrations(unwrapAcfOptionsPayload(integrationsRaw)),
    defaultSeo: fromDefaultSeo(unwrapAcfOptionsPayload(defaultSeoRaw)),
  };
}
