<?php
/**
 * Form post type and form config storage.
 *
 * @package Custom_Form_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CFB_Form_Post_Type {

	private static $instance = null;
	const POST_TYPE = 'cfb_form';

	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'admin_head', array( $this, 'admin_menu_icon_css' ) );
	}

	/**
	 * Keep sidebar menu icon size and alignment consistent with other menu icons.
	 */
	public function admin_menu_icon_css() {
		?>
		<style type="text/css">
			#adminmenu .menu-icon-cfb_form .wp-menu-image {
				display: flex !important;
				align-items: center !important;
				justify-content: center !important;
				width: 20px !important;
				height: 20px !important;
				padding: 0 !important;
				margin-left: 7px !important;
				background-size: 20px 20px !important;
				background-position: center !important;
			}
			#adminmenu .menu-icon-cfb_form .wp-menu-image img {
				width: 20px !important;
				height: 20px !important;
				max-width: 20px !important;
				max-height: 20px !important;
				object-fit: contain !important;
				display: block !important;
			}
		</style>
		<?php
	}

	public function register_post_type() {
		register_post_type( self::POST_TYPE, array(
			'labels'             => array(
				'name'               => _x( 'Forms', 'post type general name', 'custom-form-builder' ),
				'singular_name'      => _x( 'Form', 'post type singular name', 'custom-form-builder' ),
				'menu_name'          => _x( 'OMB Forms', 'admin menu', 'custom-form-builder' ),
				'add_new'            => _x( 'Add New', 'form', 'custom-form-builder' ),
				'add_new_item'       => __( 'Add New Form', 'custom-form-builder' ),
				'edit_item'          => __( 'Edit Form', 'custom-form-builder' ),
				'new_item'           => __( 'New Form', 'custom-form-builder' ),
				'view_item'          => __( 'View Form', 'custom-form-builder' ),
				'search_items'       => __( 'Search Forms', 'custom-form-builder' ),
				'not_found'          => __( 'No forms found.', 'custom-form-builder' ),
				'not_found_in_trash' => __( 'No forms found in Trash.', 'custom-form-builder' ),
			),
			'public'             => false,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'menu_icon'          => CFB_PLUGIN_URL . 'assets/images/omb-logo.svg',
			'menu_position'      => 25,
			'capability_type'    => 'post',
			'map_meta_cap'       => true,
			'hierarchical'       => false,
			'supports'           => array( 'title' ),
			'has_archive'        => false,
			'rewrite'            => false,
			'query_var'          => false,
		) );
	}

	/**
	 * Get form config (fields array) from post meta.
	 *
	 * @param int $form_id Post ID of the form.
	 * @return array List of field configs.
	 */
	public static function get_form_fields( $form_id ) {
		$fields = get_post_meta( $form_id, '_cfb_fields', true );
		return is_array( $fields ) ? $fields : array();
	}

	/**
	 * Save form fields to post meta.
	 *
	 * @param int   $form_id Post ID.
	 * @param array $fields  Field configs.
	 * @return bool
	 */
	public static function save_form_fields( $form_id, $fields ) {
		return update_post_meta( $form_id, '_cfb_fields', $fields );
	}

	/**
	 * Get form settings (submit button text, success message, etc.).
	 *
	 * @param int $form_id Post ID.
	 * @return array
	 */
	public static function get_form_settings( $form_id ) {
		$defaults = array(
			'submit_label'         => __( 'Submit', 'custom-form-builder' ),
			'success_message'      => __( 'Thank you! Your submission has been received.', 'custom-form-builder' ),
			'redirect_url'         => '',
			'send_admin_email'     => true,
			'admin_email'          => '',
			'custom_css'           => '',
			'default_row_columns'  => 1,
			'step_titles'          => array(),
		);
		$saved = get_post_meta( $form_id, '_cfb_settings', true );
		return is_array( $saved ) ? array_merge( $defaults, $saved ) : $defaults;
	}

	/**
	 * Save form settings.
	 *
	 * @param int   $form_id Post ID.
	 * @param array $settings Settings array.
	 * @return bool
	 */
	public static function save_form_settings( $form_id, $settings ) {
		return update_post_meta( $form_id, '_cfb_settings', $settings );
	}

	/**
	 * Flatten form fields (expand groups) for display/export. Skips group, page_break, section, html, row_break.
	 *
	 * @param array $fields Form fields (may contain group with nested fields).
	 * @return array Flat list of field configs (id, label, type, ...).
	 */
	public static function get_flattened_fields( $fields ) {
		$out = array();
		if ( ! is_array( $fields ) ) {
			return $out;
		}
		foreach ( $fields as $field ) {
			$type = isset( $field['type'] ) ? $field['type'] : '';
			if ( $type === 'page_break' ) {
				continue;
			}
			if ( $type === 'group' ) {
				$inner = isset( $field['fields'] ) && is_array( $field['fields'] ) ? $field['fields'] : array();
				$out = array_merge( $out, self::get_flattened_fields( $inner ) );
				continue;
			}
			if ( $type === 'section' || $type === 'html' || $type === 'row_break' ) {
				continue;
			}
			if ( $type === 'date_range' ) {
				$base_label = isset( $field['label'] ) && $field['label'] !== '' ? $field['label'] : __( 'Date range', 'custom-form-builder' );
				$out[] = array_merge( $field, array(
					'id'    => $field['id'] . '_from',
					'label' => $base_label . ' (' . __( 'From', 'custom-form-builder' ) . ')',
					'type'  => 'date',
				) );
				$out[] = array_merge( $field, array(
					'id'    => $field['id'] . '_to',
					'label' => $base_label . ' (' . __( 'To', 'custom-form-builder' ) . ')',
					'type'  => 'date',
				) );
				continue;
			}
			$out[] = $field;
		}
		return $out;
	}

	/**
	 * Count page_break fields in form (tree order, including inside groups).
	 *
	 * @param array $fields Form fields (may contain group with nested fields).
	 * @return int
	 */
	public static function count_page_breaks( $fields ) {
		if ( ! is_array( $fields ) ) {
			return 0;
		}
		$n = 0;
		foreach ( $fields as $field ) {
			$type = isset( $field['type'] ) ? $field['type'] : '';
			if ( $type === 'page_break' ) {
				$n++;
				continue;
			}
			if ( $type === 'group' && ! empty( $field['fields'] ) && is_array( $field['fields'] ) ) {
				$n += self::count_page_breaks( $field['fields'] );
			}
		}
		return $n;
	}
}
