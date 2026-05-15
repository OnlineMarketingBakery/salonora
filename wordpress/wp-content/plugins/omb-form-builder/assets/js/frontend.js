/**
 * Custom Form Builder - Frontend: submit via AJAX, live calculation (Gravity Forms style).
 */
(function($) {
	'use strict';

	var config = window.cfbFrontend || {};
	// formId -> { fieldName: [File, ...] } for multiple file inputs
	var multiFileStore = {};

	function init() {
		$(document).on('submit', '.cfb-form', onSubmit);
		$(document).on('input change', '.cfb-form input:not(.cfb-calculation), .cfb-form select, .cfb-form textarea', onInputForCalculation);
		$(document).on('input change', '.cfb-form input, .cfb-form select, .cfb-form textarea', onFieldInputClearError);
		$(document).on('input change', '.cfb-form input, .cfb-form select, .cfb-form textarea', onInputUpdateDependencies);
		$(document).on('click', '.cfb-multi-file-remove', onMultiFileRemove);
		$(document).on('click', '.cfb-step-next', onStepNext);
		$(document).on('click', '.cfb-step-prev', onStepPrev);
		$(document).on('change', '.cfb-form input.cfb-date-from', onDateRangeFromChange);
		$(document).on('click', '.cfb-radio-card', onRadioCardClick);
		initDateRangeMin();
		initMultiFileInputs();
		initSearchableSelects();
		$('.cfb-form').each(function() {
			runCalculations($(this));
			runMergeText($(this));
			updateDependentFields($(this));
		});
	}

	function getFieldValue($form, fieldId) {
		if (!fieldId) return '';
		var name = 'cfb[' + fieldId + ']';
		var $radios = $form.find('input[type="radio"][name="' + name + '"]');
		if ($radios.length) {
			var $checked = $radios.filter(':checked');
			var val = $checked.length ? ($checked.val() || '').toString().trim() : '';
			// If value is empty but there is a checked radio, use its card title or label (for dependency matching)
			if (val === '' && $checked.length) {
				val = getRadioSelectedLabel($checked);
			}
			return val;
		}
		var $sel = $form.find('select[name="' + name + '"]');
		if ($sel.length) return ($sel.val() || '').toString().trim();
		var $input = $form.find('input[name="' + name + '"], textarea[name="' + name + '"]');
		if ($input.length) return ($input.val() || '').toString().trim();
		return '';
	}

	/** For dependency matching: get the label of the selected radio (so "Hout" in UI matches depends_on_values "Hout" even if value is "opt2"). */
	function getRadioSelectedLabel($checkedRadio) {
		if (!$checkedRadio || !$checkedRadio.length) return '';
		var $card = $checkedRadio.closest('.cfb-radio-card');
		if ($card.length) {
			var title = $card.find('.cfb-radio-card-title').first().text();
			if (title) return title.trim();
		}
		var $label = $checkedRadio.closest('label');
		if ($label.length) return $label.clone().children().remove().end().text().trim();
		return '';
	}

	/** Value used for dependency visibility: for radios, match by both value and label so "Hout" in depends_on_values works. */
	function getFieldValueForDependency($form, fieldId) {
		var value = getFieldValue($form, fieldId);
		var name = 'cfb[' + fieldId + ']';
		var $radios = $form.find('input[type="radio"][name="' + name + '"]');
		if ($radios.length) {
			var $checked = $radios.filter(':checked');
			if ($checked.length) {
				var label = getRadioSelectedLabel($checked);
				return { value: value, label: (label || '').toString().trim() };
			}
		}
		return { value: value, label: value };
	}

	function updateDependentFields($form) {
		if (!$form || !$form.length) return;
		var debug = $form.closest('.cfb-form-wrapper').attr('data-cfb-debug') === '1' || $form.attr('data-cfb-debug') === '1';
		$form.find('[data-cfb-depends-on][data-cfb-depends-on-values]').each(function() {
			var $row = $(this);
			// Use attr() so we get the exact value; .data() can cache/camelCase and break chained deps
			var depId = $row.attr('data-cfb-depends-on');
			var valuesStr = ($row.attr('data-cfb-depends-on-values') || '').toString();
			var allowed = valuesStr.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
			var depVal = getFieldValueForDependency($form, depId);
			var currentVal = (depVal.value || '').toString().trim();
			var currentLabel = (depVal.label || '').toString().trim();
			// Match allowed list against both value and label (so "Hout" in depends_on_values matches when user selected the option labeled "Hout" even if value is "opt2")
			var show = allowed.length > 0 && (
				allowed.some(function(a) { return a.toLowerCase() === currentVal.toLowerCase(); }) ||
				allowed.some(function(a) { return a.toLowerCase() === currentLabel.toLowerCase(); })
			);
			if (debug) {
				var rowId = $row.attr('data-field-id') || $row.attr('id') || '(group or row)';
				console.log('[CFB dependency] row=' + rowId + ' dependsOn=' + depId + ' value="' + currentVal + '" label="' + currentLabel + '" allowed=' + JSON.stringify(allowed) + ' show=' + show);
			}
			if (show) {
				if ($row.hasClass('cfb-dependent-hidden')) {
					$row.removeClass('cfb-dependent-hidden');
					$row.css({ 'pointer-events': '', 'visibility': '', 'height': '', 'overflow': '' });
					$row.find('input, select, textarea').each(function() {
						var $el = $(this);
						$el.prop('disabled', false);
						if ($el.data('cfb-was-required') === true) $el.prop('required', true);
					});
					requestAnimationFrame(function() { /* allow layout to settle */ });
				} else {
					$row.css({ 'pointer-events': '', 'visibility': '', 'height': '', 'overflow': '' });
					$row.find('input, select, textarea').each(function() {
						var $el = $(this);
						$el.prop('disabled', false);
						if ($el.data('cfb-was-required') === true) $el.prop('required', true);
					});
				}
			} else {
				$row.addClass('cfb-dependent-hidden');
				$row.find('input, select, textarea').each(function() {
					var $el = $(this);
					if ($el.is('[required]')) $el.data('cfb-was-required', true);
					$el.prop('required', false);
					// Do NOT set disabled here - once disabled, some environments don't submit the value even after re-enabling.
				});
				// Clear only text/select/textarea values. Do NOT use .val('') on radio/checkbox - it strips the value attribute in the DOM, so when the row is shown again (or another row that was hidden) all radios would have empty value.
				$row.find('input[type="text"], input[type="email"], input[type="tel"], input[type="url"], input[type="number"], input[type="date"], select, textarea').val('');
				$row.find('input[type="radio"]').prop('checked', false);
				$row.find('input[type="checkbox"]').prop('checked', false);
				$row.find('.cfb-select-searchable').length && $row.find('select.cfb-select-searchable').trigger('change');
			}
		});
	}

	/**
	 * If the form is a stepper and the row is inside a step that is not active, switch to that step.
	 */
	function ensureStepVisibleForRow($form, $row) {
		var $step = $row.closest('.cfb-step');
		if (!$step.length || !$form.hasClass('cfb-form') || !$form.closest('.cfb-form-stepper').length) return;
		if ($step.hasClass('cfb-step-active')) return;
		var stepNum = parseInt($step.attr('data-step'), 10);
		if (isNaN(stepNum)) return;
		var $wrapper = $form.closest('.cfb-form-wrapper');
		$form.find('.cfb-step').removeClass('cfb-step-active').attr('aria-hidden', 'true');
		$form.find('.cfb-step').each(function() {
			this.style.setProperty('display', 'none', 'important');
		});
		$step.addClass('cfb-step-active').attr('aria-hidden', 'false');
		$step[0] && $step[0].style.setProperty('display', 'block', 'important');
		$wrapper.find('.cfb-step-progress-item').removeClass('cfb-step-current cfb-step-done');
		$wrapper.find('.cfb-step-progress-item[data-step="' + stepNum + '"]').addClass('cfb-step-current');
		$wrapper.find('.cfb-step-progress-item').each(function() {
			var d = parseInt($(this).attr('data-step'), 10);
			if (!isNaN(d) && d < stepNum) $(this).addClass('cfb-step-done');
		});
	}

	function onInputUpdateDependencies() {
		var $form = $(this).closest('.cfb-form');
		if (!$form.length) return;
		// Run once immediately (value may already be set) and once next tick so chained deps (B→C) see updated B
		updateDependentFields($form);
		var formEl = $form[0];
		setTimeout(function() {
			updateDependentFields($(formEl));
		}, 0);
	}

	function initSearchableSelects() {
		function escapeHtml(s) {
			if (s == null) return '';
			return String(s)
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;');
		}
		$('.cfb-form .cfb-select-searchable-wrap').each(function() {
			var $wrap = $(this);
			if ($wrap.data('cfb-searchable-inited')) return;
			var $select = $wrap.find('select.cfb-select-searchable');
			if (!$select.length) return;
			var isMultiple = $select.attr('multiple') === 'multiple' || $wrap.data('multiple') === 1;
			var placeholder = $wrap.data('placeholder') || (isMultiple ? 'Select options...' : 'Select an option...');
			var options = [];
			$select.find('option').each(function() {
				var v = $(this).attr('value');
				var l = $(this).text();
				if (v === '') return;
				options.push({ value: v, label: l });
			});
			var $trigger = $('<button type="button" class="cfb-select-trigger" aria-haspopup="listbox" aria-expanded="false"' + (isMultiple ? ' aria-multiselectable="true"' : '') + '>');
			var $clearBtn = $('<button type="button" class="cfb-select-clear" aria-label="Clear selection" title="Clear selection">×</button>');
			var $dropdown = $('<div class="cfb-select-dropdown" role="listbox" aria-hidden="true">');
			var $search = $('<input type="text" class="cfb-select-search" placeholder="' + (config.searchPlaceholder || 'Search...') + '" autocomplete="off" role="combobox" aria-autocomplete="list">');
			var $list = $('<ul class="cfb-select-list"></ul>');
			options.forEach(function(opt) {
				$list.append('<li class="cfb-select-option" role="option" data-value="' + escapeHtml(opt.value) + '" tabindex="-1">' + escapeHtml(opt.label) + '</li>');
			});
			$dropdown.append($search).append($list);
			$wrap.append($trigger).append($clearBtn).append($dropdown);
			$select.addClass('cfb-select-native-hidden').attr('tabindex', '-1');
			var selectId = $select.attr('id');
			if (selectId) {
				$trigger.attr('id', selectId + '_trigger');
				$wrap.closest('.cfb-field').find('label[for="' + selectId + '"]').attr('for', selectId + '_trigger');
			}

			function getSelectedValues() {
				if (isMultiple) {
					var arr = [];
					$select.find('option:selected').each(function() { arr.push($(this).val()); });
					return arr;
				}
				var v = $select.val();
				return v ? [v] : [];
			}
			function updateTriggerText() {
				var selected = getSelectedValues();
				var label = placeholder;
				if (selected.length) {
					if (isMultiple && selected.length > 1) {
						label = selected.map(function(v) {
							var o = options.filter(function(x) { return x.value === v; })[0];
							return o ? o.label : v;
						}).join(', ');
					} else {
						var o = options.filter(function(x) { return x.value === selected[0]; })[0];
						if (o) label = o.label;
					}
				}
				$trigger.text(label);
				$trigger.toggleClass('cfb-select-placeholder', selected.length === 0);
				$clearBtn.toggle(selected.length > 0);
				$list.find('.cfb-select-option').each(function() {
					var $opt = $(this);
					var val = $opt.data('value');
					$opt.toggleClass('cfb-select-option-selected', selected.indexOf(val) !== -1);
				});
			}
			function closeDropdown() {
				$dropdown.removeClass('cfb-select-open').attr('aria-hidden', 'true');
				$trigger.attr('aria-expanded', 'false');
				$search.val('');
				filterOptions('');
			}
			function filterOptions(q) {
				q = (q || '').toLowerCase();
				$list.find('.cfb-select-option').each(function() {
					var $opt = $(this);
					var show = !q || $opt.text().toLowerCase().indexOf(q) !== -1;
					$opt.toggle(show).attr('aria-selected', 'false');
				});
				$list.find('.cfb-select-option:visible').first().attr('aria-selected', 'true');
			}
			function setValue(val, label) {
				if (isMultiple) return;
				$select.val(val || '').trigger('change');
				$trigger.text(label || placeholder);
				$trigger.toggleClass('cfb-select-placeholder', !val);
				$clearBtn.toggle(!!val);
				closeDropdown();
			}
			function toggleMulti(value) {
				var selected = getSelectedValues();
				var idx = selected.indexOf(value);
				if (idx === -1) selected.push(value);
				else selected.splice(idx, 1);
				$select.find('option').prop('selected', false);
				selected.forEach(function(v) {
					$select.find('option[value="' + escapeHtml(v) + '"]').prop('selected', true);
				});
				$select.trigger('change');
				updateTriggerText();
			}
			function clearMulti() {
				$select.find('option').prop('selected', false);
				$select.trigger('change');
				updateTriggerText();
				closeDropdown();
			}

			updateTriggerText();
			$clearBtn.hide().on('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				if (isMultiple) clearMulti();
				else setValue('', null);
			});

			$trigger.on('click', function(e) {
				e.preventDefault();
				var open = $dropdown.hasClass('cfb-select-open');
				if (open) { closeDropdown(); return; }
				$dropdown.addClass('cfb-select-open').attr('aria-hidden', 'false');
				$trigger.attr('aria-expanded', 'true');
				$search.val('');
				filterOptions('');
				setTimeout(function() { $search.focus(); }, 50);
			});

			$search.on('input', function() { filterOptions($(this).val()); });
			$search.on('keydown', function(e) {
				if (e.key === 'Escape') { closeDropdown(); $trigger.focus(); return; }
				if (e.key === 'ArrowDown' || e.key === 'Enter') {
					var $first = $list.find('.cfb-select-option:visible').first();
					if ($first.length) { $first.click(); }
					e.preventDefault();
				}
			});

			$list.on('click', '.cfb-select-option', function() {
				var $opt = $(this);
				if (!$opt.is(':visible')) return;
				var val = $opt.data('value');
				if (isMultiple) {
					toggleMulti(val);
				} else {
					setValue(val, $opt.text());
				}
			});

			$(document).on('click.cfbSelect', function(e) {
				if ($wrap.is(e.target) || $wrap.has(e.target).length) return;
				closeDropdown();
			});

			$select.on('change', updateTriggerText);
			$wrap.data('cfb-searchable-inited', true);
		});
	}

	function initDateRangeMin() {
		$('.cfb-form input.cfb-date-to').each(function() {
			var $to = $(this);
			var fromId = $to.data('cfb-date-range-from-id');
			if (!fromId) return;
			var $from = $('#' + fromId);
			if ($from.length && $from.val()) {
				$to.attr('min', $from.val());
				var toVal = $to.val();
				if (toVal && toVal < $from.val()) $to.val('');
			}
		});
	}

	function onDateRangeFromChange() {
		var $from = $(this);
		var fromId = $from.attr('id');
		if (!fromId) return;
		var fromVal = $from.val() || '';
		var $row = $from.closest('.cfb-field');
		var $to = $row.find('input.cfb-date-to');
		if (!$to.length) return;
		$to.attr('min', fromVal);
		if ($to.val() && fromVal && $to.val() < fromVal) $to.val('');
	}

	function initMultiFileInputs() {
		$('.cfb-form input[type=file][multiple]').each(function() {
			var $input = $(this);
			if ($input.closest('.cfb-multi-file-wrap').length) return;
			var $wrap = $('<div class="cfb-multi-file-wrap"></div>');
			$input.wrap($wrap);
			$wrap = $input.parent();
			$wrap.append('<ul class="cfb-multi-file-list" aria-live="polite"></ul>');
			var formId = $input.closest('.cfb-form').data('form-id');
			var fieldName = $input.attr('name');
			if (formId != null && fieldName) {
				if (!multiFileStore[formId]) multiFileStore[formId] = {};
				multiFileStore[formId][fieldName] = [];
			}
		});
	}

	function getMultiFileStore(formId, fieldName) {
		if (!multiFileStore[formId]) multiFileStore[formId] = {};
		if (!multiFileStore[formId][fieldName]) multiFileStore[formId][fieldName] = [];
		return multiFileStore[formId][fieldName];
	}

	function renderMultiFileList($input) {
		var $wrap = $input.closest('.cfb-multi-file-wrap');
		var $list = $wrap.find('.cfb-multi-file-list');
		var formId = $input.closest('.cfb-form').data('form-id');
		var fieldName = $input.attr('name');
		var files = getMultiFileStore(formId, fieldName);
		$list.empty();
		files.forEach(function(file, index) {
			var name = file.name || ('File ' + (index + 1));
			var $li = $('<li class="cfb-multi-file-item"></li>');
			$li.append($('<span class="cfb-multi-file-name"></span>').text(name));
			$li.append($('<button type="button" class="cfb-multi-file-remove" aria-label="Remove ' + name.replace(/"/g, '') + '">&times;</button>').data('index', index));
			$list.append($li);
		});
		$input.prop('required', files.length === 0);
	}

	function onMultiFileChange() {
		var $input = $(this);
		var formId = $input.closest('.cfb-form').data('form-id');
		var fieldName = $input.attr('name');
		var files = this.files;
		if (!files || !files.length || formId == null || !fieldName) return;
		var store = getMultiFileStore(formId, fieldName);
		for (var i = 0; i < files.length; i++) {
			store.push(files[i]);
		}
		renderMultiFileList($input);
		$input.val('');
	}

	function onMultiFileRemove(e) {
		e.preventDefault();
		var $btn = $(this);
		var index = $btn.data('index');
		var $list = $btn.closest('.cfb-multi-file-list');
		var $wrap = $list.closest('.cfb-multi-file-wrap');
		var $input = $wrap.find('input[type=file]');
		var formId = $input.closest('.cfb-form').data('form-id');
		var fieldName = $input.attr('name');
		var store = getMultiFileStore(formId, fieldName);
		store.splice(index, 1);
		renderMultiFileList($input);
	}

	function onRadioCardClick(e) {
		e.preventDefault();
		var $card = $(e.currentTarget);
		var $input = $card.find('input[type="radio"]');
		if (!$input.length) return;
		var name = $input.attr('name');
		var $form = $input.closest('form');
		if (name && $form.length) {
			var escapedName = name.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
			$form.find('input[type="radio"][name="' + escapedName + '"]').prop('checked', false);
		}
		$input.prop('checked', true);
		if ($input[0]) $input[0].checked = true;
		$input.trigger('change');
		// For custom JS: listen on the form for 'cfb:radio-card-selected' (args: $card, $input)
		$form.trigger('cfb:radio-card-selected', [ $card, $input ]);
	}

	function onStepNext() {
		var $btn = $(this);
		var $form = $btn.closest('.cfb-form');
		var $wrapper = $form.closest('.cfb-form-wrapper');
		// Find steps inside the form (fieldsets), not the wrapper
		var $current = $form.find('.cfb-step.cfb-step-active');
		if (!$current.length) return;
		var step = parseInt($current.attr('data-step'), 10);
		if (isNaN(step)) return;
		var $next = $form.find('.cfb-step[data-step="' + (step + 1) + '"]');
		if (!$next.length) return;
		var valid = true;
		// Clear previous step errors so we don't duplicate messages
		$current.find('.cfb-field, li').removeClass('cfb-field-error');
		$current.find('.cfb-field-error-msg').remove();
		$current.find('[required]').each(function() {
			var $el = $(this);
			if (!$el.val() || ($el.attr('type') === 'checkbox' && !$el.is(':checked'))) {
				valid = false;
				$el.closest('.cfb-field').addClass('cfb-field-error');
			} else {
				$el.closest('.cfb-field').removeClass('cfb-field-error');
			}
		});
		$current.find('input[type=file][multiple][required]').each(function() {
			var $input = $(this);
			var formId = $form.data('form-id');
			var fieldName = $input.attr('name');
			var store = multiFileStore[formId] && multiFileStore[formId][fieldName] ? multiFileStore[formId][fieldName] : [];
			if (store.length === 0) {
				valid = false;
				$input.closest('.cfb-field').addClass('cfb-field-error');
			}
		});
		// HTML5 constraint validation (min, max, step, pattern) so typed values are validated, not only spinner
		$current.find('input, select, textarea').each(function() {
			var el = this;
			if (el.willValidate && !el.checkValidity()) {
				valid = false;
				var $field = $(el).closest('.cfb-field');
				if (!$field.length) $field = $(el).closest('li');
				$field.addClass('cfb-field-error');
				if ($field.length && !$field.find('.cfb-field-error-msg').length) {
					var msg = (typeof el.validationMessage === 'string' && el.validationMessage) ? el.validationMessage : 'Please correct this value.';
					$field.append('<span class="cfb-field-error-msg" role="alert">' + $('<div>').text(msg).html() + '</span>');
				}
			}
		});
		if (!valid) return;
		$current.removeClass('cfb-step-active').attr('aria-hidden', 'true');
		$current[0] && $current[0].style.setProperty('display', 'none', 'important');
		$next.addClass('cfb-step-active').attr('aria-hidden', 'false');
		$next[0] && $next[0].style.setProperty('display', 'block', 'important');
		$wrapper.find('.cfb-step-progress-item').removeClass('cfb-step-current cfb-step-done');
		$wrapper.find('.cfb-step-progress-item[data-step="' + step + '"]').addClass('cfb-step-done');
		$wrapper.find('.cfb-step-progress-item[data-step="' + (step + 1) + '"]').addClass('cfb-step-current');
		$next.find('input, select, textarea').first().focus();
	}

	function onStepPrev() {
		var $btn = $(this);
		var $form = $btn.closest('.cfb-form');
		var $wrapper = $form.closest('.cfb-form-wrapper');
		var $current = $form.find('.cfb-step.cfb-step-active');
		if (!$current.length) return;
		var step = parseInt($current.attr('data-step'), 10);
		if (isNaN(step)) return;
		var $prev = $form.find('.cfb-step[data-step="' + (step - 1) + '"]');
		if (!$prev.length) return;
		$current.removeClass('cfb-step-active').attr('aria-hidden', 'true');
		$current[0] && $current[0].style.setProperty('display', 'none', 'important');
		$prev.addClass('cfb-step-active').attr('aria-hidden', 'false');
		$prev[0] && $prev[0].style.setProperty('display', 'block', 'important');
		$wrapper.find('.cfb-step-progress-item').removeClass('cfb-step-current cfb-step-done');
		$wrapper.find('.cfb-step-progress-item[data-step="' + (step - 1) + '"]').addClass('cfb-step-current');
		$wrapper.find('.cfb-step-progress-item[data-step="' + step + '"]').removeClass('cfb-step-done');
	}

	function getFormValues($form) {
		var data = {};
		$form.find('input, select, textarea').each(function() {
			var $el = $(this);
			var name = $el.attr('name');
			if (!name || name.indexOf('cfb[') !== 0) return;
			var match = name.match(/cfb\[([^\]]+)\]/);
			if (!match) return;
			var key = match[1];
			if ($el.attr('type') === 'checkbox' && $el.attr('name').indexOf('[]') !== -1) {
				if (!data[key]) data[key] = [];
				if ($el.is(':checked')) data[key].push($el.val());
			} else if ($el.attr('type') !== 'checkbox' && $el.attr('type') !== 'radio') {
				data[key] = $el.val();
			} else if ($el.attr('type') === 'radio' && $el.is(':checked')) {
				data[key] = $el.val();
			}
		});
		$form.find('input[type="radio"]').each(function() {
			var name = $(this).attr('name');
			if (!name || name.indexOf('cfb[') !== 0) return;
			var match = name.match(/cfb\[([^\]]+)\]/);
			if (match && data[match[1]] === undefined) data[match[1]] = '';
		});
		return data;
	}

	function onInputForCalculation() {
		var $form = $(this).closest('.cfb-form');
		if ($form.length) {
			runCalculations($form);
			runMergeText($form);
		}
	}

	function runCalculations($form) {
		$form.find('.cfb-calculation').each(function() {
			var $input = $(this);
			var formula = $input.data('formula');
			var format = $input.data('format') || 'decimal';
			var decimals = parseInt($input.data('decimals'), 10) || 2;
			var values = getFormValues($form);
			var numValues = {};
			for (var k in values) {
				var v = values[k];
				if (Array.isArray(v)) v = v.join('');
				var n = parseFloat(String(v).replace(/[^0-9.\-]/g, '')) || 0;
				numValues[k] = n;
			}
			var expr = formula;
			for (var id in numValues) {
				expr = expr.replace(new RegExp('\\{' + id + '\\}', 'g'), numValues[id]);
			}
			expr = expr.replace(/\{[^}]+\}/g, '0');
			expr = expr.replace(/[^0-9+\-*/().\s]/g, '');
			var result = safeEval(expr);
			var formatted = formatNumber(result, format, decimals);
			$input.val(formatted);
		});
	}

	function runMergeText($form) {
		if (!$form || !$form.length) return;
		$form.find('.cfb-merge-text').each(function() {
			var $input = $(this);
			var template = ($input.data('template') || '').toString();
			var values = getFormValues($form);
			var out = template;
			for (var id in values) {
				var v = values[id];
				if (Array.isArray(v)) v = v.join(', ');
				else v = (v != null) ? String(v) : '';
				out = out.replace(new RegExp('\\{' + id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\}', 'g'), v);
			}
			out = out.replace(/\{[^}]+\}/g, '');
			$input.val(out);
		});
	}

	function formatNumber(n, format, decimals) {
		if (isNaN(n)) return '';
		decimals = parseInt(decimals, 10) || 2;
		var s = n.toFixed(decimals);
		if (format === 'percentage') return s + '%';
		return s;
	}

	function safeEval(expr) {
		expr = String(expr).replace(/\s/g, '');
		if (!expr) return 0;
		var num = function(s) { return parseFloat(s) || 0; };
		var pos = 0;
		var len = expr.length;
		function readNum() {
			var start = pos;
			if (expr[pos] === '-' || expr[pos] === '+') pos++;
			while (pos < len && /[0-9.]/.test(expr[pos])) pos++;
			return num(expr.slice(start, pos));
		}
		function factor() {
			if (pos >= len) return 0;
			if (expr[pos] === '(') {
				pos++;
				var v = expression();
				if (expr[pos] === ')') pos++;
				return v;
			}
			if (expr[pos] === '-') { pos++; return -factor(); }
			if (expr[pos] === '+') { pos++; return factor(); }
			return readNum();
		}
		function term() {
			var left = factor();
			while (pos < len) {
				if (expr[pos] === '*') { pos++; left *= factor(); }
				else if (expr[pos] === '/') { pos++; var r = factor(); left = r !== 0 ? left / r : 0; }
				else break;
			}
			return left;
		}
		function expression() {
			var left = term();
			while (pos < len) {
				if (expr[pos] === '+') { pos++; left += term(); }
				else if (expr[pos] === '-') { pos++; left -= term(); }
				else break;
			}
			return left;
		}
		return expression();
	}

	function showValidationErrors($form, formEl) {
		var firstInvalid = null;
		$form.find('.cfb-field').removeClass('cfb-field-error');
		$form.find('li').removeClass('cfb-field-error');
		$form.find('.cfb-field-error-msg').remove();
		for (var i = 0; i < formEl.elements.length; i++) {
			var el = formEl.elements[i];
			if (!el.willValidate || el.validity.valid) continue;
			var $field = null;
			if (el.id) {
				var rowId = 'cfb-row-' + el.id;
				var sel = typeof CSS !== 'undefined' && CSS.escape ? '#' + CSS.escape(rowId) : '#' + rowId.replace(/([!"$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~])/g, '\\$1');
				$field = $form.find(sel);
			}
			if (!$field || !$field.length) {
				$field = $(el).closest('.cfb-field');
			}
			if (!$field || !$field.length) {
				$field = $(el).closest('li');
			}
			if (!$field || !$field.length || !$form[0].contains($field[0])) continue;
			if ($field.hasClass('cfb-field-error')) continue;
			$field.addClass('cfb-field-error');
			var msg = (typeof el.validationMessage === 'string' && el.validationMessage) ? el.validationMessage : 'This field is required.';
			$field.append('<span class="cfb-field-error-msg" role="alert">' + $('<div>').text(msg).html() + '</span>');
			if (!firstInvalid) firstInvalid = $field[0];
		}
		if (firstInvalid) {
			firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	function clearFieldError($field) {
		$field.removeClass('cfb-field-error');
		$field.find('.cfb-field-error-msg').remove();
	}

	function onFieldInputClearError() {
		var $field = $(this).closest('.cfb-field');
		if (!$field.length) $field = $(this).closest('li');
		if ($field.length) clearFieldError($field);
	}

	/**
	 * Validate all required fields that are visible (not in .cfb-dependent-hidden).
	 * Uses data-cfb-required="1" on the row (set by server) so we don't rely on the input's required attribute.
	 * @param {jQuery} $form Form element.
	 * @param {number|null} formId Form ID for multiFileStore.
	 * @returns {boolean} True if all visible required fields are valid.
	 */
	function validateRequiredFields($form, formId) {
		$form.find('.cfb-field, li').removeClass('cfb-field-error');
		$form.find('.cfb-field-error-msg').remove();
		var firstInvalid = null;
		var requiredMessage = (typeof config.i18n !== 'undefined' && config.i18n.requiredMessage) ? config.i18n.requiredMessage : 'This field is required.';

		// Validate by row: every row with data-cfb-required="1" that is not hidden by dependency must have a value.
		$form.find('[data-cfb-required="1"]').each(function() {
			var $row = $(this);
			if ($row.closest('.cfb-dependent-hidden').length) return;
			var $field = $row.hasClass('cfb-field') || $row.is('li') ? $row : $row.closest('.cfb-field, li');
			if (!$field.length) $field = $row;

			var isEmpty = true;
			// Exclude .cfb-select-search (search box inside searchable dropdown) and readonly/calc fields
			var $inputs = $row.find('input:not([type="hidden"]):not(.cfb-calculation):not(.cfb-merge-text):not(.cfb-select-search), select, textarea');
			if ($inputs.length === 0) return;

			// For select (including searchable), use the actual <select> element, which may have class cfb-select-native-hidden
			var $select = $row.find('select').filter(function() { return this.name && this.name.indexOf('cfb[') === 0; });
			if ($select.length) {
				var val = $select.val();
				if (val !== null && val !== undefined && typeof val === 'string') val = val.trim();
				if (Array.isArray(val)) val = val.filter(function(v) { return v !== '' && v !== null && v !== undefined; });
				if ((val !== '' && val !== null && val !== undefined) && (!Array.isArray(val) || val.length > 0)) isEmpty = false;
				if (!isEmpty) { /* no error */ } else {
					$field.addClass('cfb-field-error').append('<span class="cfb-field-error-msg" role="alert">' + $('<div>').text(requiredMessage).html() + '</span>');
					if (!firstInvalid) firstInvalid = $field[0];
				}
				return;
			}

			var $firstInput = $inputs.first();
			var inputType = ($firstInput.attr('type') || '').toLowerCase();

			// Radio group: at least one radio in this row checked
			if (inputType === 'radio') {
				if ($row.find('input[type="radio"]').filter(':checked').length > 0) isEmpty = false;
			} else if (inputType === 'checkbox') {
				isEmpty = !$row.find('input[type="checkbox"]').filter(':checked').length;
			} else if ($firstInput.attr('type') === 'file') {
				var name = $firstInput.attr('name');
				if ($firstInput[0].files && $firstInput[0].files.length > 0) isEmpty = false;
				else if (formId != null && name && multiFileStore[formId] && multiFileStore[formId][name] && multiFileStore[formId][name].length > 0) isEmpty = false;
			} else {
				// text, email, tel, url, number, date, select, textarea
				var val = $firstInput.val();
				if (val !== null && val !== undefined && typeof val === 'string') val = val.trim();
				if (Array.isArray(val)) val = val.filter(function(v) { return v !== '' && v !== null && v !== undefined; });
				if ((val !== '' && val !== null && val !== undefined) && (!Array.isArray(val) || val.length > 0)) isEmpty = false;
			}

			if (isEmpty) {
				$field.addClass('cfb-field-error').append('<span class="cfb-field-error-msg" role="alert">' + $('<div>').text(requiredMessage).html() + '</span>');
				if (!firstInvalid) firstInvalid = $field[0];
			}
		});

		if (firstInvalid) {
			var $invalid = $(firstInvalid);
			var $wrapper = $form.closest('.cfb-form-stepper');
			if ($wrapper.length) {
				var $step = $invalid.closest('.cfb-step');
				if ($step.length && !$step.hasClass('cfb-step-active')) {
					var stepNum = parseInt($step.attr('data-step'), 10);
					if (!isNaN(stepNum)) {
						$form.find('.cfb-step').removeClass('cfb-step-active').attr('aria-hidden', 'true');
						$form.find('.cfb-step').each(function() {
							this.style.setProperty('display', 'none', 'important');
						});
						$step.addClass('cfb-step-active').attr('aria-hidden', 'false');
						$step[0].style.setProperty('display', 'block', 'important');
						$wrapper.find('.cfb-step-progress-item').removeClass('cfb-step-current cfb-step-done');
						$wrapper.find('.cfb-step-progress-item[data-step="' + stepNum + '"]').addClass('cfb-step-current');
						$wrapper.find('.cfb-step-progress-item').each(function() {
							var d = parseInt($(this).attr('data-step'), 10);
							if (!isNaN(d) && d < stepNum) $(this).addClass('cfb-step-done');
						});
					}
				}
			}
			firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
			return false;
		}
		return true;
	}

	/**
	 * Build FormData by iterating every visible, enabled form control and appending its value.
	 * This ensures dependent radio buttons (and other fields) are always included, instead of
	 * relying on FormData(form) which can omit them in some browsers when they were in a hidden container.
	 */
	function buildFormData($form, formId) {
		var formData = new FormData();
		var radioNamesDone = {};
		var visibleIds = {};

		$form.find('input, select, textarea').each(function() {
			var el = this;
			var $el = $(el);
			var name = el.name;
			if (!name || name.indexOf('cfb[') !== 0) return;
			if ($el.closest('.cfb-dependent-hidden').length) return;
			if (el.disabled) return;

			var match = name.match(/^cfb\[([^\]]+)\]/);
			if (match) {
				var key = match[1];
				if (key.indexOf('_from') !== -1 || key.indexOf('_to') !== -1) {
					visibleIds[key.replace(/_from$|_to$/, '')] = true;
				} else {
					visibleIds[key.replace(/\[]$/, '')] = true;
				}
			}

			var type = (el.type || '').toLowerCase();
			if (type === 'radio') {
				if (!el.checked) return;
				if (radioNamesDone[name]) return;
				radioNamesDone[name] = true;
				formData.append(name, el.value || '');
				return;
			}
			if (type === 'checkbox') {
				if (!el.checked) return;
				formData.append(name, el.value || '');
				return;
			}
			if (type === 'file') {
				var files = el.files;
				if (formId != null && multiFileStore[formId] && multiFileStore[formId][name]) {
					var store = multiFileStore[formId][name];
					for (var i = 0; i < store.length; i++) {
						formData.append(name, store[i]);
					}
				} else if (files && files.length) {
					for (var j = 0; j < files.length; j++) {
						if (files[j].name) formData.append(name, files[j]);
					}
				}
				return;
			}
			if (type === 'hidden' || type === 'submit' || type === 'button') return;
			// text, email, number, textarea, select, etc.
			var val = $el.val();
			if (val === null || val === undefined) return;
			if (Array.isArray(val)) {
				for (var k = 0; k < val.length; k++) {
					formData.append(name, val[k]);
				}
			} else {
				formData.append(name, val);
			}
		});

		formData.visibleIds = Object.keys(visibleIds);
		return formData;
	}

	function onSubmit(e) {
		e.preventDefault();
		var $form = $(this);
		var formEl = $form[0];
		if (!formEl) return;

		var formId = $form.data('form-id');

		// Validate all required fields first (including those in hidden steps; browsers often skip them in checkValidity).
		if (!validateRequiredFields($form, formId)) {
			return;
		}

		// Run HTML5 validation for other constraints (pattern, min, max, etc.)
		if (!formEl.checkValidity()) {
			showValidationErrors($form, formEl);
			return;
		}
		var $submit = $form.find('.cfb-submit');
		var $success = $form.find('.cfb-success');
		var $error = $form.find('.cfb-error');

		$success.hide().text('');
		$error.hide().text('');
		$form.find('.cfb-submit, .cfb-step-next').prop('disabled', true);

		// Ensure dependent fields (that are visible) are submittable: remove disabled from any input not inside a hidden dependent container.
		// Do NOT re-run updateDependentFields here - trust current visibility. Use removeAttr so the attribute is fully gone.
		$form.find('input:not([type="hidden"]), select, textarea').each(function() {
			var $el = $(this);
			if (!$el.closest('.cfb-dependent-hidden').length) {
				$el.prop('disabled', false);
				$el.removeAttr('disabled');
			}
		});

		var formData = buildFormData($form, formId);
		if (formData.visibleIds && formData.visibleIds.length) {
			formData.append('cfb_visible_fields', formData.visibleIds.join(','));
		}
		formData.append('action', 'cfb_submit_form');
		formData.append('form_id', formId);
		formData.append('nonce', config.nonce || '');

		$.ajax({
			url: config.ajaxUrl || '',
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false
		}).done(function(res) {
			if (res.success && res.data && res.data.message) {
				var redirectUrl = res.data.redirect_url && String(res.data.redirect_url).trim();
				if (redirectUrl) {
					window.location.href = redirectUrl;
					return;
				}
				$success.text(res.data.message).show();
				$form[0].reset();
				if (formId != null && multiFileStore[formId]) {
					for (var fn in multiFileStore[formId]) multiFileStore[formId][fn] = [];
					$form.find('input[type=file][multiple]').each(function() {
						renderMultiFileList($(this));
					});
				}
				$form.find('select.cfb-select-searchable').trigger('change');
				initDateRangeMin();
				runCalculations($form);
				updateDependentFields($form);
				runMergeText($form);
				// Reset stepper to first step if present
				var $wrap = $form.closest('.cfb-form-stepper');
				if ($wrap.length) resetStepperToFirstStep($wrap);
			} else {
				$error.text(res.data && res.data.message ? res.data.message : 'An error occurred.').show();
			}
		}).fail(function(xhr) {
			$error.text(xhr.statusText || 'Request failed.').show();
		}).always(function() {
			$form.find('.cfb-submit, .cfb-step-next').prop('disabled', false);
		});
	}

	function resetStepperToFirstStep($wrapper) {
		if (!$wrapper || !$wrapper.length) return;
		var $form = $wrapper.find('.cfb-form');
		if (!$form.length) return;
		$form.find('.cfb-step').removeClass('cfb-step-active').attr('aria-hidden', 'true');
		$form.find('.cfb-step').each(function() {
			this.style.setProperty('display', 'none', 'important');
		});
		var $first = $form.find('.cfb-step[data-step="1"]');
		$first.addClass('cfb-step-active').attr('aria-hidden', 'false');
		if ($first[0]) $first[0].style.setProperty('display', 'block', 'important');
		$wrapper.find('.cfb-step-progress-item').removeClass('cfb-step-current cfb-step-done');
		$wrapper.find('.cfb-step-progress-item[data-step="1"]').addClass('cfb-step-current');
	}

	$(function() {
		init();
		// On load/refresh always start at step 1 (undo any step switch from updateDependentFields during init)
		$('.cfb-form-stepper').each(function() {
			resetStepperToFirstStep($(this));
		});
	});
})(jQuery);
