<?php
/**
 * Plugin Name: OMB Headless Core
 * Description: Headless core plugin for CPTs, taxonomies, options pages, Polylang support, and REST helpers.
 * Version: 1.0.0
 * Requires PHP: 8.1
 * Author: OpenAI
 * Text Domain: omb-headless-core
 */

if (!defined('ABSPATH')) {
    exit;
}

define('OMB_HEADLESS_CORE_PATH', plugin_dir_path(__FILE__));
define('OMB_HEADLESS_CORE_URL', plugin_dir_url(__FILE__));

require_once OMB_HEADLESS_CORE_PATH . 'includes/post-types.php';
require_once OMB_HEADLESS_CORE_PATH . 'includes/taxonomies.php';
require_once OMB_HEADLESS_CORE_PATH . 'includes/options-pages.php';
require_once OMB_HEADLESS_CORE_PATH . 'includes/polylang.php';
require_once OMB_HEADLESS_CORE_PATH . 'includes/rest.php';
require_once OMB_HEADLESS_CORE_PATH . 'includes/contact-form-7.php';

register_activation_hook(__FILE__, function () {
    omb_register_post_types();
    omb_register_taxonomies();
    flush_rewrite_rules();
});

register_deactivation_hook(__FILE__, function () {
    flush_rewrite_rules();
});
