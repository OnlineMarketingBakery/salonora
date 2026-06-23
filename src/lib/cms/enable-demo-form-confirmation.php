<?php
/**
 * Enable branded confirmation emails on published demo request forms.
 * Run from WP root: php -r "require 'wp-load.php'; require 'wp-content/plugins/omb-form-builder/includes/class-cfb-form-post-type.php'; ..."
 * Or upload and: php enable-demo-form-confirmation.php
 */
if (!defined('ABSPATH')) {
    require_once __DIR__ . '/wp-load.php';
}

if (!class_exists('CFB_Form_Post_Type')) {
    fwrite(STDERR, "OMB Form Builder not loaded\n");
    exit(1);
}

$forms = get_posts([
    'post_type'      => 'cfb_form',
    'post_status'    => 'publish',
    'posts_per_page' => -1,
    'fields'         => 'ids',
]);

$enabled = 0;
foreach ($forms as $form_id) {
    $post = get_post($form_id);
    if (!$post) {
        continue;
    }
    $title = strtolower($post->post_title);
    if (strpos($title, 'demo') === false && strpos($title, 'request') === false) {
        continue;
    }
    $settings = CFB_Form_Post_Type::get_form_settings($form_id);
    $settings['send_confirmation_email'] = true;
    CFB_Form_Post_Type::save_form_settings($form_id, $settings);
    echo "Enabled confirmation for form #{$form_id} ({$post->post_title})\n";
    $enabled++;
}

if ($enabled === 0) {
    echo "No demo forms matched by title; enabling on all published cfb_form posts.\n";
    foreach ($forms as $form_id) {
        $settings = CFB_Form_Post_Type::get_form_settings($form_id);
        $settings['send_confirmation_email'] = true;
        CFB_Form_Post_Type::save_form_settings($form_id, $settings);
        $post = get_post($form_id);
        echo "Enabled confirmation for form #{$form_id} (" . ($post->post_title ?? '') . ")\n";
    }
}
