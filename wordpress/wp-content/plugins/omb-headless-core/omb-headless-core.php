<?php
/**
 * Plugin Name: OMB Headless Core
 * Plugin URI: https://onlinemarketingbakery.nl/
 * Description: Headless WordPress backend for OMB Next.js sites - custom post types, ACF option pages, Polylang helpers, REST endpoints, and Contact Form 7 integration.
 * Version: 1.0.0
 * Requires at least: 6.5
 * Requires PHP: 8.1
 * Author: Online Marketing Bakery
 * Author URI: https://onlinemarketingbakery.nl/
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
require_once OMB_HEADLESS_CORE_PATH . 'includes/languages.php';
require_once OMB_HEADLESS_CORE_PATH . 'includes/polylang.php';
require_once OMB_HEADLESS_CORE_PATH . 'includes/rest.php';
require_once OMB_HEADLESS_CORE_PATH . 'includes/user-profile.php';
require_once OMB_HEADLESS_CORE_PATH . 'includes/contact-form-7.php';

add_action('init', function () {
    if (!function_exists('get_field')) {
        return;
    }
    $acf_secret = get_field('revalidation_secret', 'option');
    if (!empty($acf_secret)) {
        update_option('omb_revalidation_secret', $acf_secret, false);
    }
});

register_activation_hook(__FILE__, function () {
    omb_register_post_types();
    omb_register_taxonomies();
    flush_rewrite_rules();
});

register_deactivation_hook(__FILE__, function () {
    flush_rewrite_rules();
});
