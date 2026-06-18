<?php
if (!defined('ABSPATH')) {
    exit;
}
require_once __DIR__ . '/languages.php';

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

    register_rest_route('omb-headless/v1', '/reading', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'omb_rest_get_reading',
        'args'                => [
            'lang' => [
                'required'          => false,
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ],
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
        'templates'      => 'omb-templates-settings',
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
            'footer_background_image',
            'footer_background_color',
            'footer_background_gradient',
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
            'headless_primary_language',
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
        'omb-templates-settings' => [
            'blog_single_sections',
            'show_related_posts',
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
 * Merge every `footer_*` key from the flat options array into the footer chunk.
 * New ACF fields are included even if this plugin's allowlist was not redeployed yet.
 *
 * @param array<string, mixed> $flat
 * @param array<string, mixed> $footer_chunk
 *
 * @return array<string, mixed>
 */
function omb_rest_globals_merge_footer_keys_from_flat(array $flat, array $footer_chunk): array {
    foreach ($flat as $key => $value) {
        if (is_string($key) && strpos($key, 'footer_') === 0) {
            $footer_chunk[$key] = $value;
        }
    }
    return $footer_chunk;
}

/**
 * Resolve attachment IDs / incomplete image arrays to absolute URLs for headless apps.
 *
 * @param array<string, mixed> $footer
 */
function omb_rest_normalize_footer_image_urls(array &$footer): void {
    $keys = ['footer_background_image', 'footer_top_shape_image', 'footer_logo'];
    foreach ($keys as $key) {
        if (!array_key_exists($key, $footer)) {
            continue;
        }
        $v = $footer[$key];
        $id = 0;
        if (is_numeric($v)) {
            $id = (int) $v;
        } elseif (is_array($v)) {
            $has_url = !empty($v['url']) && is_string($v['url']) && $v['url'] !== '' && $v['url'] !== 'false';
            if ($has_url) {
                $url_str = (string) $v['url'];
                if ($url_str !== '' && $url_str[0] === '/' && strncmp($url_str, '//', 2) !== 0) {
                    $footer[$key] = array_merge($v, ['url' => home_url($url_str)]);
                }
                continue;
            }
            if (!empty($v['ID'])) {
                $id = (int) $v['ID'];
            } elseif (!empty($v['id'])) {
                $id = (int) $v['id'];
            }
        }
        if ($id <= 0 || !function_exists('wp_get_attachment_image_url')) {
            continue;
        }
        $url = wp_get_attachment_image_url($id, 'full');
        if (!$url) {
            continue;
        }
        if (is_array($v)) {
            $footer[$key] = array_merge($v, ['url' => $url, 'ID' => $id, 'id' => $id]);
        } else {
            $footer[$key] = ['url' => $url, 'ID' => $id, 'id' => $id];
        }
    }
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
    if (!function_exists('get_fields')) {
        return false;
    }

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
            $chunk = omb_rest_globals_pick_keys($flat, $names);
            if ($response_key === 'footer') {
                $chunk = omb_rest_globals_merge_footer_keys_from_flat($flat, $chunk);
            }
            $out[$response_key] = $chunk;
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
                if ($response_key === 'footer') {
                    $chunk = omb_rest_globals_merge_footer_keys_from_flat($fields, $chunk);
                }
                break;
            }
        }
        $out[$response_key] = $chunk;
    }

    return $out;
}

/**
 * Match Polylang language for REST callbacks (Reading, globals, etc.).
 */
