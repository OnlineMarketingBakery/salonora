<?php
/**
 * POST /wp-json/omb-headless/v1/acf-sync — used by npm run acf:push from the repo.
 * Runs when omb-headless-core is an older build without this route (OMB_HEADLESS_CORE_HAS_ACF_SYNC_ROUTE).
 */

if (!defined('ABSPATH')) {
    exit;
}

function omb_theme_rest_acf_sync(WP_REST_Request $request): WP_REST_Response {
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

add_action(
    'rest_api_init',
    static function (): void {
        if (defined('OMB_HEADLESS_CORE_HAS_ACF_SYNC_ROUTE') && OMB_HEADLESS_CORE_HAS_ACF_SYNC_ROUTE) {
            return;
        }

        register_rest_route('omb-headless/v1', '/acf-sync', [
            'methods'             => 'POST',
            'permission_callback' => static function (WP_REST_Request $request) {
                $secret = $request->get_header('X-Sync-Secret');
                $stored = (string) get_option('omb_revalidation_secret', '');
                if ($stored === '' && function_exists('get_field')) {
                    $acf = get_field('revalidation_secret', 'option');
                    if ($acf !== null && $acf !== false && $acf !== '') {
                        $stored = is_string($acf) ? $acf : (string) $acf;
                    }
                }
                return $stored !== '' && hash_equals($stored, (string) $secret);
            },
            'callback' => 'omb_theme_rest_acf_sync',
        ]);
    },
    99
);
