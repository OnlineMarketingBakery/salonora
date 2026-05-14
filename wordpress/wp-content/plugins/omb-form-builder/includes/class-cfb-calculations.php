<?php
/**
 * Calculation field logic: parse formulas and evaluate (Gravity Forms style).
 *
 * @package Custom_Form_Builder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CFB_Calculations {

	private static $instance = null;

	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Evaluate a formula string with placeholders like {field_1}, {field_2}.
	 *
	 * @param string $formula       Formula e.g. "{field_1} * {field_2} + 10"
	 * @param array  $field_values  Map of field_id => value (numeric).
	 * @return float|string Result number or empty string on error.
	 */
	public static function evaluate_formula( $formula, $field_values = array() ) {
		if ( ! is_string( $formula ) || trim( $formula ) === '' ) {
			return '';
		}

		$expression = $formula;
		foreach ( $field_values as $field_id => $val ) {
			$num = self::to_number( $val );
			$expression = str_replace( '{' . $field_id . '}', (string) $num, $expression );
		}

		// Remove any remaining {...} placeholders (unfilled fields) and treat as 0
		$expression = preg_replace( '/\{[^}]+\}/', '0', $expression );

		// Sanitize: only allow numbers, + - * / ( ) . and spaces
		$expression = preg_replace( '/[^0-9+\-*\/().\s]/', '', $expression );
		if ( $expression === '' ) {
			return '';
		}

		try {
			$result = self::evaluate_expression( $expression );
			return is_numeric( $result ) ? (float) $result : 0;
		} catch ( \Throwable $e ) {
			return 0;
		}
	}

	/**
	 * Simple safe evaluation of arithmetic expression (no exec, no functions).
	 *
	 * @param string $expr Expression with + - * / ( ) and numbers.
	 * @return float
	 */
	public static function safe_eval_math( $expr ) {
		return (float) self::evaluate_expression( $expr );
	}

	/**
	 * Recursive descent parser that handles + - * / ( ) correctly.
	 *
	 * @param string $expr Expression with + - * / ( ) and numbers.
	 * @return float
	 */
	public static function evaluate_expression( $expr ) {
		if ( ! is_string( $expr ) ) {
			return 0;
		}
		$expr = preg_replace( '/\s+/', '', $expr );
		$len = strlen( $expr );
		if ( $len === 0 ) {
			return 0;
		}
		$pos = 0;

		$read_number = function () use ( $expr, $len, &$pos ) {
			$start = $pos;
			if ( $pos < $len && ( $expr[ $pos ] === '-' || $expr[ $pos ] === '+' ) ) {
				$pos++;
			}
			while ( $pos < $len && ( ctype_digit( $expr[ $pos ] ) || $expr[ $pos ] === '.' ) ) {
				$pos++;
			}
			$s = substr( $expr, $start, $pos - $start );
			return $s === '' || $s === '-' || $s === '+' ? 0 : (float) $s;
		};

		$parse_factor = function () use ( $expr, $len, &$pos, &$parse_factor, &$parse_term ) {
			if ( $pos >= $len ) {
				return 0;
			}
			if ( $expr[ $pos ] === '(' ) {
				$pos++;
				$v = $parse_term();
				if ( $pos < $len && $expr[ $pos ] === ')' ) {
					$pos++;
				}
				return $v;
			}
			if ( $expr[ $pos ] === '-' ) {
				$pos++;
				return -$parse_factor();
			}
			return $read_number();
		};

		$parse_term = function () use ( $expr, $len, &$pos, &$parse_factor, &$parse_term ) {
			$left = $parse_factor();
			while ( $pos < $len ) {
				$op = $expr[ $pos ];
				if ( $op === '*' ) {
					$pos++;
					$left *= $parse_factor();
				} elseif ( $op === '/' ) {
					$pos++;
					$right = $parse_factor();
					$left = $right != 0 ? $left / $right : 0;
				} else {
					break;
				}
			}
			return $left;
		};

		$parse_expr = function () use ( $expr, $len, &$pos, &$parse_term ) {
			$left = $parse_term();
			while ( $pos < $len ) {
				$op = $expr[ $pos ];
				if ( $op === '+' ) {
					$pos++;
					$left += $parse_term();
				} elseif ( $op === '-' ) {
					$pos++;
					$left -= $parse_term();
				} else {
					break;
				}
			}
			return $left;
		};

		return $parse_expr();
	}

	/**
	 * Convert value to number for formula.
	 *
	 * @param mixed $val
	 * @return float
	 */
	public static function to_number( $val ) {
		if ( is_array( $val ) ) {
			return 0;
		}
		if ( is_numeric( $val ) ) {
			return (float) $val;
		}
		if ( is_string( $val ) ) {
			$val = preg_replace( '/[^0-9.\-]/', '', $val );
			return $val !== '' ? (float) $val : 0;
		}
		return 0;
	}

	/**
	 * Format calculation result for display (decimal, currency, percentage).
	 *
	 * @param mixed  $value    Result from evaluate_formula (float or empty string).
	 * @param string $format   decimal|currency|percentage
	 * @param int    $decimals
	 * @return string
	 */
	public static function format_result( $value, $format = 'decimal', $decimals = 2 ) {
		$decimals = max( 0, min( 10, (int) $decimals ) );
		if ( $value === '' || $value === null || ( is_string( $value ) && trim( $value ) === '' ) ) {
			$num = 0;
		} else {
			$num = is_numeric( $value ) ? (float) $value : 0;
		}
		switch ( $format ) {
			case 'currency':
				return number_format( $num, $decimals );
			case 'percentage':
				return number_format( $num, $decimals ) . '%';
			default:
				return number_format( $num, $decimals );
		}
	}
}
