<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Export an ACF field group in the shape expected by acf_import_field_group().
 *
 * @return array<string, mixed>|null
 */
function omb_rest_acf_export_field_group(string $group_key): ?array
{
    if ($group_key === '' || !function_exists('acf_get_field_group')) {
        return null;
    }

    $group = acf_get_field_group($group_key);
    if (!is_array($group) || empty($group)) {
        return null;
    }

    if (function_exists('acf_get_fields')) {
        $fields = acf_get_fields($group);
        if (is_array($fields)) {
            $group['fields'] = $fields;
        }
    }

    return $group;
}

/**
 * @param list<array<string, mixed>> $base_fields
 * @param list<array<string, mixed>> $patch_fields
 *
 * @return list<array<string, mixed>>
 */
function omb_rest_acf_merge_fields_tree(array $base_fields, array $patch_fields): array
{
    $base_by_key = [];
    foreach ($base_fields as $field) {
        if (is_array($field) && !empty($field['key'])) {
            $base_by_key[(string) $field['key']] = $field;
        }
    }

    $merged = [];
    foreach ($patch_fields as $patch_field) {
        if (!is_array($patch_field)) {
            continue;
        }
        $key = !empty($patch_field['key']) ? (string) $patch_field['key'] : '';
        if ($key !== '' && isset($base_by_key[$key])) {
            $merged[] = omb_rest_acf_merge_single_field($base_by_key[$key], $patch_field);
        } else {
            $merged[] = $patch_field;
        }
    }

    return $merged;
}

/**
 * @param array<string, mixed> $base
 * @param array<string, mixed> $patch
 *
 * @return array<string, mixed>
 */
function omb_rest_acf_merge_single_field(array $base, array $patch): array
{
    $merged = $patch;

    if (!empty($patch['sub_fields']) && is_array($patch['sub_fields'])) {
        $merged['sub_fields'] = omb_rest_acf_merge_fields_tree(
            is_array($base['sub_fields'] ?? null) ? $base['sub_fields'] : [],
            $patch['sub_fields']
        );
    }

    if (!empty($patch['fields']) && is_array($patch['fields'])) {
        $merged['fields'] = omb_rest_acf_merge_fields_tree(
            is_array($base['fields'] ?? null) ? $base['fields'] : [],
            $patch['fields']
        );
    }

    if (
        ($patch['type'] ?? '') === 'flexible_content'
        && isset($patch['layouts'])
        && is_array($patch['layouts'])
    ) {
        $base_layouts = is_array($base['layouts'] ?? null) ? $base['layouts'] : [];
        $merged['layouts'] = array_merge($base_layouts, $patch['layouts']);
    }

    return $merged;
}

/**
 * @param array<string, mixed> $base
 * @param array<string, mixed> $patch
 *
 * @return array<string, mixed>
 */
function omb_rest_acf_merge_field_group(array $base, array $patch): array
{
    $merged = $patch;
    $merged['fields'] = omb_rest_acf_merge_fields_tree(
        is_array($base['fields'] ?? null) ? $base['fields'] : [],
        is_array($patch['fields'] ?? null) ? $patch['fields'] : []
    );

    return $merged;
}

/**
 * When merge is true, flexible layout definitions are merged into existing groups.
 *
 * @param list<array<string, mixed>> $incoming
 *
 * @return list<array<string, mixed>>
 */


/**
 * Load field group JSON for merge (theme acf-json is fast; DB export is the fallback).
 *
 * @return array<string, mixed>|null
 */
function omb_rest_acf_load_group_for_merge(string $group_key): ?array
{
    if ($group_key === '') {
        return null;
    }

    $local = get_stylesheet_directory() . '/acf-json/' . $group_key . '.json';
    if (is_readable($local)) {
        $decoded = json_decode((string) file_get_contents($local), true);
        if (is_array($decoded) && !empty($decoded)) {
            return $decoded;
        }
    }

    return omb_rest_acf_export_field_group($group_key);
}



/**
 * Merge flexible layouts using acf_get_field() (fast) instead of importing a full existing group export.
 *
 * @param list<array<string, mixed>> $patch_fields
 *
 * @return list<array<string, mixed>>
 */
function omb_rest_acf_merge_fields_layouts_from_db(array $patch_fields): array
{
    foreach ($patch_fields as $i => $patch_field) {
        if (!is_array($patch_field)) {
            continue;
        }

        if (
            ($patch_field['type'] ?? '') === 'flexible_content'
            && !empty($patch_field['key'])
            && isset($patch_field['layouts'])
            && is_array($patch_field['layouts'])
            && function_exists('acf_get_field')
        ) {
            $existing = acf_get_field((string) $patch_field['key']);
            $base_layouts = (
                is_array($existing)
                && !empty($existing['layouts'])
                && is_array($existing['layouts'])
            ) ? $existing['layouts'] : [];
            $patch_fields[$i]['layouts'] = array_merge($base_layouts, $patch_field['layouts']);
        }

        if (!empty($patch_field['sub_fields']) && is_array($patch_field['sub_fields'])) {
            $patch_fields[$i]['sub_fields'] = omb_rest_acf_merge_fields_layouts_from_db($patch_field['sub_fields']);
        }

        if (!empty($patch_field['fields']) && is_array($patch_field['fields'])) {
            $patch_fields[$i]['fields'] = omb_rest_acf_merge_fields_layouts_from_db($patch_field['fields']);
        }
    }

    return $patch_fields;
}

