var $body = jQuery('body');

$(document)
    .on('focus', 'input[type="text"], input[type="number"], textarea, select', function(e) {
        $body.addClass('fix-fixed');
    })
    .on('blur', 'input[type="text"], input[type="number"], textarea, select', function(e) {
        $body.removeClass('fix-fixed');
});
