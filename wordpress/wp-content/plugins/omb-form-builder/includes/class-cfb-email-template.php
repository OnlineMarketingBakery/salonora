<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Salonora-branded HTML email wrapper (table layout, inline styles for clients).
 */
class CFB_Email_Template {

	public static function site_url(): string {
		$url = '';
		if ( function_exists( 'get_field' ) ) {
			$url = (string) get_field( 'next_frontend_url', 'option' );
			if ( $url === '' ) {
				$url = (string) get_field( 'next_frontend_url', 'omb-integrations' );
			}
		}
		$url = trim( $url );
		if ( $url !== '' ) {
			return untrailingslashit( $url );
		}
		return (string) apply_filters( 'cfb_email_site_url', 'https://salonora.eu' );
	}

	public static function logo_url(): string {
		$default = 'https://backend.salonora.eu/wp-content/uploads/2026/04/salonora-logo-icon.svg';
		return (string) apply_filters( 'cfb_email_logo_url', $default );
	}

	public static function contact_email(): string {
		$email = '';
		if ( function_exists( 'get_field' ) ) {
			$email = (string) get_field( 'main_email', 'option' );
			if ( $email === '' ) {
				$email = (string) get_field( 'main_email', 'omb-contact-social' );
			}
		}
		$email = sanitize_email( $email );
		return $email !== '' ? $email : 'hi@salonora.eu';
	}


	public static function header_image_url(): string {
		return (string) apply_filters( 'cfb_email_header_image_url', '' );
	}

	/**
	 * Footer-style email hero: navy grid band + circular logo badge (SiteFooter parity).
	 */
	public static function header_band_html( string $site, string $logo ): string {
		$header_img = trim( self::header_image_url() );
		if ( $header_img !== '' ) {
			return '<tr><td style="padding:0;line-height:0;font-size:0;">'
				. '<a href="' . esc_url( $site ) . '" style="text-decoration:none;">'
				. '<img src="' . esc_url( $header_img ) . '" alt="Salonora" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:16px 16px 0 0;" />'
				. '</a></td></tr>';
		}

		$grid_bg = 'background-color:#002752;background-image:linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);background-size:48px 48px;';

		return '<tr><td style="padding:0;background-color:#ffffff;border-radius:16px 16px 0 0;">'
			. '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">'
			. '<tr><td align="center" style="padding:28px 0 0 0;background-color:#ffffff;line-height:0;font-size:0;">'
			. self::logo_badge_html( $site, $logo )
			. '</td></tr>'
			. '<tr><td align="center" style="' . $grid_bg . 'border-radius:16px 16px 0 0;padding:8px 32px 28px 32px;">'
			. '<div style="height:36px;line-height:36px;font-size:0;">&nbsp;</div>'
			. '</td></tr>'
			. '</table></td></tr>';
	}

	public static function logo_badge_html( string $site, string $logo ): string {
		return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr><td align="center" style="width:120px;height:120px;border-radius:60px;background-color:#ffffff;border:1px solid #3990f0;box-shadow:0 23px 17px rgba(67,87,128,0.34);">'
			. '<a href="' . esc_url( $site ) . '" style="text-decoration:none;display:block;padding:24px 0;">'
			. '<img src="' . esc_url( $logo ) . '" alt="Salonora" width="72" height="72" style="display:block;margin:0 auto;border:0;outline:none;" />'
			. '</a></td></tr></table>';
	}

	public static function normalize_lang( $lang ): string {
		return $lang === 'en' ? 'en' : 'nl';
	}

