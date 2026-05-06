<?php
if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    register_rest_route('omb-headless/v1', '/site', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'omb_rest_get_site_payload',
    ]);

    register_rest_route('omb-headless/v1', '/route', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'omb_rest_resolve_route',
        'args'                => [
            'path' => [
                'required'          => true,
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'lang' => [
                'required'          => false,
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ],
    ]);

    register_rest_route('omb-headless/v1', '/globals', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'omb_rest_get_globals',
        'args'                => [
            'lang' => [
                'required'          => false,
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ],
    ]);

    register_rest_route('omb-headless/v1', '/acf-sync', [
        'methods'             => 'POST',
        'permission_callback' => function (WP_REST_Request $request) {
            $secret = $request->get_header('X-Sync-Secret');
            // Try wp_options first, then ACF options field as fallback
            $stored = get_option('omb_revalidation_secret', '');
            if (empty($stored) && function_exists('get_field')) {
                $stored = get_field('revalidation_secret', 'option') ?: '';
            }
            if (empty($stored)) {
                return new WP_Error(
                    'missing_secret',
                    'Sync secret is not configured in WordPress.',
                    ['status' => 500]
                );
            }
            return hash_equals((string) $stored, (string) $secret);
        },
        'callback' => 'omb_rest_acf_sync',
    ]);

    register_rest_route('omb-headless/v1', '/acf-sync-status', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => function () {
            $stored = get_option('omb_revalidation_secret', '');
            if (empty($stored) && function_exists('get_field')) {
                $stored = get_field('revalidation_secret', 'option') ?: '';
            }
            return new WP_REST_Response([
                'route_loaded'  => true,
                'secret_found'  => !empty($stored),
                'secret_length' => strlen($stored),
            ], 200);
        },
    ]);
});

/**
 * ACF option page slugs (must match acf_add_options_sub_page menu_slug values).
 */
function omb_rest_globals_option_slugs(): array {
    return [
        'header'         => 'omb-header-settings',
        'footer'         => 'omb-footer-settings',
        'contact'        => 'omb-contact-social',
        'site'           => 'omb-site-settings',
        'integrations'   => 'omb-integrations',
        'defaultSeo'     => 'omb-default-seo',
    ];
}

/**
 * Field names per options page (OMB ACF bundle). Used when values share one ACF
 * options post_id ("option" / "options") instead of the menu_slug.
 *
 * @return array<string, list<string>>
 */
function omb_rest_globals_field_keys_by_menu_slug(): array {
    return [
        'omb-header-settings' => [
            'header_logo',
            'header_logo_dark',
            'header_style',
            'header_sticky',
            'show_language_switcher',
            'show_header_cta',
            'header_cta_link',
        ],
        'omb-footer-settings' => [
            'footer_title',
            'footer_text',
            'footer_logo',
            'footer_top_shape_image',
            'footer_cta_text',
            'footer_cta_primary_link',
            'footer_cta_secondary_link',
            'footer_cta_2_link',
            'footer_copyright',
            'show_footer_language_switcher',
        ],
        'omb-contact-social' => [
            'main_email',
            'main_phone',
            'address',
            'whatsapp',
            'linkedin_url',
            'instagram_url',
            'facebook_url',
            'youtube_url',
        ],
        'omb-site-settings' => [
            'site_name_override',
            'default_tagline',
            'default_og_image',
            'global_cta_title',
            'global_cta_text',
            'global_cta_link',
            'enable_announcement',
            'announcement_text',
            'announcement_link',
        ],
        'omb-integrations' => [
            'gtm_id',
            'ga4_id',
            'next_frontend_url',
            'revalidation_secret',
            'default_contact_form',
        ],
        'omb-default-seo' => [
            'default_seo_title_pattern',
            'default_seo_description',
            'default_share_image',
            'allow_indexing_by_default',
        ],
    ];
}

/**
 * @param array<string, mixed> $source
 * @param list<string>         $keys
 *
 * @return array<string, mixed>
 */
function omb_rest_globals_pick_keys(array $source, array $keys): array {
    $out = [];
    foreach ($keys as $key) {
        if (array_key_exists($key, $source)) {
            $out[$key] = $source[$key];
        }
    }
    return $out;
}

/**
 * ACF resolves options storage post_id per page; subpages often default to "option" / "options".
 */
function omb_rest_globals_resolve_acf_post_id(string $menu_slug): string {
    if (function_exists('acf_get_options_page')) {
        $page = acf_get_options_page($menu_slug);
        if (is_array($page) && !empty($page['post_id'])) {
            return (string) $page['post_id'];
        }
    }
    return $menu_slug;
}

/**
 * @return array<string, mixed>|false
 */
function omb_rest_globals_get_fields_for_post_id(string $post_id) {
    return get_fields($post_id);
}

/**
 * Load globals. ACF sub-options often share post_id "option" or "options" (not the menu_slug), so try those
 * first and partition by field name. Otherwise load each page's resolved post_id (or menu_slug).
 *
 * @return array<string, array<string, mixed>>
 */
