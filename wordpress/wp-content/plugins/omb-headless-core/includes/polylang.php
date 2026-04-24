<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Ensure Polylang offers translation support for custom content.
 */
add_filter('pll_get_post_types', function ($post_types, $is_settings) {
    $post_types['service'] = 'service';
    return $post_types;
}, 10, 2);

add_filter('pll_get_taxonomies', function ($taxonomies, $is_settings) {
    $taxonomies['service_category'] = 'service_category';
    return $taxonomies;
}, 10, 2);

/**
 * Helper: return language info for REST and frontend use.
 */
function omb_get_available_languages(): array {
    if (!function_exists('pll_languages_list')) {
        return [];
    }

    $languages = [];
    foreach (pll_languages_list(['fields' => []]) as $slug) {
        $languages[] = [
            'slug'   => $slug,
            'locale' => function_exists('pll_current_language') ? pll_current_language('locale') : '',
            'home'   => function_exists('pll_home_url') ? pll_home_url($slug) : home_url('/'),
        ];
    }

    return $languages;
}