	/**
	 * @param array{title?: string, preheader?: string, body_html: string, cta?: array{label: string, url: string}|null} $args
	 */
	public static function wrap( array $args ): string {
		$title      = isset( $args['title'] ) ? (string) $args['title'] : '';
		$preheader  = isset( $args['preheader'] ) ? (string) $args['preheader'] : '';
		$body_html  = isset( $args['body_html'] ) ? (string) $args['body_html'] : '';
		$cta        = isset( $args['cta'] ) && is_array( $args['cta'] ) ? $args['cta'] : null;
		$site       = esc_url( self::site_url() );
		$logo       = esc_url( self::logo_url() );
		$year       = (int) gmdate( 'Y' );
		$cta_html   = '';
		if ( $cta && ! empty( $cta['label'] ) && ! empty( $cta['url'] ) ) {
			$cta_html = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px auto 0 auto;"><tr><td align="center" style="border-radius:12px;background:linear-gradient(180deg,#3990f0 0%,#0569d7 100%);">'
				. '<a href="' . esc_url( $cta['url'] ) . '" style="display:inline-block;padding:14px 28px;font-family:Outfit,Arial,Helvetica,sans-serif;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">'
				. esc_html( (string) $cta['label'] )
				. '</a></td></tr></table>';
		}
		$preheader_block = $preheader !== ''
			? '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">' . esc_html( $preheader ) . '</div>'
			: '';

		return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
			. '<title>' . esc_html( $title ) . '</title></head><body style="margin:0;padding:0;background-color:#ebf3fe;">'
			. $preheader_block
			. '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ebf3fe;padding:24px 12px;">'
			. '<tr><td align="center">'
			. '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 28px rgba(21,41,81,0.08);">'
			. self::header_band_html( $site, $logo )
			. '<tr><td style="padding:36px 32px 32px 32px;font-family:Outfit,Arial,Helvetica,sans-serif;color:#002752;background-color:#ffffff;">'
			. ( $title !== '' ? '<h1 style="margin:0 0 16px 0;font-size:28px;line-height:1.25;font-weight:600;color:#002752;">' . esc_html( $title ) . '</h1>' : '' )
			. '<div style="font-size:16px;line-height:1.6;color:#435780;">' . $body_html . '</div>'
			. $cta_html
			. '</td></tr>'
			. '<tr><td style="background-color:#002752;padding:24px 32px;text-align:center;font-family:Outfit,Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.85);">'
			. '<p style="margin:0 0 8px 0;"><a href="' . $site . '" style="color:#ffffff;text-decoration:none;font-weight:600;">Salonora</a></p>'
			. '<p style="margin:0 0 8px 0;"><a href="mailto:' . esc_attr( self::contact_email() ) . '" style="color:#3990f0;text-decoration:none;">' . esc_html( self::contact_email() ) . '</a></p>'
			. '<p style="margin:0;opacity:0.7;">&copy; ' . $year . ' Salonora</p>'
			. '</td></tr></table></td></tr></table></body></html>';
	}

	public static function admin_notification_html( string $form_title, string $entry_table_html, string $lang = 'nl' ): string {
		$is_en = self::normalize_lang( $lang ) === 'en';
		$title = $is_en ? 'New form submission' : 'Nieuwe formulierinzending';
		$intro = $is_en
			? sprintf( 'You received a new submission for <strong style="color:#002752;">%s</strong>.', esc_html( $form_title ) )
			: sprintf( 'Je hebt een nieuwe inzending ontvangen voor <strong style="color:#002752;">%s</strong>.', esc_html( $form_title ) );
		return self::wrap(
			array(
				'title'      => $title,
				'preheader'  => $is_en ? 'New Salonora form submission' : 'Nieuwe Salonora formulierinzending',
				'body_html'  => '<p style="margin:0 0 20px 0;">' . $intro . '</p>' . $entry_table_html,
			)
		);
	}

	public static function confirmation_html( string $lang, array $replacements = array() ): string {
		$is_en = self::normalize_lang( $lang ) === 'en';
		$site  = self::site_url();
		$first = isset( $replacements['first_name'] ) ? trim( (string) $replacements['first_name'] ) : '';
		$greet = $first !== '' ? ( $is_en ? 'Hi ' . esc_html( $first ) . ',' : 'Hoi ' . esc_html( $first ) . ',' ) : ( $is_en ? 'Hi,' : 'Hoi,' );
		$body  = $is_en
			? '<p style="margin:0 0 16px 0;">' . $greet . '</p>'
				. '<p style="margin:0 0 16px 0;">Thank you for your interest in Salonora. We received your request and will send the demo video to this email address shortly.</p>'
				. '<p style="margin:0;">Want to get started right away? Discover how Salonora helps salons grow online.</p>'
			: '<p style="margin:0 0 16px 0;">' . $greet . '</p>'
				. '<p style="margin:0 0 16px 0;">Bedankt voor je interesse in Salonora. We hebben je aanvraag ontvangen en sturen de demo-video binnenkort naar dit e-mailadres.</p>'
				. '<p style="margin:0;">Wil je alvast verder ontdekken? Bekijk hoe Salonora salons helpt online te groeien.</p>';
		$cta_label = $is_en ? 'Explore Salonora' : 'Ontdek Salonora';
		$cta_url   = $is_en ? $site . '/en/campaign' : $site . '/nl/campagne';
		if ( ! empty( $replacements['cta_url'] ) ) {
			$cta_url = (string) $replacements['cta_url'];
		}
		return self::wrap(
			array(
				'title'     => $is_en ? 'Thank you!' : 'Bedankt!',
				'preheader' => $is_en ? 'Your Salonora demo request was received' : 'Je Salonora demo-aanvraag is ontvangen',
				'body_html' => $body,
				'cta'       => array(
					'label' => $cta_label,
					'url'   => $cta_url,
				),
			)
		);
	}

	public static function mail_headers(): array {
		$from_email = (string) apply_filters( 'cfb_email_from_address', 'hi@salonora.eu' );
		$from_name  = (string) apply_filters( 'cfb_email_from_name', 'Salonora' );
		return array(
			'Content-Type: text/html; charset=UTF-8',
			'From: ' . $from_name . ' <' . $from_email . '>',
			'Reply-To: hi@salonora.eu',
		);
	}

	/**
	 * Find submitter email from entry data (email field type or name "email").
	 *
	 * @param int   $form_id
	 * @param array $entry_data
	 */
	public static function find_submitter_email( $form_id, $entry_data ): string {
		if ( ! is_array( $entry_data ) || ! class_exists( 'CFB_Form_Post_Type' ) ) {
			return '';
		}
		$fields = CFB_Form_Post_Type::get_form_fields( $form_id );
		$flat   = CFB_Form_Post_Type::get_flattened_fields( $fields );
		foreach ( $flat as $field ) {
			$id   = isset( $field['id'] ) ? (string) $field['id'] : '';
			$name = isset( $field['name'] ) ? (string) $field['name'] : '';
			$type = isset( $field['type'] ) ? (string) $field['type'] : '';
			if ( $id === '' ) {
				continue;
			}
			if ( $type === 'email' || $name === 'email' ) {
				$val = isset( $entry_data[ $id ] ) ? trim( (string) $entry_data[ $id ] ) : '';
				if ( is_email( $val ) ) {
					return $val;
				}
			}
		}
		foreach ( $entry_data as $val ) {
			$val = trim( is_string( $val ) ? $val : '' );
			if ( is_email( $val ) ) {
				return $val;
			}
		}
		return '';
	}

	/**
	 * @param int    $form_id
	 * @param array  $entry_data
	 * @param string $name Field name slug (e.g. first_name).
	 */
	public static function find_entry_value_by_name( $form_id, $entry_data, $name ): string {
		if ( ! is_array( $entry_data ) || $name === '' || ! class_exists( 'CFB_Form_Post_Type' ) ) {
			return '';
		}
		$fields = CFB_Form_Post_Type::get_form_fields( $form_id );
		$flat   = CFB_Form_Post_Type::get_flattened_fields( $fields );
		foreach ( $flat as $field ) {
			$fid  = isset( $field['id'] ) ? (string) $field['id'] : '';
			$fname = isset( $field['name'] ) ? (string) $field['name'] : '';
			if ( $fid !== '' && $fname === $name && isset( $entry_data[ $fid ] ) ) {
				return trim( (string) $entry_data[ $fid ] );
			}
		}
		return '';
	}
}
