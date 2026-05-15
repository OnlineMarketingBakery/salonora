/**
 * Custom Form Builder - Admin form builder (drag & drop, field settings).
 */
(function($) {
	'use strict';

	var fields = [];
	var selectedFieldId = null;
	var config = window.cfbBuilder || {};
	var fieldTypes = config.fieldTypes || {};
	var formId = config.formId || 0;
	var i18n = config.i18n || {};

	function init() {
		fields = Array.isArray(config.fields) ? config.fields.slice() : [];
		ensureUniqueFieldIds();
		renderFormFields();
		syncHiddenInput();
		renderPalette();
		setupPaletteClick();
		setupSortable();
		setupFormSubmit();
		updateStepTitlesVisibility();
	}

	function renderFormFields() {
		var $list = $('#cfb-form-fields-list');
		$list.empty();
		var dragHint = i18n.dragToReorder || 'Drag to reorder';
		fields.forEach(function(f) {
			if (f.type === 'group') {
				var groupLabel = f.group_label || f.label || f.id;
				var $groupLi = $('<li class="cfb-group-item" data-group-id="' + f.id + '">');
				var $header = $('<div class="cfb-group-header cfb-can-drag">')
					.append($('<span class="cfb-field-drag-handle" title="' + escapeHtml(dragHint) + '"><span class="dashicons dashicons-move"></span><span class="cfb-drag-handle-text">' + (i18n.dragLabel || 'Drag') + '</span></span>'))
					.append($('<span class="cfb-field-icon dashicons dashicons-groups"></span>'))
					.append($('<span class="cfb-group-title-text">').text(groupLabel))
					.append($('<span class="cfb-field-remove dashicons dashicons-no-alt" title="' + (i18n.remove || 'Remove') + '"></span>'));
				$groupLi.append($header);
				var $innerList = $('<ul class="cfb-group-fields-list">');
				(f.fields || []).forEach(function(innerF, innerIndex) {
					var typeDef = fieldTypes[innerF.type] || {};
					var icon = typeDef.icon || 'dashicons-editor-alignleft';
					var label = innerF.label || innerF.id;
					var total = (f.fields || []).length;
					var upDisabled = innerIndex <= 0 ? ' disabled' : '';
					var downDisabled = innerIndex >= total - 1 ? ' disabled' : '';
					var $item = $('<li class="cfb-form-field-item" data-field-id="' + innerF.id + '">');
					$item.append($('<span class="cfb-field-icon dashicons ' + icon + '"></span>'));
					$item.append($('<span class="cfb-field-summary">').text(label));
					$item.append('<span class="cfb-inner-field-move-btns">' +
						'<button type="button" class="button-link cfb-inner-move-up" title="Move up" aria-label="Move up"' + upDisabled + '><span class="dashicons dashicons-arrow-up-alt2"></span></button>' +
						'<button type="button" class="button-link cfb-inner-move-down" title="Move down" aria-label="Move down"' + downDisabled + '><span class="dashicons dashicons-arrow-down-alt2"></span></button>' +
						'</span>');
					$item.append($('<span class="cfb-field-remove dashicons dashicons-no-alt" title="' + (i18n.remove || 'Remove') + '"></span>'));
					$innerList.append($item);
				});
				$groupLi.append($innerList);
				$list.append($groupLi);
				return;
			}
			var typeDef = fieldTypes[f.type] || {};
			var icon = typeDef.icon || 'dashicons-editor-alignleft';
			var label = f.label || f.id;
			if (f.type === 'section' && (f.section_title || '').trim() !== '') {
				label = f.section_title.trim();
			}
			var $handle = $('<span class="cfb-field-drag-handle" title="' + escapeHtml(dragHint) + '" aria-label="' + escapeHtml(dragHint) + '"><span class="dashicons dashicons-move"></span><span class="cfb-drag-handle-text">' + (i18n.dragLabel || 'Drag') + '</span></span>');
			var $item = $('<li class="cfb-form-field-item cfb-can-drag" data-field-id="' + f.id + '">')
				.append($handle)
				.append($('<span class="cfb-field-icon dashicons ' + icon + '"></span>'))
				.append($('<span class="cfb-field-summary">').text(label))
				.append($('<span class="cfb-field-remove dashicons dashicons-no-alt" title="' + (i18n.remove || 'Remove') + '"></span>'));
			$list.append($item);
		});
		$list.off('click', '.cfb-form-field-item').on('click', '.cfb-form-field-item', function(e) {
			if ($(e.target).hasClass('cfb-field-remove') || $(e.target).closest('.cfb-field-remove').length) return;
			if ($(e.target).hasClass('cfb-field-drag-handle') || $(e.target).closest('.cfb-field-drag-handle').length) return;
			if ($(e.target).closest('.cfb-inner-move-up, .cfb-inner-move-down').length) return;
			var id = $(this).data('field-id');
			selectField(id);
		});
		$list.off('click', '.cfb-group-header').on('click', '.cfb-group-header', function(e) {
			if ($(e.target).hasClass('cfb-field-remove') || $(e.target).closest('.cfb-field-remove').length) return;
			if ($(e.target).hasClass('cfb-field-drag-handle') || $(e.target).closest('.cfb-field-drag-handle').length) return;
			var id = $(this).closest('.cfb-group-item').data('group-id');
			selectField(id);
		});
		$list.off('click', '.cfb-field-remove').on('click', '.cfb-field-remove', function(e) {
			e.stopPropagation();
			var $row = $(this).closest('.cfb-form-field-item');
			if ($row.length) {
				removeField($row.data('field-id'));
				return;
			}
			var $group = $(this).closest('.cfb-group-item');
			if ($group.length) removeField($group.data('group-id'));
		});
		$list.off('click', '.cfb-inner-move-up').on('click', '.cfb-inner-move-up', function(e) {
			e.preventDefault();
			e.stopPropagation();
			var fieldId = $(this).closest('.cfb-form-field-item').data('field-id');
			if (fieldId) moveFieldInGroup(fieldId, -1);
		});
		$list.off('click', '.cfb-inner-move-down').on('click', '.cfb-inner-move-down', function(e) {
			e.preventDefault();
			e.stopPropagation();
			var fieldId = $(this).closest('.cfb-form-field-item').data('field-id');
			if (fieldId) moveFieldInGroup(fieldId, 1);
		});
		setDraggableOnFormItems();
		if (window.Sortable) setupGroupSortables();
	}

	function renderPalette() {
		// Palette is static HTML; just ensure click works
	}

	function setupPaletteClick() {
		$('#cfb-palette-list').on('click', '.cfb-palette-item', function() {
			var type = $(this).attr('data-type');
			if (type) addField(type);
		});
	}

	function addField(typeKey) {
		var typeDef = fieldTypes[typeKey];
		if (!typeDef) return;
		var newField = JSON.parse(JSON.stringify(typeDef));
		newField.id = nextFieldId();
		newField.label = (typeDef.label || typeKey) + ' (' + newField.id + ')';
		if (!newField.name) newField.name = (typeKey === 'radio' ? (nameFromFirstRadioChoice(newField.choices) || newField.id) : newField.id);
		fields.push(newField);
		renderFormFields();
		selectField(newField.id);
		syncHiddenInput();
		updateStepTitlesVisibility();
	}

	function addFieldToGroup(groupId, typeKey) {
		var group = getGroupById(groupId);
		if (!group || !group.fields) return;
		var typeDef = fieldTypes[typeKey];
		if (!typeDef) return;
		var newField = JSON.parse(JSON.stringify(typeDef));
		newField.id = nextFieldId();
		newField.label = (typeDef.label || typeKey) + ' (' + newField.id + ')';
		if (!newField.name) newField.name = (typeKey === 'radio' ? (nameFromFirstRadioChoice(newField.choices) || newField.id) : newField.id);
		group.fields.push(newField);
		renderFormFields();
		selectField(newField.id);
		syncHiddenInput();
		updateStepTitlesVisibility();
	}

	function nextFieldId() {
		var ids = [];
		function collect(list) {
			(list || []).forEach(function(f) {
				if (f.id) ids.push(f.id);
				if (f.type === 'group' && Array.isArray(f.fields)) collect(f.fields);
			});
		}
		collect(fields);
		var n = 1;
		while (ids.indexOf('field_' + n) !== -1) n++;
		return 'field_' + n;
	}

	/**
	 * Ensure every field has a unique id. Fixes duplicate IDs that cause radio (and other)
	 * field names to get mixed up when multiple fields of the same type exist.
	 */
	function ensureUniqueFieldIds() {
		var seen = Object.create(null);
		function walk(list) {
			if (!list || !list.length) return;
			for (var i = 0; i < list.length; i++) {
				var f = list[i];
				if (!f || typeof f.id === 'undefined') continue;
				var id = String(f.id);
				if (seen[id]) {
					var newId = nextFieldId();
					f.id = newId;
					if (!f.name || f.name === id) f.name = newId;
					seen[newId] = true;
				} else {
					seen[id] = true;
				}
				if (f.type === 'group' && Array.isArray(f.fields)) walk(f.fields);
			}
		}
		walk(fields);
	}

	function countPageBreaks(list) {
		var n = 0;
		(list || []).forEach(function(f) {
			if (f.type === 'page_break') n++;
			else if (f.type === 'group' && Array.isArray(f.fields)) n += countPageBreaks(f.fields);
		});
		return n;
	}

	function updateStepTitlesVisibility() {
		var $container = $('#cfb-settings-step-titles-container');
		if (!$container.length) return;
		var numBreaks = countPageBreaks(fields);
		var numSteps = numBreaks + 1;
		if (numBreaks === 0) {
			$container.hide();
			return;
		}
		$container.show();
		$container.find('.cfb-step-title-row').each(function() {
			var idx = parseInt($(this).data('step-index'), 10);
			$(this).toggle(idx < numSteps);
		});
	}

	function getGroupById(id) {
		for (var i = 0; i < fields.length; i++) {
			if (fields[i].type === 'group' && fields[i].id === id) return fields[i];
		}
		return null;
	}

	function getFieldParent(id) {
		function find(list) {
			for (var i = 0; i < list.length; i++) {
				if (list[i].id === id) return { parent: list, index: i };
				if (list[i].type === 'group' && Array.isArray(list[i].fields)) {
					var inGroup = find(list[i].fields);
					if (inGroup) return inGroup;
				}
			}
			return null;
		}
		return find(fields);
	}

	function removeField(id) {
		var loc = getFieldParent(id);
		if (loc) {
			loc.parent.splice(loc.index, 1);
		} else {
			// might be a group
			fields = fields.filter(function(f) { return f.id !== id; });
		}
		if (selectedFieldId === id) selectedFieldId = null;
		renderFormFields();
		renderFieldSettings(null);
		syncHiddenInput();
		updateStepTitlesVisibility();
	}

	function moveFieldInGroup(fieldId, direction) {
		var loc = getFieldParent(fieldId);
		if (!loc || !loc.parent) return;
		if (loc.parent === fields) return;
		var group = null;
		for (var g = 0; g < fields.length; g++) {
			if (fields[g].type === 'group' && fields[g].fields === loc.parent) {
				group = fields[g];
				break;
			}
		}
		if (!group || !group.fields) return;
		var idx = loc.index;
		var newIdx = idx + direction;
		if (newIdx < 0 || newIdx >= group.fields.length) return;
		var arr = group.fields;
		var tmp = arr[idx];
		arr[idx] = arr[newIdx];
		arr[newIdx] = tmp;
		renderFormFields();
		selectField(fieldId);
		syncHiddenInput();
		updateStepTitlesVisibility();
	}

	function selectField(id) {
		selectedFieldId = id;
		$('#cfb-form-fields-list .cfb-form-field-item').removeClass('cfb-selected');
		$('#cfb-form-fields-list .cfb-group-item').removeClass('cfb-selected');
		$('#cfb-form-fields-list .cfb-form-field-item[data-field-id="' + id + '"]').addClass('cfb-selected');
		$('#cfb-form-fields-list .cfb-group-item[data-group-id="' + id + '"]').addClass('cfb-selected');
		var group = getGroupById(id);
		var field = getFieldById(id);
		renderFieldSettings(group || field);
	}

	function getFieldById(id) {
		function find(list) {
			for (var i = 0; i < list.length; i++) {
				if (list[i].id === id) return list[i];
				if (list[i].type === 'group' && Array.isArray(list[i].fields)) {
					var inGroup = find(list[i].fields);
					if (inGroup) return inGroup;
				}
			}
			return null;
		}
		return find(fields);
	}

	function getFlatFieldsForDependency(excludeId) {
		var out = [];
		function walk(list) {
			for (var i = 0; i < list.length; i++) {
				var f = list[i];
				var t = f.type || '';
				if (t === 'group' && Array.isArray(f.fields)) {
					walk(f.fields);
					continue;
				}
				if (t === 'section' || t === 'page_break' || t === 'row_break' || t === 'html') continue;
				if (f.id && f.id !== excludeId) out.push({ id: f.id, label: (f.label || f.id) });
			}
		}
		walk(fields);
		return out;
	}

	function updateField(id, key, value) {
		var f = getFieldById(id);
		if (f) { f[key] = value; syncHiddenInput(); }
	}

	function renderFieldSettings(field) {
		var $inner = $('#cfb-field-settings-inner');
		$inner.empty();
		if (!field) {
			$inner.html('<p class="cfb-select-field-hint">' + (i18n.selectField || 'Select a field to edit.') + '</p>');
			return;
		}

		// Group settings
		if (field.type === 'group') {
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label for="cfb-edit-group-label-' + escapeHtml(field.id) + '">' + (i18n.groupLabel || 'Group label') + '</label>' +
				'<input type="text" id="cfb-edit-group-label-' + escapeHtml(field.id) + '" class="cfb-edit-group-label" value="' + escapeHtml(field.group_label || '') + '" placeholder="' + (i18n.groupLabelHelp || '') + '" />' +
				'<p class="description">' + (i18n.groupLabelHelp || 'Title shown above this group on the form.') + '</p>' +
				'</div>' +
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.groupColumns || 'Row columns') + '</label>' +
				'<select class="cfb-edit-group-columns">' +
				'<option value="1"' + (field.columns === 1 ? ' selected' : '') + '>' + (i18n.columns1 || '1 (full width)') + '</option>' +
				'<option value="2"' + (field.columns === 2 || field.columns === undefined ? ' selected' : '') + '>' + (i18n.columns2 || '2') + '</option>' +
				'<option value="3"' + (field.columns === 3 ? ' selected' : '') + '>' + (i18n.columns3 || '3') + '</option>' +
				'<option value="4"' + (field.columns === 4 ? ' selected' : '') + '>' + (i18n.columns4 || '4') + '</option>' +
				'</select>' +
				'<p class="description">' + (i18n.groupColumnsHelp || 'Number of columns for rows inside this group.') + '</p>' +
				'</div>' +
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.addFieldToGroup || 'Add field to group') + '</label>' +
				'<select class="cfb-add-to-group-type"><option value="">— ' + (i18n.addFieldToGroup || 'Add field') + ' —</option></select>' +
				'<button type="button" class="button cfb-add-to-group-btn" style="margin-top:6px">' + (i18n.addFieldToGroup || 'Add field to group') + '</button>' +
				'</div>'
			);
			// Show when: conditional visibility for group
			var depOptsGroup = '<option value="">' + (i18n.dependsOnNone || '— None —') + '</option>';
			getFlatFieldsForDependency(field.id).forEach(function(f) {
				depOptsGroup += '<option value="' + escapeHtml(f.id) + '"' + ((field.depends_on || '') === f.id ? ' selected' : '') + '>' + escapeHtml(f.label || f.id) + '</option>';
			});
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.dependsOn || 'Show when') + '</label>' +
				'<select class="cfb-edit-depends-on">' + depOptsGroup + '</select>' +
				'<p class="description">' + (i18n.dependsOnHelp || 'Show this field only when the selected field has one of the values below.') + '</p>' +
				'</div>' +
				'<div class="cfb-setting-row cfb-depends-on-values-row">' +
				'<label>' + (i18n.dependsOnValues || 'When value is (comma-separated)') + '</label>' +
				'<input type="text" class="cfb-edit-depends-on-values" value="' + escapeHtml(field.depends_on_values || '') + '" placeholder="e.g. yes, option_1" />' +
				'<p class="description">' + (i18n.dependsOnValuesHelp || 'Enter values from the other field; this field is shown when that field\'s value matches one of these.') + '</p>' +
				'</div>'
			);
			var $sel = $inner.find('.cfb-add-to-group-type');
			Object.keys(fieldTypes).forEach(function(key) {
				if (key === 'group' || key === 'page_break') return;
				$sel.append('<option value="' + escapeHtml(key) + '">' + escapeHtml(fieldTypes[key].label || key) + '</option>');
			});
			$inner.find('.cfb-edit-group-label').on('input', function() {
				updateField(field.id, 'group_label', $(this).val());
				$('.cfb-group-item[data-group-id="' + field.id + '"] .cfb-group-title-text').text($(this).val() || field.id);
			});
			$inner.find('.cfb-edit-group-columns').on('change', function() {
				updateField(field.id, 'columns', parseInt($(this).val(), 10) || 2);
			});
			$inner.find('.cfb-add-to-group-btn').on('click', function() {
				var typeKey = $inner.find('.cfb-add-to-group-type').val();
				if (typeKey) addFieldToGroup(field.id, typeKey);
			});
			$inner.find('.cfb-edit-depends-on').on('change', function() {
				updateField(field.id, 'depends_on', $(this).val());
				syncHiddenInput();
			});
			$inner.find('.cfb-edit-depends-on-values').on('input', function() {
				updateField(field.id, 'depends_on_values', $(this).val());
				syncHiddenInput();
			});
			return;
		}

		// Custom ID - always first for every field (applied to input's id for JS/CSS targeting)
		$inner.append(
			'<div class="cfb-setting-row cfb-setting-row-custom-id">' +
			'<label for="cfb-edit-custom-id-' + escapeHtml(field.id) + '">' + (i18n.customId || 'Custom ID') + '</label>' +
			'<input type="text" id="cfb-edit-custom-id-' + escapeHtml(field.id) + '" class="cfb-edit-custom-id" value="' + escapeHtml(field.custom_id || '') + '" placeholder="e.g. my-email-field" />' +
			'<p class="description">' + (i18n.customIdHelp || 'Applied to the input\'s id attribute for JavaScript/CSS targeting. Leave blank for default.') + '</p>' +
			'</div>' +
			'<div class="cfb-setting-row cfb-setting-row-css-class">' +
			'<label for="cfb-edit-css-class-' + escapeHtml(field.id) + '">' + (i18n.cssClass || 'CSS class') + '</label>' +
			'<input type="text" id="cfb-edit-css-class-' + escapeHtml(field.id) + '" class="cfb-edit-css-class" value="' + escapeHtml(field.class || '') + '" placeholder="e.g. my-input highlight" />' +
			'<p class="description">' + (i18n.cssClassHelp || 'Optional space-separated classes added to the field wrapper for custom styling.') + '</p>' +
			'</div>'
		);

		// Layout (field structure: default block vs inline label+input)
		if (field.type !== 'section' && field.type !== 'page_break' && field.type !== 'html' && field.type !== 'row_break') {
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.layout || 'Layout') + '</label>' +
				'<select class="cfb-edit-layout">' +
				'<option value="default"' + ((field.layout || 'default') === 'default' ? ' selected' : '') + '>' + (i18n.layoutDefault || 'Default (block)') + '</option>' +
				'<option value="inline"' + (field.layout === 'inline' ? ' selected' : '') + '>' + (i18n.layoutInline || 'Inline (label + input on one line)') + '</option>' +
				'</select>' +
				'<p class="description">' + (i18n.layoutHelp || 'Control how the label and input are arranged.') + '</p>' +
				'</div>'
			);
		}

		// New row: columns setting
		if (field.type === 'row_break') {
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.rowColumns || 'Columns') + '</label>' +
				'<select class="cfb-edit-row-columns">' +
				'<option value="1"' + (field.columns === 1 ? ' selected' : '') + '>' + (i18n.columns1 || '1 (full width)') + '</option>' +
				'<option value="2"' + (field.columns === 2 || field.columns === undefined ? ' selected' : '') + '>' + (i18n.columns2 || '2') + '</option>' +
				'<option value="3"' + (field.columns === 3 ? ' selected' : '') + '>' + (i18n.columns3 || '3') + '</option>' +
				'<option value="4"' + (field.columns === 4 ? ' selected' : '') + '>' + (i18n.columns4 || '4') + '</option>' +
				'</select>' +
				'<p class="description">' + (i18n.rowBreakHelp || 'Number of columns for the row that starts after this.') + '</p>' +
				'</div>'
			);
		}

		// Page break: Next/Previous button labels only (step titles are in Form Settings)
		if (field.type === 'page_break') {
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.nextLabel || 'Next button text') + '</label>' +
				'<input type="text" class="cfb-edit-next-label" value="' + escapeHtml(field.next_label || '') + '" placeholder="Next" />' +
				'</div>' +
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.prevLabel || 'Previous button text') + '</label>' +
				'<input type="text" class="cfb-edit-prev-label" value="' + escapeHtml(field.prev_label || '') + '" placeholder="Previous" />' +
				'</div>'
			);
		}

		// Section: title and description (section title is used as Step 1 name when it\'s the first field in the form)
		if (field.type === 'section') {
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label for="cfb-edit-section-title-' + escapeHtml(field.id) + '">' + (i18n.sectionTitle || 'Section title') + '</label>' +
				'<input type="text" id="cfb-edit-section-title-' + escapeHtml(field.id) + '" class="cfb-edit-section-title" value="' + escapeHtml(field.section_title || '') + '" placeholder="' + (i18n.sectionTitle || 'Section title') + '" />' +
				'<p class="description">' + (i18n.sectionTitleStepHelp || 'If this is the first section in the form, it is used as the name of Step 1 in the progress bar.') + '</p>' +
				'</div>' +
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.sectionDesc || 'Section description (optional)') + '</label>' +
				'<textarea class="cfb-edit-section-desc" rows="2" placeholder="">' + escapeHtml(field.section_desc || '') + '</textarea>' +
				'</div>'
			);
		}

		// Field name (assignable name for entries/exports) - for all input-type fields except row_break; radio gets it too so it can be set/edited
		var hasName = ['text','textarea','email','phone','url','number','date','date_range','calculation','merge_text','select','radio','checkbox','file','hidden','section','page_break'].indexOf(field.type) !== -1;
		if (hasName && field.type !== 'row_break') {
			var nameVal = (field.name || '').toString().trim();
			if (field.type === 'radio' && !nameVal) {
				nameVal = nameFromFirstRadioChoice(field.choices) || (field.id || '');
			}
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.fieldName || 'Field name') + '</label>' +
				'<input type="text" class="cfb-edit-name" value="' + escapeHtml(field.type === 'radio' ? nameVal : (field.name || field.id || '')) + '" placeholder="' + (field.id || '') + '" />' +
				'<p class="description">' + (i18n.fieldNameHelp || 'Unique name for entries/exports. Letters, numbers, underscores.') + '</p>' +
				'</div>'
			);
		}

		if (field.type !== 'row_break') {
		// Label
		$inner.append(
			'<div class="cfb-setting-row">' +
			'<label>' + (i18n.label || 'Label') + '</label>' +
			'<input type="text" class="cfb-edit-label" value="' + escapeHtml(field.label || '') + '" />' +
			'</div>'
		);
		if (field.type !== 'hidden' && field.type !== 'calculation' && field.type !== 'merge_text' && field.type !== 'section' && field.type !== 'page_break') {
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.placeholder || 'Placeholder') + '</label>' +
				'<input type="text" class="cfb-edit-placeholder" value="' + escapeHtml(field.placeholder || '') + '" />' +
				'</div>'
			);
		}
		if (['text', 'textarea', 'email', 'phone', 'url', 'number', 'date', 'hidden'].indexOf(field.type) !== -1) {
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.defaultValue || 'Default Value') + '</label>' +
				'<input type="text" class="cfb-edit-default" value="' + escapeHtml(field.default_value || '') + '" />' +
				'</div>'
			);
		}
		if (field.type === 'date_range') {
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label><input type="checkbox" class="cfb-edit-default-from-today" ' + (field.default_from_today !== false ? 'checked' : '') + ' /> ' + (i18n.defaultFromToday || 'Default From date to today') + '</label>' +
				'<p class="description">' + (i18n.defaultFromTodayHelp || 'Pre-fill the From date with the current date.') + '</p>' +
				'</div>' +
				'<div class="cfb-setting-row">' +
				'<label><input type="checkbox" class="cfb-edit-allow-from-past" ' + (field.allow_from_past ? 'checked' : '') + ' /> ' + (i18n.allowFromPast || 'Allow From date before today') + '</label>' +
				'<p class="description">' + (i18n.allowFromPastHelp || 'When unchecked, the From date cannot be before the current date.') + '</p>' +
				'</div>'
			);
		}
		if (['text', 'textarea', 'email', 'phone', 'url', 'number', 'date', 'date_range', 'select', 'radio', 'checkbox', 'file'].indexOf(field.type) !== -1) {
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label><input type="checkbox" class="cfb-edit-required" ' + (field.required ? 'checked' : '') + ' /> ' + (i18n.required || 'Required') + '</label>' +
				'</div>'
			);
		}
		// Display only: show to user but don't save in entries (for text, calculation, merge_text, etc.)
		if (['text', 'textarea', 'email', 'phone', 'url', 'number', 'date', 'date_range', 'calculation', 'merge_text', 'select', 'radio', 'checkbox', 'file', 'hidden'].indexOf(field.type) !== -1) {
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label><input type="checkbox" class="cfb-edit-display-only" ' + (field.include_in_entries === false ? 'checked' : '') + ' /> ' + (i18n.displayOnly || 'Display only (don\'t save in entries)') + '</label>' +
				'<p class="description">' + (i18n.displayOnlyHelp || 'When checked, this field is shown to the user but its value is not stored in form entries.') + '</p>' +
				'</div>'
			);
		}
		if (field.type === 'number') {
			$inner.append(
				'<div class="cfb-setting-row"><label>' + (i18n.min || 'Min') + '</label><input type="number" class="cfb-edit-min" value="' + escapeHtml(field.min || '') + '" placeholder="" /></div>' +
				'<div class="cfb-setting-row"><label>' + (i18n.max || 'Max') + '</label><input type="number" class="cfb-edit-max" value="' + escapeHtml(field.max || '') + '" /></div>' +
				'<div class="cfb-setting-row"><label>' + (i18n.step || 'Step') + '</label><input type="text" class="cfb-edit-step" value="' + escapeHtml(field.step || '') + '" /></div>'
			);
		}
		if (field.type === 'file') {
			var acceptVal = field.accept || '';
			var presetVal = '';
			if (acceptVal === 'image/*') presetVal = 'images';
			else if (acceptVal === '.pdf,.doc,.docx') presetVal = 'documents';
			else if (acceptVal === 'image/*,.pdf') presetVal = 'images_pdf';
			else if (acceptVal === 'audio/*') presetVal = 'audio';
			else if (acceptVal === 'video/*') presetVal = 'video';
			else if (acceptVal !== '') presetVal = 'custom';
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.accept || 'Accept file types') + '</label>' +
				'<select class="cfb-edit-accept-preset">' +
				'<option value=""' + (presetVal === '' ? ' selected' : '') + '>' + (i18n.acceptAny || 'Any file type') + '</option>' +
				'<option value="images"' + (presetVal === 'images' ? ' selected' : '') + '>' + (i18n.acceptImages || 'Images only (image/*)') + '</option>' +
				'<option value="documents"' + (presetVal === 'documents' ? ' selected' : '') + '>' + (i18n.acceptDocuments || 'Documents (.pdf, .doc, .docx)') + '</option>' +
				'<option value="images_pdf"' + (presetVal === 'images_pdf' ? ' selected' : '') + '>' + (i18n.acceptImagesPdf || 'Images and PDF') + '</option>' +
				'<option value="audio"' + (presetVal === 'audio' ? ' selected' : '') + '>' + (i18n.acceptAudio || 'Audio') + '</option>' +
				'<option value="video"' + (presetVal === 'video' ? ' selected' : '') + '>' + (i18n.acceptVideo || 'Video') + '</option>' +
				'<option value="custom"' + (presetVal === 'custom' ? ' selected' : '') + '>' + (i18n.acceptCustom || 'Custom (enter below)') + '</option>' +
				'</select>' +
				'<input type="text" class="cfb-edit-accept" value="' + escapeHtml(acceptVal) + '" placeholder="e.g. image/*,.pdf" style="margin-top:6px;" />' +
				'<p class="description">' + (i18n.acceptHelp || 'Leave empty for any file, or set e.g. image/*,.pdf') + '</p>' +
				'</div>' +
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.maxSize || 'Max file size (MB)') + '</label>' +
				'<input type="number" class="cfb-edit-max-size" min="1" max="64" value="' + (field.max_size !== undefined ? field.max_size : 2) + '" />' +
				'</div>' +
				'<div class="cfb-setting-row">' +
				'<label><input type="checkbox" class="cfb-edit-multiple" ' + (field.multiple ? 'checked' : '') + ' /> ' + (i18n.allowMultipleFiles || 'Allow multiple files') + '</label>' +
				'<p class="description">' + (i18n.allowMultipleFilesHelp || 'User can select one or more files at once.') + '</p>' +
				'</div>'
			);
		}
		if (field.type === 'calculation') {
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.formula || 'Formula') + '</label>' +
				'<input type="text" class="cfb-edit-formula" value="' + escapeHtml(field.formula || '') + '" placeholder="{field_1} * {field_2}" />' +
				'<p class="description">' + (i18n.formulaHelp || 'Use {field_1}, {field_2} for field values.') + '</p>' +
				'</div>' +
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.format || 'Format') + '</label>' +
				'<select class="cfb-edit-format">' +
				'<option value="decimal"' + (field.format === 'decimal' ? ' selected' : '') + '>' + (i18n.decimal || 'Decimal') + '</option>' +
				'<option value="currency"' + (field.format === 'currency' ? ' selected' : '') + '>' + (i18n.currency || 'Currency') + '</option>' +
				'<option value="percentage"' + (field.format === 'percentage' ? ' selected' : '') + '>' + (i18n.percentage || 'Percentage') + '</option>' +
				'</select>' +
				'</div>' +
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.decimals || 'Decimals') + '</label>' +
				'<input type="number" class="cfb-edit-decimals" min="0" max="10" value="' + (field.decimals !== undefined ? field.decimals : 2) + '" />' +
				'</div>'
			);
		}
		if (field.type === 'merge_text') {
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.mergeTemplate || 'Template') + '</label>' +
				'<textarea class="cfb-edit-merge-template" rows="4" placeholder="e.g. Hello {field_1}, your total is {field_2}">' + escapeHtml(field.template || '') + '</textarea>' +
				'<p class="description">' + (i18n.mergeTemplateHelp || 'Use {field_1}, {field_2} to insert the value of other fields. Updates live as the user fills the form.') + '</p>' +
				'</div>'
			);
		}
		if (['select', 'radio', 'checkbox'].indexOf(field.type) !== -1) {
			var choices = field.choices || [{ value: '', label: 'Option 1' }];
			if (field.type === 'select') {
				$inner.append(
					'<div class="cfb-setting-row">' +
					'<label><input type="checkbox" class="cfb-edit-select-multiple" ' + (field.multiple ? 'checked' : '') + ' /> ' + (i18n.allowMultipleSelections || 'Allow multiple selections') + '</label>' +
					'<p class="description">' + (i18n.allowMultipleSelectionsHelp || 'User can select more than one option.') + '</p>' +
					'</div>'
				);
			}
			// Radio: display style (list vs image cards); default selected; choices are always manual
			if (field.type === 'radio') {
				var defaultOpts = '<option value="">' + (i18n.noDefault || 'None') + '</option>';
				choices.forEach(function(c) {
					var v = (c.value || '').toString();
					if (v === '') return;
					var label = (c.label || v);
					defaultOpts += '<option value="' + escapeHtml(v) + '"' + ((field.default_value || '') === v ? ' selected' : '') + '>' + escapeHtml(label) + '</option>';
				});
				$inner.append(
					'<div class="cfb-setting-row">' +
					'<label>' + (i18n.choiceStyle || 'Display as') + '</label>' +
					'<select class="cfb-edit-choice-style">' +
					'<option value="default"' + ((field.choice_style || 'default') === 'default' ? ' selected' : '') + '>' + (i18n.choiceStyleList || 'List (default)') + '</option>' +
					'<option value="cards"' + (field.choice_style === 'cards' ? ' selected' : '') + '>' + (i18n.choiceStyleCards || 'Image cards') + '</option>' +
					'</select>' +
					'<p class="description">' + (i18n.choiceStyleHelp || 'Image cards show each option as a card with image, title, description, and optional badge.') + '</p>' +
					'</div>' +
					'<div class="cfb-setting-row">' +
					'<label>' + (i18n.radioDefaultSelected || 'Default selected') + '</label>' +
					'<select class="cfb-edit-radio-default">' + defaultOpts + '</select>' +
					'<p class="description">' + (i18n.radioDefaultSelectedHelp || 'Which option should be selected by default. Choose None for no default.') + '</p>' +
					'</div>'
				);
			}
			var isCards = field.type === 'radio' && field.choice_style === 'cards';
			var choicesHtml = '<div class="cfb-setting-row cfb-choices-manual"><label>' + (i18n.choices || 'Choices') + '</label>';
			choicesHtml += '<div class="cfb-choices-list">';
			choices.forEach(function(c, i) {
				choicesHtml += '<div class="cfb-choice-row">' +
					'<input type="text" class="cfb-choice-value" placeholder="' + (i18n.value || 'Value') + '" value="' + escapeHtml((c.value || '')) + '" />' +
					'<input type="text" class="cfb-choice-label" placeholder="' + (i18n.option || 'Option') + '" value="' + escapeHtml((c.label || '')) + '" />';
				if (isCards) {
					choicesHtml += '<input type="text" class="cfb-choice-description" placeholder="' + (i18n.choiceDescription || 'Description') + '" value="' + escapeHtml((c.description || '')) + '" />' +
						'<span class="cfb-choice-image-cell">' +
						'<input type="hidden" class="cfb-choice-image" value="' + escapeHtml((c.image || '')) + '" />' +
						'<button type="button" class="button cfb-choice-image-btn">' + (i18n.selectImage || 'Select image') + '</button>' +
						'<span class="cfb-choice-image-preview">' + (c.image ? '<img src="' + escapeHtml(c.image) + '" alt="" />' : '') + '</span>' +
						'<button type="button" class="button cfb-choice-image-clear" style="' + (c.image ? '' : 'display:none;') + '">' + (i18n.clearImage || 'Clear') + '</button>' +
						'</span>' +
						'<input type="text" class="cfb-choice-badge" placeholder="' + (i18n.choiceBadge || 'Badge') + '" value="' + escapeHtml((c.badge || '')) + '" />';
				}
				choicesHtml += '<button type="button" class="button cfb-remove-choice">' + (i18n.remove || 'Remove') + '</button></div>';
			});
			choicesHtml += '</div><button type="button" class="button cfb-add-choice">' + (i18n.addChoice || 'Add choice') + '</button></div>';
			$inner.append(choicesHtml);
			// Radio: ensure name is set (from first choice or id) if missing; don't overwrite if user already set it
			if (field.type === 'radio' && selectedFieldId) {
				var currentName = (field.name || '').toString().trim();
				if (!currentName) {
					var radioName = nameFromFirstRadioChoice(field.choices) || field.id;
					updateField(selectedFieldId, 'name', radioName);
					$inner.find('.cfb-edit-name').val(radioName);
				}
			}
		}
		if (field.type === 'html') {
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.htmlContent || 'HTML Content') + '</label>' +
				'<textarea class="cfb-edit-html-content" rows="8" placeholder="">' + escapeHtml(field.html_content || '') + '</textarea>' +
				'<p class="description">' + (i18n.htmlContentHelp || 'Add any HTML: headings, paragraphs, lists, images, or layout divs.') + '</p>' +
				'</div>' +
				'<div class="cfb-setting-row">' +
				'<label><input type="checkbox" class="cfb-edit-allow-shortcodes" ' + (field.allow_shortcodes ? 'checked' : '') + ' /> ' + (i18n.allowShortcodes || 'Process shortcodes') + '</label>' +
				'</div>' +
				'<div class="cfb-setting-row">' +
				'<label><input type="checkbox" class="cfb-edit-allow-full-html" ' + (field.allow_full_html ? 'checked' : '') + ' /> ' + (i18n.allowFullHtml || 'Allow full HTML') + '</label>' +
				'<p class="description">' + (i18n.allowFullHtmlHelp || 'Output without sanitization so you can use any HTML. Only enable if needed.') + '</p>' +
				'</div>'
			);
		}
		// Show when: conditional visibility (all field types that have settings)
		if (field.type !== 'group') {
			var depOpts = '<option value="">' + (i18n.dependsOnNone || '— None —') + '</option>';
			getFlatFieldsForDependency(field.id).forEach(function(f) {
				depOpts += '<option value="' + escapeHtml(f.id) + '"' + ((field.depends_on || '') === f.id ? ' selected' : '') + '>' + escapeHtml(f.label || f.id) + '</option>';
			});
			$inner.append(
				'<div class="cfb-setting-row">' +
				'<label>' + (i18n.dependsOn || 'Show when') + '</label>' +
				'<select class="cfb-edit-depends-on">' + depOpts + '</select>' +
				'<p class="description">' + (i18n.dependsOnHelp || 'Show this field only when the selected field has one of the values below.') + '</p>' +
				'</div>' +
				'<div class="cfb-setting-row cfb-depends-on-values-row">' +
				'<label>' + (i18n.dependsOnValues || 'When value is (comma-separated)') + '</label>' +
				'<input type="text" class="cfb-edit-depends-on-values" value="' + escapeHtml(field.depends_on_values || '') + '" placeholder="e.g. yes, option_1" />' +
				'<p class="description">' + (i18n.dependsOnValuesHelp || 'Enter values from the other field; this field is shown when that field\'s value matches one of these.') + '</p>' +
				'</div>'
			);
		}
		} // end if (field.type !== 'row_break')

		// Bind edits - use selectedFieldId so we always update the currently selected field (avoids wrong field when multiple radios/etc)
		$inner.find('.cfb-edit-name').on('input', function() {
			var v = $(this).val().replace(/[^a-zA-Z0-9_]/g, '_').replace(/_{2,}/g, '_').replace(/^_|_$/g, '');
			var id = selectedFieldId;
			if (id) updateField(id, 'name', v || id);
		});
		$inner.find('.cfb-edit-custom-id').on('input', function() {
			var v = $(this).val().replace(/[^a-zA-Z0-9_-]/g, '');
			if (/^[0-9]/.test(v)) v = 'f-' + v;
			updateField(field.id, 'custom_id', v);
		});
		$inner.find('.cfb-edit-css-class').on('input', function() {
			updateField(field.id, 'class', $(this).val());
		});
		$inner.find('.cfb-edit-layout').on('change', function() { updateField(field.id, 'layout', $(this).val()); });
		$inner.find('.cfb-edit-label').on('input', function() { updateField(field.id, 'label', $(this).val()); });
		$inner.find('.cfb-edit-placeholder').on('input', function() { updateField(field.id, 'placeholder', $(this).val()); });
		$inner.find('.cfb-edit-default').on('input', function() { updateField(field.id, 'default_value', $(this).val()); });
		$inner.find('.cfb-edit-required').on('change', function() { updateField(field.id, 'required', $(this).is(':checked')); });
		$inner.find('.cfb-edit-display-only').on('change', function() { updateField(field.id, 'include_in_entries', !$(this).is(':checked')); });
		$inner.find('.cfb-edit-min').on('input', function() { updateField(field.id, 'min', $(this).val()); });
		$inner.find('.cfb-edit-max').on('input', function() { updateField(field.id, 'max', $(this).val()); });
		$inner.find('.cfb-edit-step').on('input', function() { updateField(field.id, 'step', $(this).val()); });
		$inner.find('.cfb-edit-formula').on('input', function() { updateField(field.id, 'formula', $(this).val()); });
		$inner.find('.cfb-edit-merge-template').on('input', function() { updateField(field.id, 'template', $(this).val()); syncHiddenInput(); });
		$inner.find('.cfb-edit-format').on('change', function() { updateField(field.id, 'format', $(this).val()); });
		$inner.find('.cfb-edit-decimals').on('input', function() { updateField(field.id, 'decimals', parseInt($(this).val(), 10) || 0); });
		$inner.find('.cfb-edit-next-label').on('input', function() { updateField(field.id, 'next_label', $(this).val()); });
		$inner.find('.cfb-edit-prev-label').on('input', function() { updateField(field.id, 'prev_label', $(this).val()); });
		$inner.find('.cfb-edit-section-title').on('input', function() {
			var v = $(this).val();
			updateField(field.id, 'section_title', v);
			$('#cfb-form-fields-list .cfb-form-field-item[data-field-id="' + field.id + '"] .cfb-field-summary').text((v || '').trim() || field.label || field.id);
		});
		$inner.find('.cfb-edit-section-desc').on('input', function() { updateField(field.id, 'section_desc', $(this).val()); });
		$inner.find('.cfb-edit-accept').on('input', function() {
			var val = $(this).val();
			updateField(field.id, 'accept', val);
			$inner.find('.cfb-edit-accept-preset').val(val ? 'custom' : '');
		});
		$inner.find('.cfb-edit-max-size').on('input', function() { updateField(field.id, 'max_size', parseInt($(this).val(), 10) || 2); });
		$inner.find('.cfb-edit-multiple').on('change', function() { updateField(field.id, 'multiple', $(this).is(':checked')); });
		$inner.find('.cfb-edit-default-from-today').on('change', function() { updateField(field.id, 'default_from_today', $(this).is(':checked')); });
		$inner.find('.cfb-edit-allow-from-past').on('change', function() { updateField(field.id, 'allow_from_past', $(this).is(':checked')); });
		$inner.find('.cfb-edit-select-multiple').on('change', function() { updateField(field.id, 'multiple', $(this).is(':checked')); });
		$inner.find('.cfb-edit-accept-preset').on('change', function() {
			var v = $(this).val();
			var acceptMap = { '': '', 'images': 'image/*', 'documents': '.pdf,.doc,.docx', 'images_pdf': 'image/*,.pdf', 'audio': 'audio/*', 'video': 'video/*' };
			var acceptVal = acceptMap[v] !== undefined ? acceptMap[v] : ($inner.find('.cfb-edit-accept').val() || '');
			if (v !== 'custom') { $inner.find('.cfb-edit-accept').val(acceptVal); updateField(field.id, 'accept', acceptVal); }
			else { updateField(field.id, 'accept', $inner.find('.cfb-edit-accept').val()); }
		});
		$inner.find('.cfb-edit-html-content').on('input', function() { updateField(field.id, 'html_content', $(this).val()); });
		$inner.find('.cfb-edit-allow-shortcodes').on('change', function() { updateField(field.id, 'allow_shortcodes', $(this).is(':checked')); });
		$inner.find('.cfb-edit-allow-full-html').on('change', function() { updateField(field.id, 'allow_full_html', $(this).is(':checked')); });
		$inner.find('.cfb-edit-row-columns').on('change', function() { updateField(field.id, 'columns', parseInt($(this).val(), 10) || 2); });
		$inner.find('.cfb-edit-choice-style').on('change', function() {
			updateField(field.id, 'choice_style', $(this).val());
			renderFieldSettings(field);
			syncHiddenInput();
		});
		$inner.find('.cfb-edit-radio-default').on('change', function() {
			updateField(field.id, 'default_value', $(this).val());
			syncHiddenInput();
		});
		$inner.find('.cfb-edit-depends-on').on('change', function() {
			updateField(field.id, 'depends_on', $(this).val());
			syncHiddenInput();
		});
		$inner.find('.cfb-edit-depends-on-values').on('input', function() {
			updateField(field.id, 'depends_on_values', $(this).val());
			syncHiddenInput();
		});

		$inner.find('.cfb-add-choice').on('click', function() {
			var f = getFieldById(selectedFieldId);
			if (!f) return;
			var list = f.choices || [];
			var defaultLabel = 'Option ' + (list.length + 1);
			var newChoice = { value: defaultLabel, label: defaultLabel };
			if (f.type === 'radio' && f.choice_style === 'cards') {
				newChoice.description = '';
				newChoice.image = '';
				newChoice.badge = '';
			}
			if (f.type !== 'radio') newChoice.value = 'opt' + (list.length + 1);
			list.push(newChoice);
			f.choices = list;
			renderFieldSettings(f);
			syncHiddenInput();
		});
		$inner.on('click', '.cfb-remove-choice', function() {
			var f = getFieldById(selectedFieldId);
			if (!f) return;
			var idx = $(this).closest('.cfb-choice-row').index();
			f.choices = f.choices || [];
			f.choices.splice(idx, 1);
			if (f.choices.length === 0) f.choices = [{ value: '', label: 'Option 1' }];
			renderFieldSettings(f);
			syncHiddenInput();
		});
		$inner.on('input', '.cfb-choice-value', function() {
			var f = getFieldById(selectedFieldId);
			if (!f) return;
			var idx = $(this).closest('.cfb-choice-row').index();
			if (f.choices && f.choices[idx]) f.choices[idx].value = $(this).val();
			if (f.type === 'radio') {
				var nameVal = nameFromFirstRadioChoice(f.choices);
				if (nameVal && selectedFieldId) {
					updateField(selectedFieldId, 'name', nameVal);
					$inner.find('.cfb-edit-name').val(nameVal);
				}
			}
			syncHiddenInput();
		});
		$inner.on('input', '.cfb-choice-label', function() {
			var f = getFieldById(selectedFieldId);
			if (!f) return;
			var idx = $(this).closest('.cfb-choice-row').index();
			var labelVal = $(this).val();
			if (f.choices && f.choices[idx]) {
				f.choices[idx].label = labelVal;
				// Radio: label also becomes the value so the submitted value matches what the user sees
				if (f.type === 'radio') {
					f.choices[idx].value = labelVal;
					$(this).closest('.cfb-choice-row').find('.cfb-choice-value').val(labelVal);
				}
			}
			if (f.type === 'radio') {
				var nameVal = nameFromFirstRadioChoice(f.choices);
				if (nameVal && selectedFieldId) {
					updateField(selectedFieldId, 'name', nameVal);
					$inner.find('.cfb-edit-name').val(nameVal);
				}
			}
			syncHiddenInput();
		});
		$inner.on('input', '.cfb-choice-description', function() {
			var f = getFieldById(selectedFieldId);
			if (!f || !f.choices) return;
			var idx = $(this).closest('.cfb-choice-row').index();
			if (f.choices[idx]) f.choices[idx].description = $(this).val();
			syncHiddenInput();
		});
		$inner.on('click', '.cfb-choice-image-btn', function() {
			var f = getFieldById(selectedFieldId);
			if (!f) return;
			var $row = $(this).closest('.cfb-choice-row');
			var idx = $row.index();
			var $input = $row.find('.cfb-choice-image');
			var $preview = $row.find('.cfb-choice-image-preview');
			var $clear = $row.find('.cfb-choice-image-clear');
			if (typeof wp === 'undefined' || !wp.media) return;
			var frame = wp.media({
				title: (i18n.selectImage || 'Select image'),
				library: { type: 'image' },
				multiple: false,
				button: { text: (i18n.selectImage || 'Select image') }
			});
			frame.on('select', function() {
				var att = frame.state().get('selection').first().toJSON();
				var url = att.url || '';
				$input.val(url);
				if (f.choices && f.choices[idx]) f.choices[idx].image = url;
				$preview.html(url ? '<img src="' + escapeHtml(url) + '" alt="" />' : '').toggle(!!url);
				$clear.toggle(!!url);
				syncHiddenInput();
			});
			frame.open();
		});
		$inner.on('click', '.cfb-choice-image-clear', function() {
			var f = getFieldById(selectedFieldId);
			if (!f || !f.choices) return;
			var $row = $(this).closest('.cfb-choice-row');
			var idx = $row.index();
			$row.find('.cfb-choice-image').val('');
			if (f.choices[idx]) f.choices[idx].image = '';
			$row.find('.cfb-choice-image-preview').empty().hide();
			$(this).hide();
			syncHiddenInput();
		});
		$inner.on('input', '.cfb-choice-badge', function() {
			var f = getFieldById(selectedFieldId);
			if (!f || !f.choices) return;
			var idx = $(this).closest('.cfb-choice-row').index();
			if (f.choices[idx]) f.choices[idx].badge = $(this).val();
			syncHiddenInput();
		});
	}

	function escapeHtml(s) {
		if (s == null) return '';
		return String(s)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	/** For radio only: derive a valid field name from the first option (value or label). */
	function nameFromFirstRadioChoice(choices) {
		if (!choices || !choices.length) return '';
		var c = choices[0];
		var raw = (c.value || '').toString().trim() || (c.label || '').toString().trim();
		return raw.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_{2,}/g, '_').replace(/^_|_$/g, '') || '';
	}

	function buildRepeaterMapDropdowns($inner, field, acfRepeaters) {
		var key = field.acf_repeater_key || ($inner.find('.cfb-edit-acf-repeater').val() || '');
		var repeater = acfRepeaters.filter(function(r) { return r.key === key; })[0];
		var $container = $inner.find('.cfb-repeater-map-fields');
		$container.empty();
		if (!repeater || !repeater.sub_fields || repeater.sub_fields.length === 0) return;
		var map = field.acf_repeater_map || { value: 'row_index', label: '', image: '', description: '', badge: '' };
		var subs = repeater.sub_fields;
		function opt(val, label) {
			return '<option value="' + escapeHtml(val) + '">' + escapeHtml(label) + '</option>';
		}
		var valueOpts = '<option value="row_index">' + (i18n.rowIndex || 'Row index') + '</option>';
		var labelOpts = '<option value="">— ' + (i18n.noneOptional || 'None') + ' —</option>';
		var imageOpts = '<option value="">' + (i18n.noneOptional || '— None —') + '</option>';
		var descOpts = '<option value="">' + (i18n.noneOptional || '— None —') + '</option>';
		var badgeOpts = '<option value="">' + (i18n.noneOptional || '— None —') + '</option>';
		subs.forEach(function(s) {
			var name = s.name || '';
			var label = (s.label || name);
			valueOpts += opt(name, label);
			labelOpts += opt(name, label);
			if (s.type === 'image' || s.type === 'url' || s.type === 'text') imageOpts += opt(name, label);
			if (s.type === 'text' || s.type === 'textarea') { descOpts += opt(name, label); badgeOpts += opt(name, label); }
		});
		$container.append(
			'<div class="cfb-setting-row"><label>' + (i18n.mapValueFrom || 'Value from') + '</label><select class="cfb-edit-map-value">' + valueOpts + '</select></div>' +
			'<div class="cfb-setting-row"><label>' + (i18n.mapLabelFrom || 'Title/Label from') + '</label><select class="cfb-edit-map-label">' + labelOpts + '</select></div>' +
			'<div class="cfb-setting-row"><label>' + (i18n.mapImageFrom || 'Image from') + '</label><select class="cfb-edit-map-image">' + imageOpts + '</select></div>' +
			'<div class="cfb-setting-row"><label>' + (i18n.mapDescFrom || 'Description from') + '</label><select class="cfb-edit-map-desc">' + descOpts + '</select></div>' +
			'<div class="cfb-setting-row"><label>' + (i18n.mapBadgeFrom || 'Badge from') + '</label><select class="cfb-edit-map-badge">' + badgeOpts + '</select></div>'
		);
		$container.find('.cfb-edit-map-value').val(map.value || 'row_index');
		$container.find('.cfb-edit-map-label').val(map.label || '');
		$container.find('.cfb-edit-map-image').val(map.image || '');
		$container.find('.cfb-edit-map-desc').val(map.description || '');
		$container.find('.cfb-edit-map-badge').val(map.badge || '');
	}

	function getTopLevelById(id) {
		for (var i = 0; i < fields.length; i++) {
			if (fields[i].id === id) return fields[i];
		}
		return null;
	}

	function setupSortable() {
		var list = document.getElementById('cfb-form-fields-list');
		if (!list) return;
		if (window.Sortable) {
			// One class for both: top-level field row and group header (so group drag works reliably)
			window.Sortable.create(list, {
				animation: 150,
				ghostClass: 'cfb-dragging',
				draggable: '.cfb-form-field-item, .cfb-group-item',
				handle: '.cfb-can-drag',
				onEnd: function(evt) {
					var $list = $(list);
					var newFields = [];
					$list.children().each(function() {
						var id = $(this).data('field-id') || $(this).data('group-id');
						if (id) {
							var item = getTopLevelById(id);
							if (item) newFields.push(item);
						}
					});
					fields = newFields;
					syncHiddenInput();
					updateStepTitlesVisibility();
				}
			});
			setupGroupSortables();
		} else {
			// Native HTML5 drag and drop: attach to list (delegation), set draggable on items after each render
			list.addEventListener('dragstart', function(e) {
				var item = e.target.closest('.cfb-form-field-item');
				var groupItem = e.target.closest('.cfb-group-item');
				// Top-level field: drag from anywhere. Group: drag from anywhere on group (header or body).
				// Only skip when clicking an inner field's drag handle (that reorders within group).
				var onInnerHandle = e.target.closest('.cfb-group-fields-list .cfb-field-drag-handle');
				if (item && !item.closest('.cfb-group-fields-list')) {
					item.classList.add('cfb-dragging');
					e.dataTransfer.setData('text/plain', item.getAttribute('data-field-id'));
					e.dataTransfer.setData('cfb-type', 'field');
				} else if (groupItem && !onInnerHandle) {
					groupItem.classList.add('cfb-dragging');
					e.dataTransfer.setData('text/plain', groupItem.getAttribute('data-group-id'));
					e.dataTransfer.setData('cfb-type', 'group');
				} else {
					e.preventDefault();
					return;
				}
				e.dataTransfer.effectAllowed = 'move';
			});
			list.addEventListener('dragend', function(e) {
				var item = e.target.closest('.cfb-form-field-item');
				var groupItem = e.target.closest('.cfb-group-item');
				if (item) item.classList.remove('cfb-dragging');
				if (groupItem) groupItem.classList.remove('cfb-dragging');
			});
			list.addEventListener('dragover', function(e) {
				e.preventDefault();
				e.dataTransfer.dropEffect = 'move';
			});
			list.addEventListener('drop', function(e) {
				e.preventDefault();
				var id = e.dataTransfer.getData('text/plain');
				var type = e.dataTransfer.getData('cfb-type');
				var target = e.target.closest('.cfb-form-field-item') || e.target.closest('.cfb-group-item');
				if (!id || !target) return;
				var fromIdx = -1;
				for (var i = 0; i < fields.length; i++) {
					if (fields[i].id === id) { fromIdx = i; break; }
				}
				var children = list.children;
				var toIdx = Array.prototype.indexOf.call(children, target);
				if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
				var item = fields.splice(fromIdx, 1)[0];
				fields.splice(toIdx, 0, item);
				renderFormFields();
				syncHiddenInput();
				updateStepTitlesVisibility();
			});
			setDraggableOnFormItems();
		}
	}

	function setupGroupSortables() {
		if (!window.Sortable) return;
		$('.cfb-group-fields-list').each(function() {
			var $innerList = $(this);
			if ($innerList.data('sortable')) return; // already init
			var groupId = $innerList.closest('.cfb-group-item').data('group-id');
			var group = getGroupById(groupId);
			if (!group) return;
			window.Sortable.create(this, {
				animation: 150,
				ghostClass: 'cfb-dragging',
				group: 'group-fields',
				handle: '.cfb-field-drag-handle',
				onEnd: function() {
					var newOrder = [];
					$innerList.children('.cfb-form-field-item').each(function() {
						var id = $(this).data('field-id');
						var f = getFieldById(id);
						if (f) newOrder.push(f);
					});
					group.fields = newOrder;
					syncHiddenInput();
					updateStepTitlesVisibility();
				}
			});
		});
	}

	function setDraggableOnFormItems() {
		if (window.Sortable) return;
		var list = document.getElementById('cfb-form-fields-list');
		if (!list) return;
		var i, child;
		for (i = 0; i < list.children.length; i++) {
			child = list.children[i];
			if (child.classList.contains('cfb-form-field-item') || child.classList.contains('cfb-group-item')) {
				child.setAttribute('draggable', 'true');
			}
		}
	}

	function syncHiddenInput() {
		$('#cfb_fields_json').val(JSON.stringify(fields));
	}

	function setupFormSubmit() {
		$('#post').on('submit', function() {
			syncHiddenInput();
		});
		var saveTimeout;
		function debouncedSave() {
			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(function() {
				if (!formId || fields.length === 0) return;
				wp.apiFetch({
					path: 'custom-form-builder/v1/forms/' + formId + '/fields',
					method: 'POST',
					data: { fields: fields }
				}).then(function(res) {
					if (res.saved) {
						$(document.body).trigger('cfb-saved');
					}
				}).catch(function() {});
			}, 500);
		}
		$(document.body).on('cfb-fields-changed', debouncedSave);
		$('#cfb-form-builder').on('input change', 'input, select, textarea', function() {
			syncHiddenInput();
			$(document.body).trigger('cfb-fields-changed');
		});
	}

	$(function() {
		init();
	});
})(jQuery);
