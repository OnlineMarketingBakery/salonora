<?php
/**
 * Available field types for the form builder.
 *
 * @package Custom_Form_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CFB_Field_Types {

	/**
	 * Field types that can be dragged into the form (with default config).
	 * Each field has: id (set when added), name (assignable slug for entries/export), label, type, ...
	 *
	 * @return array[]
	 */
	public static function get_builder_fields() {
		return array(
			'text'         => array(
				'label'         => __( 'Single Line Text', 'custom-form-builder' ),
				'name'          => '',
				'custom_id'     => '',
				'icon'          => 'dashicons-editor-textcolor',
				'type'          => 'text',
				'required'      => false,
				'placeholder'   => '',
				'default_value' => '',
				'acf_field'     => '',
				'acf_field_key' => '',
				'depends_on'    => '',
				'depends_on_values' => '',
			),
			'textarea'     => array(
				'label'         => __( 'Paragraph Text', 'custom-form-builder' ),
				'name'          => '',
				'custom_id'     => '',
				'icon'          => 'dashicons-editor-alignleft',
				'type'          => 'textarea',
				'required'      => false,
				'placeholder'   => '',
				'default_value' => '',
				'acf_field'     => '',
				'acf_field_key' => '',
				'depends_on'    => '',
				'depends_on_values' => '',
			),
			'email'        => array(
				'label'         => __( 'Email', 'custom-form-builder' ),
				'name'          => '',
				'custom_id'     => '',
				'icon'          => 'dashicons-email',
				'type'          => 'email',
				'required'      => false,
				'placeholder'   => '',
				'default_value' => '',
				'acf_field'     => '',
				'acf_field_key' => '',
				'depends_on'    => '',
				'depends_on_values' => '',
			),
			'phone'        => array(
				'label'         => __( 'Phone', 'custom-form-builder' ),
				'name'          => '',
				'custom_id'     => '',
				'icon'          => 'dashicons-phone',
				'type'          => 'phone',
				'required'      => false,
				'placeholder'   => '',
				'default_value' => '',
				'acf_field'     => '',
				'acf_field_key' => '',
				'depends_on'    => '',
				'depends_on_values' => '',
			),
			'url'          => array(
				'label'         => __( 'Website / URL', 'custom-form-builder' ),
				'name'          => '',
				'custom_id'     => '',
				'icon'          => 'dashicons-admin-links',
				'type'          => 'url',
				'required'      => false,
				'placeholder'   => 'https://',
				'default_value' => '',
				'acf_field'     => '',
				'acf_field_key' => '',
			),
			'number'       => array(
				'label'         => __( 'Number', 'custom-form-builder' ),
				'name'          => '',
				'custom_id'     => '',
				'icon'          => 'dashicons-plus-alt',
				'type'          => 'number',
				'required'      => false,
				'placeholder'   => '',
				'default_value' => '',
				'min'           => '',
				'max'           => '',
				'step'          => '',
				'acf_field'     => '',
				'acf_field_key' => '',
				'depends_on'    => '',
				'depends_on_values' => '',
			),
			'date'         => array(
				'label'         => __( 'Date', 'custom-form-builder' ),
				'name'          => '',
				'custom_id'     => '',
				'icon'          => 'dashicons-calendar-alt',
				'type'          => 'date',
				'required'      => false,
				'placeholder'   => '',
				'default_value' => '',
				'date_format'   => 'Y-m-d',
				'acf_field'     => '',
				'acf_field_key' => '',
				'depends_on'    => '',
				'depends_on_values' => '',
			),
			'date_range'    => array(
				'label'              => __( 'Date range', 'custom-form-builder' ),
				'name'               => '',
				'custom_id'          => '',
				'icon'               => 'dashicons-calendar',
				'type'               => 'date_range',
				'required'           => false,
				'default_from_today' => true,
				'allow_from_past'    => false,
				'acf_field'          => '',
				'acf_field_key'      => '',
				'depends_on'         => '',
				'depends_on_values'  => '',
			),
			'calculation'  => array(
				'label'         => __( 'Calculation', 'custom-form-builder' ),
				'name'          => '',
				'custom_id'     => '',
				'icon'          => 'dashicons-calculator',
				'type'          => 'calculation',
				'formula'       => '',
				'format'        => 'decimal',
				'decimals'      => 2,
				'acf_field'     => '',
				'acf_field_key' => '',
				'depends_on'    => '',
				'depends_on_values' => '',
			),
			'merge_text'    => array(
				'label'         => __( 'Text with field values', 'custom-form-builder' ),
				'name'          => '',
				'custom_id'     => '',
				'icon'          => 'dashicons-editor-paragraph',
				'type'          => 'merge_text',
				'template'      => '', // e.g. "Hello {field_1}, your total is {field_2}"
				'acf_field'     => '',
				'acf_field_key' => '',
				'depends_on'    => '',
				'depends_on_values' => '',
			),
			'select'       => array(
				'label'         => __( 'Dropdown', 'custom-form-builder' ),
				'name'          => '',
				'custom_id'     => '',
				'icon'          => 'dashicons-list-view',
				'type'          => 'select',
				'required'      => false,
				'placeholder'   => __( 'Select an option...', 'custom-form-builder' ),
				'multiple'      => false,
				'choices'       => array(
					array( 'value' => 'opt1', 'label' => __( 'Option 1', 'custom-form-builder' ) ),
					array( 'value' => 'opt2', 'label' => __( 'Option 2', 'custom-form-builder' ) ),
				),
				'depends_on'    => '',
				'depends_on_values' => '',
				'acf_field'     => '',
				'acf_field_key' => '',
			),
			'radio'        => array(
				'label'         => __( 'Radio Buttons', 'custom-form-builder' ),
				'name'          => '',
				'custom_id'     => '',
				'icon'          => 'dashicons-marker',
				'type'          => 'radio',
				'required'      => false,
				'choice_style'  => 'default', // 'default' = list, 'cards' = image cards with title/description/badge
				'choices_source'=> 'manual',  // 'manual' | 'acf_repeater'
				'acf_repeater_key' => '',
				'acf_repeater_map' => array( 'value' => 'row_index', 'label' => '', 'image' => '', 'description' => '', 'badge' => '' ),
				'choices'       => array(
					array( 'value' => 'yes', 'label' => __( 'Yes', 'custom-form-builder' ) ),
					array( 'value' => 'no', 'label' => __( 'No', 'custom-form-builder' ) ),
				),
				'depends_on'    => '',       // Field ID this field depends on (show only when that field has one of depends_on_values).
				'depends_on_values' => '',  // Comma-separated values; when dependency field has one of these, show this field.
				'acf_field'     => '',
				'acf_field_key' => '',
			),
			'checkbox'     => array(
				'label'         => __( 'Checkboxes', 'custom-form-builder' ),
				'name'          => '',
				'custom_id'     => '',
				'icon'          => 'dashicons-yes',
				'type'          => 'checkbox',
				'required'      => false,
				'choices'       => array(
					array( 'value' => 'opt1', 'label' => __( 'Option 1', 'custom-form-builder' ) ),
				),
				'depends_on'    => '',
				'depends_on_values' => '',
				'acf_field'     => '',
				'acf_field_key' => '',
			),
			'file'         => array(
				'label'         => __( 'File Upload', 'custom-form-builder' ),
				'name'          => '',
				'custom_id'     => '',
				'icon'          => 'dashicons-upload',
				'type'          => 'file',
				'required'      => false,
				'accept'        => '', // e.g. image/*,.pdf or use preset
				'max_size'      => 2,   // MB
				'multiple'      => false,
				'acf_field'     => '',
				'acf_field_key' => '',
				'depends_on'    => '',
				'depends_on_values' => '',
			),
			'section'      => array(
				'label'        => __( 'Section / Heading', 'custom-form-builder' ),
				'name'         => '',
				'custom_id'    => '',
				'icon'         => 'dashicons-editor-break',
				'type'         => 'section',
				'section_title'=> __( 'Section Title', 'custom-form-builder' ),
				'section_desc' => '',
				'acf_field'    => '',
				'acf_field_key'=> '',
				'depends_on'   => '',
				'depends_on_values' => '',
			),
			'page_break'   => array(
				'label'       => __( 'Page Break (Next Step)', 'custom-form-builder' ),
				'name'        => '',
				'custom_id'   => '',
				'icon'        => 'dashicons-randomize',
				'type'        => 'page_break',
				'step_title'  => __( 'Next Step', 'custom-form-builder' ),
				'next_label'  => __( 'Next', 'custom-form-builder' ),
				'prev_label'  => __( 'Previous', 'custom-form-builder' ),
				'depends_on'  => '',
				'depends_on_values' => '',
			),
			'row_break'    => array(
				'label'   => __( 'New row', 'custom-form-builder' ),
				'name'    => '',
				'custom_id' => '',
				'icon'    => 'dashicons-table-row-after',
				'type'    => 'row_break',
				'columns' => 2,
				'depends_on' => '',
				'depends_on_values' => '',
			),
			'group'        => array(
				'label'        => __( 'Group', 'custom-form-builder' ),
				'name'         => '',
				'custom_id'    => '',
				'icon'         => 'dashicons-groups',
				'type'         => 'group',
				'group_label'  => __( 'Group label', 'custom-form-builder' ),
				'columns'      => 2,
				'fields'       => array(),
				'depends_on'   => '',
				'depends_on_values' => '',
			),
			'hidden'       => array(
				'label'         => __( 'Hidden', 'custom-form-builder' ),
				'name'          => '',
				'custom_id'     => '',
				'icon'          => 'dashicons-hidden',
				'type'          => 'hidden',
				'default_value' => '',
				'acf_field'     => '',
				'acf_field_key' => '',
				'depends_on'    => '',
				'depends_on_values' => '',
			),
			'html'         => array(
				'label'            => __( 'HTML Block', 'custom-form-builder' ),
				'name'             => '',
				'custom_id'        => '',
				'icon'             => 'dashicons-editor-code',
				'type'             => 'html',
				'html_content'     => '',
				'allow_shortcodes' => false,
				'allow_full_html'  => false,
				'depends_on'       => '',
				'depends_on_values' => '',
			),
		);
	}

	/**
	 * Generate a unique ID for a new field. Considers nested fields inside groups.
	 *
	 * @param array $existing_fields Current form fields (may contain groups with nested fields).
	 * @return string
	 */
	public static function next_field_id( $existing_fields = array() ) {
		$ids = self::collect_all_field_ids( $existing_fields );
		$n = 1;
		while ( in_array( 'field_' . $n, $ids, true ) ) {
			$n++;
		}
		return 'field_' . $n;
	}

	/**
	 * Collect all field IDs from a fields array (including nested group.fields).
	 *
	 * @param array $fields Form fields (may contain type group with 'fields' key).
	 * @return array List of ids.
	 */
	public static function collect_all_field_ids( $fields = array() ) {
		$ids = array();
		foreach ( $fields as $f ) {
			if ( ! empty( $f['id'] ) ) {
				$ids[] = $f['id'];
			}
			if ( isset( $f['type'] ) && $f['type'] === 'group' && ! empty( $f['fields'] ) && is_array( $f['fields'] ) ) {
				$ids = array_merge( $ids, self::collect_all_field_ids( $f['fields'] ) );
			}
		}
		return $ids;
	}

	/**
	 * Sanitize field name (slug) for use in names and entries.
	 *
	 * @param string $name Raw name.
	 * @return string
	 */
	public static function sanitize_field_name( $name ) {
		$name = sanitize_title( $name );
		$name = str_replace( '-', '_', $name );
		return preg_replace( '/[^a-z0-9_]/i', '', $name ) ?: '';
	}

	/**
	 * Sanitize custom ID for use as HTML id attribute (must be valid in DOM/CSS).
	 *
	 * @param string $custom_id Raw custom ID.
	 * @param string $fallback  Fallback when empty or invalid.
	 * @return string
	 */
	public static function sanitize_custom_id( $custom_id, $fallback = '' ) {
		if ( ! is_string( $custom_id ) || trim( $custom_id ) === '' ) {
			return $fallback;
		}
		$id = preg_replace( '/[^a-zA-Z0-9_-]/', '', $custom_id );
		// HTML id must not start with a number
		if ( $id !== '' && preg_match( '/^[0-9]/', $id ) ) {
			$id = 'f-' . $id;
		}
		return $id !== '' ? $id : $fallback;
	}

	/**
	 * Sanitize CSS class string (space-separated tokens, each [a-zA-Z0-9_-]).
	 *
	 * @param string $input Raw class attribute value.
	 * @return string Sanitized classes, space-separated, or empty string.
	 */
	public static function sanitize_css_class( $input ) {
		if ( ! is_string( $input ) || trim( $input ) === '' ) {
			return '';
		}
		$tokens = preg_split( '/\s+/', trim( $input ), -1, PREG_SPLIT_NO_EMPTY );
		$out = array();
		foreach ( $tokens as $token ) {
			$clean = preg_replace( '/[^a-zA-Z0-9_-]/', '', $token );
			if ( $clean !== '' ) {
				$out[] = $clean;
			}
		}
		return implode( ' ', $out );
	}

	/**
	 * Create a new field config from a type key.
	 *
	 * @param string $type_key Type key from get_builder_fields().
	 * @param array  $existing_fields Current form fields (for unique ID).
	 * @return array
	 */
	public static function create_field( $type_key, $existing_fields = array() ) {
		$types = self::get_builder_fields();
		if ( ! isset( $types[ $type_key ] ) ) {
			return array();
		}
		$field = $types[ $type_key ];
		$field['id'] = self::next_field_id( $existing_fields );
		if ( $type_key === 'group' ) {
			$field['label'] = ( isset( $field['label'] ) ? $field['label'] : 'Group' ) . ' (' . $field['id'] . ')';
			$field['fields'] = isset( $field['fields'] ) ? $field['fields'] : array();
		} else {
			$field['label'] = ( isset( $field['label'] ) ? $field['label'] : $type_key ) . ' (' . $field['id'] . ')';
		}
		if ( empty( $field['name'] ) && $type_key !== 'group' ) {
			$field['name'] = $field['id'];
		}
		return $field;
	}
}
