<?php
/**
 * Headless: expose per-language path segments (after language prefix) for a post, using Polylang.
 * Install: wp-content/mu-plugins/salonora-headless-polylang.php
 *
 * Must-use plugins run BEFORE regular plugins, so we must NOT check pll_get_post_translations() at
 * file load time — that function only exists after Polylang has loaded. Register the route on
 * rest_api_init, then verify Polylang when the callback runs.
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'rest_api_init', 'salonora_headless_register_polylang_path_route' );

/**
 * Fires after all plugins are loaded; Polylang is available here.
 */
function salonora_headless_register_polylang_path_route() {
    if ( ! function_exists( 'register_rest_route' ) ) {
        return;
    }
    if ( ! function_exists( 'pll_get_post_translations' ) ) {
        return;
    }

    register_rest_route(
        'headless/v1',
        '/polylang-paths/(?P<id>\\d+)',
        array(
            'methods'             => 'GET',
            'callback'            => 'salonora_headless_polylang_paths',
            'permission_callback' => '__return_true',
        )
    );
}

/**
 * @param WP_REST_Request $req
 * @return array|WP_Error
 */
function salonora_headless_polylang_paths( $req ) {
    if ( ! function_exists( 'pll_get_post_translations' ) ) {
        return new WP_Error( 'polylang_inactive', 'Polylang is not active', array( 'status' => 503 ) );
    }

    $id   = (int) $req['id'];
    $post = get_post( $id );
    if ( ! $post || ! is_post_status_viewable( $post->post_status ) ) {
        return new WP_Error( 'not_found', 'Post not found', array( 'status' => 404 ) );
    }

    $tr = pll_get_post_translations( $id );
    if ( empty( $tr ) || ! is_array( $tr ) ) {
        return new WP_Error( 'no_translations', 'No translations for this post', array( 'status' => 404 ) );
    }

    $lang_slugs = pll_languages_list( array( 'fields' => 'slug' ) );
    if ( ! is_array( $lang_slugs ) ) {
        $lang_slugs = array();
    }

    $out = array();

    foreach ( $tr as $lang_key => $tr_id ) {
        if ( ! $tr_id || (int) $tr_id !== (int) $tr_id ) {
            continue;
        }
        $p = get_post( (int) $tr_id );
        if ( ! $p || ! is_post_status_viewable( $p->post_status ) ) {
            continue;
        }
        $url  = get_permalink( (int) $tr_id );
        $path = parse_url( $url, PHP_URL_PATH );
        if ( ! is_string( $path ) || $path === '' ) {
            $path = '/';
        }
        $path = trim( $path, '/' );
        if ( $path === '' ) {
            $out[ $lang_key ] = '';
            continue;
        }
        $parts = explode( '/', $path );
        if ( count( $parts ) && in_array( $parts[0], $lang_slugs, true ) ) {
            array_shift( $parts );
        }
        $out[ $lang_key ] = implode( '/', $parts );
    }

    if ( empty( $out ) ) {
        return new WP_Error( 'no_paths', 'Could not build paths', array( 'status' => 404 ) );
    }

    return array( 'paths' => $out );
}
