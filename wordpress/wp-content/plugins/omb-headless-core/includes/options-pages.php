<?php
if (!defined('ABSPATH')) {
    exit;
}

add_action('acf/init', function () {
    if (!function_exists('acf_add_options_page')) {
        return;
    }

    acf_add_options_page([
        'page_title' => 'Global Settings',
        'menu_title' => 'Global Settings',
        'menu_slug'  => 'omb-global-settings',
        'capability' => 'edit_posts',
        'redirect'   => true,
        'position'   => 30,
        'icon_url'   => 'dashicons-admin-generic',
    ]);

    acf_add_options_sub_page([
        'page_title'  => 'Site Settings',
        'menu_title'  => 'Site Settings',
        'parent_slug' => 'omb-global-settings',
        'menu_slug'   => 'omb-site-settings',
    ]);

    acf_add_options_sub_page([
        'page_title'  => 'Header Settings',
        'menu_title'  => 'Header Settings',
        'parent_slug' => 'omb-global-settings',
        'menu_slug'   => 'omb-header-settings',
    ]);

    acf_add_options_sub_page([
        'page_title'  => 'Footer Settings',
        'menu_title'  => 'Footer Settings',
        'parent_slug' => 'omb-global-settings',
        'menu_slug'   => 'omb-footer-settings',
    ]);

    acf_add_options_sub_page([
        'page_title'  => 'Contact & Social',
        'menu_title'  => 'Contact & Social',
        'parent_slug' => 'omb-global-settings',
        'menu_slug'   => 'omb-contact-social',
    ]);

    acf_add_options_sub_page([
        'page_title'  => 'Default SEO',
        'menu_title'  => 'Default SEO',
        'parent_slug' => 'omb-global-settings',
        'menu_slug'   => 'omb-default-seo',
    ]);

    acf_add_options_sub_page([
        'page_title'  => 'Integrations',
        'menu_title'  => 'Integrations',
        'parent_slug' => 'omb-global-settings',
        'menu_slug'   => 'omb-integrations',
    ]);
});
