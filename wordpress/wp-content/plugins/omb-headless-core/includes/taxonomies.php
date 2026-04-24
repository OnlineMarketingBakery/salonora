<?php
if (!defined('ABSPATH')) {
    exit;
}

function omb_register_taxonomies(): void {
    register_taxonomy('service_category', ['service'], [
        'labels' => [
            'name'          => __('Service Categories', 'omb-headless-core'),
            'singular_name' => __('Service Category', 'omb-headless-core'),
        ],
        'public'            => true,
        'hierarchical'      => true,
        'show_in_rest'      => true,
        'show_admin_column' => true,
        'rewrite'           => ['slug' => 'service-category', 'with_front' => false],
    ]);
}
add_action('init', 'omb_register_taxonomies');
