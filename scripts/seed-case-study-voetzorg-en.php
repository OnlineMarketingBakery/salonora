<?php
/**
 * Seed English Polylang translation for Voetzorg Roermond case study (NL post 44051).
 *
 * Usage (on server):
 *   OMB_WP_ROOT=/path/to/wordpress php seed-case-study-voetzorg-en.php /path/to/case-study-voetzorg-en.json [--dry-run]
 *
 * Exit codes: 0 success, 1 failure.
 */

if (php_sapi_name() !== 'cli') {
    fwrite(STDERR, "CLI only\n");
    exit(1);
}

$dryRun = in_array('--dry-run', $argv, true);
$jsonPath = null;
foreach ($argv as $arg) {
    if ($arg === '--dry-run' || str_starts_with($arg, '--')) {
        continue;
    }
    if ($jsonPath === null && is_string($arg) && $arg !== $argv[0]) {
        $jsonPath = $arg;
    }
}

if (!$jsonPath || !is_readable($jsonPath)) {
    fwrite(STDERR, "Usage: OMB_WP_ROOT=/wp php seed-case-study-voetzorg-en.php /path/to/case-study-voetzorg-en.json [--dry-run]\n");
    exit(1);
}

$wpRoot = getenv('OMB_WP_ROOT');
if (!$wpRoot || $wpRoot === '') {
    fwrite(STDERR, "OMB_WP_ROOT is required\n");
    exit(1);
}

$wpLoad = rtrim($wpRoot, '/') . '/wp-load.php';
if (!is_readable($wpLoad)) {
    fwrite(STDERR, "wp-load.php not found at {$wpLoad}\n");
    exit(1);
}

define('WP_USE_THEMES', false);
require $wpLoad;

if (!function_exists('update_field')) {
    fwrite(STDERR, "ACF is not available (update_field missing)\n");
    exit(1);
}

if (!function_exists('pll_set_post_language') || !function_exists('pll_save_post_translations')) {
    fwrite(STDERR, "Polylang is not available\n");
    exit(1);
}

$raw = file_get_contents($jsonPath);
$data = json_decode($raw, true);
if (!is_array($data)) {
    fwrite(STDERR, "Invalid JSON in {$jsonPath}\n");
    exit(1);
}

$nlId = (int) ($data['source_nl_post_id'] ?? 0);
if ($nlId <= 0) {
    fwrite(STDERR, "source_nl_post_id is required\n");
    exit(1);
}

$nlPost = get_post($nlId);
if (!$nlPost || $nlPost->post_type !== 'case_study') {
    fwrite(STDERR, "NL case study {$nlId} not found\n");
    exit(1);
}

$slug = sanitize_title($data['slug'] ?? '');
$title = wp_strip_all_tags($data['title'] ?? '');
if ($slug === '' || $title === '') {
    fwrite(STDERR, "slug and title are required in JSON\n");
    exit(1);
}

$acfData = $data['acf'] ?? [];
$media = $acfData['media_ids'] ?? [];

function omb_build_case_study_sections(array $acfData, array $media): array
{
    $rows = [];
    foreach ($acfData['case_study_sections'] ?? [] as $row) {
        if (!is_array($row)) {
            continue;
        }
        $layout = $row['acf_fc_layout'] ?? '';
        if ($layout === 'case_study_chapter') {
            $rows[] = [
                'acf_fc_layout' => 'case_study_chapter',
                'heading' => $row['heading'] ?? '',
                'body' => $row['body'] ?? '',
                'show_divider_after' => !empty($row['show_divider_after']),
            ];
            continue;
        }
        if ($layout === 'case_study_product_shot') {
            $rows[] = [
                'acf_fc_layout' => 'case_study_product_shot',
                'image' => (int) ($media['product_shot_image'] ?? 0),
                'title' => $row['title'] ?? '',
                'description' => $row['description'] ?? '',
                'show_divider_after' => !empty($row['show_divider_after']),
            ];
            continue;
        }
        if ($layout === 'case_study_client_review') {
            $rows[] = [
                'acf_fc_layout' => 'case_study_client_review',
                'section_heading' => $row['section_heading'] ?? '',
                'video_url' => $row['video_url'] ?? '',
                'video_poster' => (int) ($media['client_review_video_poster'] ?? 0),
                'quote' => $row['quote'] ?? '',
                'person_name' => $row['person_name'] ?? '',
                'person_role' => $row['person_role'] ?? '',
                'person_photo' => (int) ($media['client_review_person_photo'] ?? 0),
            ];
            continue;
        }
        if ($layout === 'case_study_conversion_cta') {
            $cta = is_array($row['cta'] ?? null) ? $row['cta'] : [];
            $rows[] = [
                'acf_fc_layout' => 'case_study_conversion_cta',
                'title' => $row['title'] ?? '',
                'subtitle' => $row['subtitle'] ?? '',
                'cta' => [
                    'title' => $cta['title'] ?? '',
                    'url' => $cta['url'] ?? '',
                    'target' => $cta['target'] ?? '',
                ],
            ];
        }
    }
    return $rows;
}

