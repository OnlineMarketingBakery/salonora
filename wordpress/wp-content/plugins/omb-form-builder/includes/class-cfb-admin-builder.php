<?php
/**
 * Admin form builder: drag-and-drop UI and form editor.
 *
 * @package Custom_Form_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CFB_Admin_Builder {

	private static $instance = null;

	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'save_post_cfb_form', array( $this, 'save_form_meta' ), 10, 2 );
		add_filter( 'manage_cfb_form_posts_columns', array( $this, 'form_columns' ) );
		add_action( 'manage_cfb_form_posts_custom_column', array( $this, 'form_column_content' ), 10, 2 );
	}

	public function add_meta_boxes() {
		add_meta_box(
			'cfb_form_builder',
			__( 'OMB Forms', 'custom-form-builder' ),
			array( $this, 'render_builder' ),
			'cfb_form',
			'normal',
			'high'
		);
		add_meta_box(
			'cfb_form_shortcode',
			__( 'Shortcode', 'custom-form-builder' ),
			array( $this, 'render_shortcode' ),
			'cfb_form',
			'side'
		);
		add_meta_box(
			'cfb_form_settings',
			__( 'Form Settings', 'custom-form-builder' ),
			array( $this, 'render_settings' ),
			'cfb_form',
			'side'
		);
	}

	public function enqueue_scripts( $hook ) {
		$screen = get_current_screen();
		if ( ! $screen || $screen->post_type !== 'cfb_form' || $screen->base !== 'post' ) {
			return;
		}

		wp_enqueue_style(
			'cfb-admin-builder',
			CFB_PLUGIN_URL . 'assets/css/admin-builder.css',
			array(),
			(string) filemtime( CFB_PLUGIN_DIR . 'assets/css/admin-builder.css' )
		);

		wp_enqueue_media();

		wp_enqueue_script(
			'cfb-admin-builder',
			CFB_PLUGIN_URL . 'assets/js/admin-builder.js',
			array( 'jquery', 'wp-api-fetch' ),
			(string) filemtime( CFB_PLUGIN_DIR . 'assets/js/admin-builder.js' ),
			true
		);

		$form_id = isset( $_GET['post'] ) ? (int) $_GET['post'] : 0;
		$fields  = $form_id ? CFB_Form_Post_Type::get_form_fields( $form_id ) : array();
		$settings = $form_id ? CFB_Form_Post_Type::get_form_settings( $form_id ) : array();

		wp_localize_script( 'cfb-admin-builder', 'cfbBuilder', array(
			'formId'       => $form_id,
			'fields'       => $fields,
			'settings'     => $settings,
			'fieldTypes'   => CFB_Field_Types::get_builder_fields(),
			'restUrl'      => rest_url( 'custom-form-builder/v1/' ),
			'nonce'        => wp_create_nonce( 'wp_rest' ),
			'i18n'         => array(
				'addField'       => __( 'Add Field', 'custom-form-builder' ),
				'fieldName'      => __( 'Field name', 'custom-form-builder' ),
				'fieldNameHelp'  => __( 'Unique name for this field (used in entries/exports). Letters, numbers, underscores. Leave blank to use Field ID.', 'custom-form-builder' ),
				'customId'       => __( 'Custom ID', 'custom-form-builder' ),
				'customIdHelp'   => __( 'Applied to the input\'s id attribute for JavaScript/CSS targeting. Leave blank for default.', 'custom-form-builder' ),
				'cssClass'       => __( 'CSS class', 'custom-form-builder' ),
				'cssClassHelp'   => __( 'Optional space-separated classes added to the field wrapper for custom styling.', 'custom-form-builder' ),
				'layout'         => __( 'Layout', 'custom-form-builder' ),
				'layoutDefault'  => __( 'Default (block)', 'custom-form-builder' ),
				'layoutInline'   => __( 'Inline (label + input on one line)', 'custom-form-builder' ),
				'layoutHelp'     => __( 'Control how the label and input are arranged.', 'custom-form-builder' ),
				'htmlContent'    => __( 'HTML Content', 'custom-form-builder' ),
				'htmlContentHelp'=> __( 'Add any HTML: headings, paragraphs, lists, images, or layout divs. Example: &lt;h2&gt;Title&lt;/h2&gt;&lt;p&gt;Description text.&lt;/p&gt;', 'custom-form-builder' ),
				'allowShortcodes'=> __( 'Process shortcodes', 'custom-form-builder' ),
				'allowFullHtml'  => __( 'Allow full HTML', 'custom-form-builder' ),
				'allowFullHtmlHelp' => __( 'Output content without sanitization so you can use any HTML (custom classes, iframes, etc.). Only enable if you need it.', 'custom-form-builder' ),
				'rowBreakHelp'      => __( 'Fields after this item will appear on a new row and can sit side by side. Drag to reorder like other fields.', 'custom-form-builder' ),
				'rowColumns'        => __( 'Columns', 'custom-form-builder' ),
				'columns1'          => __( '1 (full width)', 'custom-form-builder' ),
				'columns2'          => __( '2', 'custom-form-builder' ),
				'columns3'          => __( '3', 'custom-form-builder' ),
				'columns4'          => __( '4', 'custom-form-builder' ),
				'groupLabel'         => __( 'Group label', 'custom-form-builder' ),
				'groupLabelHelp'     => __( 'Title shown above this group on the form (e.g. "Gewenste gevelafwerking")', 'custom-form-builder' ),
				'groupColumns'      => __( 'Row columns', 'custom-form-builder' ),
				'groupColumnsHelp'   => __( 'Number of columns for rows inside this group.', 'custom-form-builder' ),
				'addFieldToGroup'    => __( 'Add field to group', 'custom-form-builder' ),
				'label'          => __( 'Label', 'custom-form-builder' ),
				'placeholder'    => __( 'Placeholder', 'custom-form-builder' ),
				'defaultValue'   => __( 'Default Value', 'custom-form-builder' ),
				'required'       => __( 'Required', 'custom-form-builder' ),
				'formula'        => __( 'Formula', 'custom-form-builder' ),
				'formulaHelp'    => __( 'Use {field_1}, {field_2} for field values. Example: {field_1} * {field_2}', 'custom-form-builder' ),
				'mergeTemplate'  => __( 'Template', 'custom-form-builder' ),
				'mergeTemplateHelp' => __( 'Use {field_1}, {field_2} to insert the value of other fields. Updates live as the user fills the form.', 'custom-form-builder' ),
				'choices'        => __( 'Choices', 'custom-form-builder' ),
				'value'          => __( 'Value', 'custom-form-builder' ),
				'option'         => __( 'Option', 'custom-form-builder' ),
				'choiceStyle'    => __( 'Display as', 'custom-form-builder' ),
				'choiceStyleList'=> __( 'List (default)', 'custom-form-builder' ),
				'choiceStyleCards'=> __( 'Image cards', 'custom-form-builder' ),
				'choiceStyleHelp' => __( 'Image cards show each option as a card with image, title, description, and optional badge.', 'custom-form-builder' ),
				'radioDefaultSelected' => __( 'Default selected', 'custom-form-builder' ),
				'radioDefaultSelectedHelp' => __( 'Which option should be selected by default. Choose None for no default.', 'custom-form-builder' ),
				'noDefault'       => __( 'None', 'custom-form-builder' ),
				'dependsOn'       => __( 'Show when', 'custom-form-builder' ),
				'dependsOnNone'   => __( '— None —', 'custom-form-builder' ),
				'dependsOnHelp'   => __( 'Show this field only when the selected field has one of the values below.', 'custom-form-builder' ),
				'dependsOnValues' => __( 'When value is (comma-separated)', 'custom-form-builder' ),
				'dependsOnValuesHelp' => __( 'Enter values from the other field; this field is shown when that field\'s value matches one of these.', 'custom-form-builder' ),
				'choiceDescription' => __( 'Description', 'custom-form-builder' ),
				'choiceImage'    => __( 'Image URL', 'custom-form-builder' ),
				'selectImage'    => __( 'Select image', 'custom-form-builder' ),
				'clearImage'     => __( 'Clear', 'custom-form-builder' ),
				'choiceBadge'    => __( 'Badge (e.g. POPULAR)', 'custom-form-builder' ),
				'choicesFrom'    => __( 'Choices from', 'custom-form-builder' ),
				'choicesFromManual' => __( 'Manual (enter below)', 'custom-form-builder' ),
				'mapLabelFrom'   => __( 'Title/Label from', 'custom-form-builder' ),
				'mapImageFrom'   => __( 'Image from', 'custom-form-builder' ),
				'mapDescFrom'    => __( 'Description from', 'custom-form-builder' ),
				'mapBadgeFrom'   => __( 'Badge from', 'custom-form-builder' ),
				'mapValueFrom'   => __( 'Value from', 'custom-form-builder' ),
				'rowIndex'       => __( 'Row index (0, 1, 2…)', 'custom-form-builder' ),
				'noneOptional'   => __( '— None —', 'custom-form-builder' ),
				'addChoice'      => __( 'Add choice', 'custom-form-builder' ),
				'remove'         => __( 'Remove', 'custom-form-builder' ),
				'dragToReorder'  => __( 'Drag to reorder', 'custom-form-builder' ),
				'dragLabel'      => __( 'Drag', 'custom-form-builder' ),
				'min'            => __( 'Min', 'custom-form-builder' ),
				'max'            => __( 'Max', 'custom-form-builder' ),
				'step'           => __( 'Step', 'custom-form-builder' ),
				'decimals'       => __( 'Decimals', 'custom-form-builder' ),
				'format'         => __( 'Format', 'custom-form-builder' ),
				'decimal'        => __( 'Decimal', 'custom-form-builder' ),
				'currency'       => __( 'Currency', 'custom-form-builder' ),
				'percentage'     => __( 'Percentage', 'custom-form-builder' ),
				'stepTitle'      => __( 'Step title', 'custom-form-builder' ),
				'stepTitleHelp'  => __( 'Title shown for the next step (e.g. "Contact details")', 'custom-form-builder' ),
				'sectionTitleStepHelp' => __( 'If this is the first section in the form, it is used as the name of Step 1 in the progress bar.', 'custom-form-builder' ),
				'nextLabel'      => __( 'Next button text', 'custom-form-builder' ),
				'prevLabel'      => __( 'Previous button text', 'custom-form-builder' ),
				'sectionTitle'   => __( 'Section title', 'custom-form-builder' ),
				'sectionDesc'    => __( 'Section description (optional)', 'custom-form-builder' ),
				'accept'         => __( 'Accept file types', 'custom-form-builder' ),
				'acceptHelp'     => __( 'Optional: leave empty for any file, or set e.g. image/*,.pdf', 'custom-form-builder' ),
				'acceptAny'      => __( 'Any file type', 'custom-form-builder' ),
				'acceptImages'   => __( 'Images only (image/*)', 'custom-form-builder' ),
				'acceptDocuments'=> __( 'Documents (.pdf, .doc, .docx)', 'custom-form-builder' ),
				'acceptImagesPdf'=> __( 'Images and PDF', 'custom-form-builder' ),
				'acceptAudio'    => __( 'Audio', 'custom-form-builder' ),
				'acceptVideo'    => __( 'Video', 'custom-form-builder' ),
				'acceptCustom'   => __( 'Custom (enter below)', 'custom-form-builder' ),
				'maxSize'        => __( 'Max file size (MB)', 'custom-form-builder' ),
				'allowMultipleFiles' => __( 'Allow multiple files', 'custom-form-builder' ),
				'allowMultipleFilesHelp' => __( 'User can select one or more files at once.', 'custom-form-builder' ),
				'defaultFromToday'   => __( 'Default From date to today', 'custom-form-builder' ),
				'defaultFromTodayHelp'=> __( 'Pre-fill the From date with the current date.', 'custom-form-builder' ),
				'allowFromPast'       => __( 'Allow From date before today', 'custom-form-builder' ),
				'allowFromPastHelp'   => __( 'When unchecked, the From date cannot be before the current date.', 'custom-form-builder' ),
				'allowMultipleSelections' => __( 'Allow multiple selections', 'custom-form-builder' ),
				'allowMultipleSelectionsHelp' => __( 'User can select more than one option.', 'custom-form-builder' ),
				'saved'          => __( 'Saved.', 'custom-form-builder' ),
				'error'          => __( 'Error saving.', 'custom-form-builder' ),
				'displayOnly'    => __( 'Display only (don\'t save in entries)', 'custom-form-builder' ),
				'displayOnlyHelp'=> __( 'When checked, this field is shown to the user but its value is not stored in form entries.', 'custom-form-builder' ),
			),
		) );
	}

	public function render_builder( $post ) {
		?>
		<div id="cfb-form-builder" class="cfb-builder-wrap">
			<div class="cfb-fields-palette-wrap">
				<div class="cfb-omb-brand">
					<span class="cfb-omb-title"><?php esc_html_e( 'Add fields', 'custom-form-builder' ); ?></span>
				</div>
				<ul class="cfb-palette-list" id="cfb-palette-list">
					<?php
					foreach ( CFB_Field_Types::get_builder_fields() as $key => $def ) {
						echo '<li class="cfb-palette-item" data-type="' . esc_attr( $key ) . '" title="' . esc_attr( $def['label'] ) . '">';
						echo '<span class="dashicons ' . esc_attr( $def['icon'] ) . '"></span>';
						echo '<span class="cfb-palette-label">' . esc_html( $def['label'] ) . '</span>';
						echo '</li>';
					}
					?>
				</ul>
			</div>
			<div class="cfb-builder-layout">
				<div class="cfb-form-canvas">
					<h3><?php esc_html_e( 'Form layout', 'custom-form-builder' ); ?></h3>
					<p class="cfb-drag-hint"><?php esc_html_e( 'Click a field type to add it. Use the "Drag" handle on the left of each row to reorder.', 'custom-form-builder' ); ?></p>
					<ul class="cfb-form-fields-list" id="cfb-form-fields-list">
						<!-- Populated by JS -->
					</ul>
				</div>
				<div class="cfb-field-settings" id="cfb-field-settings">
					<h3><?php esc_html_e( 'Field settings', 'custom-form-builder' ); ?></h3>
					<p class="cfb-select-field-hint"><?php esc_html_e( 'Select a field to edit its settings.', 'custom-form-builder' ); ?></p>
					<div class="cfb-field-settings-inner" id="cfb-field-settings-inner"></div>
				</div>
			</div>
			<input type="hidden" name="cfb_fields_json" id="cfb_fields_json" value="" />
		</div>
		<?php
	}

	public function render_shortcode( $post ) {
		if ( $post->post_status !== 'publish' ) {
			echo '<p>' . esc_html__( 'Publish the form to get the shortcode.', 'custom-form-builder' ) . '</p>';
			return;
		}
		$shortcode = '[cfb_form id="' . (int) $post->ID . '"]';
		echo '<p><input type="text" class="widefat" readonly value="' . esc_attr( $shortcode ) . '" onclick="this.select();" /></p>';
	}

	public function render_settings( $post ) {
		$settings = CFB_Form_Post_Type::get_form_settings( $post->ID );
		$fields   = CFB_Form_Post_Type::get_form_fields( $post->ID );
		$num_breaks = CFB_Form_Post_Type::count_page_breaks( $fields );
		$step_titles = isset( $settings['step_titles'] ) && is_array( $settings['step_titles'] ) ? $settings['step_titles'] : array();
		?>
		<p>
			<label for="cfb_submit_label"><?php esc_html_e( 'Submit button text', 'custom-form-builder' ); ?></label>
			<input type="text" id="cfb_submit_label" name="cfb_settings[submit_label]" class="widefat" value="<?php echo esc_attr( $settings['submit_label'] ); ?>" />
		</p>
		<p>
			<label for="cfb_success_message"><?php esc_html_e( 'Success message (confirmation shown to user after submit)', 'custom-form-builder' ); ?></label>
			<textarea id="cfb_success_message" name="cfb_settings[success_message]" class="widefat" rows="3"><?php echo esc_textarea( $settings['success_message'] ); ?></textarea>
		</p>
		<p>
			<label for="cfb_redirect_page"><?php esc_html_e( 'Redirect after submit', 'custom-form-builder' ); ?></label>
			<?php
			$redirect_url = isset( $settings['redirect_url'] ) ? trim( (string) $settings['redirect_url'] ) : '';
			$pages        = get_posts( array(
				'post_type'      => 'page',
				'post_status'    => 'publish',
				'numberposts'    => -1,
				'orderby'        => 'title',
				'order'          => 'ASC',
				'posts_per_page' => -1,
			) );
			$page_urls    = array();
			foreach ( $pages as $page ) {
				$page_urls[ get_permalink( $page ) ] = $page->post_title;
			}
			$redirect_is_page = $redirect_url && isset( $page_urls[ $redirect_url ] );
			?>
			<select id="cfb_redirect_page" class="widefat">
				<option value=""><?php esc_html_e( 'No redirect (show success message)', 'custom-form-builder' ); ?></option>
				<?php foreach ( $page_urls as $url => $title ) : ?>
					<option value="<?php echo esc_attr( $url ); ?>" <?php selected( $redirect_url, $url ); ?>><?php echo esc_html( $title ); ?></option>
				<?php endforeach; ?>
				<option value="__custom__" <?php selected( $redirect_url && ! $redirect_is_page ); ?>><?php esc_html_e( 'Custom URL...', 'custom-form-builder' ); ?></option>
			</select>
			<input type="text" id="cfb_redirect_url_custom" class="widefat" style="margin-top:6px; display:<?php echo ( $redirect_url && ! $redirect_is_page ) ? 'block' : 'none'; ?>;" placeholder="<?php esc_attr_e( 'Enter full URL', 'custom-form-builder' ); ?>" value="<?php echo $redirect_url && ! $redirect_is_page ? esc_attr( $redirect_url ) : ''; ?>" />
			<input type="hidden" id="cfb_redirect_url" name="cfb_settings[redirect_url]" value="<?php echo esc_attr( $redirect_url ); ?>" />
			<span class="description"><?php esc_html_e( 'Choose a page to redirect to after successful submit, or leave as "No redirect" to show the success message.', 'custom-form-builder' ); ?></span>
		</p>
		<script>
		(function() {
			var sel = document.getElementById('cfb_redirect_page');
			var customInput = document.getElementById('cfb_redirect_url_custom');
			var hidden = document.getElementById('cfb_redirect_url');
			if (!sel || !customInput || !hidden) return;
			function sync() {
				var val = sel.value;
				if (val === '__custom__') {
					customInput.style.display = 'block';
					hidden.value = customInput.value.trim();
				} else {
					customInput.style.display = 'none';
					hidden.value = val || '';
				}
			}
			sel.addEventListener('change', sync);
			customInput.addEventListener('input', sync);
			customInput.addEventListener('change', sync);
		})();
		</script>
		<p>
			<label><input type="checkbox" name="cfb_settings[save_entries]" value="1" <?php checked( ! empty( $settings['save_entries'] ) ); ?> /> <?php esc_html_e( 'Save entries', 'custom-form-builder' ); ?></label>
		</p>
		<p>
			<label><input type="checkbox" name="cfb_settings[send_admin_email]" value="1" <?php checked( ! isset( $settings['send_admin_email'] ) || ! empty( $settings['send_admin_email'] ) ); ?> /> <?php esc_html_e( 'Send notification email to admin on submit', 'custom-form-builder' ); ?></label>
		</p>
		<p class="cfb-admin-email-row">
			<label for="cfb_admin_email"><?php esc_html_e( 'Notification email address', 'custom-form-builder' ); ?></label>
			<input type="email" id="cfb_admin_email" name="cfb_settings[admin_email]" class="widefat" value="<?php echo esc_attr( isset( $settings['admin_email'] ) ? $settings['admin_email'] : '' ); ?>" placeholder="<?php echo esc_attr( get_option( 'admin_email' ) ); ?>" />
			<span class="description"><?php esc_html_e( 'Leave empty to use the site admin email.', 'custom-form-builder' ); ?></span>
		</p>
		<?php
		$max_steps = 15;
		$num_steps_initial = $num_breaks > 0 ? $num_breaks + 1 : 0;
		?>
		<div id="cfb-settings-step-titles-container" class="cfb-settings-step-titles" style="margin:1em 0;<?php echo $num_breaks === 0 ? ' display:none;' : ''; ?>">
			<p><strong><?php esc_html_e( 'Step titles', 'custom-form-builder' ); ?></strong></p>
			<p class="description" style="margin-bottom:8px;"><?php esc_html_e( 'One title per step (you have one step more than page breaks). Shown in the progress bar. Updates when you add/remove page breaks.', 'custom-form-builder' ); ?></p>
			<?php for ( $i = 0; $i < $max_steps; $i++ ) : ?>
			<p class="cfb-step-title-row" data-step-index="<?php echo (int) $i; ?>"<?php echo $i >= $num_steps_initial ? ' style="display:none;"' : ''; ?>>
				<label for="cfb_step_title_<?php echo (int) $i; ?>"><?php echo esc_html( sprintf( __( 'Step %d title', 'custom-form-builder' ), $i + 1 ) ); ?></label>
				<input type="text" id="cfb_step_title_<?php echo (int) $i; ?>" name="cfb_settings[step_titles][<?php echo (int) $i; ?>]" class="widefat" value="<?php echo esc_attr( isset( $step_titles[ $i ] ) ? $step_titles[ $i ] : '' ); ?>" placeholder="<?php esc_attr_e( 'e.g. Contact details', 'custom-form-builder' ); ?>" />
			</p>
			<?php endfor; ?>
		</div>
		<p>
			<label for="cfb_default_row_columns"><?php esc_html_e( 'Default row columns', 'custom-form-builder' ); ?></label>
			<input type="number" id="cfb_default_row_columns" name="cfb_settings[default_row_columns]" min="1" max="12" value="<?php echo esc_attr( isset( $settings['default_row_columns'] ) ? max( 1, min( 12, (int) $settings['default_row_columns'] ) ) : 1 ); ?>" />
			<p class="description"><?php esc_html_e( "Number of columns for the first row in each step when there's no 'New row' before it (1–12).", 'custom-form-builder' ); ?></p>
		</p>
		<p>
			<label for="cfb_custom_css"><?php esc_html_e( 'Custom CSS', 'custom-form-builder' ); ?></label>
			<textarea id="cfb_custom_css" name="cfb_settings[custom_css]" class="widefat" rows="8" placeholder="<?php esc_attr_e( 'e.g. .my-radio input { appearance: none; width: 20px; height: 20px; border-radius: 50%; }', 'custom-form-builder' ); ?>"><?php echo esc_textarea( isset( $settings['custom_css'] ) ? $settings['custom_css'] : '' ); ?></textarea>
			<p class="description"><?php echo esc_html( sprintf( __( 'Optional CSS for this form. Use field CSS classes or Custom IDs from Field settings to target elements. Scope to this form with: .cfb-form-wrapper[data-form-id="%d"] .your-class', 'custom-form-builder' ), (int) $post->ID ) ); ?></p>
		</p>
		<?php
	}

	public function save_form_meta( $post_id, $post ) {
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		if ( isset( $_POST['cfb_settings'] ) && is_array( $_POST['cfb_settings'] ) ) {
			$settings = wp_unslash( $_POST['cfb_settings'] );
			if ( ! empty( $_POST['cfb_fields_json'] ) ) {
				$decoded = json_decode( stripslashes( $_POST['cfb_fields_json'] ), true );
				if ( is_array( $decoded ) ) {
					$num_breaks = CFB_Form_Post_Type::count_page_breaks( $decoded );
					if ( $num_breaks === 0 ) {
						$settings['step_titles'] = array();
					} else {
						$num_steps = $num_breaks + 1;
						$step_titles = isset( $settings['step_titles'] ) && is_array( $settings['step_titles'] ) ? array_values( $settings['step_titles'] ) : array();
						$settings['step_titles'] = array_slice( $step_titles, 0, $num_steps );
					}
				}
			}
			CFB_Form_Post_Type::save_form_settings( $post_id, $settings );
		}
		// Fields are saved via REST from the builder JS; if not using REST we could save from cfb_fields_json here
		if ( ! empty( $_POST['cfb_fields_json'] ) ) {
			$decoded = json_decode( stripslashes( $_POST['cfb_fields_json'] ), true );
			if ( is_array( $decoded ) ) {
				CFB_Form_Post_Type::save_form_fields( $post_id, $decoded );
			}
		}
	}

	public function form_columns( $columns ) {
		$new = array();
		$new['cb'] = $columns['cb'];
		$new['title'] = $columns['title'];
		$new['cfb_shortcode'] = __( 'Shortcode', 'custom-form-builder' );
		$new['date'] = $columns['date'];
		return $new;
	}

	public function form_column_content( $column, $post_id ) {
		if ( $column === 'cfb_shortcode' ) {
			echo '<code>[cfb_form id="' . (int) $post_id . '"]</code>';
		}
	}
}
