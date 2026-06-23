<?php
require __DIR__ . '/wp-load.php';

$form_id = 73844;
$frontend = CFB_Frontend::instance();

// Load field ids from form
$fields = CFB_Form_Post_Type::get_form_fields($form_id);
$flat = CFB_Form_Post_Type::get_flattened_fields($fields);
$by_name = [];
foreach ($flat as $f) {
    if (!empty($f['name']) && !empty($f['id'])) {
        $by_name[$f['name']] = $f['id'];
    }
}

$cfb = [];
if (isset($by_name['first_name'])) $cfb[$by_name['first_name']] = 'Email';
if (isset($by_name['last_name'])) $cfb[$by_name['last_name']] = 'Test';
if (isset($by_name['email'])) $cfb[$by_name['email']] = 'hi@salonora.eu';
if (isset($by_name['phone'])) $cfb[$by_name['phone']] = '0612345678';
if (isset($by_name['salon_type'])) $cfb[$by_name['salon_type']] = 'hair_salon';
if (isset($by_name['do_you_have_any_current_website'])) $cfb[$by_name['do_you_have_any_current_website']] = 'no';

$visible = array_keys($cfb);
$lang = isset($argv[1]) && $argv[1] === 'nl' ? 'nl' : 'en';
$meta = ['lang' => $lang];

$result = $frontend->process_form_submission($form_id, $cfb, $visible, [], 0, $meta);
if (is_wp_error($result)) {
    echo "FAIL: " . $result->get_error_message() . "\n";
    exit(1);
}
echo "lang={$lang} submit ok\n";
echo "message: " . ($result['message'] ?? '') . "\n";
$s = CFB_Form_Post_Type::get_form_settings($form_id);
echo "admin_email: " . ($s['admin_email'] ?? '') . "\n";
echo "confirmation: " . (!empty($s['send_confirmation_email']) ? 'on' : 'off') . "\n";
