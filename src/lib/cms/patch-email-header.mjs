import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.."),
  "wordpress/wp-content/plugins/omb-form-builder/includes/class-cfb-email-template.php"
);

let t = fs.readFileSync(file, "utf8");

const helpers = `
\tpublic static function header_image_url(): string {
\t\treturn (string) apply_filters( 'cfb_email_header_image_url', '' );
\t}

\t/**
\t * Footer-style email hero: navy grid band + circular logo badge (SiteFooter parity).
\t */
\tpublic static function header_band_html( string $site, string $logo ): string {
\t\t$header_img = trim( self::header_image_url() );
\t\tif ( $header_img !== '' ) {
\t\t\treturn '<tr><td style="padding:0;line-height:0;font-size:0;">'
\t\t\t\t. '<a href="' . esc_url( $site ) . '" style="text-decoration:none;">'
\t\t\t\t. '<img src="' . esc_url( $header_img ) . '" alt="Salonora" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:16px 16px 0 0;" />'
\t\t\t\t. '</a></td></tr>';
\t\t}

\t\t$grid_bg = 'background-color:#002752;background-image:linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);background-size:48px 48px;';

\t\treturn '<tr><td style="padding:0;background-color:#ffffff;border-radius:16px 16px 0 0;">'
\t\t\t. '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">'
\t\t\t. '<tr><td align="center" style="padding:28px 0 0 0;background-color:#ffffff;line-height:0;font-size:0;">'
\t\t\t. self::logo_badge_html( $site, $logo )
\t\t\t. '</td></tr>'
\t\t\t. '<tr><td align="center" style="' . $grid_bg . 'border-radius:16px 16px 0 0;padding:8px 32px 28px 32px;">'
\t\t\t. '<div style="height:36px;line-height:36px;font-size:0;">&nbsp;</div>'
\t\t\t. '</td></tr>'
\t\t\t. '</table></td></tr>';
\t}

\tpublic static function logo_badge_html( string $site, string $logo ): string {
\t\treturn '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr><td align="center" style="width:120px;height:120px;border-radius:60px;background-color:#ffffff;border:1px solid #3990f0;box-shadow:0 23px 17px rgba(67,87,128,0.34);">'
\t\t\t. '<a href="' . esc_url( $site ) . '" style="text-decoration:none;display:block;padding:24px 0;">'
\t\t\t. '<img src="' . esc_url( $logo ) . '" alt="Salonora" width="72" height="72" style="display:block;margin:0 auto;border:0;outline:none;" />'
\t\t\t. '</a></td></tr></table>';
\t}

`;

if (!t.includes("header_band_html")) {
  t = t.replace(
    "\tpublic static function normalize_lang( $lang ): string {",
    helpers + "\tpublic static function normalize_lang( $lang ): string {"
  );
}

const oldWrapHeader =
  "\t\t\t. '<table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 28px rgba(21,41,81,0.08);\">'\n" +
  "\t\t\t. '<tr><td style=\"background-color:#002752;padding:28px 32px;text-align:center;\">'\n" +
  "\t\t\t. '<a href=\"' . $site . '\" style=\"text-decoration:none;\"><img src=\"' . $logo . '\" alt=\"Salonora\" width=\"72\" height=\"72\" style=\"display:block;margin:0 auto;border:0;outline:none;\" /></a>'\n" +
  "\t\t\t. '</td></tr>'\n" +
  "\t\t\t. '<tr><td style=\"height:4px;background:linear-gradient(90deg,transparent 0%,#3990f0 50%,transparent 100%);font-size:0;line-height:0;\">&nbsp;</td></tr>'\n" +
  "\t\t\t. '<tr><td style=\"padding:36px 32px 32px 32px;font-family:Outfit,Arial,Helvetica,sans-serif;color:#002752;\">'";

const newWrapHeader =
  "\t\t\t. '<table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 28px rgba(21,41,81,0.08);\">'\n" +
  "\t\t\t. self::header_band_html( $site, $logo )\n" +
  "\t\t\t. '<tr><td style=\"padding:36px 32px 32px 32px;font-family:Outfit,Arial,Helvetica,sans-serif;color:#002752;background-color:#ffffff;\">'";

if (t.includes(oldWrapHeader)) {
  t = t.replace(oldWrapHeader, newWrapHeader);
} else if (!t.includes("header_band_html( $site, $logo )")) {
  throw new Error("wrap() header block not found");
}

fs.writeFileSync(file, t);
console.log("patched email header");
