<?php
/**
 * Align WP Mail SMTP Pro defaults for Salonora form mail.
 * Run from WP root: php fix-wp-mail-smtp-salonora.php
 */
require __DIR__ . '/wp-load.php';

$smtp = get_option('wp_mail_smtp');
if (!is_array($smtp)) {
    fwrite(STDERR, "wp_mail_smtp option missing\n");
    exit(1);
}

if (!isset($smtp['mail']) || !is_array($smtp['mail'])) {
    $smtp['mail'] = [];
}

$changed = false;
$mail = &$smtp['mail'];

if (($mail['from_email'] ?? '') !== 'hi@salonora.eu') {
    $mail['from_email'] = 'hi@salonora.eu';
    $changed = true;
}
if (($mail['from_name'] ?? '') !== 'Salonora') {
    $mail['from_name'] = 'Salonora';
    $changed = true;
}
if (empty($mail['from_email_force'])) {
    $mail['from_email_force'] = true;
    $changed = true;
}
if (empty($mail['from_name_force'])) {
    $mail['from_name_force'] = true;
    $changed = true;
}

if ($changed) {
    update_option('wp_mail_smtp', $smtp);
    echo "Updated wp_mail_smtp: from=hi@salonora.eu, name=Salonora, force=on\n";
} else {
    echo "wp_mail_smtp already aligned\n";
}

echo "mailer: " . ($mail['mailer'] ?? '?') . "\n";
echo "\nDNS required for delivery (salonora.eu has DMARC p=reject, no SPF today):\n";
echo "  SPF TXT @: v=spf1 include:_spf.google.com ~all\n";
echo "  DKIM: add Google Workspace DKIM TXT from Admin > Apps > Google Workspace > Gmail > Authenticate email\n";
echo "  DMARC: keep v=DMARC1; p=reject only after SPF+DKIM pass\n";
