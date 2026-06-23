<?php
/**
 * Fix demo form email settings: admin recipient, confirmation, remove legacy addresses.
 * Run from WP root: php wp-content/omb-cms/fix-demo-form-emails.php
 */
if (!defined('ABSPATH')) {
    $candidates = [
        __DIR__ . '/wp-load.php',
        dirname(__DIR__) . '/wp-load.php',
    ];
    $wp_load = null;
    foreach ($candidates as $candidate) {
        if (is_file($candidate)) {
            $wp_load = $candidate;
            break;
        }
    }
    if (!$wp_load) {
        fwrite(STDERR, "wp-load.php not found\n");
        exit(1);
    }
    require_once $wp_load;
}

if (!class_exists('CFB_Form_Post_Type')) {
    fwrite(STDERR, "OMB Form Builder not loaded\n");
    exit(1);
}

const SALONORA_FORM_ADMIN_EMAIL = 'hi@salonora.eu';
const LEGACY_RECIPIENTS = [
    'tanjil@onlinemarketingbakery.nl',
    'tanjil@onlinemarketingbakery.nl',
];

$forms = get_posts([
    'post_type'      => 'cfb_form',
    'post_status'    => ['publish', 'draft', 'private'],
    'posts_per_page' => -1,
    'fields'         => 'ids',
]);

$updated = 0;
foreach ($forms as $form_id) {
    $post = get_post($form_id);
    if (!$post) {
        continue;
    }

    $settings = CFB_Form_Post_Type::get_form_settings($form_id);
    $changed  = false;
    $title    = strtolower($post->post_title);
    $is_demo  = strpos($title, 'demo') !== false || strpos($title, 'request') !== false;

    $admin = isset($settings['admin_email']) ? strtolower(trim((string) $settings['admin_email'])) : '';
    if ($admin === '' || in_array($admin, array_map('strtolower', LEGACY_RECIPIENTS), true) || strpos($admin, 'onlinemarketingbakery') !== false) {
        $settings['admin_email'] = SALONORA_FORM_ADMIN_EMAIL;
        $changed = true;
    }

    if ($is_demo && empty($settings['send_confirmation_email'])) {
        $settings['send_confirmation_email'] = true;
        $changed = true;
    }

    if ($changed) {
        CFB_Form_Post_Type::save_form_settings($form_id, $settings);
        echo "Updated form #{$form_id} ({$post->post_title}): admin=" . $settings['admin_email'];
        echo !empty($settings['send_confirmation_email']) ? ', confirmation=on' : '';
        echo "\n";
        $updated++;
    } else {
        echo "Skipped form #{$form_id} ({$post->post_title}) — already correct\n";
    }
}

// DB sweep for serialized tanjil in _cfb_settings.
global $wpdb;
$like = '%tanjil@onlinemarketingbakery.nl%';
$rows = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT post_id, meta_value FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value LIKE %s",
        '_cfb_settings',
        $like
    )
);
foreach ($rows as $row) {
    $settings = maybe_unserialize($row->meta_value);
    if (!is_array($settings)) {
        continue;
    }
    $settings['admin_email'] = SALONORA_FORM_ADMIN_EMAIL;
    if (!isset($settings['send_confirmation_email']) || !$settings['send_confirmation_email']) {
        $settings['send_confirmation_email'] = true;
    }
    update_post_meta((int) $row->post_id, '_cfb_settings', $settings);
    echo "DB sweep updated post_meta for form #{$row->post_id}\n";
    $updated++;
}

echo "Done. {$updated} form(s) updated.\n";
