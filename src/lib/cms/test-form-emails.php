<?php
/**
 * Send test branded emails (admin + confirmation) via wp_mail.
 * Usage: php test-form-emails.php [lang]
 */
require __DIR__ . '/wp-load.php';

$lang = isset($argv[1]) && $argv[1] === 'en' ? 'en' : 'nl';
$to = 'hi@salonora.eu';

if (!class_exists('CFB_Email_Template')) {
    fwrite(STDERR, "CFB_Email_Template missing\n");
    exit(1);
}

$headers = CFB_Email_Template::mail_headers();
$table = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;"><tr><th style="padding:8px;background:#ebf3fe;">Test</th><td style="padding:8px;">OK</td></tr></table>';

$admin_html = CFB_Email_Template::admin_notification_html('Demo Request Form (test)', $table, $lang);
$admin_subject = $lang === 'en' ? '[Salonora] Test admin notification' : '[Salonora] Test admin notificatie';

$confirm_html = CFB_Email_Template::confirmation_html($lang, ['first_name' => 'Test']);
$confirm_subject = $lang === 'en' ? 'Test: Your Salonora demo request' : 'Test: Je Salonora demo-aanvraag';

$r1 = wp_mail($to, $admin_subject, $admin_html, $headers);
$r2 = wp_mail($to, $confirm_subject, $confirm_html, $headers);

echo "lang={$lang}\n";
echo "headers From: " . implode(' | ', $headers) . "\n";
echo "admin wp_mail: " . ($r1 ? 'ok' : 'fail') . "\n";
echo "confirm wp_mail: " . ($r2 ? 'ok' : 'fail') . "\n";
