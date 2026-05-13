<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Language list for REST / frontend (Polylang when active).
 *
 * @return list<array{slug: string, locale: string, home: string}>
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
