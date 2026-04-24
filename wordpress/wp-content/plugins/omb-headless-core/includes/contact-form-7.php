<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Starter endpoint to list basic Contact Form 7 forms for embedding/reference.
 * Submission can continue to use Contact Form 7's own REST/AJAX flow from Next.js later.
 */
add_action('rest_api_init', function () {
    register_rest_route('omb-headless/v1', '/forms', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'omb_rest_get_contact_forms',
    ]);
});

function omb_rest_get_contact_forms(WP_REST_Request $request): WP_REST_Response {
    if (!post_type_exists('wpcf7_contact_form')) {
        return new WP_REST_Response([
            'enabled' => false,
            'message' => 'Contact Form 7 is not active.',
        ]);
    }

    $forms = get_posts([
        'post_type'      => 'wpcf7_contact_form',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'orderby'        => 'title',
        'order'          => 'ASC',
    ]);

    $payload = array_map(function ($form) {
        return [
            'id'       => $form->ID,
            'title'    => get_the_title($form),
            'shortcode'=> sprintf('[contact-form-7 id="%d" title="%s"]', $form->ID, esc_attr(get_the_title($form))),
        ];
    }, $forms);

    return new WP_REST_Response([
        'enabled' => true,
        'forms'   => $payload,
    ]);
}
