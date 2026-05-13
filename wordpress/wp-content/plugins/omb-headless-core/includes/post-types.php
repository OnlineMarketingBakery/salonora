<?php
if (!defined('ABSPATH')) {
    exit;
}

function omb_register_post_types(): void {
    register_post_type('service', [
        'labels' => [
            'name'               => __('Services', 'omb-headless-core'),
            'singular_name'      => __('Service', 'omb-headless-core'),
            'add_new_item'       => __('Add New Service', 'omb-headless-core'),
            'edit_item'          => __('Edit Service', 'omb-headless-core'),
            'new_item'           => __('New Service', 'omb-headless-core'),
            'view_item'          => __('View Service', 'omb-headless-core'),
            'search_items'       => __('Search Services', 'omb-headless-core'),
            'not_found'          => __('No services found', 'omb-headless-core'),
            'not_found_in_trash' => __('No services found in Trash', 'omb-headless-core'),
        ],
        'public'             => true,
        'has_archive'        => true,
        'menu_icon'          => 'dashicons-hammer',
        'show_in_rest'       => true,
        'show_in_nav_menus'  => true,
        'supports'           => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
        'rewrite'            => ['slug' => 'services', 'with_front' => false],
        'menu_position'      => 21,
    ]);

	register_post_type('testimonial', [
		'labels' => [
			'name'               => __('Testimonials', 'omb-headless-core'),
			'singular_name'      => __('Testimonial', 'omb-headless-core'),
			'add_new_item'       => __('Add New Testimonial', 'omb-headless-core'),
			'edit_item'          => __('Edit Testimonial', 'omb-headless-core'),
			'new_item'           => __('New Testimonial', 'omb-headless-core'),
			'view_item'          => __('View Testimonial', 'omb-headless-core'),
			'search_items'       => __('Search Testimonials', 'omb-headless-core'),
			'not_found'          => __('No testimonials found', 'omb-headless-core'),
			'not_found_in_trash' => __('No testimonials found in Trash', 'omb-headless-core'),
		],
		'public'             => true,
		'has_archive'        => false,
		'menu_icon'          => 'dashicons-format-quote',
		'show_in_rest'       => true,
		'show_in_nav_menus'  => false,
		'supports'           => ['title', 'editor', 'thumbnail', 'revisions'],
		'rewrite'            => ['slug' => 'testimonials', 'with_front' => false],
		'menu_position'      => 22,
	]);

	register_post_type('case_study', [
		'labels' => [
			'name'               => __('Case studies', 'omb-headless-core'),
			'singular_name'      => __('Case study', 'omb-headless-core'),
			'add_new_item'       => __('Add New Case Study', 'omb-headless-core'),
			'edit_item'          => __('Edit Case Study', 'omb-headless-core'),
			'new_item'           => __('New Case Study', 'omb-headless-core'),
			'view_item'          => __('View Case Study', 'omb-headless-core'),
			'search_items'       => __('Search Case Studies', 'omb-headless-core'),
			'not_found'          => __('No case studies found', 'omb-headless-core'),
			'not_found_in_trash' => __('No case studies found in Trash', 'omb-headless-core'),
		],
		'public'             => true,
		'has_archive'        => true,
		'menu_icon'          => 'dashicons-portfolio',
		'show_in_rest'       => true,
		'show_in_nav_menus'  => true,
		/** `author` enables the block editor Author control (needed for “Over de auteur” on the headless case study page). */
		'supports'           => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'author'],
		'rewrite'            => ['slug' => 'case-studies', 'with_front' => false],
		'menu_position'      => 23,
	]);
}
add_action('init', 'omb_register_post_types');
