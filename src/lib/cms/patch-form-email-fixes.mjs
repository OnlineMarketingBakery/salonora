import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const inc = path.join(root, "wordpress/wp-content/plugins/omb-form-builder/includes");

function patch(file, replacements) {
  const p = path.join(inc, file);
  let t = fs.readFileSync(p, "utf8");
  for (const [oldStr, newStr] of replacements) {
    if (!t.includes(oldStr)) {
      if (newStr && t.includes(newStr.split("\n")[0])) continue;
      throw new Error(`Patch miss in ${file}: ${oldStr.slice(0, 60)}...`);
    }
    t = t.replace(oldStr, newStr);
  }
  fs.writeFileSync(p, t);
  console.log("patched", file);
}

patch("class-cfb-email-template.php", [
  [
    "return $email !== '' ? $email : 'hoi@salonora.nl';",
    "return $email !== '' ? $email : 'hi@salonora.eu';",
  ],
  [
    "\t\t$from_email = (string) apply_filters( 'cfb_email_from_address', 'noreply@salonora.eu' );",
    "\t\t$from_email = (string) apply_filters( 'cfb_email_from_address', 'hi@salonora.eu' );",
  ],
  [
    "\t\t\t'Reply-To: ' . self::contact_email(),",
    "\t\t\t'Reply-To: hi@salonora.eu',",
  ],
]);

patch("class-cfb-rest.php", [
  [
    `\t\t$context_post_id = isset( $params['cfb_post_id'] ) ? (int) $params['cfb_post_id'] : 0;

\t\t$frontend = CFB_Frontend::instance();
\t\t$result = $frontend->process_form_submission( $id, $raw, $visible, array(), $context_post_id );`,
    `\t\t$context_post_id = isset( $params['cfb_post_id'] ) ? (int) $params['cfb_post_id'] : 0;

\t\t$lang = isset( $params['cfb_lang'] ) ? sanitize_text_field( (string) $params['cfb_lang'] ) : 'nl';
\t\t$meta = array( 'lang' => $lang );

\t\t$frontend = CFB_Frontend::instance();
\t\t$result = $frontend->process_form_submission( $id, $raw, $visible, array(), $context_post_id, $meta );`,
  ],
]);

patch("class-cfb-form-post-type.php", [
  [
    "'admin_email'          => '',",
    "'admin_email'              => '',\n\t\t\t'send_confirmation_email'    => false,\n\t\t\t'confirmation_subject'       => '',\n\t\t\t'confirmation_body'          => '',",
  ],
]);

patch("class-cfb-admin-builder.php", [
  [
    `\t\t<p class="cfb-admin-email-row">
\t\t\t<label for="cfb_admin_email"><?php esc_html_e( 'Notification email address', 'custom-form-builder' ); ?></label>
\t\t\t<input type="email" id="cfb_admin_email" name="cfb_settings[admin_email]" class="widefat" value="<?php echo esc_attr( isset( $settings['admin_email'] ) ? $settings['admin_email'] : '' ); ?>" placeholder="<?php echo esc_attr( get_option( 'admin_email' ) ); ?>" />
\t\t\t<span class="description"><?php esc_html_e( 'Leave empty to use the site admin email.', 'custom-form-builder' ); ?></span>
\t\t</p>`,
    `\t\t<p class="cfb-admin-email-row">
\t\t\t<label for="cfb_admin_email"><?php esc_html_e( 'Notification email address', 'custom-form-builder' ); ?></label>
\t\t\t<input type="email" id="cfb_admin_email" name="cfb_settings[admin_email]" class="widefat" value="<?php echo esc_attr( isset( $settings['admin_email'] ) ? $settings['admin_email'] : '' ); ?>" placeholder="<?php echo esc_attr( get_option( 'admin_email' ) ); ?>" />
\t\t\t<span class="description"><?php esc_html_e( 'Leave empty to use the site admin email.', 'custom-form-builder' ); ?></span>
\t\t</p>
\t\t<p>
\t\t\t<label><input type="checkbox" name="cfb_settings[send_confirmation_email]" value="1" <?php checked( ! empty( $settings['send_confirmation_email'] ) ); ?> /> <?php esc_html_e( 'Send branded confirmation email to submitter', 'custom-form-builder' ); ?></label>
\t\t</p>
\t\t<p>
\t\t\t<label for="cfb_confirmation_subject"><?php esc_html_e( 'Confirmation email subject (optional)', 'custom-form-builder' ); ?></label>
\t\t\t<input type="text" id="cfb_confirmation_subject" name="cfb_settings[confirmation_subject]" class="widefat" value="<?php echo esc_attr( isset( $settings['confirmation_subject'] ) ? $settings['confirmation_subject'] : '' ); ?>" placeholder="<?php esc_attr_e( 'e.g. Your Salonora demo request', 'custom-form-builder' ); ?>" />
\t\t</p>`,
  ],
]);

console.log("All form email patches applied.");
