/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module("bahmni.ot")
    .directive("onScroll", [function () {
        var link = function ($scope, $element, attrs) {
            $element.bind('scroll', function (evt) {
                // Please dont remove or alter the below class name
                $('.calendar-location').css("top", $element.scrollTop());
                $('.calendar-time-container').css("left", $element.scrollLeft());
            });
        };
        return {
            restrict: "A",
            link: link
        };
    }]);