$sections = omb_build_case_study_sections($acfData, $media);

$enId = 0;
$translations = pll_get_post_translations($nlId);
if (is_array($translations) && !empty($translations['en']) && (int) $translations['en'] !== $nlId) {
    $enId = (int) $translations['en'];
}

if ($enId <= 0) {
    $existing = get_posts([
        'name' => $slug,
        'post_type' => 'case_study',
        'post_status' => 'any',
        'posts_per_page' => 1,
        'lang' => 'en',
        'suppress_filters' => false,
    ]);
    if (!empty($existing[0])) {
        $enId = (int) $existing[0]->ID;
    }
}

$featuredMedia = (int) ($data['featured_media_id'] ?? 0);
$authorId = (int) ($data['author_id'] ?? $nlPost->post_author);
$excerpt = $data['excerpt'] ?? '';

$postPayload = [
    'post_title' => $title,
    'post_name' => $slug,
    'post_status' => 'publish',
    'post_type' => 'case_study',
    'post_author' => $authorId,
    'post_excerpt' => $excerpt,
    'post_content' => '',
];

if ($dryRun) {
    echo json_encode([
        'dry_run' => true,
        'nl_id' => $nlId,
        'existing_en_id' => $enId ?: null,
        'slug' => $slug,
        'title' => $title,
        'sections_count' => count($sections),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
    exit(0);
}

if ($enId > 0) {
    $postPayload['ID'] = $enId;
    $result = wp_update_post($postPayload, true);
} else {
    $result = wp_insert_post($postPayload, true);
    $enId = is_wp_error($result) ? 0 : (int) $result;
}

if (is_wp_error($result) || $enId <= 0) {
    $msg = is_wp_error($result) ? $result->get_error_message() : 'Unknown insert/update error';
    fwrite(STDERR, "Failed to save EN post: {$msg}\n");
    exit(1);
}

if ($featuredMedia > 0) {
    set_post_thumbnail($enId, $featuredMedia);
}

update_field('case_study_project_label', $acfData['case_study_project_label'] ?? '', $enId);
update_field('case_study_lead', $acfData['case_study_lead'] ?? '', $enId);
update_field('case_study_outcome_metrics', $acfData['case_study_outcome_metrics'] ?? [], $enId);
update_field('show_toc', !empty($acfData['show_toc']), $enId);
update_field('breadcrumb_parent', $acfData['breadcrumb_parent'] ?? '', $enId);
update_field('show_related_case_studies', !empty($acfData['show_related_case_studies']), $enId);
update_field('featured_form', $acfData['featured_form'] ?? false, $enId);
update_field('case_study_sections', $sections, $enId);

$yoastTitle = $data['yoast_title'] ?? '';
$yoastDesc = $data['yoast_metadesc'] ?? '';
if ($yoastTitle !== '') {
    update_post_meta($enId, '_yoast_wpseo_title', $yoastTitle);
}
if ($yoastDesc !== '') {
    update_post_meta($enId, '_yoast_wpseo_metadesc', $yoastDesc);
}

pll_set_post_language($enId, 'en');
pll_save_post_translations([
    'nl' => $nlId,
    'en' => $enId,
]);

$enPost = get_post($enId);
echo json_encode([
    'success' => true,
    'nl_id' => $nlId,
    'en_id' => $enId,
    'slug' => $enPost ? $enPost->post_name : $slug,
    'title' => $enPost ? $enPost->post_title : $title,
    'translations' => pll_get_post_translations($nlId),
    'permalink' => get_permalink($enId),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
