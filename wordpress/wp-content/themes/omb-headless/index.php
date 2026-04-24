<?php
if (!defined('ABSPATH')) {
    exit;
}
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<main style="max-width: 900px; margin: 60px auto; font-family: sans-serif; line-height: 1.6;">
    <h1>OMB Headless WordPress</h1>
    <p>This theme only exists to support WordPress admin, menus, media, ACF JSON sync, and safe fallbacks.</p>
    <p>The public frontend should be served by Next.js.</p>
</main>
<?php wp_footer(); ?>
</body>
</html>
