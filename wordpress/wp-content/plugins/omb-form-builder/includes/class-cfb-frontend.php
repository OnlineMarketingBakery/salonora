<?php
/**
 * Frontend form display, submission, and calculation (Gravity/Fluent style).
 *
 * @package Custom_Form_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CFB_Frontend {

	private static $instance = null;

	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_shortcode( 'cfb_form', array( $this, 'shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'wp_ajax_cfb_submit_form', array( $this, 'ajax_submit' ) );
		add_action( 'wp_ajax_nopriv_cfb_submit_form', array( $this, 'ajax_submit' ) );
		add_action( 'wp_ajax_cfb_calculate', array( $this, 'ajax_calculate' ) );
		add_action( 'wp_ajax_nopriv_cfb_calculate', array( $this, 'ajax_calculate' ) );
	}

	public function shortcode( $atts ) {
		$atts = shortcode_atts( array( 'id' => 0, 'post_id' => 0 ), $atts, 'cfb_form' );
		$form_id = (int) $atts['id'];
		if ( ! $form_id ) {
			return '';
		}
		$post = get_post( $form_id );
		if ( ! $post || $post->post_type !== 'cfb_form' || $post->post_status !== 'publish' ) {
			return '';
		}
		// Optional post_id: use for ACF repeater choice source when form is embedded elsewhere.
		$context_post_id = (int) $atts['post_id'];
		self::enqueue_frontend_assets();
		return $this->render_form( $form_id, $context_post_id );
	}

	public function render_form( $form_id, $context_post_id = 0 ) {
		$fields   = CFB_Form_Post_Type::get_form_fields( $form_id );
		$settings = CFB_Form_Post_Type::get_form_settings( $form_id );
		$post_id  = $context_post_id > 0 ? $context_post_id : get_the_ID();

		$steps = $this->get_form_steps( $fields );
		$flat_fields = $this->get_flattened_fields( $fields );
		$is_stepper = count( $steps ) > 1;
		$step_titles = isset( $settings['step_titles'] ) && is_array( $settings['step_titles'] ) ? $settings['step_titles'] : array();

		ob_start();
		?>
		<div class="cfb-form-wrapper <?php echo $is_stepper ? 'cfb-form-stepper' : ''; ?>" data-form-id="<?php echo (int) $form_id; ?>" data-steps="<?php echo (int) count( $steps ); ?>">
		<?php
		if ( ! empty( $settings['custom_css'] ) ) {
			$custom_css = wp_strip_all_tags( $settings['custom_css'] );
			if ( $custom_css !== '' ) {
				echo '<style id="cfb-form-css-' . (int) $form_id . '">' . "\n" . $custom_css . "\n" . '</style>';
			}
		}
		?>
			<form class="cfb-form" method="post" action="" data-form-id="<?php echo (int) $form_id; ?>" enctype="multipart/form-data">
				<?php wp_nonce_field( 'cfb_submit_' . $form_id, 'cfb_nonce' ); ?>
				<?php if ( $is_stepper ) : ?>
					<ol class="cfb-step-progress" aria-label="<?php esc_attr_e( 'Form progress', 'custom-form-builder' ); ?>">
						<?php foreach ( $steps as $step_index => $step_fields ) : ?>
							<li class="cfb-step-progress-item" data-step="<?php echo (int) ( $step_index + 1 ); ?>">
								<span class="cfb-step-progress-num"><?php echo (int) ( $step_index + 1 ); ?></span>
								<span class="cfb-step-progress-title"><?php echo esc_html( $this->get_step_title( $fields, $step_index, $step_titles ) ); ?></span>
							</li>
						<?php endforeach; ?>
					</ol>
				<?php endif; ?>
				<?php foreach ( $steps as $step_index => $step_fields ) : ?>
					<?php
					$step_style = $is_stepper && $step_index > 0 ? ' style="display:none !important;"' : '';
					if ( $is_stepper && $step_index === 0 ) {
						$step_style = ' style="display:block !important;"';
					}
					?>
					<fieldset class="cfb-step <?php echo $step_index === 0 ? 'cfb-step-active' : ''; ?>" data-step="<?php echo (int) ( $step_index + 1 ); ?>" aria-hidden="<?php echo $step_index === 0 ? 'false' : 'true'; ?>"<?php echo $step_style; ?>>
						<?php if ( $is_stepper && $this->get_step_title( $fields, $step_index, $step_titles ) ) : ?>
							<legend class="cfb-step-legend"><?php echo esc_html( $this->get_step_title( $fields, $step_index, $step_titles ) ); ?></legend>
						<?php endif; ?>
						<?php
						$default_columns = isset( $settings['default_row_columns'] ) ? max( 1, min( 12, (int) $settings['default_row_columns'] ) ) : 1;
						$segments = $this->get_step_segments( $step_fields );
						foreach ( $segments as $segment ) :
							$seg_fields   = isset( $segment['fields'] ) ? $segment['fields'] : array();
							$seg_gid     = isset( $segment['group_id'] ) ? $segment['group_id'] : null;
							$seg_glabel  = isset( $segment['group_label'] ) ? $segment['group_label'] : null;
							$seg_columns = ( $seg_gid === null ) ? $default_columns : ( isset( $segment['group_columns'] ) ? max( 1, min( 12, (int) $segment['group_columns'] ) ) : 1 );
							if ( empty( $seg_fields ) ) {
								continue;
							}
							$seg_has_row_break = false;
							foreach ( $seg_fields as $f ) {
								if ( isset( $f['type'] ) && $f['type'] === 'row_break' ) {
									$seg_has_row_break = true;
									break;
								}
							}
							if ( $seg_gid !== null && $seg_glabel !== '' ) :
								$seg_dep   = isset( $segment['group_depends_on'] ) ? trim( (string) $segment['group_depends_on'] ) : '';
								$seg_depv  = isset( $segment['group_depends_on_values'] ) ? trim( (string) $segment['group_depends_on_values'] ) : '';
								$group_classes = 'cfb-group';
								if ( $seg_dep !== '' && $seg_depv !== '' ) {
									$group_classes .= ' cfb-field-dependent';
									$dep_default = '';
									foreach ( $flat_fields as $f ) {
										if ( isset( $f['id'] ) && $f['id'] === $seg_dep ) {
											$dep_default = isset( $f['default_value'] ) ? (string) $f['default_value'] : '';
											break;
										}
									}
									$allowed = array_map( 'trim', explode( ',', $seg_depv ) );
									$allowed = array_filter( $allowed );
									if ( ! in_array( $dep_default, $allowed, true ) ) {
										$group_classes .= ' cfb-dependent-hidden';
									}
								}
								?>
						<div class="<?php echo esc_attr( $group_classes ); ?>" data-group-id="<?php echo esc_attr( $seg_gid ); ?>"
							<?php
							if ( $seg_dep !== '' && $seg_depv !== '' ) {
								echo ' data-cfb-depends-on="' . esc_attr( $seg_dep ) . '" data-cfb-depends-on-values="' . esc_attr( $seg_depv ) . '"';
							}
							?>>
							<h3 class="cfb-group-title"><?php echo esc_html( $seg_glabel ); ?></h3>
							<?php
							endif;
							if ( ! $seg_has_row_break ) {
								?>
						<div class="cfb-form-row cfb-form-cols-<?php echo (int) $seg_columns; ?>">
							<ul class="cfb-form-fields">
								<?php
								foreach ( $seg_fields as $field ) {
									echo $this->render_field( $field, $post_id, $flat_fields );
								}
								?>
							</ul>
						</div>
								<?php
							} else {
								$rows = $this->get_step_rows( $seg_fields, $seg_columns );
								foreach ( $rows as $row ) :
									$row_fields = isset( $row['fields'] ) ? $row['fields'] : array();
									$row_cols   = isset( $row['columns'] ) ? max( 1, min( 12, (int) $row['columns'] ) ) : 1;
									if ( empty( $row_fields ) ) {
										continue;
									}
									?>
						<div class="cfb-form-row cfb-form-cols-<?php echo (int) $row_cols; ?>">
							<ul class="cfb-form-fields">
									<?php
									foreach ( $row_fields as $field ) {
										echo $this->render_field( $field, $post_id, $flat_fields );
									}
									?>
							</ul>
						</div>
									<?php
								endforeach;
							}
							if ( $seg_gid !== null && $seg_glabel !== '' ) :
								?>
						</div>
							<?php endif; ?>
						<?php endforeach; ?>
						<?php if ( $is_stepper ) : ?>
							<p class="cfb-step-actions">
								<?php if ( $step_index > 0 ) : ?>
									<?php
									$prev_break = $this->get_page_break_before_step( $fields, $step_index );
									$prev_label = ( $prev_break && isset( $prev_break['prev_label'] ) && $prev_break['prev_label'] ) ? $prev_break['prev_label'] : __( 'Previous', 'custom-form-builder' );
									?>
									<button type="button" class="cfb-step-prev"><?php echo esc_html( $prev_label ); ?></button>
								<?php endif; ?>
								<?php if ( $step_index < count( $steps ) - 1 ) : ?>
									<?php
									$next_break = $this->get_page_break_before_step( $fields, $step_index + 1 );
									$next_label = ( $next_break && isset( $next_break['next_label'] ) && $next_break['next_label'] ) ? $next_break['next_label'] : __( 'Next', 'custom-form-builder' );
									?>
									<button type="button" class="cfb-step-next"><?php echo esc_html( $next_label ); ?></button>
								<?php else : ?>
									<button type="submit" class="cfb-submit"><?php echo esc_html( $settings['submit_label'] ); ?></button>
								<?php endif; ?>
							</p>
						<?php endif; ?>
					</fieldset>
				<?php endforeach; ?>
				<?php if ( ! $is_stepper ) : ?>
					<p class="cfb-form-actions">
						<button type="submit" class="cfb-submit"><?php echo esc_html( $settings['submit_label'] ); ?></button>
					</p>
				<?php endif; ?>
				<p class="cfb-form-message cfb-success" aria-live="polite" style="display:none;"></p>
				<p class="cfb-form-message cfb-error" aria-live="polite" style="display:none;"></p>
			</form>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Segment step fields by group (consecutive fields with same group_id form one segment).
	 *
	 * @param array $step_fields Flat list of field items (may have group_id, group_label, group_columns).
	 * @return array[] Array of [ 'group_id' => string|null, 'group_label' => string|null, 'group_columns' => int, 'fields' => array ].
	 */
	private function get_step_segments( $step_fields ) {
		$segments = array();
		$current  = array();
		$gid      = null;
		$glabel   = null;
		$gcols    = 1;
		foreach ( $step_fields as $item ) {
			$item_gid   = isset( $item['group_id'] ) ? $item['group_id'] : null;
			$item_glabel = isset( $item['group_label'] ) ? $item['group_label'] : null;
			$item_gcols = isset( $item['group_columns'] ) ? max( 1, min( 12, (int) $item['group_columns'] ) ) : 1;
			if ( $current !== array() && $item_gid !== $gid ) {
				$seg_dep   = null;
				$seg_depv  = null;
				foreach ( $current as $c ) {
					if ( ! empty( $c['group_depends_on'] ) && ! empty( $c['group_depends_on_values'] ) ) {
						$seg_dep  = $c['group_depends_on'];
						$seg_depv = $c['group_depends_on_values'];
						break;
					}
				}
				$segments[] = array(
					'group_id'     => $gid,
					'group_label'  => $glabel,
					'group_columns' => $gcols,
					'group_depends_on' => $seg_dep,
					'group_depends_on_values' => $seg_depv,
					'fields'       => $current,
				);
				$current = array();
			}
			$gid    = $item_gid;
			$glabel = $item_glabel;
			$gcols  = $item_gcols;
			$current[] = $item;
		}
		if ( $current !== array() ) {
			$seg_dep   = null;
			$seg_depv  = null;
			foreach ( $current as $c ) {
				if ( ! empty( $c['group_depends_on'] ) && ! empty( $c['group_depends_on_values'] ) ) {
					$seg_dep  = $c['group_depends_on'];
					$seg_depv = $c['group_depends_on_values'];
					break;
				}
			}
			$segments[] = array(
				'group_id'     => $gid,
				'group_label'  => $glabel,
				'group_columns' => $gcols,
				'group_depends_on' => $seg_dep,
				'group_depends_on_values' => $seg_depv,
				'fields'       => $current,
			);
		}
		return $segments;
	}

	/**
	 * Split step fields into rows (by row_break). Each row has a column count from the row_break that starts it.
	 * A row_break with N columns applies only to the next N fields; any further fields go in full-width (1 column) rows.
	 *
	 * @param array $step_fields     Fields in one step (may include row_break).
	 * @param int   $default_columns Columns for the first row of the step (when no row_break precedes it). 1–12.
	 * @return array[] Array of [ 'columns' => int, 'fields' => array ].
	 */
	private function get_step_rows( $step_fields, $default_columns = 1 ) {
		$default_columns = max( 1, min( 12, (int) $default_columns ) );
		$rows            = array();
		$current         = array();
		$next_columns    = $default_columns;
		$step_fields     = array_values( $step_fields );
		$n               = count( $step_fields );

		for ( $i = 0; $i < $n; $i++ ) {
			$field = $step_fields[ $i ];
			$type  = isset( $field['type'] ) ? $field['type'] : '';

			if ( $type === 'row_break' ) {
				// Push any current row before this break.
				if ( ! empty( $current ) ) {
					$rows[]   = array(
						'columns' => $next_columns,
						'fields'  => $current,
					);
					$current  = array();
				}
				$cols = isset( $field['columns'] ) ? max( 1, min( 12, (int) $field['columns'] ) ) : 1;
				// Take only the next N fields for this N-column row (not all fields until the next row_break).
				$take = 0;
				for ( $j = $i + 1; $j < $n && $take < $cols; $j++ ) {
					$ft = isset( $step_fields[ $j ]['type'] ) ? $step_fields[ $j ]['type'] : '';
					if ( $ft === 'row_break' ) {
						break;
					}
					$take++;
				}
				$row_fields = array_slice( $step_fields, $i + 1, $take );
				$rows[]     = array(
					'columns' => $cols,
					'fields'  => $row_fields,
				);
				$i         += $take; // Skip the fields we just put in this row (for loop will ++).
				$next_columns = 1; // Remaining fields are full width.
				$current      = array();
				continue;
			}

			$current[] = $field;
		}

		if ( ! empty( $current ) ) {
			$rows[] = array(
				'columns' => $next_columns,
				'fields'  => $current,
			);
		}
		return $rows;
	}

	/**
	 * Split form fields into steps (by page_break). Expands groups so each step is a flat list of
	 * fields with optional group_id, group_label, group_columns for rendering group wrappers.
	 *
	 * @param array $fields All form fields (may contain type group with nested fields).
	 * @return array[] Array of steps, each step an array of field items (field + optional group_* keys).
	 */
	private function get_form_steps( $fields ) {
		$steps   = array();
		$current = array();
		$this->walk_fields_for_steps( $fields, null, null, null, $current, $steps, '', '' );
		if ( ! empty( $current ) ) {
			$steps[] = $current;
		}
		return $steps;
	}

	/**
	 * Recursively walk fields and push to $current step; on page_break push $current to $steps and reset.
	 * Groups are expanded and each inner field gets group_id, group_label, group_columns.
	 *
	 * @param array   $fields       Fields to walk (may contain group).
	 * @param string  $group_id     Current group id (or null).
	 * @param string  $group_label  Current group label (or null).
	 * @param int|null $group_columns Current group columns 1-4 (or null).
	 * @param array   $current      Current step accumulator (passed by reference).
	 * @param array   $steps        Steps array (passed by reference).
	 */
	private function walk_fields_for_steps( $fields, $group_id, $group_label, $group_columns, &$current, &$steps, $group_depends_on = '', $group_depends_on_values = '' ) {
		foreach ( $fields as $field ) {
			$type = isset( $field['type'] ) ? $field['type'] : '';
			if ( $type === 'page_break' ) {
				if ( ! empty( $current ) ) {
					$steps[] = $current;
					$current = array();
				}
				continue;
			}
			if ( $type === 'group' ) {
				$gid    = isset( $field['id'] ) ? $field['id'] : 'group_' . uniqid();
				$glabel = isset( $field['group_label'] ) ? $field['group_label'] : __( 'Group', 'custom-form-builder' );
				$gcols  = isset( $field['columns'] ) ? max( 1, min( 4, (int) $field['columns'] ) ) : 2;
				$gdep   = isset( $field['depends_on'] ) ? trim( (string) $field['depends_on'] ) : '';
				$gdepv  = isset( $field['depends_on_values'] ) ? trim( (string) $field['depends_on_values'] ) : '';
				$inner  = isset( $field['fields'] ) && is_array( $field['fields'] ) ? $field['fields'] : array();
				$this->walk_fields_for_steps( $inner, $gid, $glabel, $gcols, $current, $steps, $gdep, $gdepv );
				continue;
			}
			$item = $field;
			if ( $group_id !== null ) {
				$item['group_id']     = $group_id;
				$item['group_label']  = $group_label;
				$item['group_columns'] = $group_columns;
				if ( $group_depends_on !== '' && $group_depends_on_values !== '' ) {
					$item['group_depends_on']       = $group_depends_on;
					$item['group_depends_on_values'] = $group_depends_on_values;
				}
			}
			$current[] = $item;
		}
	}

	/**
	 * Flatten form fields (expand groups) for submission/calculations. Returns flat list of fields only (no group, no page_break).
	 *
	 * @param array $fields Form fields (may contain group with nested fields).
	 * @return array Flat list of field configs.
	 */
	private function get_flattened_fields( $fields ) {
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
				$out = array_merge( $out, $this->get_flattened_fields( $inner ) );
				continue;
			}
			$out[] = $field;
		}
		return $out;
	}

	/**
	 * Get title for a step (from Form Settings step_titles by step index, or first section in step, or Step N).
	 *
	 * @param array $fields      All form fields.
	 * @param int   $step_index 0-based step index.
	 * @param array $step_titles Optional. Step titles from form settings (index = step index: 0=first step, 1=second, ...).
	 * @return string
	 */
	private function get_step_title( $fields, $step_index, $step_titles = array() ) {
		$steps = $this->get_form_steps( $fields );
		$step_fields = isset( $steps[ $step_index ] ) ? $steps[ $step_index ] : array();

		// Step titles from Form Settings: one per step (step_titles[0]=first step, [1]=second, ...).
		if ( ! empty( $step_titles ) && is_array( $step_titles ) ) {
			$step_titles = array_values( $step_titles );
			if ( isset( $step_titles[ $step_index ] ) && (string) $step_titles[ $step_index ] !== '' ) {
				return trim( (string) $step_titles[ $step_index ] );
			}
			// Form has page breaks: use only settings or "Step N", never section title.
			return sprintf( __( 'Step %d', 'custom-form-builder' ), $step_index + 1 );
		}

		// No page breaks: first step can use first section title as label, else "Step 1".
		if ( $step_index === 0 ) {
			if ( ! empty( $step_fields ) ) {
				foreach ( $step_fields as $f ) {
					if ( isset( $f['type'] ) && $f['type'] === 'section' && ! empty( $f['section_title'] ) ) {
						return $f['section_title'];
					}
				}
			}
			return __( 'Step 1', 'custom-form-builder' );
		}
		return sprintf( __( 'Step %d', 'custom-form-builder' ), $step_index + 1 );
	}

	/**
	 * Get the page_break field that precedes the given step (step_index 0 = first step, 1 = second step...).
	 * Walks the field tree so page_breaks inside groups are counted.
	 *
	 * @param array $fields      All form fields (may contain groups).
	 * @param int   $step_index 0-based step index.
	 * @return array|null The page_break field config or null.
	 */
	private function get_page_break_before_step( $fields, $step_index ) {
		if ( $step_index <= 0 ) {
			return null;
		}
		$breaks = $this->collect_page_breaks_in_order( $fields );
		$idx = $step_index - 1;
		return isset( $breaks[ $idx ] ) ? $breaks[ $idx ] : null;
	}

	/**
	 * Collect all page_break fields in tree order (depth-first, including inside groups).
	 *
	 * @param array $fields Form fields.
	 * @return array List of page_break field configs.
	 */
	private function collect_page_breaks_in_order( $fields ) {
		$out = array();
		foreach ( $fields as $field ) {
			$type = isset( $field['type'] ) ? $field['type'] : '';
			if ( $type === 'page_break' ) {
				$out[] = $field;
				continue;
			}
			if ( $type === 'group' && ! empty( $field['fields'] ) && is_array( $field['fields'] ) ) {
				$out = array_merge( $out, $this->collect_page_breaks_in_order( $field['fields'] ) );
			}
		}
		return $out;
	}

	/**
	 * Render a single field HTML.
	 *
	 * @param array $field      Field config.
	 * @param int   $post_id    Current post ID (for context, not used for ACF).
	 * @param array $all_fields Flattened list of all form fields (for dependency initial state).
	 * @return string
	 */
	public function render_field( $field, $post_id = 0, $all_fields = array() ) {
		$id = isset( $field['id'] ) ? $field['id'] : 'field_' . uniqid();
		$type = isset( $field['type'] ) ? $field['type'] : 'text';
		$label = isset( $field['label'] ) ? $field['label'] : $id;
		$required = ! empty( $field['required'] );
		$name = 'cfb[' . esc_attr( $id ) . ']';

		// Custom ID for JavaScript/CSS targeting; fallback to cfb_{id}
		$input_id = CFB_Field_Types::sanitize_custom_id(
			isset( $field['custom_id'] ) ? $field['custom_id'] : '',
			'cfb_' . $id
		);
		$layout = isset( $field['layout'] ) && $field['layout'] === 'inline' ? 'inline' : 'default';

		// Optional CSS classes on the field wrapper (sanitized)
		$custom_class = isset( $field['class'] ) ? CFB_Field_Types::sanitize_css_class( $field['class'] ) : '';
		$field_classes = 'cfb-field cfb-field-' . esc_attr( $type ) . ' cfb-layout-' . esc_attr( $layout );
		if ( $custom_class !== '' ) {
			$field_classes .= ' ' . esc_attr( $custom_class );
		}

		// page_break is not rendered as a field (used only to split steps).
		if ( $type === 'page_break' ) {
			return '';
		}
		// row_break is not rendered (used only to split rows within a step).
		if ( $type === 'row_break' ) {
			return '';
		}

		$default = isset( $field['default_value'] ) ? $field['default_value'] : '';

		// Dependency: show this field only when another field has one of the given values.
		$depends_on        = isset( $field['depends_on'] ) ? trim( (string) $field['depends_on'] ) : '';
		$depends_on_values = isset( $field['depends_on_values'] ) ? trim( (string) $field['depends_on_values'] ) : '';
		if ( $depends_on !== '' && $depends_on_values !== '' ) {
			$field_classes .= ' cfb-field-dependent';
			// Initial visibility: hide if dependency field's default is not in the allowed values.
			$dep_default = '';
			foreach ( $all_fields as $f ) {
				if ( isset( $f['id'] ) && $f['id'] === $depends_on ) {
					$dep_default = isset( $f['default_value'] ) ? (string) $f['default_value'] : '';
					break;
				}
			}
			$allowed = array_map( 'trim', explode( ',', $depends_on_values ) );
			$allowed = array_filter( $allowed );
			if ( ! in_array( $dep_default, $allowed, true ) ) {
				$field_classes .= ' cfb-dependent-hidden';
			}
		}

		$html = '<li class="' . $field_classes . '" data-field-id="' . esc_attr( $id ) . '" id="cfb-row-' . esc_attr( $input_id ) . '"';
		if ( $required ) {
			$html .= ' data-cfb-required="1"';
		}
		if ( $depends_on !== '' && $depends_on_values !== '' ) {
			$html .= ' data-cfb-depends-on="' . esc_attr( $depends_on ) . '" data-cfb-depends-on-values="' . esc_attr( $depends_on_values ) . '"';
		}
		$html .= '>';
		if ( $type !== 'hidden' && $type !== 'section' && $type !== 'html' ) {
			$html .= '<label for="' . esc_attr( $input_id ) . '">' . esc_html( $label );
			if ( $required ) {
				$html .= ' <span class="cfb-required">*</span>';
			}
			$html .= '</label>';
		}

		switch ( $type ) {
			case 'section':
				$title = isset( $field['section_title'] ) ? $field['section_title'] : __( 'Section', 'custom-form-builder' );
				$desc = isset( $field['section_desc'] ) ? $field['section_desc'] : '';
				$html .= '<h3 class="cfb-section-title">' . esc_html( $title ) . '</h3>';
				if ( $desc ) {
					$html .= '<p class="cfb-section-desc">' . esc_html( $desc ) . '</p>';
				}
				$html .= '</li>';
				return $html;
			case 'textarea':
				$placeholder = isset( $field['placeholder'] ) ? $field['placeholder'] : '';
				$html .= '<textarea id="' . esc_attr( $input_id ) . '" name="' . $name . '" placeholder="' . esc_attr( $placeholder ) . '" ' . ( $required ? ' required' : '' ) . '>' . esc_textarea( $default ) . '</textarea>';
				break;
			case 'email':
				$placeholder = isset( $field['placeholder'] ) ? $field['placeholder'] : '';
				$html .= '<input type="email" id="' . esc_attr( $input_id ) . '" name="' . $name . '" value="' . esc_attr( $default ) . '" placeholder="' . esc_attr( $placeholder ) . '" ' . ( $required ? ' required' : '' ) . ' />';
				break;
			case 'phone':
				$placeholder = isset( $field['placeholder'] ) ? $field['placeholder'] : '';
				$html .= '<input type="tel" id="' . esc_attr( $input_id ) . '" name="' . $name . '" value="' . esc_attr( $default ) . '" placeholder="' . esc_attr( $placeholder ) . '" ' . ( $required ? ' required' : '' ) . ' />';
				break;
			case 'url':
				$placeholder = isset( $field['placeholder'] ) ? $field['placeholder'] : 'https://';
				$html .= '<input type="url" id="' . esc_attr( $input_id ) . '" name="' . $name . '" value="' . esc_attr( $default ) . '" placeholder="' . esc_attr( $placeholder ) . '" ' . ( $required ? ' required' : '' ) . ' />';
				break;
			case 'date':
				$placeholder = isset( $field['placeholder'] ) ? $field['placeholder'] : '';
				$html .= '<input type="date" id="' . esc_attr( $input_id ) . '" name="' . $name . '" value="' . esc_attr( $default ) . '" placeholder="' . esc_attr( $placeholder ) . '" ' . ( $required ? ' required' : '' ) . ' />';
				break;
			case 'date_range':
				$default_from_today = ! isset( $field['default_from_today'] ) || ! empty( $field['default_from_today'] );
				$allow_from_past    = ! empty( $field['allow_from_past'] );
				$from_value         = $default_from_today ? gmdate( 'Y-m-d' ) : '';
				$from_min           = $allow_from_past ? '' : ' min="' . esc_attr( gmdate( 'Y-m-d' ) ) . '"';
				$from_id            = $input_id . '_from';
				$to_id              = $input_id . '_to';
				$from_name          = 'cfb[' . esc_attr( $id ) . '_from]';
				$to_name            = 'cfb[' . esc_attr( $id ) . '_to]';
				$html .= '<div class="cfb-date-range">';
				$html .= '<label for="' . esc_attr( $from_id ) . '" class="cfb-date-range-label">' . esc_html__( 'From', 'custom-form-builder' ) . '</label>';
				$html .= '<input type="date" id="' . esc_attr( $from_id ) . '" class="cfb-date-from" name="' . $from_name . '" value="' . esc_attr( $from_value ) . '" data-cfb-date-range-from="' . esc_attr( $id ) . '"' . $from_min . ( $required ? ' required' : '' ) . ' />';
				$html .= '<label for="' . esc_attr( $to_id ) . '" class="cfb-date-range-label">' . esc_html__( 'To', 'custom-form-builder' ) . '</label>';
				$html .= '<input type="date" id="' . esc_attr( $to_id ) . '" class="cfb-date-to" name="' . $to_name . '" value="" data-cfb-date-range-to="' . esc_attr( $id ) . '" data-cfb-date-range-from-id="' . esc_attr( $from_id ) . '" min=""' . ( $required ? ' required' : '' ) . ' />';
				$html .= '</div>';
				break;
			case 'file':
				$accept = isset( $field['accept'] ) && $field['accept'] !== '' ? ' accept="' . esc_attr( $field['accept'] ) . '"' : '';
				$max_mb = isset( $field['max_size'] ) ? max( 1, min( 64, (int) $field['max_size'] ) ) : 2;
				$multiple = ! empty( $field['multiple'] );
				$name_attr = $multiple ? $name . '[]' : $name;
				$html .= '<input type="file" id="' . esc_attr( $input_id ) . '" name="' . esc_attr( $name_attr ) . '"' . $accept . ' data-max-mb="' . esc_attr( $max_mb ) . '" ' . ( $multiple ? ' multiple' : '' ) . ' ' . ( $required ? ' required' : '' ) . ' />';
				break;
			case 'number':
				$placeholder = isset( $field['placeholder'] ) ? $field['placeholder'] : '';
				$min = isset( $field['min'] ) && $field['min'] !== '' ? ' min="' . esc_attr( $field['min'] ) . '"' : '';
				$max = isset( $field['max'] ) && $field['max'] !== '' ? ' max="' . esc_attr( $field['max'] ) . '"' : '';
				$step = isset( $field['step'] ) && $field['step'] !== '' ? ' step="' . esc_attr( $field['step'] ) . '"' : '';
				$html .= '<input type="number" id="' . esc_attr( $input_id ) . '" name="' . $name . '" value="' . esc_attr( $default ) . '" placeholder="' . esc_attr( $placeholder ) . '"' . $min . $max . $step . ( $required ? ' required' : '' ) . ' />';
				break;
			case 'calculation':
				$format = isset( $field['format'] ) ? $field['format'] : 'decimal';
				$decimals = isset( $field['decimals'] ) ? (int) $field['decimals'] : 2;
				$html .= '<input type="text" id="' . esc_attr( $input_id ) . '" name="' . $name . '" value="" readonly class="cfb-calculation" data-formula="' . esc_attr( isset( $field['formula'] ) ? $field['formula'] : '' ) . '" data-format="' . esc_attr( $format ) . '" data-decimals="' . esc_attr( $decimals ) . '" />';
				break;
			case 'merge_text':
				$template = isset( $field['template'] ) ? $field['template'] : '';
				$html .= '<input type="text" id="' . esc_attr( $input_id ) . '" name="' . $name . '" value="" readonly class="cfb-merge-text" data-template="' . esc_attr( $template ) . '" />';
				break;
			case 'select':
				$is_multiple = ! empty( $field['multiple'] );
				$placeholder_text = isset( $field['placeholder'] ) && (string) $field['placeholder'] !== '' ? $field['placeholder'] : ( $is_multiple ? __( 'Select options...', 'custom-form-builder' ) : __( 'Select an option...', 'custom-form-builder' ) );
				$name_attr = $is_multiple ? $name . '[]' : $name;
				$html .= '<div class="cfb-select-searchable-wrap" data-placeholder="' . esc_attr( $placeholder_text ) . '"' . ( $is_multiple ? ' data-multiple="1"' : '' ) . '>';
				$html .= '<select id="' . esc_attr( $input_id ) . '" name="' . esc_attr( $name_attr ) . '" class="cfb-select-searchable"' . ( $is_multiple ? ' multiple' : '' ) . ' ' . ( $required ? ' required' : '' ) . '>';
				if ( ! $is_multiple ) {
					$html .= '<option value="">' . esc_html( $placeholder_text ) . '</option>';
				}
				$choices = isset( $field['choices'] ) && is_array( $field['choices'] ) ? $field['choices'] : array();
				$default_arr = $is_multiple ? array_filter( array_map( 'trim', explode( ',', (string) $default ) ) ) : array();
				foreach ( $choices as $choice ) {
					$v = isset( $choice['value'] ) ? $choice['value'] : '';
					$l = isset( $choice['label'] ) ? $choice['label'] : $v;
					if ( $v === '' ) {
						continue;
					}
					$selected = $is_multiple ? in_array( $v, $default_arr, true ) : ( (string) $default === (string) $v );
					$html .= '<option value="' . esc_attr( $v ) . '"' . ( $selected ? ' selected' : '' ) . '>' . esc_html( $l ) . '</option>';
				}
				$html .= '</select>';
				$html .= '</div>';
				break;
			case 'radio':
				$choices = isset( $field['choices'] ) && is_array( $field['choices'] ) ? $field['choices'] : array();
				// Default selection is controlled by field setting (default_value). No automatic first-option fallback.
				$choice_style = isset( $field['choice_style'] ) && $field['choice_style'] === 'cards' ? 'cards' : 'default';
				if ( $choice_style === 'cards' ) {
					$html .= '<div class="cfb-radio-cards">';
					foreach ( $choices as $idx => $choice ) {
						$l = isset( $choice['label'] ) ? trim( (string) $choice['label'] ) : '';
						$v = isset( $choice['value'] ) && (string) $choice['value'] !== '' ? trim( (string) $choice['value'] ) : $l;
						if ( $v === '' ) {
							$v = 'option_' . $idx;
						}
						$desc = isset( $choice['description'] ) ? $choice['description'] : '';
						$img = isset( $choice['image'] ) ? trim( $choice['image'] ) : '';
						$badge = isset( $choice['badge'] ) ? trim( $choice['badge'] ) : '';
						$radio_id = $idx === 0 ? $input_id : ( $input_id . '-' . $idx );
						$html .= '<label class="cfb-radio-card">';
						$html .= '<input type="radio" id="' . esc_attr( $radio_id ) . '" name="' . $name . '" value="' . esc_attr( $v ) . '"' . checked( $default, $v, false ) . ( $required ? ' required' : '' ) . ' />';
						$html .= '<span class="cfb-radio-card-inner">';
						if ( $badge !== '' ) {
							$html .= '<span class="cfb-radio-card-badge">' . esc_html( $badge ) . '</span>';
						}
						if ( $img !== '' ) {
							$html .= '<span class="cfb-radio-card-image"><img src="' . esc_url( $img ) . '" alt="" /></span>';
						}
						$html .= '<span class="cfb-radio-card-title">' . esc_html( $l ) . '</span>';
						if ( $desc !== '' ) {
							$html .= '<span class="cfb-radio-card-desc">' . esc_html( $desc ) . '</span>';
						}
						$html .= '</span></label>';
					}
					$html .= '</div>';
				} else {
					$html .= '<span class="cfb-radio-group">';
					foreach ( $choices as $idx => $choice ) {
						$l = isset( $choice['label'] ) ? trim( (string) $choice['label'] ) : '';
						$v = isset( $choice['value'] ) && (string) $choice['value'] !== '' ? trim( (string) $choice['value'] ) : $l;
						if ( $v === '' ) {
							$v = 'option_' . $idx;
						}
						$radio_id = $idx === 0 ? $input_id : ( $input_id . '-' . $idx );
						$html .= '<label><input type="radio" id="' . esc_attr( $radio_id ) . '" name="' . $name . '" value="' . esc_attr( $v ) . '"' . checked( $default, $v, false ) . ( $required ? ' required' : '' ) . ' /> ' . esc_html( $l ) . '</label> ';
					}
					$html .= '</span>';
				}
				break;
			case 'checkbox':
				$choices = isset( $field['choices'] ) && is_array( $field['choices'] ) ? $field['choices'] : array();
				$html .= '<span class="cfb-checkbox-group">';
				foreach ( $choices as $idx => $choice ) {
					$v = isset( $choice['value'] ) ? $choice['value'] : '';
					$l = isset( $choice['label'] ) ? $choice['label'] : $v;
					$chk_id = $idx === 0 ? $input_id : ( $input_id . '-' . $idx );
					$html .= '<label><input type="checkbox" id="' . esc_attr( $chk_id ) . '" name="' . $name . '[]" value="' . esc_attr( $v ) . '" /> ' . esc_html( $l ) . '</label> ';
				}
				$html .= '</span>';
				break;
			case 'hidden':
				$html .= '<input type="hidden" id="' . esc_attr( $input_id ) . '" name="' . $name . '" value="' . esc_attr( $default ) . '" />';
				break;
			case 'html':
				$content = isset( $field['html_content'] ) ? $field['html_content'] : '';
				if ( ! empty( $field['allow_full_html'] ) ) {
					// Output raw HTML (saved by editor; use only when full control is needed).
					$content = apply_filters( 'cfb_html_block_content_unfiltered', $content, $field, $post_id );
				} else {
					$content = wp_kses_post( $content );
				}
				if ( ! empty( $field['allow_shortcodes'] ) && $content !== '' ) {
					$content = do_shortcode( $content );
				}
				$html .= '<div class="cfb-html-content">' . $content . '</div>';
				break;
			default:
				$placeholder = isset( $field['placeholder'] ) ? $field['placeholder'] : '';
				$html .= '<input type="text" id="' . esc_attr( $input_id ) . '" name="' . $name . '" value="' . esc_attr( $default ) . '" placeholder="' . esc_attr( $placeholder ) . '" ' . ( $required ? ' required' : '' ) . ' />';
		}

		$html .= '</li>';
		return $html;
	}

	public function enqueue_scripts() {
		global $post;
		if ( is_a( $post, 'WP_Post' ) && has_shortcode( $post->post_content, 'cfb_form' ) ) {
			self::enqueue_frontend_assets();
		}
	}

	/**
	 * Enqueue frontend CSS/JS (called from shortcode or enqueue_scripts).
	 */
	public static function enqueue_frontend_assets() {
		if ( wp_script_is( 'cfb-frontend', 'enqueued' ) ) {
			return;
		}
		$css_path = CFB_PLUGIN_DIR . 'assets/css/frontend.css';
		$js_path  = CFB_PLUGIN_DIR . 'assets/js/frontend.js';
		wp_enqueue_style( 'cfb-frontend', CFB_PLUGIN_URL . 'assets/css/frontend.css', array(), file_exists( $css_path ) ? (string) filemtime( $css_path ) : CFB_VERSION );
		wp_enqueue_script( 'cfb-frontend', CFB_PLUGIN_URL . 'assets/js/frontend.js', array( 'jquery' ), file_exists( $js_path ) ? (string) filemtime( $js_path ) : CFB_VERSION, true );
		wp_localize_script( 'cfb-frontend', 'cfbFrontend', array(
			'ajaxUrl'         => admin_url( 'admin-ajax.php' ),
			'nonce'           => wp_create_nonce( 'cfb_submit' ),
			'searchPlaceholder' => __( 'Search...', 'custom-form-builder' ),
			'i18n'            => array(
				'requiredMessage' => __( 'This field is required.', 'custom-form-builder' ),
			),
		) );
	}

	/**
	 * Process a form submission (shared by admin-ajax and headless REST).
	 *
	 * @param int   $form_id       Published cfb_form post ID.
	 * @param array $raw           Field id => value (already unslashed).
	 * @param array $visible_list  Field ids considered visible (dependency); empty = all visible.
	 * @param array $files_cfb     Same shape as $_FILES['cfb'] for file fields, or empty array.
	 * @param int   $context_post_id Optional context post (ACF etc.).
	 * @return array|\WP_Error { message, redirect_url } on success.
	 */
	public function process_form_submission( $form_id, $raw, $visible_list, $files_cfb, $context_post_id = 0 ) {
		$form_id = (int) $form_id;
		if ( ! $form_id ) {
			return new \WP_Error( 'cfb_invalid', __( 'Invalid form.', 'custom-form-builder' ) );
		}
		$post = get_post( $form_id );
		if ( ! $post || $post->post_type !== 'cfb_form' || $post->post_status !== 'publish' ) {
			return new \WP_Error( 'cfb_not_found', __( 'Form not found.', 'custom-form-builder' ) );
		}
		if ( ! is_array( $raw ) ) {
			$raw = array();
		}
		if ( ! is_array( $visible_list ) ) {
			$visible_list = array();
		}
		if ( ! is_array( $files_cfb ) ) {
			$files_cfb = array();
		}

		try {
			$fields = CFB_Form_Post_Type::get_form_fields( $form_id );
			$fields = is_array( $fields ) ? $fields : array();
			$flat_fields = $this->get_flattened_fields( $fields );
			$entry_data = array();
			$files_ok = ! empty( $files_cfb ) && isset( $files_cfb['name'] ) && is_array( $files_cfb['name'] );

			foreach ( $flat_fields as $field ) {
				$fid = isset( $field['id'] ) ? $field['id'] : '';
				$ftype = isset( $field['type'] ) ? $field['type'] : '';
				if ( $fid === '' || $ftype === 'section' || $ftype === 'html' || $ftype === 'row_break' ) {
					continue;
				}
				if ( $ftype === 'date_range' ) {
					$entry_data[ $fid . '_from' ] = isset( $raw[ $fid . '_from' ] ) ? sanitize_text_field( $raw[ $fid . '_from' ] ) : '';
					$entry_data[ $fid . '_to' ]   = isset( $raw[ $fid . '_to' ] ) ? sanitize_text_field( $raw[ $fid . '_to' ] ) : '';
					continue;
				}
				$val = isset( $raw[ $fid ] ) ? $raw[ $fid ] : '';
				if ( $ftype === 'file' && $files_ok && isset( $files_cfb['name'][ $fid ] ) ) {
					$names = $files_cfb['name'][ $fid ];
					$is_multi = is_array( $names );
					if ( $is_multi ) {
						$urls = array();
						foreach ( array_keys( $names ) as $idx ) {
							$one = array(
								'name'     => $files_cfb['name'][ $fid ][ $idx ],
								'type'     => isset( $files_cfb['type'][ $fid ][ $idx ] ) ? $files_cfb['type'][ $fid ][ $idx ] : '',
								'tmp_name' => isset( $files_cfb['tmp_name'][ $fid ][ $idx ] ) ? $files_cfb['tmp_name'][ $fid ][ $idx ] : '',
								'error'    => isset( $files_cfb['error'][ $fid ][ $idx ] ) ? (int) $files_cfb['error'][ $fid ][ $idx ] : UPLOAD_ERR_NO_FILE,
								'size'     => isset( $files_cfb['size'][ $fid ][ $idx ] ) ? (int) $files_cfb['size'][ $fid ][ $idx ] : 0,
							);
							if ( ! empty( $one['name'] ) ) {
								$url = $this->handle_file_upload( $one, $field );
								if ( $url !== '' ) {
									$urls[] = $url;
								}
							}
						}
						$val = $urls;
					} else {
						if ( ! empty( $names ) ) {
							$file = array(
								'name'     => $files_cfb['name'][ $fid ],
								'type'     => isset( $files_cfb['type'][ $fid ] ) ? $files_cfb['type'][ $fid ] : '',
								'tmp_name' => isset( $files_cfb['tmp_name'][ $fid ] ) ? $files_cfb['tmp_name'][ $fid ] : '',
								'error'    => isset( $files_cfb['error'][ $fid ] ) ? (int) $files_cfb['error'][ $fid ] : UPLOAD_ERR_NO_FILE,
								'size'     => isset( $files_cfb['size'][ $fid ] ) ? (int) $files_cfb['size'][ $fid ] : 0,
							);
							$val = $this->handle_file_upload( $file, $field );
						}
					}
				} elseif ( $ftype === 'checkbox' ) {
					// Normalize: PHP may send single checkbox as string when only one is checked
					if ( ! is_array( $val ) ) {
						$val = ( $val !== '' && $val !== null ) ? array( $val ) : array();
					}
					$val = implode( ', ', array_filter( array_map( 'trim', array_map( 'strval', $val ) ) ) );
					// If at least one was checked but all values were empty (e.g. single checkbox with empty value), store a readable fallback
					if ( $val === '' && isset( $raw[ $fid ] ) ) {
						$choices = isset( $field['choices'] ) && is_array( $field['choices'] ) ? $field['choices'] : array();
						$first   = reset( $choices );
						$val     = ( $first && isset( $first['label'] ) && trim( (string) $first['label'] ) !== '' ) ? trim( (string) $first['label'] ) : __( 'Yes', 'custom-form-builder' );
					}
				} elseif ( $ftype === 'select' && is_array( $val ) ) {
					$val = implode( ', ', $val );
				}
				$entry_data[ $fid ] = is_array( $val ) ? $val : ( is_string( $val ) ? sanitize_text_field( $val ) : (string) $val );
			}

			// Server-side required validation (visible fields only; client sends cfb_visible_fields).
			foreach ( $flat_fields as $field ) {
				if ( empty( $field['required'] ) ) {
					continue;
				}
				$fid = isset( $field['id'] ) ? $field['id'] : '';
				if ( $fid === '' ) {
					continue;
				}
				$ftype = isset( $field['type'] ) ? $field['type'] : '';
				if ( $ftype === 'calculation' || $ftype === 'merge_text' || $ftype === 'section' || $ftype === 'html' || $ftype === 'row_break' ) {
					continue;
				}
				if ( ! empty( $visible_list ) && ! in_array( $fid, $visible_list, true ) ) {
					continue; // Hidden by dependency, skip required check.
				}
				if ( $ftype === 'date_range' ) {
					$from = isset( $entry_data[ $fid . '_from' ] ) ? trim( (string) $entry_data[ $fid . '_from' ] ) : '';
					$to   = isset( $entry_data[ $fid . '_to' ] ) ? trim( (string) $entry_data[ $fid . '_to' ] ) : '';
					if ( $from === '' || $to === '' ) {
						return new \WP_Error( 'cfb_required', __( 'Please fill in all required fields.', 'custom-form-builder' ) );
					}
					continue;
				}
				$val = isset( $entry_data[ $fid ] ) ? $entry_data[ $fid ] : '';
				if ( is_array( $val ) ) {
					$val = array_filter( $val, function ( $v ) { return $v !== '' && $v !== null; } );
				} else {
					$val = trim( (string) $val );
				}
				if ( $val === '' || ( is_array( $val ) && empty( $val ) ) ) {
					return new \WP_Error( 'cfb_required', __( 'Please fill in all required fields.', 'custom-form-builder' ) );
				}
			}

			// Run calculations for calculation fields
			foreach ( $flat_fields as $field ) {
				if ( isset( $field['type'] ) && $field['type'] === 'calculation' && isset( $field['id'] ) ) {
					$calc_id = $field['id'];
					$submitted = isset( $entry_data[ $calc_id ] ) ? $entry_data[ $calc_id ] : '';
					try {
						$formula = isset( $field['formula'] ) ? $field['formula'] : '';
						$result  = CFB_Calculations::evaluate_formula( $formula, $entry_data );
						$formatted = CFB_Calculations::format_result(
							$result,
							isset( $field['format'] ) ? $field['format'] : 'decimal',
							isset( $field['decimals'] ) ? (int) $field['decimals'] : 2
						);
						// If server result is 0 but user submitted a non-zero value, keep the submitted value (frontend-calculated)
						$result_num = CFB_Calculations::to_number( $result );
						$submitted_num = is_string( $submitted ) ? CFB_Calculations::to_number( $submitted ) : 0;
						if ( $result_num == 0 && $submitted_num != 0 && $submitted !== '' ) {
							$entry_data[ $calc_id ] = is_string( $submitted ) ? $submitted : CFB_Calculations::format_result( $submitted_num, isset( $field['format'] ) ? $field['format'] : 'decimal', isset( $field['decimals'] ) ? (int) $field['decimals'] : 2 );
						} else {
							$entry_data[ $calc_id ] = $formatted;
						}
					} catch ( \Throwable $e ) {
						// Use submitted value or format 0 if calculation fails
						if ( $submitted !== '' && is_string( $submitted ) ) {
							$entry_data[ $calc_id ] = $submitted;
						} else {
							$entry_data[ $calc_id ] = CFB_Calculations::format_result( 0, isset( $field['format'] ) ? $field['format'] : 'decimal', isset( $field['decimals'] ) ? (int) $field['decimals'] : 2 );
						}
					}
				}
			}

			// Merge text fields: replace {field_id} in template with submitted values
			foreach ( $flat_fields as $field ) {
				if ( isset( $field['type'] ) && $field['type'] === 'merge_text' && isset( $field['id'] ) ) {
					$merge_id = $field['id'];
					$template = isset( $field['template'] ) ? $field['template'] : '';
					$entry_data[ $merge_id ] = $this->merge_template( $template, $entry_data );
				}
			}

			// Remove display-only fields from entry data (they are shown to the user but not saved in entries)
			foreach ( $flat_fields as $field ) {
				if ( isset( $field['include_in_entries'] ) && $field['include_in_entries'] === false ) {
					$fid = isset( $field['id'] ) ? $field['id'] : '';
					if ( $fid === '' ) {
						continue;
					}
					if ( isset( $field['type'] ) && $field['type'] === 'date_range' ) {
						unset( $entry_data[ $fid . '_from' ], $entry_data[ $fid . '_to' ] );
					} else {
						unset( $entry_data[ $fid ] );
					}
				}
			}

			$post_id = (int) $context_post_id;
			$entry_data = apply_filters( 'cfb_entry_data_before_save', $entry_data, $form_id, $post_id );

			$settings = CFB_Form_Post_Type::get_form_settings( $form_id );
			// Save entry when "Save entries" is enabled (default true when not set).
			$save_entries = ! isset( $settings['save_entries'] ) || ! empty( $settings['save_entries'] );
			if ( $save_entries ) {
				$entry_id = CFB_Entries::create_entry( $form_id, $entry_data );
				if ( is_wp_error( $entry_id ) ) {
					return new \WP_Error( 'cfb_save', __( 'Could not save entry. Please try again.', 'custom-form-builder' ) );
				}
			}

			do_action( 'cfb_after_submit', $form_id, $entry_data, $post_id );

			// Send notification email to admin if enabled in form settings.
			$send_admin_email = ! isset( $settings['send_admin_email'] ) || ! empty( $settings['send_admin_email'] );
			if ( $send_admin_email && ! empty( $entry_data ) ) {
				$to = isset( $settings['admin_email'] ) && is_email( trim( $settings['admin_email'] ) ) ? trim( $settings['admin_email'] ) : get_option( 'admin_email' );
				if ( $to ) {
					$form_post = get_post( $form_id );
					$form_title = $form_post && $form_post->post_title ? $form_post->post_title : __( 'Form', 'custom-form-builder' );
					$subject = sprintf( __( '[%s] New form submission: %s', 'custom-form-builder' ), wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ), $form_title );
					$body_html = CFB_Entries::get_entry_data_html_from_array( $form_id, $entry_data );
					$message = '<p>' . esc_html__( 'You have received a new form submission.', 'custom-form-builder' ) . '</p>' . $body_html;
					$headers = array( 'Content-Type: text/html; charset=UTF-8' );
					wp_mail( $to, $subject, $message, $headers );
				}
			}

			return array(
				'message'      => isset( $settings['success_message'] ) && trim( (string) $settings['success_message'] ) !== '' ? $settings['success_message'] : __( 'Thank you! Your submission has been received.', 'custom-form-builder' ),
				'redirect_url' => isset( $settings['redirect_url'] ) && trim( (string) $settings['redirect_url'] ) !== '' ? esc_url_raw( trim( $settings['redirect_url'] ) ) : '',
			);
		} catch ( \Throwable $e ) {
			$message = __( 'An error occurred. Please try again.', 'custom-form-builder' );
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				$message = $e->getMessage() . ' (in ' . basename( $e->getFile() ) . ':' . $e->getLine() . ')';
			}
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG && defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
				error_log( 'CFB submit error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() );
			}
			return new \WP_Error( 'cfb_exception', $message );
		}
	}

	public function ajax_submit() {
		check_ajax_referer( 'cfb_submit', 'nonce' );
		$form_id = isset( $_POST['form_id'] ) ? (int) $_POST['form_id'] : 0;
		$raw = isset( $_POST['cfb'] ) && is_array( $_POST['cfb'] ) ? wp_unslash( $_POST['cfb'] ) : array();
		$visible_list = isset( $_POST['cfb_visible_fields'] ) ? array_filter( array_map( 'trim', explode( ',', sanitize_text_field( wp_unslash( $_POST['cfb_visible_fields'] ) ) ) ) ) : array();
		$files_cfb = isset( $_FILES['cfb'] ) && is_array( $_FILES['cfb'] ) ? $_FILES['cfb'] : array();
		$context_post_id = isset( $_POST['cfb_post_id'] ) ? (int) $_POST['cfb_post_id'] : 0;

		$result = $this->process_form_submission( $form_id, $raw, $visible_list, $files_cfb, $context_post_id );
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}
		wp_send_json_success( $result );
	}

	public function ajax_calculate() {
		$form_id = isset( $_POST['form_id'] ) ? (int) $_POST['form_id'] : 0;
		$field_id = isset( $_POST['field_id'] ) ? sanitize_text_field( $_POST['field_id'] ) : '';
		$formula = isset( $_POST['formula'] ) ? wp_unslash( $_POST['formula'] ) : '';
		$values = isset( $_POST['values'] ) && is_array( $_POST['values'] ) ? array_map( 'sanitize_text_field', wp_unslash( $_POST['values'] ) ) : array();
		$format = isset( $_POST['format'] ) ? sanitize_text_field( $_POST['format'] ) : 'decimal';
		$decimals = isset( $_POST['decimals'] ) ? (int) $_POST['decimals'] : 2;

		if ( ! $formula ) {
			wp_send_json_success( array( 'value' => '' ) );
		}
		$result = CFB_Calculations::evaluate_formula( $formula, $values );
		$formatted = CFB_Calculations::format_result( $result, $format, $decimals );
		wp_send_json_success( array( 'value' => $formatted ) );
	}

	/**
	 * Replace {field_id} placeholders in a template with values from entry data.
	 *
	 * @param string $template    Template string (e.g. "Hello {field_1}, total: {field_2}").
	 * @param array  $entry_data  Key-value map of field ids to submitted values.
	 * @return string
	 */
	private function merge_template( $template, $entry_data ) {
		if ( ! is_string( $template ) || $template === '' ) {
			return '';
		}
		$out = $template;
		foreach ( $entry_data as $fid => $val ) {
			if ( is_array( $val ) ) {
				$val = implode( ', ', $val );
			}
			$val = (string) $val;
			$out = str_replace( '{' . $fid . '}', $val, $out );
		}
		// Remove any remaining {xxx} placeholders (unknown fields)
		$out = preg_replace( '/\{[^}]+\}/', '', $out );
		return sanitize_text_field( $out );
	}

	/**
	 * Handle file upload for a file field. Returns URL or empty string.
	 *
	 * @param array $file  $_FILES item.
	 * @param array $field Field config.
	 * @return string
	 */
	private function handle_file_upload( $file, $field ) {
		if ( $file['error'] !== UPLOAD_ERR_OK || ! is_uploaded_file( $file['tmp_name'] ) ) {
			return '';
		}
		$max_mb = isset( $field['max_size'] ) ? max( 1, min( 64, (int) $field['max_size'] ) ) : 2;
		if ( $file['size'] > $max_mb * 1024 * 1024 ) {
			return '';
		}
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		$overrides = array( 'test_form' => false );
		$upload = wp_handle_upload( $file, $overrides );
		if ( isset( $upload['url'] ) ) {
			return $upload['url'];
		}
		return '';
	}
}
