<?php
/**
 * OMB agent — create EN Polylang translations for NL blog posts + blog archive page.
 */
if (php_sapi_name() !== 'cli') { fwrite(STDERR, "CLI only\n"); exit(1); }
$manifestPath = $argv[1] ?? '';
$contentDir = $argv[2] ?? '';
if ($manifestPath === '' || $contentDir === '' || !is_readable($manifestPath)) {
    fwrite(STDERR, "Usage: php omb-sync-blog-en.php <manifest.json> <content-dir>\n");
    exit(1);
}
$wpRoot = getenv('OMB_WP_ROOT');
if (!$wpRoot) { fwrite(STDERR, "OMB_WP_ROOT is required\n"); exit(1); }
$wpLoad = rtrim($wpRoot, '/') . '/wp-load.php';
if (!is_readable($wpLoad)) { fwrite(STDERR, "wp-load.php not found\n"); exit(1); }
define('WP_USE_THEMES', false);
require $wpLoad;
if (!function_exists('pll_set_post_language')) { fwrite(STDERR, "Polylang missing\n"); exit(1); }
$manifest = json_decode(file_get_contents($manifestPath), true);
if (!is_array($manifest)) { fwrite(STDERR, "Invalid manifest\n"); exit(1); }
$authorId = (int) ($manifest['authorId'] ?? 4);
$nlBlogPageId = (int) ($manifest['nlBlogPageId'] ?? 0);
$featuredNlPostId = (int) ($manifest['featuredNlPostId'] ?? 0);
$posts = $manifest['posts'] ?? [];
$blogPage = $manifest['blogPage'] ?? [];
function omb_read_content(string $contentDir, string $file): string {
    $path = rtrim($contentDir, '/') . '/' . ltrim($file, '/');
    if (!is_readable($path)) { fwrite(STDERR, "Missing content: {$path}\n"); exit(1); }
    return file_get_contents($path);
}
function omb_copy_acf_post_meta(int $fromId, int $toId): void {
    foreach (['show_related_posts','featured_form','breadcrumb_parent','show_toc','post_sections'] as $key) {
        $val = get_field($key, $fromId);
        if ($val !== null && $val !== false) update_field($key, $val, $toId);
    }
}
function omb_ensure_en_post(int $nlId, array $entry, int $authorId, string $contentDir): int {
    $nl = get_post($nlId);
    if (!$nl || $nl->post_type !== 'post') { fwrite(STDERR, "NL post {$nlId} missing\n"); exit(1); }
    wp_update_post(['ID' => $nlId, 'post_author' => $authorId]);
    pll_set_post_language($nlId, 'nl');
    $translations = pll_get_post_translations($nlId) ?: [];
    $translations['nl'] = $nlId;
    $enId = isset($translations['en']) ? (int) $translations['en'] : 0;
    $content = omb_read_content($contentDir, (string) ($entry['contentFile'] ?? ''));
    $postData = [
        'post_title' => (string) ($entry['title'] ?? $nl->post_title),
        'post_name' => (string) ($entry['slug'] ?? $nl->post_name),
        'post_excerpt' => (string) ($entry['excerpt'] ?? ''),
        'post_content' => $content,
        'post_status' => 'publish',
        'post_type' => 'post',
        'post_author' => $authorId,
    ];
    if ($enId > 0 && get_post($enId)) {
        $postData['ID'] = $enId;
        wp_update_post($postData);
        echo "Updated EN post {$enId} (NL {$nlId})\n";
    } else {
        $enId = (int) wp_insert_post($postData, true);
        if (is_wp_error($enId)) { fwrite(STDERR, $enId->get_error_message() . "\n"); exit(1); }
        echo "Created EN post {$enId} (NL {$nlId})\n";
    }
    pll_set_post_language($enId, 'en');
    $translations['en'] = $enId;
    pll_save_post_translations($translations);
    omb_copy_acf_post_meta($nlId, $enId);
    $lead = (string) ($entry['post_lead'] ?? '');
    if ($lead !== '') update_field('post_lead', $lead, $enId);
    $thumb = (int) get_post_thumbnail_id($nlId);
    if ($thumb > 0) set_post_thumbnail($enId, $thumb);
    $cats = wp_get_post_categories($nlId);
    if ($cats) wp_set_post_categories($enId, $cats);
    $tags = wp_get_post_tags($nlId, ['fields' => 'ids']);
    if ($tags) wp_set_post_tags($enId, $tags, false);
    return $enId;
}
$enByNl = [];
foreach ($posts as $entry) {
    $nlId = (int) ($entry['nlId'] ?? 0);
    if ($nlId < 1) continue;
    $enByNl[$nlId] = omb_ensure_en_post($nlId, $entry, $authorId, $contentDir);
}
$featuredEnId = $enByNl[$featuredNlPostId] ?? 0;
if ($nlBlogPageId > 0) {
    $nlPage = get_post($nlBlogPageId);
    if (!$nlPage) { fwrite(STDERR, "NL blog page missing\n"); exit(1); }
    pll_set_post_language($nlBlogPageId, 'nl');
    $pageTranslations = pll_get_post_translations($nlBlogPageId) ?: [];
    $pageTranslations['nl'] = $nlBlogPageId;
    $enPageId = isset($pageTranslations['en']) ? (int) $pageTranslations['en'] : 0;
    $enTitle = (string) ($blogPage['title'] ?? 'Blog');
    $enSlug = (string) ($blogPage['slug'] ?? 'blog');
    if ($enPageId > 0 && get_post($enPageId)) {
        wp_update_post(['ID' => $enPageId, 'post_title' => $enTitle, 'post_name' => $enSlug, 'post_status' => 'publish']);
        echo "Updated EN blog page {$enPageId}\n";
    } else {
        $enPageId = (int) wp_insert_post(['post_title' => $enTitle, 'post_name' => $enSlug, 'post_status' => 'publish', 'post_type' => 'page', 'post_content' => $nlPage->post_content], true);
        if (is_wp_error($enPageId)) { fwrite(STDERR, $enPageId->get_error_message() . "\n"); exit(1); }
        echo "Created EN blog page {$enPageId}\n";
    }
    pll_set_post_language($enPageId, 'en');
    $pageTranslations['en'] = $enPageId;
    pll_save_post_translations($pageTranslations);
    $nlSections = get_field('page_sections', $nlBlogPageId);
    if (is_array($nlSections)) {
        $enSections = $nlSections;
        foreach ($enSections as &$section) {
            if (!is_array($section)) continue;
            if (($section['acf_fc_layout'] ?? '') === 'blog_post_overview') {
                $section['title'] = (string) ($blogPage['sectionTitle'] ?? $section['title'] ?? '');
                $section['intro'] = (string) ($blogPage['sectionIntro'] ?? $section['intro'] ?? '');
                if ($featuredEnId > 0) $section['featured_post'] = $featuredEnId;
            }
        }
        unset($section);
        update_field('page_sections', $enSections, $enPageId);
    }
    foreach (['template_variant','hide_page_title','hide_site_navigation'] as $flag) {
        $val = get_field($flag, $nlBlogPageId);
        if ($val !== null && $val !== false) update_field($flag, $val, $enPageId);
    }
    update_field('is_blog_archive', true, $enPageId);
    echo "EN blog page {$enPageId} featured_post => {$featuredEnId}\n";
}
echo json_encode(['enPosts' => $enByNl, 'featuredEnId' => $featuredEnId], JSON_PRETTY_PRINT) . "\n";
echo "Blog EN sync complete.\n";

