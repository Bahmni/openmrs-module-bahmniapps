/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

$(function () {
    if (Modernizr.ios) {
        // This fix is needed when we use fastclick.js on ipad
        $(document).on("click", "label[for]", function () {
            var $inputElement = $('input#' + $(this).attr('for'));
            var elementType = $inputElement.attr('type');
            if (elementType === 'radio') {
                $inputElement.prop('checked', true);
            } else if (elementType === 'checkbox') {
                $inputElement.prop('checked', !$inputElement.prop('checked'));
            } else {
                $inputElement.focus();
            }
        });
    }
});
