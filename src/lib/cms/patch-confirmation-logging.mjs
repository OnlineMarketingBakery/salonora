import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.."),
  "wordpress/wp-content/plugins/omb-form-builder/includes/class-cfb-frontend.php"
);

let t = fs.readFileSync(file, "utf8");

const oldBlock = `\t\t\t// Branded confirmation to submitter (optional per form).
\t\t\t$send_confirmation = ! empty( $settings['send_confirmation_email'] );
\t\t\tif ( $send_confirmation && class_exists( 'CFB_Email_Template' ) ) {
\t\t\t\t$submitter = CFB_Email_Template::find_submitter_email( $form_id, $entry_data );
\t\t\t\tif ( $submitter !== '' ) {
\t\t\t\t\t$first_name = CFB_Email_Template::find_entry_value_by_name( $form_id, $entry_data, 'first_name' );
\t\t\t\t\t$custom_body = isset( $settings['confirmation_body'] ) ? trim( (string) $settings['confirmation_body'] ) : '';
\t\t\t\t\tif ( $custom_body !== '' ) {
\t\t\t\t\t\t$custom_body = str_replace( '{first_name}', esc_html( $first_name ), $custom_body );
\t\t\t\t\t\t$confirm_html = CFB_Email_Template::wrap(
\t\t\t\t\t\t\tarray(
\t\t\t\t\t\t\t\t'title'     => $lang === 'en' ? 'Thank you!' : 'Bedankt!',
\t\t\t\t\t\t\t\t'body_html' => $custom_body,
\t\t\t\t\t\t\t)
\t\t\t\t\t\t);
\t\t\t\t\t} else {
\t\t\t\t\t\t$confirm_html = CFB_Email_Template::confirmation_html( $lang, array( 'first_name' => $first_name ) );
\t\t\t\t\t}
\t\t\t\t\t$confirm_subject = isset( $settings['confirmation_subject'] ) ? trim( (string) $settings['confirmation_subject'] ) : '';
\t\t\t\t\tif ( $confirm_subject === '' ) {
\t\t\t\t\t\t$confirm_subject = $lang === 'en' ? 'Your Salonora demo request' : 'Je Salonora demo-aanvraag';
\t\t\t\t\t}
\t\t\t\t\twp_mail( $submitter, $confirm_subject, $confirm_html, $headers );
\t\t\t\t}
\t\t\t}`;

const newBlock = `\t\t\t// Branded confirmation to submitter (optional per form).
\t\t\t$send_confirmation = ! empty( $settings['send_confirmation_email'] );
\t\t\tif ( $send_confirmation && class_exists( 'CFB_Email_Template' ) ) {
\t\t\t\t$submitter = CFB_Email_Template::find_submitter_email( $form_id, $entry_data );
\t\t\t\tif ( $submitter === '' ) {
\t\t\t\t\tif ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
\t\t\t\t\t\terror_log( sprintf( '[CFB] Confirmation skipped for form %d: no submitter email in entry.', (int) $form_id ) );
\t\t\t\t\t}
\t\t\t\t} else {
\t\t\t\t\t$first_name = CFB_Email_Template::find_entry_value_by_name( $form_id, $entry_data, 'first_name' );
\t\t\t\t\t$custom_body = isset( $settings['confirmation_body'] ) ? trim( (string) $settings['confirmation_body'] ) : '';
\t\t\t\t\tif ( $custom_body !== '' ) {
\t\t\t\t\t\t$custom_body = str_replace( '{first_name}', esc_html( $first_name ), $custom_body );
\t\t\t\t\t\t$confirm_html = CFB_Email_Template::wrap(
\t\t\t\t\t\t\tarray(
\t\t\t\t\t\t\t\t'title'     => $lang === 'en' ? 'Thank you!' : 'Bedankt!',
\t\t\t\t\t\t\t\t'body_html' => $custom_body,
\t\t\t\t\t\t\t)
\t\t\t\t\t\t);
\t\t\t\t\t} else {
\t\t\t\t\t\t$confirm_html = CFB_Email_Template::confirmation_html( $lang, array( 'first_name' => $first_name ) );
\t\t\t\t\t}
\t\t\t\t\t$confirm_subject = isset( $settings['confirmation_subject'] ) ? trim( (string) $settings['confirmation_subject'] ) : '';
\t\t\t\t\tif ( $confirm_subject === '' ) {
\t\t\t\t\t\t$confirm_subject = $lang === 'en' ? 'Your Salonora demo request' : 'Je Salonora demo-aanvraag';
\t\t\t\t\t}
\t\t\t\t\t$confirm_sent = wp_mail( $submitter, $confirm_subject, $confirm_html, $headers );
\t\t\t\t\tif ( ! $confirm_sent && defined( 'WP_DEBUG' ) && WP_DEBUG ) {
\t\t\t\t\t\terror_log( sprintf( '[CFB] Confirmation wp_mail failed for form %d to %s', (int) $form_id, $submitter ) );
\t\t\t\t\t}
\t\t\t\t}
\t\t\t}`;

if (t.includes("Confirmation skipped for form")) {
  console.log("confirmation logging already patched");
} else if (t.includes(oldBlock)) {
  t = t.replace(oldBlock, newBlock);
  fs.writeFileSync(file, t);
  console.log("patched confirmation logging");
} else {
  throw new Error("confirmation block not found");
}