function omb_rest_globals_collect_fields(): array {
    $response_keys = omb_rest_globals_option_slugs();
    $keys_by_slug = omb_rest_globals_field_keys_by_menu_slug();
    $out = [];

    foreach (['option', 'options'] as $bucket) {
        $flat = omb_rest_globals_get_fields_for_post_id($bucket);
        if (!is_array($flat) || $flat === []) {
            continue;
        }
        foreach ($response_keys as $response_key => $menu_slug) {
            $names = $keys_by_slug[$menu_slug] ?? [];
            $out[$response_key] = omb_rest_globals_pick_keys($flat, $names);
        }
        return $out;
    }

    foreach ($response_keys as $response_key => $menu_slug) {
        $names = $keys_by_slug[$menu_slug] ?? [];
        $candidates = array_unique(
            array_filter(
                [
                    omb_rest_globals_resolve_acf_post_id($menu_slug),
                    $menu_slug,
                ],
                static function ($id) {
                    return $id !== '' && $id !== 'option' && $id !== 'options';
                }
            )
        );
        $chunk = [];
        foreach ($candidates as $post_id) {
            $fields = omb_rest_globals_get_fields_for_post_id($post_id);
            if (is_array($fields) && $fields !== []) {
                $chunk = $names ? omb_rest_globals_pick_keys($fields, $names) : $fields;
                break;
            }
        }
        $out[$response_key] = $chunk;
    }

    return $out;
}

/**
 * Expose ACF global option groups for headless frontends when the ACF REST namespace
 * is unavailable (common). Uses get_fields() server-side so image fields include URLs.
 */
function omb_rest_get_globals(WP_REST_Request $request): WP_REST_Response {
    if (!function_exists('get_fields')) {
        return new WP_REST_Response(
            ['error' => 'acf_inactive', 'message' => 'Advanced Custom Fields is required for globals.'],
            503
        );
    }

    $lang = (string) $request->get_param('lang');
    if ($lang !== '' && function_exists('PLL')) {
        $pll = PLL();
        if ($pll && is_callable([$pll, 'switch_language'])) {
            $pll->switch_language($lang);
        } elseif ($pll && isset($pll->model) && is_object($pll->model)) {
            $pll_lang = $pll->model->get_language($lang);
            if ($pll_lang) {
                $pll->curlang = $pll_lang;
            }
        }
    }

    $out = omb_rest_globals_collect_fields();

    return new WP_REST_Response($out, 200);
}

function omb_rest_get_site_payload(WP_REST_Request $request): WP_REST_Response {
    return new WP_REST_Response([
        'name' => get_bloginfo('name'),
        'description' => get_bloginfo('description'),
        'url' => home_url('/'),
        'languages' => omb_get_available_languages(),
        'menus' => [
            'primary' => has_nav_menu('primary'),
            'footer' => has_nav_menu('footer'),
            'legal' => has_nav_menu('legal'),
        ],
    ]);
}

function omb_rest_resolve_route(WP_REST_Request $request): WP_REST_Response {
    $raw_path = trim((string) $request->get_param('path'), '/');
    $lang = (string) $request->get_param('lang');

    $query = new WP_Query([
        'name'              => basename($raw_path),
        'post_type'         => ['page', 'post', 'service'],
        'post_status'       => 'publish',
        'posts_per_page'    => 1,
        'no_found_rows'     => true,
        'suppress_filters'  => false,
        'lang'              => $lang ?: '',
    ]);

    if (!$query->have_posts()) {
        return new WP_REST_Response(['found' => false], 404);
    }

    $post = $query->posts[0];
    $translations = [];

    if (function_exists('pll_get_post_translations')) {
        foreach (pll_get_post_translations($post->ID) as $translation_lang => $translation_id) {
            $translations[] = [
                'lang' => $translation_lang,
                'id'   => $translation_id,
                'uri'  => get_permalink($translation_id),
            ];
        }
    }

    return new WP_REST_Response([
        'found'        => true,
        'id'           => $post->ID,
        'type'         => get_post_type($post),
        'slug'         => $post->post_name,
        'uri'          => get_permalink($post),
        'lang'         => function_exists('pll_get_post_language') ? pll_get_post_language($post->ID, 'slug') : null,
        'translations' => $translations,
    ]);
}

function omb_rest_acf_sync(WP_REST_Request $request): WP_REST_Response {
    if (!function_exists('acf_import_field_group')) {
        return new WP_REST_Response(
            ['error' => 'acf_inactive', 'message' => 'ACF is required.'],
            503
        );
    }

    $groups = $request->get_json_params();

    if (!is_array($groups) || empty($groups)) {
        return new WP_REST_Response(
            ['error' => 'invalid_payload', 'message' => 'Expected a JSON array of field groups.'],
            400
        );
    }

    $imported = 0;
    foreach ($groups as $group) {
        acf_import_field_group($group);
        $imported++;
    }

    return new WP_REST_Response(['success' => true, 'imported' => $imported], 200);
}
