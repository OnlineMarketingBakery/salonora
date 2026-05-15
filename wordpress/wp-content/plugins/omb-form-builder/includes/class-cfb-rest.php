<?php
/**
 * REST API for form builder (save/load form fields).
 *
 * @package Custom_Form_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CFB_REST {

	private static $instance = null;
	const NAMESPACE = 'custom-form-builder/v1';

	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route( self::NAMESPACE, '/forms/(?P<id>\d+)', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_form' ),
				'permission_callback'  => array( $this, 'can_edit_form' ),
				'args'                 => array(
					'id' => array(
						'validate_callback' => function ( $v ) {
							return is_numeric( $v ) && (int) $v > 0;
						},
					),
				),
			),
		) );

		register_rest_route( self::NAMESPACE, '/forms/(?P<id>\d+)/fields', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'save_fields' ),
				'permission_callback' => array( $this, 'can_edit_form' ),
				'args'                => array(
					'id' => array(
						'validate_callback' => function ( $v ) {
							return is_numeric( $v ) && (int) $v > 0;
						},
					),
					'fields' => array(
						'required' => false,
						'type'     => 'array',
					),
				),
			),
		) );

		// Published forms only — for headless / Next.js (no auth).
		register_rest_route( self::NAMESPACE, '/public/forms/(?P<id>\d+)', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_public_form' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'id' => array(
						'validate_callback' => function ( $v ) {
							return is_numeric( $v ) && (int) $v > 0;
						},
					),
				),
			),
		) );

		register_rest_route( self::NAMESPACE, '/public/forms/by-slug/(?P<slug>[a-zA-Z0-9_-]+)', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_public_form_by_slug' ),
				'permission_callback' => '__return_true',
			),
		) );

		register_rest_route( self::NAMESPACE, '/public/forms/(?P<id>\d+)/submit', array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'submit_public_form' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'id' => array(
						'validate_callback' => function ( $v ) {
							return is_numeric( $v ) && (int) $v > 0;
						},
					),
				),
			),
		) );
	}

	/**
	 * Optional hard limit on which form IDs are readable via the public REST route.
	 * Define in wp-config.php: `define( 'CFB_HEADLESS_PUBLIC_FORM_IDS', '12,34' );`
	 *
	 * @param int $form_id Form post ID.
	 * @return bool
	 */
	public function is_form_id_publicly_listed( $form_id ) {
		$form_id = (int) $form_id;
		if ( ! defined( 'CFB_HEADLESS_PUBLIC_FORM_IDS' ) || ! is_string( CFB_HEADLESS_PUBLIC_FORM_IDS ) || trim( CFB_HEADLESS_PUBLIC_FORM_IDS ) === '' ) {
			return true;
		}
		$ids = array_filter( array_map( 'intval', explode( ',', CFB_HEADLESS_PUBLIC_FORM_IDS ) ) );
		return in_array( $form_id, $ids, true );
	}

	/**
	 * Shared secret for POST /public/forms/{id}/submit (server-to-server from your app).
	 * Define in wp-config.php: `define( 'CFB_HEADLESS_SUBMIT_SECRET', 'long-random-string' );`
	 *
	 * @return string
	 */
	public static function get_headless_submit_secret() {
		if ( defined( 'CFB_HEADLESS_SUBMIT_SECRET' ) && is_string( CFB_HEADLESS_SUBMIT_SECRET ) && CFB_HEADLESS_SUBMIT_SECRET !== '' ) {
			return CFB_HEADLESS_SUBMIT_SECRET;
		}
		return (string) apply_filters( 'cfb_headless_submit_secret', '' );
	}

	/**
	 * Strip internal keys from settings before exposing to the frontend.
	 *
	 * @param array $settings Raw form settings.
	 * @return array
	 */
	private function sanitize_public_settings( $settings ) {
		if ( ! is_array( $settings ) ) {
			return array();
		}
		$keys = array(
			'submit_button_text',
			'success_message',
			'redirect_url',
			'redirect_after_submit',
			'step_titles',
			'default_row_columns',
			'custom_css',
		);
		$out = array();
		foreach ( $keys as $k ) {
			if ( array_key_exists( $k, $settings ) ) {
				$out[ $k ] = $settings[ $k ];
			}
		}
		return $out;
	}

	/**
	 * @param int $id Published form post ID.
	 * @return WP_REST_Response|WP_Error
	 */
	private function build_public_form_payload( $id ) {
		$id = (int) $id;
		if ( ! $this->is_form_id_publicly_listed( $id ) ) {
			return new WP_Error( 'not_found', __( 'Form not found.', 'custom-form-builder' ), array( 'status' => 404 ) );
		}
		$post = get_post( $id );
		if ( ! $post || $post->post_type !== CFB_Form_Post_Type::POST_TYPE || $post->post_status !== 'publish' ) {
			return new WP_Error( 'not_found', __( 'Form not found.', 'custom-form-builder' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response( array(
			'id'       => $id,
			'title'    => get_the_title( $id ),
			'slug'     => $post->post_name,
			'fields'   => CFB_Form_Post_Type::get_form_fields( $id ),
			'settings' => $this->sanitize_public_settings( CFB_Form_Post_Type::get_form_settings( $id ) ),
		), 200 );
	}

	public function get_public_form( $request ) {
		return $this->build_public_form_payload( (int) $request['id'] );
	}

	public function get_public_form_by_slug( $request ) {
		$slug = isset( $request['slug'] ) ? sanitize_title( (string) $request['slug'] ) : '';
		if ( $slug === '' ) {
			return new WP_Error( 'not_found', __( 'Form not found.', 'custom-form-builder' ), array( 'status' => 404 ) );
		}
		$posts = get_posts( array(
			'post_type'      => CFB_Form_Post_Type::POST_TYPE,
			'post_status'    => 'publish',
			'name'           => $slug,
			'posts_per_page' => 1,
			'fields'         => 'ids',
		) );
		if ( empty( $posts ) ) {
			return new WP_Error( 'not_found', __( 'Form not found.', 'custom-form-builder' ), array( 'status' => 404 ) );
		}
		return $this->build_public_form_payload( (int) $posts[0] );
	}

	public function submit_public_form( $request ) {
		$secret = self::get_headless_submit_secret();
		if ( $secret === '' ) {
			return new WP_Error( 'disabled', __( 'Headless submit is not configured.', 'custom-form-builder' ), array( 'status' => 503 ) );
		}
		$auth = $request->get_header( 'authorization' );
		$token = '';
		if ( is_string( $auth ) && preg_match( '/^\s*Bearer\s+(.+)$/i', $auth, $m ) ) {
			$token = trim( $m[1] );
		}
		if ( $token === '' || ! hash_equals( $secret, $token ) ) {
			return new WP_Error( 'forbidden', __( 'Invalid or missing authorization.', 'custom-form-builder' ), array( 'status' => 403 ) );
		}

		$id = (int) $request['id'];
		if ( ! $this->is_form_id_publicly_listed( $id ) ) {
			return new WP_Error( 'not_found', __( 'Form not found.', 'custom-form-builder' ), array( 'status' => 404 ) );
		}
		$post = get_post( $id );
		if ( ! $post || $post->post_type !== CFB_Form_Post_Type::POST_TYPE || $post->post_status !== 'publish' ) {
			return new WP_Error( 'not_found', __( 'Form not found.', 'custom-form-builder' ), array( 'status' => 404 ) );
		}

		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		$raw = isset( $params['cfb'] ) && is_array( $params['cfb'] ) ? $params['cfb'] : array();
		$visible = array();
		if ( isset( $params['cfb_visible_fields'] ) ) {
			if ( is_array( $params['cfb_visible_fields'] ) ) {
				$visible = array_map( 'sanitize_text_field', $params['cfb_visible_fields'] );
			} elseif ( is_string( $params['cfb_visible_fields'] ) ) {
				$visible = array_filter( array_map( 'trim', explode( ',', sanitize_text_field( $params['cfb_visible_fields'] ) ) ) );
			}
		}
		$context_post_id = isset( $params['cfb_post_id'] ) ? (int) $params['cfb_post_id'] : 0;

		$frontend = CFB_Frontend::instance();
		$result = $frontend->process_form_submission( $id, $raw, $visible, array(), $context_post_id );

		if ( is_wp_error( $result ) ) {
			$code = $result->get_error_code();
			$status = ( $code === 'cfb_required' ) ? 400 : 500;
			return new WP_Error( $code, $result->get_error_message(), array( 'status' => $status ) );
		}

		return new WP_REST_Response( array(
			'ok'           => true,
			'message'      => isset( $result['message'] ) ? $result['message'] : '',
			'redirect_url' => isset( $result['redirect_url'] ) ? $result['redirect_url'] : '',
		), 200 );
	}

	public function can_edit_form( $request ) {
		$id = (int) $request['id'];
		return current_user_can( 'edit_post', $id );
	}

	public function get_form( $request ) {
		$id = (int) $request['id'];
		$post = get_post( $id );
		if ( ! $post || $post->post_type !== 'cfb_form' ) {
			return new WP_Error( 'not_found', __( 'Form not found.', 'custom-form-builder' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response( array(
			'id'      => $id,
			'fields'  => CFB_Form_Post_Type::get_form_fields( $id ),
			'settings' => CFB_Form_Post_Type::get_form_settings( $id ),
		), 200 );
	}

	public function save_fields( $request ) {
		$id = (int) $request['id'];
		$fields = $request->get_param( 'fields' );
		if ( ! is_array( $fields ) ) {
			$fields = array();
		}
		CFB_Form_Post_Type::save_form_fields( $id, $fields );
		return new WP_REST_Response( array( 'saved' => true, 'fields' => CFB_Form_Post_Type::get_form_fields( $id ) ), 200 );
	}
}
