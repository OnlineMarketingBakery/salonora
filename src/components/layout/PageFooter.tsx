import type { Locale } from "@/lib/i18n/locales";
import { mergeFooterSettings } from "@/lib/globals/merge-footer-settings";
import { resolvePageFooter } from "@/lib/wordpress/resolve-page-footer";
import type { GlobalSettings } from "@/types/globals";
import type { MenuItem } from "@/types/menu";
import { SiteFooter } from "./SiteFooter";

type Props = {
  globals: GlobalSettings;
  lang: Locale;
  footerMenu: MenuItem[];
  legalMenu: MenuItem[];
  languageSwitcherPathname: string;
  languageSwitcherHrefs: Record<Locale, string> | null;
};

/**
 * Renders the global footer or per-page flexible footer sections (ACF: `use_custom_footer`).
 */
export async function PageFooter(props: Props) {
  const resolved = await resolvePageFooter(
    props.globals,
    props.lang,
    props.languageSwitcherPathname,
  );

  if (resolved.mode === "custom") {
    const globals: GlobalSettings = {
      ...props.globals,
      footer: mergeFooterSettings(props.globals.footer, resolved.footer),
    };
    return <SiteFooter {...props} globals={globals} />;
  }

  return <SiteFooter {...props} />;
}
