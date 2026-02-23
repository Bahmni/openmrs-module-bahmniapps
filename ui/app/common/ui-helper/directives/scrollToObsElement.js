/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('scrollToObsElement', function () {
        return function (scope, elem, attrs) {
            if (attrs.scrollToObsElement && scope.observation.scrollToElement) {
                $(elem).focus();
                var scrollPosition = $(elem).offset().top - window.innerHeight / 2;
                if ($('#scrollOnEdit')[0]) {
                    var container = $('#scrollOnEdit');
                    var scrollTo = elem;
                    scrollPosition = scrollTo.offset().top + container.scrollTop() - (container.offset().top + container.offset().top / 2);
                    container.animate({scrollTop: scrollPosition}, 900);
                } else {
                    $(window).animate({scrollTop: scrollPosition}, 900);
                }
                scope.observation.scrollToElement = false;
            }
        };
    });
