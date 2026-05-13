<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Ensure Polylang offers translation support for custom content.
 */
add_filter('pll_get_post_types', function ($post_types, $is_settings) {
    $post_types['service'] = 'service';
    $post_types['case_study'] = 'case_study';
    return $post_types;
}, 10, 2);

add_filter('pll_get_taxonomies', function ($taxonomies, $is_settings) {
    $taxonomies['service_category'] = 'service_category';
    return $taxonomies;
}, 10, 2);
