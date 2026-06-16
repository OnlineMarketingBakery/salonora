<?php
/**
 * Update NL + EN Voetzorg case studies from JSON + media manifest.
 * Usage: OMB_WP_ROOT=/wp php update-case-study-from-figma.php /path/to/media.json /path/to/nl.json /path/to/en.json
 */
if (php_sapi_name() !== 'cli') { fwrite(STDERR, "CLI only\n"); exit(1); }
$manifestPath = $argv[1] ?? '';
$nlPath = $argv[2] ?? '';
$enPath = $argv[3] ?? '';
foreach ([$manifestPath, $nlPath, $enPath] as $p) {
  if (!is_readable($p)) { fwrite(STDERR, "Unreadable: {$p}\n"); exit(1); }
}
$wpRoot = getenv('OMB_WP_ROOT');
if (!$wpRoot) { fwrite(STDERR, "OMB_WP_ROOT required\n"); exit(1); }
define('WP_USE_THEMES', false);
require rtrim($wpRoot, '/') . '/wp-load.php';
if (!function_exists('update_field')) { fwrite(STDERR, "ACF missing\n"); exit(1); }
$manifest = json_decode(file_get_contents($manifestPath), true);
$media = $manifest['media'] ?? [];
function omb_build_sections(array $acfData, array $media): array {
  $rows = [];
  foreach ($acfData['case_study_sections'] ?? [] as $row) {
    if (!is_array($row)) continue;
    $layout = $row['acf_fc_layout'] ?? '';
    if ($layout === 'case_study_chapter') {
      $body = $row['body'] ?? '';
      $inlineKey = $row['inline_image_key'] ?? '';
      if ($inlineKey !== '' && !empty($media[$inlineKey])) {
        $url = wp_get_attachment_url((int) $media[$inlineKey]);
        if ($url) {
          $body .= '<p><img src="' . esc_url($url) . '" alt="" class="rounded-[14px]" /></p>';
        }
      }
      $rows[] = [
        'acf_fc_layout' => 'case_study_chapter',
        'heading' => $row['heading'] ?? '',
        'body' => $body,
        'show_divider_after' => !empty($row['show_divider_after']),
      ];
    } elseif ($layout === 'case_study_product_shot') {
      $key = $row['image_key'] ?? 'product_shot';
      $rows[] = [
        'acf_fc_layout' => 'case_study_product_shot',
        'image' => (int) ($media[$key] ?? 0),
        'title' => $row['title'] ?? '',
        'description' => $row['description'] ?? '',
        'show_divider_after' => !empty($row['show_divider_after']),
      ];
    } elseif ($layout === 'case_study_client_review') {
      $posterKey = $row['video_poster_key'] ?? '';
      $photoKey = $row['person_photo_key'] ?? 'avatar';
      $rows[] = [
        'acf_fc_layout' => 'case_study_client_review',
        'section_heading' => $row['section_heading'] ?? '',
        'video_url' => $row['video_url'] ?? '',
        'video_poster' => $posterKey !== '' ? (int) ($media[$posterKey] ?? 0) : 0,
        'quote' => $row['quote'] ?? '',
        'person_name' => $row['person_name'] ?? '',
        'person_role' => $row['person_role'] ?? '',
        'person_photo' => (int) ($media[$photoKey] ?? 0),
      ];
    } elseif ($layout === 'case_study_conversion_cta') {
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
function omb_update_post_from_json(array $data, array $media): array {
  $postId = (int) ($data['post_id'] ?? 0);
  if ($postId <= 0) throw new RuntimeException('post_id required');
  $acfData = $data['acf'] ?? [];
  $payload = [
    'ID' => $postId,
    'post_title' => $data['title'] ?? '',
    'post_name' => $data['slug'] ?? '',
    'post_excerpt' => $data['excerpt'] ?? '',
    'post_status' => 'publish',
  ];
  $result = wp_update_post($payload, true);
  if (is_wp_error($result)) throw new RuntimeException($result->get_error_message());
  $heroId = (int) ($media['hero'] ?? 0);
  if ($heroId > 0) set_post_thumbnail($postId, $heroId);
  update_field('case_study_project_label', $acfData['case_study_project_label'] ?? '', $postId);
  update_field('case_study_lead', $acfData['case_study_lead'] ?? '', $postId);
  update_field('case_study_outcome_metrics', $acfData['case_study_outcome_metrics'] ?? [], $postId);
  update_field('show_toc', !empty($acfData['show_toc']), $postId);
  update_field('breadcrumb_parent', $acfData['breadcrumb_parent'] ?? '', $postId);
  update_field('show_related_case_studies', !empty($acfData['show_related_case_studies']), $postId);
  update_field('featured_form', $acfData['featured_form'] ?? false, $postId);
  update_field('case_study_sections', omb_build_sections($acfData, $media), $postId);
  if (!empty($data['yoast_title'])) update_post_meta($postId, '_yoast_wpseo_title', $data['yoast_title']);
  if (!empty($data['yoast_metadesc'])) update_post_meta($postId, '_yoast_wpseo_metadesc', $data['yoast_metadesc']);
  return ['post_id' => $postId, 'slug' => get_post($postId)->post_name, 'permalink' => get_permalink($postId)];
}
$nl = json_decode(file_get_contents($nlPath), true);
$en = json_decode(file_get_contents($enPath), true);
try {
  $results = [
    'nl' => omb_update_post_from_json($nl, $media),
    'en' => omb_update_post_from_json($en, $media),
  ];
  if (function_exists('pll_save_post_translations')) {
    pll_save_post_translations(['nl' => (int) $nl['post_id'], 'en' => (int) $en['post_id']]);
  }
  echo json_encode(['success' => true, 'results' => $results, 'media' => $media], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
} catch (Throwable $e) {
  fwrite(STDERR, $e->getMessage() . "\n");
  exit(1);
}
