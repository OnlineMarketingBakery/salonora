/**
 * Entries list: View modal and Delete link.
 */
(function($) {
	'use strict';

	var $modal = $('#cfb-entry-modal');
	var $inner = $modal.find('.cfb-modal-inner');
	var $loading = $modal.find('.cfb-modal-loading');

	function openModal() {
		$modal.show().attr('aria-hidden', 'false');
		$loading.show();
		$inner.hide().empty();
	}

	function closeModal() {
		$modal.hide().attr('aria-hidden', 'true');
	}

	function setContent(html) {
		$loading.hide();
		$inner.html(html).show();
	}

	function setError(msg) {
		$loading.hide();
		$inner.html('<p class="cfb-modal-error">' + (msg || (typeof cfbEntries !== 'undefined' && cfbEntries.i18n ? cfbEntries.i18n.error : 'Could not load entry.')) + '</p>').show();
	}

	$(function() {
		if (!$modal.length) return;

		$(document).on('click', '.cfb-view-entry', function(e) {
			e.preventDefault();
			var entryId = $(this).data('entry-id');
			if (!entryId) return;
			if (typeof cfbEntries === 'undefined' || !cfbEntries.ajaxUrl || !cfbEntries.nonce) {
				setError('Configuration missing.');
				openModal();
				return;
			}
			openModal();
			$.post(cfbEntries.ajaxUrl, {
				action: 'cfb_get_entry_modal',
				entry_id: entryId,
				nonce: cfbEntries.nonce
			})
				.done(function(res) {
					if (res && res.success && res.data && res.data.html) {
						setContent(res.data.html);
					} else {
						setError(res && res.data && res.data.message ? res.data.message : null);
					}
				})
				.fail(function() {
					setError();
				});
		});

		$modal.find('.cfb-modal-close, .cfb-modal-overlay').on('click', function() {
			closeModal();
		});

		$(document).on('keydown', function(e) {
			if (e.key === 'Escape' && $modal.is(':visible')) {
				closeModal();
			}
		});
	});
})(jQuery);
