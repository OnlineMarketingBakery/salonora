<?php
/**
 * Plugin Name: OMB Forms
 * Plugin URI: https://onlinemarketingbakery.com
 * Description: Drag-and-drop form builder by Online Marketing Bakery.
 * Version: 1.0.0
 * Author: Rubin Koot
 * Author URI: https://onlinemarketingbakery.com
 * Text Domain: custom-form-builder
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CFB_VERSION', '1.0.0' );
define( 'CFB_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'CFB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'CFB_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

require_once CFB_PLUGIN_DIR . 'includes/class-cfb-form-post-type.php';
require_once CFB_PLUGIN_DIR . 'includes/class-cfb-field-types.php';
require_once CFB_PLUGIN_DIR . 'includes/class-cfb-admin-builder.php';
require_once CFB_PLUGIN_DIR . 'includes/class-cfb-calculations.php';
require_once CFB_PLUGIN_DIR . 'includes/class-cfb-frontend.php';
require_once CFB_PLUGIN_DIR . 'includes/class-cfb-entries.php';
require_once CFB_PLUGIN_DIR . 'includes/class-cfb-rest.php';

/**
 * Main plugin class.
 */
final class Custom_Form_Builder {

	private static $instance = null;

	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'plugins_loaded', array( $this, 'init' ) );
		add_action( 'init', array( $this, 'load_textdomain' ) );
	}

	public function init() {
		CFB_Form_Post_Type::instance();
		CFB_Admin_Builder::instance();
		CFB_Calculations::instance();
		CFB_Frontend::instance();
		CFB_Entries::instance();
		CFB_REST::instance();
	}

	public function load_textdomain() {
		load_plugin_textdomain( 'custom-form-builder', false, dirname( CFB_PLUGIN_BASENAME ) . '/languages' );
	}
}

function cfb() {
	return Custom_Form_Builder::instance();
}

add_action( 'plugins_loaded', function () {
	cfb();
}, 5 );

register_activation_hook( __FILE__, function () {
	require_once CFB_PLUGIN_DIR . 'includes/class-cfb-form-post-type.php';
	require_once CFB_PLUGIN_DIR . 'includes/class-cfb-entries.php';
	CFB_Form_Post_Type::instance()->register_post_type();
	CFB_Entries::instance()->register_post_type();
	flush_rewrite_rules();
} );
