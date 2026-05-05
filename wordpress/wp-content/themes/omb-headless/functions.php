<?php
if (!defined('ABSPATH')) {
    exit;
}

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('menus');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script']);

    register_nav_menus([
        'primary' => __('Primary Menu', 'omb-headless'),
        'footer'  => __('Footer Menu', 'omb-headless'),
        'legal'   => __('Legal Menu', 'omb-headless'),
    ]);
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('omb-headless-style', get_stylesheet_uri(), [], wp_get_theme()->get('Version'));
});

/**
 * Keep ACF Local JSON inside the theme for easy sync/import.
 * Docs: https://www.advancedcustomfields.com/resources/local-json/
 */
add_filter('acf/settings/save_json', function ($path) {
    return get_stylesheet_directory() . '/acf-json';
});

add_filter('acf/settings/load_json', function ($paths) {
    $paths[] = get_stylesheet_directory() . '/acf-json';
    return $paths;
});