function omb_rest_switch_polylang_lang(?string $lang): void {
    if ($lang === null || $lang === '') {
        return;
    }
    if (!function_exists('PLL')) {
        return;
    }
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

/**
 * Settings ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Reading: static front page slug for the active (switched) language.
 *
 * @return array{show_on_front: string, homepage_slug: string|null}
 */
function omb_rest_reading_home_payload(): array {
    $show = (string) get_option('show_on_front');
    if ($show !== 'page') {
        return [
            'show_on_front'   => $show,
            'homepage_slug'   => null,
        ];
    }
    $page_id = (int) get_option('page_on_front');
    if ($page_id <= 0) {
        return [
            'show_on_front'   => $show,
            'homepage_slug'   => null,
        ];
    }
    $post = get_post($page_id);
    if (!$post || $post->post_type !== 'page' || $post->post_status !== 'publish') {
        return [
            'show_on_front'   => $show,
            'homepage_slug'   => null,
        ];
    }

    return [
        'show_on_front' => $show,
        'homepage_slug' => $post->post_name,
    ];
}

function omb_rest_get_reading(WP_REST_Request $request): WP_REST_Response {
    $lang = (string) $request->get_param('lang');
    omb_rest_switch_polylang_lang($lang !== '' ? $lang : null);

    return new WP_REST_Response(omb_rest_reading_home_payload(), 200);
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
    omb_rest_switch_polylang_lang($lang !== '' ? $lang : null);

    $out = omb_rest_globals_collect_fields();
    $out['reading'] = omb_rest_reading_home_payload();

    if (!empty($out['footer']) && is_array($out['footer'])) {
        omb_rest_normalize_footer_image_urls($out['footer']);
    }

    return new WP_REST_Response($out, 200);
}

function omb_rest_get_site_payload(WP_REST_Request $request): WP_REST_Response {
    return new WP_REST_Response([
        'name' => get_bloginfo('name'),
        'description' => get_bloginfo('description'),
        'url' => home_url('/'),
        'primary_language' => omb_get_primary_language_slug(),
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
        'post_type'         => ['page', 'post', 'service', 'case_study'],
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

function omb_rest_user_plain_bio(string $html): string {
    return trim(wp_strip_all_tags($html));
}

/** Sanitize optional author social URL for REST JSON. */
function omb_rest_author_social_url(string $raw): string {
    $t = trim($raw);
    if ($t === '' || $t === '#') {
        return '';
    }
    $u = esc_url_raw($t);
    if (is_string($u) && $u !== '') {
        return $u;
    }

    return '';
}

/**
 * First non-empty user meta string among common keys (ACF / profile field names vary).
 *
 * @param list<string> $keys
 */
function omb_rest_user_meta_first_string(int $user_id, array $keys): string {
    foreach ($keys as $key) {
        if (!is_string($key) || $key === '') {
            continue;
        }
        $v = get_user_meta($user_id, $key, true);
        if (is_string($v)) {
            $t = trim($v);
            if ($t !== '') {
                return $t;
            }
        }
    }

    return '';
}

/**
 * @return string HTML or plain bio (same shape as `description` in REST)
 */
function omb_rest_user_description_for_lang(int $user_id, string $lang_slug): string {
    $slug = sanitize_key($lang_slug);
    if ($slug === '') {
        return '';
    }

    omb_rest_switch_polylang_lang($slug);

    $read = static function (int $uid, string $meta_key): string {
        $v = get_user_meta($uid, $meta_key, true);
        return is_string($v) ? $v : '';
    };

    $suffixes = [$slug];
    if (function_exists('PLL') && isset(PLL()->model)) {
        $lang_obj = PLL()->model->get_language($slug);
        if ($lang_obj && !empty($lang_obj->locale)) {
            $loc = (string) $lang_obj->locale;
            $suffixes[] = strtolower(str_replace('-', '_', $loc));
            $suffixes[] = $loc;
        }
    }
    $suffixes = array_values(array_unique(array_filter($suffixes)));

    // Prefer locale-specific keys first: default `description` often holds English while Polylang
    // stores Nederlands in `description_nl` / `description_nl_nl` ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â so `?lang=nl` must not stop at English.
    foreach ($suffixes as $suffix) {
        foreach (['description_' . $suffix, 'description-' . $suffix, 'pll_description_' . $suffix] as $key) {
            $raw = $read($user_id, $key);
            if ($raw !== '' && omb_rest_user_plain_bio($raw) !== '') {
                return $raw;
            }
        }
    }

    $fallback = $read($user_id, 'description');
    if ($fallback !== '' && omb_rest_user_plain_bio($fallback) !== '') {
        return $fallback;
    }

    return '';
}

/**
 * @param WP_REST_Response $response
 */

/** Full-size custom author photo URL from user meta (omb_author_avatar_id). */
function omb_rest_user_avatar_url(int $user_id): string {
    if (function_exists('omb_author_avatar_url_for_user')) {
        return omb_author_avatar_url_for_user($user_id);
    }
    $id = (int) get_user_meta($user_id, 'omb_author_avatar_id', true);
    if ($id < 1) {
        return '';
    }
    $url = wp_get_attachment_image_url($id, 'full');

    return is_string($url) && $url !== '' ? $url : '';
}

function omb_rest_prepare_user_i18n_description($response, WP_User $user, WP_REST_Request $request) {
    $data = $response->get_data();
    if (!is_array($data)) {
        return $response;
    }

    $uid = (int) $user->ID;
    $data['omb_author_avatar_url'] = omb_rest_user_avatar_url($uid);
    $data['omb_author_social'] = [
        'facebook' => omb_rest_author_social_url(
            omb_rest_user_meta_first_string(
                $uid,
                [
                    'omb_author_facebook',
                    'facebook_profile_url',
                    'facebook_url',
                    'facebook',
                ]
            )
        ),
        'instagram' => omb_rest_author_social_url(
            omb_rest_user_meta_first_string(
                $uid,
                [
                    'omb_author_instagram',
                    'instagram_profile_url',
                    'instagram_url',
                    'instagram',
                ]
            )
        ),
        'linkedin' => omb_rest_author_social_url(
            omb_rest_user_meta_first_string(
                $uid,
                [
                    'omb_author_linkedin',
                    'linkedin_profile_url',
                    'linkedin_url',
                    'linkedin',
                ]
            )
        ),
    ];

    $lang = $request->get_param('lang');
    if (is_string($lang) && $lang !== '') {
        $bio = omb_rest_user_description_for_lang($uid, $lang);
        if ($bio !== '') {
            $data['description'] = $bio;
        }
    }

    $response->set_data($data);

    return $response;
}

add_filter('rest_prepare_user', 'omb_rest_prepare_user_i18n_description', 20, 3);


/**
 * Headless author card on the POST/CASE_STUDY REST response.
 *
 * The frontend needs the author display name, custom avatar, bio and socials,
 * but the core `/wp/v2/users` endpoint is intentionally locked down on this
 * install (no user enumeration). `rest_prepare_user` therefore never runs for
 * public/embedded author requests. Exposing the author card directly on the
 * already-public post response keeps the users endpoint closed while still
 * giving headless clients exactly the public display fields they need.
 *
 * @return array<string, mixed>
 */
function omb_rest_author_card_payload(int $user_id, string $lang): array {
    if ($user_id < 1) {
        return [];
    }
    $user = get_userdata($user_id);
    if (!$user instanceof WP_User) {
        return [];
    }

    $bio = '';
    if ($lang !== '') {
        $bio = omb_rest_user_description_for_lang($user_id, $lang);
    }
    if ($bio === '') {
        $desc = get_user_meta($user_id, 'description', true);
        $bio = is_string($desc) ? $desc : '';
    }

    return [
        'id'          => $user_id,
        'name'        => (string) $user->display_name,
        'avatar_url'  => omb_rest_user_avatar_url($user_id),
        'bio'         => omb_rest_user_plain_bio($bio),
        'profile_url' => omb_rest_author_social_url((string) $user->user_url),
        'facebook'    => omb_rest_author_social_url(
            omb_rest_user_meta_first_string($user_id, ['omb_author_facebook', 'facebook_profile_url', 'facebook_url', 'facebook'])
        ),
        'instagram'   => omb_rest_author_social_url(
            omb_rest_user_meta_first_string($user_id, ['omb_author_instagram', 'instagram_profile_url', 'instagram_url', 'instagram'])
        ),
        'linkedin'    => omb_rest_author_social_url(
            omb_rest_user_meta_first_string($user_id, ['omb_author_linkedin', 'linkedin_profile_url', 'linkedin_url', 'linkedin'])
        ),
    ];
}

/**
 * @param array<string, mixed> $post_arr
 *
 * @return array<string, mixed>|null
 */
function omb_rest_author_card_get_field($post_arr, string $field_name, WP_REST_Request $request) {
    $post_id = isset($post_arr['id']) ? (int) $post_arr['id'] : 0;
    if ($post_id < 1) {
        return null;
    }
    $author_id = (int) get_post_field('post_author', $post_id);
    if ($author_id < 1) {
        return null;
    }
    $lang = (string) $request->get_param('lang');

    return omb_rest_author_card_payload($author_id, $lang);
}

add_action('rest_api_init', function () {
    foreach (['post', 'case_study'] as $post_type) {
        register_rest_field($post_type, 'author_card', [
            'get_callback' => 'omb_rest_author_card_get_field',
            'schema'       => [
                'description' => 'Headless author card: display name, custom avatar URL, bio, and social links.',
                'type'        => 'object',
                'context'     => ['view', 'embed'],
            ],
        ]);
    }
});


/**
 * Public, read-only nav menu by theme location (Polylang-aware).
 *
 * Core `/wp/v2/menu-items` requires authentication (`rest_cannot_view`) and this
 * install locks down user/menu enumeration, so headless clients cannot read menus
 * there. This route resolves the menu for a theme location + language server-side
 * and returns only the public link fields the frontend needs.
 */
function omb_resolve_menu_id_for_location(string $location, string $lang): int {
    // Polylang stores per-language location assignments in the `polylang` option
    // under nav_menus[theme][location][lang]; read it directly so resolution is
    // deterministic in the REST context (frontend location filters may not run).
    if ($lang !== '') {
        $pll_opts = get_option('polylang');
        $theme = (string) get_option('stylesheet');
        if (is_array($pll_opts) && isset($pll_opts['nav_menus'][$theme][$location][$lang])) {
            $mid = (int) $pll_opts['nav_menus'][$theme][$location][$lang];
            if ($mid > 0) {
                return $mid;
            }
        }
    }

    $locations = get_nav_menu_locations();

    return isset($locations[$location]) ? (int) $locations[$location] : 0;
}

function omb_rest_get_menu(WP_REST_Request $request): WP_REST_Response {
    $location = (string) $request->get_param('location');
    $lang = (string) $request->get_param('lang');
    omb_rest_switch_polylang_lang($lang !== '' ? $lang : null);

    $menu_id = omb_resolve_menu_id_for_location($location, $lang);
    $items = [];

    if ($menu_id > 0) {
        $nav_items = wp_get_nav_menu_items($menu_id, ['update_post_term_cache' => false]);
        if (is_array($nav_items)) {
            foreach ($nav_items as $it) {
                $items[] = [
                    'id'         => (int) $it->ID,
                    'parent'     => (int) $it->menu_item_parent,
                    'title'      => ['rendered' => (string) $it->title],
                    'url'        => (string) $it->url,
                    'menu_order' => (int) $it->menu_order,
                    'target'     => (string) $it->target,
                ];
            }
        }
    }

    return new WP_REST_Response([
        'location' => $location,
        'lang'     => $lang,
        'menu_id'  => $menu_id,
        'items'    => $items,
    ], 200);
}

add_action('rest_api_init', function () {
    register_rest_route('omb-headless/v1', '/menu', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'omb_rest_get_menu',
        'args'                => [
            'location' => [
                'required'          => true,
                'sanitize_callback' => 'sanitize_key',
            ],
            'lang' => [
                'required'          => false,
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ],
    ]);
});
