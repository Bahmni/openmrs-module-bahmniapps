var $body = jQuery('body');

$(document)
    .on('focus', 'input, textarea, select', function(e) {
        $body.addClass('fix-fixed');
    })
    .on('blur', 'input, textarea, select', function(e) {
        $body.removeClass('fix-fixed');
});