/**
 * @param array<string, mixed> $patch
 *
 * @return array<string, mixed>
 */
function omb_rest_acf_merge_field_group_from_db_layouts(array $patch): array
{
    $merged = $patch;
    if (!empty($patch['fields']) && is_array($patch['fields'])) {
        $merged['fields'] = omb_rest_acf_merge_fields_layouts_from_db($patch['fields']);
    }

    return $merged;
}

function omb_rest_acf_prepare_groups_for_import(array $incoming, bool $merge): array
{
    if (!$merge) {
        return $incoming;
    }

    $prepared = [];
    foreach ($incoming as $group) {
        if (!is_array($group) || empty($group['key'])) {
            $prepared[] = $group;
            continue;
        }

        $prepared[] = omb_rest_acf_merge_field_group_from_db_layouts($group);
    }

    return $prepared;
}



/**
 * Append flexible layouts without acf_import_field_group (avoids 502 on large groups).
 *
 * @param array<string, mixed> $new_layouts
 */
function omb_rest_acf_append_layouts_to_field(string $field_key, array $new_layouts): bool
{
    if ($field_key === '' || !function_exists('acf_get_field') || !function_exists('acf_import_field_group')) {
        return false;
    }

    $field = acf_get_field($field_key);
    if (!is_array($field)) {
        return false;
    }

    $group = function_exists('acf_get_field_group') ? acf_get_field_group((string) ($field['parent'] ?? '')) : null;
    if (!is_array($group) || empty($group['key'])) {
        $group = ['key' => 'group_omb_page_builder', 'title' => 'OMB Page Builder'];
    }

    $patch = [
        'key'    => (string) $group['key'],
        'title'  => (string) ($group['title'] ?? 'OMB Page Builder'),
        'fields' => [
            [
                'key'     => $field_key,
                'label'   => (string) ($field['label'] ?? ''),
                'name'    => (string) ($field['name'] ?? ''),
                'type'    => 'flexible_content',
                'layouts' => $new_layouts,
            ],
        ],
    ];

    $merged = omb_rest_acf_merge_field_group_from_db_layouts($patch);
    acf_import_field_group($merged);

    return true;
}

function omb_rest_acf_sync_append_layouts(array $items): WP_REST_Response
{
    $appended = 0;

    foreach ($items as $item) {
        if (!is_array($item)) {
            continue;
        }
        $field_key = isset($item['field_key']) ? (string) $item['field_key'] : '';
        $layouts = isset($item['layouts']) && is_array($item['layouts']) ? $item['layouts'] : [];
        if ($field_key === '' || $layouts === []) {
            continue;
        }
        if (!omb_rest_acf_append_layouts_to_field($field_key, $layouts)) {
            return new WP_REST_Response(
                [
                    'error'   => 'append_failed',
                    'message' => 'Could not append layouts to field ' . $field_key,
                ],
                500
            );
        }
        $appended += count($layouts);
    }

    return new WP_REST_Response(
        [
            'success'  => true,
            'appended' => $appended,
            'mode'     => 'append',
        ],
        200
    );
}


/**
 * Layout names registered on the Page sections flexible field (for sync diagnostics).
 *
 * @return list<string>
 */
function omb_rest_acf_page_sections_layout_names(): array
{
    if (!function_exists('acf_get_field')) {
        return [];
    }

    $field = acf_get_field('field_omb_page_sections');
    if (!is_array($field) || empty($field['layouts']) || !is_array($field['layouts'])) {
        return [];
    }

    $names = [];
    foreach ($field['layouts'] as $layout) {
        if (is_array($layout) && !empty($layout['name'])) {
            $names[] = (string) $layout['name'];
        }
    }

    sort($names);

    return $names;
}
function omb_rest_acf_sync(WP_REST_Request $request): WP_REST_Response
{
    if (!function_exists('acf_import_field_group')) {
        return new WP_REST_Response(
            ['error' => 'acf_inactive', 'message' => 'ACF is required.'],
            503
        );
    }

    $body = $request->get_json_params();
    $append = $request->get_header('X-Acf-Append-Layouts') === '1';

    if ($append && is_array($body) && !empty($body['append']) && is_array($body['append'])) {
        return omb_rest_acf_sync_append_layouts($body['append']);
    }

    $merge = $request->get_header('X-Acf-Merge-Layouts') === '1';
    $groups = $body;

    if (is_array($body) && array_key_exists('groups', $body)) {
        $groups = $body['groups'];
        $merge = $merge || !empty($body['merge']);
    }

    if (!is_array($groups) || empty($groups) || !is_array($groups[0] ?? null)) {
        return new WP_REST_Response(
            ['error' => 'invalid_payload', 'message' => 'Expected a JSON array of field groups.'],
            400
        );
    }

    $groups = omb_rest_acf_prepare_groups_for_import($groups, $merge);

    $imported = 0;
    foreach ($groups as $group) {
        if (!is_array($group)) {
            continue;
        }
        acf_import_field_group($group);
        $imported++;
    }

    return new WP_REST_Response(
        [
            'success'  => true,
            'imported' => $imported,
            'merged'   => $merge,
        ],
        200
    );
}
