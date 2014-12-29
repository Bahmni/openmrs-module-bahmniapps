var $body = jQuery('body');

$(document)
    .on('focus', 'input[type="text"], input[type="number"], textarea, select, .form-field button', function(e) {
        $body.addClass('fix-fixed');
    })
    .on('blur', 'input[type="text"], input[type="number"], textarea, select, .form-field button', function(e) {
        $body.removeClass('fix-fixed');
	})
	.on('focus', 'textarea', function(e) {
		$(this).css("height", "75px");
	})
	.on('blur', 'textarea', function(e) {
		if ($(this).val()) {
		    $(this).css("height", "75px");
		} else {
			$(this).css("height", "25px");
		}
	});
