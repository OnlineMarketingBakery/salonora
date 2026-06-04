import { asBool, asImage, asLink, asString } from "./field-mappers";
import type { FooterSettings } from "@/types/globals";

/** Map ACF footer field names (page footer section or global Footer settings). */
export function acfPick(o: Record<string, unknown>, snake: string, camel: string): unknown {
  if (Object.prototype.hasOwnProperty.call(o, snake)) return o[snake];
  if (Object.prototype.hasOwnProperty.call(o, camel)) return o[camel];
  return undefined;
}

export function mapFooterFieldsFromAcfRow(o: Record<string, unknown> | null): FooterSettings {
  if (!o) {
    return {
      footerTitle: "",
      footerText: "",
      footerLogo: null,
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
