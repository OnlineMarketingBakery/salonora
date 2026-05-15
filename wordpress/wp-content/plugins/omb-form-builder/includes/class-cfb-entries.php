<?php
/**
 * Form entries storage (custom table or post type).
 *
 * @package Custom_Form_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CFB_Entries {

	private static $instance = null;
	const POST_TYPE = 'cfb_entry';

	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'admin_menu', array( $this, 'add_entries_menu' ) );
		add_action( 'admin_init', array( $this, 'handle_delete_entry' ) );
		add_action( 'add_meta_boxes', array( $this, 'add_entry_data_meta_box' ) );
		add_action( 'admin_head', array( $this, 'hide_add_new_on_entries_list' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_entries_page_assets' ) );
		add_action( 'wp_ajax_cfb_get_entry_modal', array( $this, 'ajax_get_entry_modal' ) );
	}

	public function register_post_type() {
		register_post_type( self::POST_TYPE, array(
			'labels'             => array(
				'name'               => _x( 'Form Entries', 'post type general name', 'custom-form-builder' ),
				'singular_name'      => _x( 'Entry', 'post type singular name', 'custom-form-builder' ),
				'menu_name'          => _x( 'Entries', 'admin menu', 'custom-form-builder' ),
				'view_item'          => __( 'View Entry', 'custom-form-builder' ),
				'search_items'       => __( 'Search Entries', 'custom-form-builder' ),
				'not_found'          => __( 'No entries found.', 'custom-form-builder' ),
			),
			'public'             => false,
			'show_ui'            => true,
			'show_in_menu'       => false,
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
	 * Hide "Add Post" / "Add New" button on the Form Entries list (entries are created only by form submission).
	 */
	public function hide_add_new_on_entries_list() {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( $screen && $screen->id === 'edit-' . self::POST_TYPE ) {
			echo '<style>.edit-' . esc_attr( self::POST_TYPE ) . ' .page-title-action { display: none !important; }</style>';
		}
	}

	/**
	 * Add Entries as a submenu under Form Builder (lists forms; each form shows its submissions).
	 */
	public function add_entries_menu() {
		if ( ! class_exists( 'CFB_Form_Post_Type' ) ) {
			return;
		}
		add_submenu_page(
			'edit.php?post_type=' . CFB_Form_Post_Type::POST_TYPE,
			_x( 'Entries', 'admin menu', 'custom-form-builder' ),
			_x( 'Entries', 'admin menu', 'custom-form-builder' ),
			'edit_posts',
			'cfb-entries',
			array( $this, 'render_entries_page' )
		);
	}

	/**
	 * Handle delete entry request (admin only). Redirects back to form entries list.
	 */
	public function handle_delete_entry() {
		if ( ! isset( $_GET['page'] ) || $_GET['page'] !== 'cfb-entries' || ! isset( $_GET['action'] ) || $_GET['action'] !== 'delete_entry' ) {
			return;
		}
		$entry_id = isset( $_GET['entry_id'] ) ? (int) $_GET['entry_id'] : 0;
		$form_id  = isset( $_GET['form_id'] ) ? (int) $_GET['form_id'] : 0;
		if ( $entry_id <= 0 || $form_id <= 0 ) {
			return;
		}
		if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'cfb_delete_entry_' . $entry_id ) ) {
			return;
		}
		if ( ! current_user_can( 'delete_post', $entry_id ) ) {
			return;
		}
		$entry = get_post( $entry_id );
		if ( ! $entry || $entry->post_type !== self::POST_TYPE ) {
			return;
		}
		wp_delete_post( $entry_id, true );
		$redirect = add_query_arg( array( 'page' => 'cfb-entries', 'form_id' => $form_id, 'deleted' => 1 ), admin_url( 'admin.php' ) );
		wp_safe_redirect( $redirect );
		exit;
	}

	/**
	 * AJAX: return HTML for entry modal (read-only field list).
	 */
	public function ajax_get_entry_modal() {
		$entry_id = isset( $_POST['entry_id'] ) ? (int) $_POST['entry_id'] : 0;
		if ( $entry_id <= 0 ) {
			wp_send_json_error( array( 'message' => __( 'Invalid entry.', 'custom-form-builder' ) ) );
		}
		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied.', 'custom-form-builder' ) ) );
		}
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'cfb_entry_modal' ) ) {
			wp_send_json_error( array( 'message' => __( 'Security check failed.', 'custom-form-builder' ) ) );
		}
		$html = self::get_entry_data_html( $entry_id );
		if ( $html === '' ) {
			wp_send_json_error( array( 'message' => __( 'Entry not found or no data.', 'custom-form-builder' ) ) );
		}
		wp_send_json_success( array( 'html' => $html ) );
	}

	/**
	 * Get a human-readable display label for a field (for entry details).
	 * Prefers label, then custom name, then a humanized id (e.g. field_9 → Field 9).
	 *
	 * @param array  $field Field config (id, label, name, type, ...).
	 * @param string $id    Field id (key in entry data).
	 * @return string
	 */
	public static function get_field_display_label( $field, $id ) {
		$label = isset( $field['label'] ) ? trim( (string) $field['label'] ) : '';
		if ( $label !== '' ) {
			return $label;
		}
		$name = isset( $field['name'] ) ? trim( (string) $field['name'] ) : '';
		if ( $name !== '' && $name !== $id ) {
			// Use custom field name; make it a bit more readable (underscores to spaces, capitalize)
			return ucfirst( str_replace( '_', ' ', $name ) );
		}
		// Humanize id: field_9 → Field 9, field_14 → Field 14
		if ( preg_match( '/^field[_-]?(\d+)$/i', $id, $m ) ) {
			return sprintf( __( 'Field %s', 'custom-form-builder' ), $m[1] );
		}
		return str_replace( array( '_', '-' ), ' ', ucfirst( $id ) );
	}

	/**
	 * Get read-only HTML for an entry's submitted data (used in modal and AJAX).
	 *
	 * @param int $entry_id Entry post ID.
	 * @return string HTML table or empty string.
	 */
	public static function get_entry_data_html( $entry_id ) {
		$form_id = self::get_entry_form_id( $entry_id );
		$data    = self::get_entry_data( $entry_id );
		if ( ! $form_id ) {
			return '';
		}
		if ( ! class_exists( 'CFB_Form_Post_Type' ) ) {
			return '';
		}
		$fields = CFB_Form_Post_Type::get_form_fields( $form_id );
		$flat   = CFB_Form_Post_Type::get_flattened_fields( $fields );
		$labels = array();
		$field_types = array();
		foreach ( $flat as $f ) {
			$id = isset( $f['id'] ) ? $f['id'] : '';
			if ( $id !== '' ) {
				$labels[ $id ] = self::get_field_display_label( $f, $id );
				$field_types[ $id ] = isset( $f['type'] ) ? $f['type'] : '';
			}
		}
		if ( empty( $data ) ) {
			return '<p>' . esc_html__( 'No submitted data for this entry.', 'custom-form-builder' ) . '</p>';
		}
		$out = '<table class="widefat striped" style="margin:0;"><tbody>';
		foreach ( $data as $key => $value ) {
			$label = isset( $labels[ $key ] ) ? $labels[ $key ] : self::get_field_display_label( array( 'id' => $key ), $key );
			$type  = isset( $field_types[ $key ] ) ? $field_types[ $key ] : '';
			$cell  = self::format_entry_value_for_display( $value, $type );
			$out .= '<tr><th style="width:30%;vertical-align:top;">' . esc_html( $label ) . '</th><td>' . $cell . '</td></tr>';
		}
		$out .= '</tbody></table>';
		return $out;
	}

	/**
	 * Build HTML body for admin notification email from form_id and entry data array.
	 * Used when sending email on submit (works even if entry is not saved).
	 *
	 * @param int   $form_id    Form post ID.
	 * @param array $entry_data Key-value map of field ids to submitted values.
	 * @return string HTML fragment (table of label/value rows).
	 */
	public static function get_entry_data_html_from_array( $form_id, $entry_data ) {
		if ( ! $form_id || ! is_array( $entry_data ) ) {
			return '';
		}
		if ( ! class_exists( 'CFB_Form_Post_Type' ) ) {
			return '';
		}
		$fields = CFB_Form_Post_Type::get_form_fields( $form_id );
		$flat   = CFB_Form_Post_Type::get_flattened_fields( $fields );
		$labels = array();
		$field_types = array();
		foreach ( $flat as $f ) {
			$id = isset( $f['id'] ) ? $f['id'] : '';
			if ( $id !== '' ) {
				$labels[ $id ] = self::get_field_display_label( $f, $id );
				$field_types[ $id ] = isset( $f['type'] ) ? $f['type'] : '';
			}
		}
		if ( empty( $entry_data ) ) {
			return '<p>' . esc_html__( 'No submitted data.', 'custom-form-builder' ) . '</p>';
		}
		$out = '<table border="0" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%; max-width:600px;"><tbody>';
		foreach ( $entry_data as $key => $value ) {
			$label = isset( $labels[ $key ] ) ? $labels[ $key ] : self::get_field_display_label( array( 'id' => $key ), $key );
			$type  = isset( $field_types[ $key ] ) ? $field_types[ $key ] : '';
			$cell  = self::format_entry_value_for_display( $value, $type );
			$out .= '<tr><th style="width:30%;vertical-align:top;text-align:left;border-bottom:1px solid #ddd;">' . esc_html( $label ) . '</th><td style="border-bottom:1px solid #ddd;">' . $cell . '</td></tr>';
		}
		$out .= '</tbody></table>';
		return $out;
	}

	/**
	 * Format a single entry value for display (file URLs become clickable links).
	 *
	 * @param mixed  $value      Raw value (string or array of URLs for multiple files).
	 * @param string $field_type Field type (e.g. 'file').
	 * @return string Safe HTML (escaped text or link(s) for file URLs).
	 */
	public static function format_entry_value_for_display( $value, $field_type = '' ) {
		$is_array = is_array( $value );
		$vals     = $is_array ? $value : array( $value );
		$vals     = array_filter( $vals, function ( $v ) { return $v !== '' && $v !== null; } );

		if ( empty( $vals ) ) {
			return '<span style="color:#999;">' . esc_html__( '(empty)', 'custom-form-builder' ) . '</span>';
		}

		if ( $field_type === 'file' ) {
			$links = array();
			foreach ( $vals as $val ) {
				$val = (string) $val;
				if ( strpos( $val, 'http' ) === 0 || strpos( $val, '/' ) === 0 ) {
					$url  = esc_url( $val );
					$text = strlen( $val ) > 60 ? __( 'View file', 'custom-form-builder' ) : $val;
					$links[] = '<a href="' . $url . '" target="_blank" rel="noopener">' . esc_html( $text ) . '</a>';
				} else {
					$links[] = esc_html( $val );
				}
			}
			return implode( '<br>', $links );
		}

		$val = $is_array ? implode( ', ', $vals ) : (string) $value;
		return esc_html( $val );
	}

	/**
	 * Enqueue script and style for the custom Entries page (form entries list view).
	 */
	public function enqueue_entries_page_assets() {
		if ( ! isset( $_GET['page'] ) || $_GET['page'] !== 'cfb-entries' || empty( $_GET['form_id'] ) ) {
			return;
		}
		$base = CFB_PLUGIN_URL;
		$ver  = defined( 'CFB_VERSION' ) ? CFB_VERSION : '1.0';
		wp_enqueue_style( 'cfb-admin-entries', $base . 'assets/css/admin-entries.css', array(), $ver );
		wp_enqueue_script( 'cfb-admin-entries', $base . 'assets/js/admin-entries.js', array( 'jquery' ), $ver, true );
		wp_localize_script( 'cfb-admin-entries', 'cfbEntries', array(
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
			'nonce'   => wp_create_nonce( 'cfb_entry_modal' ),
			'i18n'    => array(
				'loading' => __( 'Loading…', 'custom-form-builder' ),
				'error'   => __( 'Could not load entry.', 'custom-form-builder' ),
				'close'   => __( 'Close', 'custom-form-builder' ),
			),
		) );
	}

	/**
	 * Get number of entries for a form.
	 *
	 * @param int $form_id Form post ID.
	 * @return int
	 */
	public static function get_entries_count_for_form( $form_id ) {
		$q = new \WP_Query( array(
			'post_type'      => self::POST_TYPE,
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'meta_query'     => array(
				array( 'key' => '_cfb_form_id', 'value' => (int) $form_id ),
			),
		) );
		return (int) $q->found_posts;
	}

	/**
	 * Get entries for a form (newest first).
	 *
	 * @param int $form_id Form post ID.
	 * @param int $limit   Max entries (0 = all).
	 * @return \WP_Post[]
	 */
	public static function get_entries_for_form( $form_id, $limit = 0 ) {
		$args = array(
			'post_type'      => self::POST_TYPE,
			'post_status'    => 'any',
			'orderby'        => 'date',
			'order'          => 'DESC',
			'meta_query'     => array(
				array( 'key' => '_cfb_form_id', 'value' => (int) $form_id ),
			),
		);
		if ( $limit > 0 ) {
			$args['posts_per_page'] = $limit;
		} else {
			$args['posts_per_page'] = -1;
		}
		$q = new \WP_Query( $args );
		return $q->posts;
	}

	/**
	 * Render the custom Entries admin page: list forms (instances) or entries for one form.
	 */
	public function render_entries_page() {
		$form_id = isset( $_GET['form_id'] ) ? (int) $_GET['form_id'] : 0;

		if ( $form_id > 0 ) {
			$this->render_form_entries_list( $form_id );
			return;
		}

		$this->render_forms_list();
	}

	/**
	 * List all forms (instances) with entry count; each links to its entries.
	 */
	private function render_forms_list() {
		$forms = get_posts( array(
			'post_type'      => CFB_Form_Post_Type::POST_TYPE,
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
		) );

		$page_url = admin_url( 'admin.php?page=cfb-entries' );
		?>
		<div class="wrap">
			<h1 class="wp-heading-inline"><?php esc_html_e( 'Form Entries', 'custom-form-builder' ); ?></h1>
			<p class="description"><?php esc_html_e( 'Select a form to view its submissions.', 'custom-form-builder' ); ?></p>
			<table class="wp-list-table widefat fixed striped">
				<thead>
					<tr>
						<th scope="col" class="column-title"><?php esc_html_e( 'Form', 'custom-form-builder' ); ?></th>
						<th scope="col" class="column-entries"><?php esc_html_e( 'Entries', 'custom-form-builder' ); ?></th>
						<th scope="col" class="column-actions"><?php esc_html_e( 'Actions', 'custom-form-builder' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php if ( empty( $forms ) ) : ?>
						<tr><td colspan="3"><?php esc_html_e( 'No forms found. Create a form first.', 'custom-form-builder' ); ?></td></tr>
					<?php else : ?>
						<?php foreach ( $forms as $form ) : ?>
							<?php
							$count = self::get_entries_count_for_form( $form->ID );
							$link  = add_query_arg( 'form_id', $form->ID, $page_url );
							?>
							<tr>
								<td class="column-title"><strong><?php echo esc_html( $form->post_title ); ?></strong></td>
								<td class="column-entries"><?php echo (int) $count; ?></td>
								<td class="column-actions"><a href="<?php echo esc_url( $link ); ?>" class="button button-small"><?php esc_html_e( 'View entries', 'custom-form-builder' ); ?></a></td>
							</tr>
						<?php endforeach; ?>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}

	/**
	 * List entries for one form (table with field columns and link to view full entry).
	 */
	private function render_form_entries_list( $form_id ) {
		$form = get_post( $form_id );
		if ( ! $form || $form->post_type !== CFB_Form_Post_Type::POST_TYPE ) {
			echo '<div class="wrap"><p>' . esc_html__( 'Form not found.', 'custom-form-builder' ) . '</p></div>';
			return;
		}

		$entries   = self::get_entries_for_form( $form_id );
		$fields    = CFB_Form_Post_Type::get_form_fields( $form_id );
		$flat      = CFB_Form_Post_Type::get_flattened_fields( $fields );
		$labels    = array();
		$col_order = array();
		$field_types = array();
		foreach ( $flat as $f ) {
			$id = isset( $f['id'] ) ? $f['id'] : '';
			if ( $id !== '' ) {
				$labels[ $id ]   = self::get_field_display_label( $f, $id );
				$col_order[]     = $id;
				$field_types[ $id ] = isset( $f['type'] ) ? $f['type'] : '';
			}
		}

		$max_table_columns = 5;
		$col_order_table   = array_slice( $col_order, 0, $max_table_columns );
		$has_more_fields   = count( $col_order ) > $max_table_columns;

		$page_url = admin_url( 'admin.php?page=cfb-entries' );
		$back_url = remove_query_arg( 'form_id', $page_url );
		$deleted  = isset( $_GET['deleted'] ) && (int) $_GET['deleted'] === 1;
		?>
		<div class="wrap">
			<?php if ( $deleted ) : ?>
				<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Entry deleted.', 'custom-form-builder' ); ?></p></div>
			<?php endif; ?>
			<p><a href="<?php echo esc_url( $back_url ); ?>">&larr; <?php esc_html_e( 'Back to forms', 'custom-form-builder' ); ?></a></p>
			<h1 class="wp-heading-inline"><?php echo esc_html( sprintf( __( 'Entries: %s', 'custom-form-builder' ), $form->post_title ) ); ?></h1>
			<table class="wp-list-table widefat fixed striped">
				<thead>
					<tr>
						<th scope="col" class="column-date"><?php esc_html_e( 'Date', 'custom-form-builder' ); ?></th>
						<?php foreach ( $col_order_table as $id ) : ?>
							<th scope="col"><?php echo esc_html( $labels[ $id ] ); ?></th>
						<?php endforeach; ?>
						<th scope="col" class="column-actions"><?php esc_html_e( 'Actions', 'custom-form-builder' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php if ( empty( $entries ) ) : ?>
						<tr><td colspan="<?php echo count( $col_order_table ) + 2; ?>"><?php esc_html_e( 'No entries yet.', 'custom-form-builder' ); ?></td></tr>
					<?php else : ?>
						<?php foreach ( $entries as $entry ) : ?>
							<?php
							$data     = self::get_entry_data( $entry->ID );
							$date     = get_post_meta( $entry->ID, '_cfb_date', true );
							$delete_url = add_query_arg( array(
								'page'     => 'cfb-entries',
								'form_id'  => $form_id,
								'action'   => 'delete_entry',
								'entry_id' => $entry->ID,
								'_wpnonce' => wp_create_nonce( 'cfb_delete_entry_' . $entry->ID ),
							), admin_url( 'admin.php' ) );
							?>
							<tr>
								<td class="column-date"><?php echo esc_html( $date ? $date : get_the_date( '', $entry ) ); ?></td>
								<?php foreach ( $col_order_table as $id ) : ?>
									<?php
									$raw   = isset( $data[ $id ] ) ? $data[ $id ] : '';
									$type  = isset( $field_types[ $id ] ) ? $field_types[ $id ] : '';
									$cell  = self::format_entry_value_for_display( $raw, $type );
									?>
									<td><?php echo $cell; ?></td>
								<?php endforeach; ?>
								<td class="column-actions">
									<?php if ( $has_more_fields ) : ?>
										<a href="#" class="cfb-view-entry" data-entry-id="<?php echo (int) $entry->ID; ?>"><?php esc_html_e( 'View More', 'custom-form-builder' ); ?></a>
										<span class="cfb-actions-sep">|</span>
									<?php endif; ?>
									<a href="<?php echo esc_url( $delete_url ); ?>" class="cfb-delete-entry" onclick="return confirm('<?php echo esc_js( __( 'Delete this entry?', 'custom-form-builder' ) ); ?>');"><?php esc_html_e( 'Delete', 'custom-form-builder' ); ?></a>
								</td>
							</tr>
						<?php endforeach; ?>
					<?php endif; ?>
				</tbody>
			</table>
			<div id="cfb-entry-modal" class="cfb-modal" role="dialog" aria-hidden="true" style="display:none;">
				<div class="cfb-modal-overlay"></div>
				<div class="cfb-modal-content">
					<div class="cfb-modal-header">
						<h2 class="cfb-modal-title"><?php esc_html_e( 'Entry details', 'custom-form-builder' ); ?></h2>
						<button type="button" class="cfb-modal-close" aria-label="<?php esc_attr_e( 'Close', 'custom-form-builder' ); ?>">&times;</button>
					</div>
					<div class="cfb-modal-body">
						<div class="cfb-modal-loading"><?php esc_html_e( 'Loading…', 'custom-form-builder' ); ?></div>
						<div class="cfb-modal-inner" style="display:none;"></div>
					</div>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Create an entry for a form submission.
	 *
	 * @param int   $form_id Form post ID.
	 * @param array $data    Field key => value (after ACF mapping keys).
	 * @return int|WP_Error Entry post ID or error.
	 */
	public static function create_entry( $form_id, $data ) {
		$form_id = (int) $form_id;
		$data    = is_array( $data ) ? $data : array();
		if ( $form_id <= 0 ) {
			return new \WP_Error( 'invalid_form', __( 'Invalid form ID.', 'custom-form-builder' ) );
		}
		$form_title = get_the_title( $form_id );
		if ( $form_title === '' ) {
			$form_title = sprintf( __( 'Form #%d', 'custom-form-builder' ), $form_id );
		}
		$title = sprintf(
			/* translators: 1: form title, 2: date */
			__( '%1$s – %2$s', 'custom-form-builder' ),
			$form_title,
			current_time( 'Y-m-d H:i:s' )
		);

		// Allow entry creation by anyone (including logged-out) when submitting the form via AJAX.
		$allow_cap = doing_action( 'wp_ajax_cfb_submit_form' ) || doing_action( 'wp_ajax_nopriv_cfb_submit_form' );
		if ( $allow_cap ) {
			add_filter( 'map_meta_cap', array( __CLASS__, 'map_meta_cap_allow_entry_creation' ), 10, 4 );
		}

		$entry_id = wp_insert_post( array(
			'post_type'   => self::POST_TYPE,
			'post_title'  => $title,
			'post_status' => 'publish',
			'post_author' => get_current_user_id() ?: 0,
		), true );

		if ( $allow_cap ) {
			remove_filter( 'map_meta_cap', array( __CLASS__, 'map_meta_cap_allow_entry_creation' ), 10 );
		}

		if ( is_wp_error( $entry_id ) ) {
			return $entry_id;
		}

		update_post_meta( $entry_id, '_cfb_form_id', $form_id );
		update_post_meta( $entry_id, '_cfb_data', $data );
		update_post_meta( $entry_id, '_cfb_date', current_time( 'mysql' ) );

		return $entry_id;
	}

	/**
	 * Temporarily allow creating cfb_entry posts (for form submission by any user).
	 *
	 * @param array  $caps    Required capabilities.
	 * @param string $cap     Capability being checked.
	 * @param int    $user_id User ID.
	 * @param array  $args    Additional args (e.g. post ID).
	 * @return array
	 */
	public static function map_meta_cap_allow_entry_creation( $caps, $cap, $user_id, $args ) {
		$post_type = get_post_type_object( self::POST_TYPE );
		if ( ! $post_type || ! isset( $post_type->cap->create_posts ) || $cap !== $post_type->cap->create_posts ) {
			return $caps;
		}
		return array( 'exist' );
	}

	/**
	 * Get entry data.
	 *
	 * @param int $entry_id Entry post ID.
	 * @return array
	 */
	public static function get_entry_data( $entry_id ) {
		$data = get_post_meta( $entry_id, '_cfb_data', true );
		return is_array( $data ) ? $data : array();
	}

	/**
	 * Get form ID for an entry.
	 *
	 * @param int $entry_id Entry post ID.
	 * @return int
	 */
	public static function get_entry_form_id( $entry_id ) {
		return (int) get_post_meta( $entry_id, '_cfb_form_id', true );
	}

	/**
	 * Add meta box on entry edit screen to display submitted form data.
	 */
	public function add_entry_data_meta_box() {
		add_meta_box(
			'cfb_entry_data',
			__( 'Submitted data', 'custom-form-builder' ),
			array( $this, 'render_entry_data_meta_box' ),
			self::POST_TYPE,
			'normal',
			'high'
		);
	}

	/**
	 * Render the entry data meta box (field labels and values).
	 *
	 * @param \WP_Post $post Entry post.
	 */
	public function render_entry_data_meta_box( $post ) {
		$entry_id = (int) $post->ID;
		$form_id  = self::get_entry_form_id( $entry_id );
		$data     = self::get_entry_data( $entry_id );

		if ( ! $form_id ) {
			echo '<p>' . esc_html__( 'No form linked to this entry.', 'custom-form-builder' ) . '</p>';
			return;
		}

		$fields = CFB_Form_Post_Type::get_form_fields( $form_id );
		$flat   = CFB_Form_Post_Type::get_flattened_fields( $fields );
		$labels = array();
		$field_types = array();
		foreach ( $flat as $f ) {
			$id = isset( $f['id'] ) ? $f['id'] : '';
			if ( $id !== '' ) {
				$labels[ $id ] = self::get_field_display_label( $f, $id );
				$field_types[ $id ] = isset( $f['type'] ) ? $f['type'] : '';
			}
		}

		if ( empty( $data ) ) {
			echo '<p>' . esc_html__( 'No submitted data for this entry.', 'custom-form-builder' ) . '</p>';
			return;
		}

		echo '<table class="widefat striped" style="margin:0;"><tbody>';
		foreach ( $data as $key => $value ) {
			$label = isset( $labels[ $key ] ) ? $labels[ $key ] : self::get_field_display_label( array( 'id' => $key ), $key );
			$type  = isset( $field_types[ $key ] ) ? $field_types[ $key ] : '';
			$cell  = self::format_entry_value_for_display( $value, $type );
			echo '<tr><th style="width:30%;vertical-align:top;">' . esc_html( $label ) . '</th><td>' . $cell . '</td></tr>';
		}
		echo '</tbody></table>';
	}
}
