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
 * Recursively sort array keys for stable JSON hashing.
 *
 * @param mixed $value
 *
 * @return mixed
 */
function omb_rest_acf_sort_for_hash($value)
{
    if (!is_array($value)) {
        return $value;
    }
    if (array_is_list($value)) {
        return array_map('omb_rest_acf_sort_for_hash', $value);
    }
    ksort($value);
    foreach ($value as $k => $v) {
        $value[$k] = omb_rest_acf_sort_for_hash($v);
    }
    return $value;
}

/**
 * @param array<string, mixed> $layout
 */
function omb_rest_acf_layout_hash(array $layout): string
{
    return hash('sha256', wp_json_encode(omb_rest_acf_sort_for_hash($layout)));
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
    $seen = [];

    foreach ($patch_fields as $patch_field) {
        if (!is_array($patch_field)) {
            continue;
        }
        $key = !empty($patch_field['key']) ? (string) $patch_field['key'] : '';
        if ($key !== '' && isset($base_by_key[$key])) {
            $merged[] = omb_rest_acf_merge_single_field($base_by_key[$key], $patch_field);
            $seen[$key] = true;
        } else {
            $merged[] = $patch_field;
            if ($key !== '') {
                $seen[$key] = true;
            }
        }
    }

    // Preserve base fields not present in the patch (prevents wiping Page Settings).
    foreach ($base_fields as $base_field) {
        if (!is_array($base_field) || empty($base_field['key'])) {
            continue;
        }
        $key = (string) $base_field['key'];
        if (!isset($seen[$key])) {
            $merged[] = $base_field;
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

/**
 * Merge layouts into a flexible field via acf_update_field (no full group re-import).
 *
 * @param array<string|int, mixed> $incoming_layouts
 *
 * @return array{ok: bool, merged: int, total: int, error?: string}
 */
function omb_rest_acf_merge_layouts_into_flexible_field(string $field_key, array $incoming_layouts): array
{
    if ($field_key === '' || !function_exists('acf_get_field') || !function_exists('acf_update_field')) {
        return ['ok' => false, 'merged' => 0, 'total' => 0, 'error' => 'acf_unavailable'];
    }

    $field = acf_get_field($field_key);
    if (!is_array($field)) {
        return ['ok' => false, 'merged' => 0, 'total' => 0, 'error' => 'field_not_found'];
    }

    $layouts = is_array($field['layouts'] ?? null) ? $field['layouts'] : [];
    $before = count($layouts);

    foreach ($incoming_layouts as $layout_key => $layout_def) {
        if (!is_array($layout_def)) {
            continue;
        }
        $layouts[(string) $layout_key] = $layout_def;
    }

    $field['layouts'] = $layouts;
    acf_update_field($field);

    return ['ok' => true, 'merged' => count($layouts) - $before, 'total' => count($layouts)];
}

/**
 * Import/update a field group by stable key (merge with existing when possible).
 *
 * @param array<string, mixed> $group
 */
function omb_rest_acf_import_field_group_safe(array $group): bool
{
    if (!function_exists('acf_import_field_group')) {
        return false;
    }

    $key = !empty($group['key']) ? (string) $group['key'] : '';
    if ($key !== '' && function_exists('acf_get_field_group')) {
        $existing = omb_rest_acf_load_group_for_merge($key);
        if (is_array($existing) && !empty($existing)) {
            $group = omb_rest_acf_merge_field_group($existing, $group);
        }
    }

    acf_import_field_group($group);

    return true;
}

/**
 * @param list<array<string, mixed>> $incoming
 *
 * @return list<array<string, mixed>>
 */
function omb_rest_acf_prepare_groups_for_import(array $incoming, bool $merge, bool $merge_field_group = false): array
{
    if (!$merge && !$merge_field_group) {
        return $incoming;
    }

    $prepared = [];
    foreach ($incoming as $group) {
        if (!is_array($group) || empty($group['key'])) {
            $prepared[] = $group;
            continue;
        }

        if ($merge_field_group) {
            $existing = omb_rest_acf_load_group_for_merge((string) $group['key']);
            if (is_array($existing) && !empty($existing)) {
                $group = omb_rest_acf_merge_field_group($existing, $group);
            }
        } else {
            $group = omb_rest_acf_merge_field_group_from_db_layouts($group);
        }

        $prepared[] = $group;
    }

    return $prepared;
}

/**
 * Append flexible layouts via acf_update_field only.
 *
 * @param array<string, mixed> $new_layouts
 */
function omb_rest_acf_append_layouts_to_field(string $field_key, array $new_layouts): bool
{
    $result = omb_rest_acf_merge_layouts_into_flexible_field($field_key, $new_layouts);

    return !empty($result['ok']);
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
        $result = omb_rest_acf_merge_layouts_into_flexible_field($field_key, $layouts);
        if (empty($result['ok'])) {
            return new WP_REST_Response(
                [
                    'error'   => 'append_failed',
                    'message' => 'Could not append layouts to field ' . $field_key,
                    'detail'  => $result['error'] ?? 'unknown',
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

function omb_rest_acf_sync_merge_layouts(array $items): WP_REST_Response
{
    $merged_total = 0;
    $layout_total = 0;

    foreach ($items as $item) {
        if (!is_array($item)) {
            continue;
        }
        $field_key = isset($item['field_key']) ? (string) $item['field_key'] : '';
        $layouts = isset($item['layouts']) && is_array($item['layouts']) ? $item['layouts'] : [];
        if ($field_key === '' || $layouts === []) {
            continue;
        }
        $result = omb_rest_acf_merge_layouts_into_flexible_field($field_key, $layouts);
        if (empty($result['ok'])) {
            return new WP_REST_Response(
                [
                    'error'   => 'merge_failed',
                    'message' => 'Could not merge layouts into field ' . $field_key,
                    'detail'  => $result['error'] ?? 'unknown',
                ],
                500
            );
        }
        $merged_total += (int) ($result['merged'] ?? 0);
        $layout_total = (int) ($result['total'] ?? 0);
    }

    return new WP_REST_Response(
        [
            'success'      => true,
            'merged'       => $merged_total,
            'layout_total' => $layout_total,
            'mode'         => 'layout_merge',
        ],
        200
    );
}

/**
 * @return list<array{layout_key: string, name: string, hash: string}>
 */
function omb_rest_acf_page_sections_layout_entries(): array
{
    if (!function_exists('acf_get_field')) {
        return [];
    }

    $field = acf_get_field('field_omb_page_sections');
    if (!is_array($field) || empty($field['layouts']) || !is_array($field['layouts'])) {
        return [];
    }

    $entries = [];
    foreach ($field['layouts'] as $layout_key => $layout) {
        if (!is_array($layout) || empty($layout['name'])) {
            continue;
        }
        $entries[] = [
            'layout_key' => (string) $layout_key,
            'name'       => (string) $layout['name'],
            'hash'       => omb_rest_acf_layout_hash($layout),
        ];
    }

    usort($entries, static function (array $a, array $b): int {
        return strcmp($a['name'], $b['name']);
    });

    return $entries;
}

/**
 * @return list<string>
 */
function omb_rest_acf_page_sections_layout_names(): array
{
    return array_map(
        static fn(array $e): string => $e['name'],
        omb_rest_acf_page_sections_layout_entries()
    );
}

/**
 * @return array<string, mixed>
 */
function omb_rest_acf_field_group_stats(): array
{
    $operational_statuses = ['publish', 'acf-disabled', 'draft'];
    $operational_posts = get_posts([
        'post_type'      => 'acf-field-group',
        'post_status'    => $operational_statuses,
        'posts_per_page' => -1,
        'fields'         => 'ids',
    ]);
    $trashed_posts = get_posts([
        'post_type'      => 'acf-field-group',
        'post_status'    => ['trash'],
        'posts_per_page' => -1,
        'fields'         => 'ids',
    ]);

    $by_key = [];
    foreach ($operational_posts as $post_id) {
        $key = (string) get_post_field('post_name', $post_id);
        if ($key === '') {
            continue;
        }
        if (!isset($by_key[$key])) {
            $by_key[$key] = [];
        }
        $by_key[$key][] = (int) $post_id;
    }

    $duplicate_posts = 0;
    $canonical = [];
    foreach ($by_key as $key => $ids) {
        if (count($ids) > 1) {
            $duplicate_posts += count($ids) - 1;
        }
        // Prefer the lowest-ID published copy (original); avoid newest partial-import duplicates.
        $published = array_values(array_filter($ids, static function (int $id): bool {
            return get_post_status($id) === 'publish';
        }));
        $canonical[$key] = !empty($published) ? min($published) : min($ids);
    }

    return [
        'field_group_total'           => count($operational_posts),
        'field_group_trash_total'     => count($trashed_posts),
        'field_group_unique_keys'     => count($by_key),
        'field_group_duplicate_posts' => $duplicate_posts,
        'field_group_active_total'    => count(array_filter($operational_posts, static function (int $id): bool {
            return get_post_status($id) === 'publish';
        })),
        'canonical'                   => $canonical,
    ];
}

/**
 * @param array{dry_run?: bool} $args
 *
 * @return array<string, mixed>
 */
function omb_rest_acf_cleanup_duplicate_field_groups(array $args = []): array
{
    $dry_run = !empty($args['dry_run']);
    $stats = omb_rest_acf_field_group_stats();
    $canonical = is_array($stats['canonical'] ?? null) ? $stats['canonical'] : [];

    $trashed = 0;
    $kept_active = 0;

    foreach ($canonical as $key => $keep_id) {
        $posts = get_posts([
            'post_type'      => 'acf-field-group',
            'name'           => (string) $key,
            'post_status'    => ['publish', 'acf-disabled', 'draft'],
            'posts_per_page' => -1,
            'fields'         => 'ids',
        ]);

        $kept_active++;
        foreach ($posts as $post_id) {
            if ((int) $post_id === (int) $keep_id) {
                if (!$dry_run && get_post_status($post_id) !== 'publish') {
                    wp_update_post(['ID' => $post_id, 'post_status' => 'publish']);
                }
                continue;
            }
            if (!$dry_run) {
                wp_trash_post($post_id);
            }
            $trashed++;
        }
    }

    $after = omb_rest_acf_field_group_stats();

    return [
        'success'        => true,
        'dry_run'        => $dry_run,
        'trashed'        => $trashed,
        'deactivated'    => $trashed,
        'kept_active'    => $kept_active,
        'duplicate_keys' => count(array_filter($canonical, static function ($id) use ($canonical) {
            return true;
        })),
        'total_before'   => (int) ($stats['field_group_total'] ?? 0),
        'unique_keys'    => (int) ($stats['field_group_unique_keys'] ?? 0),
        'canonical'      => $canonical,
        'field_group_duplicate_posts' => (int) ($after['field_group_duplicate_posts'] ?? 0),
        'field_group_total'           => (int) ($after['field_group_total'] ?? 0),
        'field_group_trash_total'     => (int) ($after['field_group_trash_total'] ?? 0),
        'mode'           => 'trash_duplicates',
    ];
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

    if (is_array($body) && !empty($body['merge_layouts']) && is_array($body['merge_layouts'])) {
        return omb_rest_acf_sync_merge_layouts($body['merge_layouts']);
    }

    $merge = $request->get_header('X-Acf-Merge-Layouts') === '1';
    $merge_field_group = $request->get_header('X-Acf-Merge-Field-Group') === '1';
    $groups = $body;

    if (is_array($body) && array_key_exists('groups', $body)) {
        $groups = $body['groups'];
        $merge = $merge || !empty($body['merge']);
        $merge_field_group = $merge_field_group || !empty($body['merge_field_group']);
    }

    if (!is_array($groups) || empty($groups) || !is_array($groups[0] ?? null)) {
        return new WP_REST_Response(
            ['error' => 'invalid_payload', 'message' => 'Expected a JSON array of field groups.'],
            400
        );
    }

    if (!$merge && !$merge_field_group) {
        return new WP_REST_Response(
            [
                'error'   => 'merge_required',
                'message' => 'Full replace imports are disabled. Send X-Acf-Merge-Layouts: 1.',
            ],
            400
        );
    }

    $groups = omb_rest_acf_prepare_groups_for_import($groups, $merge, $merge_field_group);

    $imported = 0;
    foreach ($groups as $group) {
        if (!is_array($group)) {
            continue;
        }
        omb_rest_acf_import_field_group_safe($group);
        $imported++;
    }

    return new WP_REST_Response(
        [
            'success'            => true,
            'imported'           => $imported,
            'merged'             => $merge,
            'merged_field_group' => $merge_field_group,
        ],
        200
    );
}
