<?php
/**
 * One-shot: set header/footer primary CTA links to campaign paths (Polylang ACF options).
 * Run: wp eval-file fix-header-footer-cta-wpcli.php (from WP root)
 */
if (!function_exists('update_field')) {
    fwrite(STDERR, "ACF update_field not available\n");
    exit(1);
}

$updates = [
    ['header_cta_link', ['title' => 'Begin nu', 'url' => '/nl/campagne', 'target' => ''], 'option'],
    ['header_cta_link', ['title' => 'Begin nu', 'url' => '/nl/campagne', 'target' => ''], 'option_nl'],
    ['header_cta_link', ['title' => 'Start Now', 'url' => '/en/campaign', 'target' => ''], 'option_en'],
    ['footer_cta_primary_link', ['title' => 'Begin Nu', 'url' => '/nl/campagne', 'target' => ''], 'option'],
    ['footer_cta_primary_link', ['title' => 'Begin Nu', 'url' => '/nl/campagne', 'target' => ''], 'option_nl'],
    ['footer_cta_primary_link', ['title' => 'Start Now', 'url' => '/en/campaign', 'target' => ''], 'option_en'],
];

foreach ($updates as [$field, $value, $postId]) {
    $ok = update_field($field, $value, $postId);
    echo ($ok ? 'OK' : 'FAIL') . " {$postId} {$field} -> {$value['url']}\n";
}
