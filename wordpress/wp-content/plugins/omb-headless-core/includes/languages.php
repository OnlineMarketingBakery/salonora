<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Normalize Polylang language list entries to slug strings.
 *
 * @param mixed $item
 */
function omb_normalize_language_slug($item): string {
    if (is_string($item)) {
        return $item;
    }
    if (is_array($item) && !empty($item['slug']) && is_string($item['slug'])) {
        return $item['slug'];
    }
    if (is_object($item) && !empty($item->slug) && is_string($item->slug)) {
        return $item->slug;
    }
    return '';
}

/**
 * Headless primary language slug (no URL prefix on Next.js). ACF Site Settings, then Polylang default, then nl.
 */
function omb_get_primary_language_slug(): string {
    if (function_exists('get_field')) {
        $slug = get_field('headless_primary_language', 'option');
        if (is_string($slug) && $slug !== '') {
            return $slug;
        }
        $slug = get_field('headless_primary_language', 'omb-site-settings');
        if (is_string($slug) && $slug !== '') {
            return $slug;
        }
    }
    if (function_exists('pll_default_language')) {
        $def = pll_default_language('slug');
        if (is_string($def) && $def !== '') {
            return $def;
        }
    }
    return 'nl';
}

/**
 * URL path prefix for a language on the Next.js frontend (null = primary, no prefix).
 */
function omb_get_language_url_prefix(string $slug): ?string {
    return $slug === omb_get_primary_language_slug() ? null : $slug;
}

/**
 * Polylang locale string for a language slug.
 */
function omb_get_language_locale(string $slug): string {
    if (function_exists('PLL') && isset(PLL()->model)) {
        $lang = PLL()->model->get_language($slug);
        if ($lang && !empty($lang->locale)) {
            return (string) $lang->locale;
        }
    }
    return $slug;
}

/**
 * Language list for REST / frontend (Polylang when active).
 *
 * @return list<array{slug: string, locale: string, home: string, url_prefix: string|null, is_primary: bool}>
 */
function omb_get_available_languages(): array {
    if (!function_exists('pll_languages_list')) {
        return [];
    }

    $primary = omb_get_primary_language_slug();
    $languages = [];
    $raw_list = pll_languages_list(['fields' => 'slug']);

    if (!is_array($raw_list)) {
        return [];
    }

    foreach ($raw_list as $item) {
        $slug = omb_normalize_language_slug($item);
        if ($slug === '') {
            continue;
        }
        $languages[] = [
            'slug'       => $slug,
            'locale'     => omb_get_language_locale($slug),
            'home'       => function_exists('pll_home_url') ? pll_home_url($slug) : home_url('/'),
            'url_prefix' => omb_get_language_url_prefix($slug),
            'is_primary' => $slug === $primary,
        ];
    }

    return $languages;
}
