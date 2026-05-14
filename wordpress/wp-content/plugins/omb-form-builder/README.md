# Custom Form Builder

A WordPress plugin that combines **Gravity Forms–style** drag-and-drop form building and **calculation fields** with **Fluent Form–style ACF (Advanced Custom Fields) mapping**.

## Features

- **Drag-and-drop form builder** – Add fields by clicking from a palette; reorder by dragging (native HTML5 drag-and-drop, or Sortable.js if you add it).
- **Field types** – Single line text, paragraph, email, number, dropdown, radio, checkboxes, hidden, and **calculation**.
- **Calculation fields** – Formula support like Gravity Forms: use `{field_1}`, `{field_2}` in formulas (e.g. `{field_1} * {field_2}`). Format: decimal, currency, percentage; live calculation on the frontend.
- **ACF mapping** – Map any form input to an ACF field (Fluent Form style). When the form is submitted, mapped values can update ACF on the current post (or a post you specify via a hidden field).
- **Entries** – Form submissions are stored as a custom post type (optional per form).
- **Shortcode** – `[cfb_form id="123"]` to display a form.

## Requirements

- WordPress 5.8+
- PHP 7.4+
- Optional: **Advanced Custom Fields** (ACF) for field mapping

## Installation

1. Upload the `custom-form-builder` folder to `/wp-content/plugins/`.
2. Activate the plugin in **Plugins**.
3. Go to **Form Builder** in the admin to create your first form.

## Usage

### Building a form

1. **Form Builder** → **Add New** (or edit an existing form).
2. **Add fields** – Click a field type in the left palette (e.g. Number, Calculation). Fields appear in the center canvas.
3. **Reorder** – Drag rows in the form layout to reorder.
4. **Edit a field** – Click a field in the center; the right panel shows label, placeholder, required, choices (for select/radio/checkbox), and **Map to ACF Field**.
5. **Calculation** – Add at least one Number (or text) field and one Calculation field. In the Calculation field settings, set the formula (e.g. `{field_1} * {field_2}`). The frontend updates the result as the user types.
6. **Form Settings** (right sidebar) – Submit button text, success message, and “Save entries”.
7. **Publish** and use the shortcode shown in the sidebar, e.g. `[cfb_form id="42"]`.

### ACF mapping

- Install and activate **Advanced Custom Fields**.
- In the form builder, select a field and in the right panel choose an ACF field under **Map to ACF Field**.
- On submit, if the form is shown on a post (single post page), the mapped values are written to that post’s ACF fields. You can also pass a post ID in a hidden field named `cfb_post_id` to update a specific post.

### Calculation formula syntax

- Use field IDs in curly braces: `{field_1}`, `{field_2}`, etc.
- Operators: `+`, `-`, `*`, `/`, parentheses `( )`.
- Example: `({field_1} + {field_2}) * 0.1`

## File structure

```
custom-form-builder/
├── custom-form-builder.php          # Main plugin file
├── includes/
│   ├── class-cfb-form-post-type.php # Form CPT and meta
│   ├── class-cfb-field-types.php    # Field definitions
│   ├── class-cfb-admin-builder.php  # Admin UI
│   ├── class-cfb-acf-integration.php # ACF mapping
│   ├── class-cfb-calculations.php   # Formula evaluation
│   ├── class-cfb-frontend.php       # Shortcode, render, submit
│   ├── class-cfb-entries.php        # Entry storage
│   └── class-cfb-rest.php           # REST API for saving fields
├── assets/
│   ├── css/
│   │   ├── admin-builder.css
│   │   └── frontend.css
│   └── js/
│       ├── admin-builder.js         # Drag-drop, settings, ACF select
│       └── frontend.js              # AJAX submit, live calculations
└── README.md
```

## Hooks

- `cfb_entry_data_before_save` – Filter entry data (and ACF mapping) before saving: `apply_filters( 'cfb_entry_data_before_save', $entry_data, $form_id, $post_id );`
- `cfb_after_submit` – After a successful submit: `do_action( 'cfb_after_submit', $form_id, $entry_data, $post_id );`

## License

Use as you like; no warranty.
