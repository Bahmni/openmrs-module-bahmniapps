/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.common.uiHelper').directive('autoScroll', ['$location', '$anchorScroll', '$timeout', function ($location, $anchorScroll, $timeout) {
    var heightOfNavigationBar = 55;
    return {
        scope: {
            autoScrollEnabled: "="
        },
        link: function (scope, element, attrs) {
            $timeout(function () {
                if (scope.autoScrollEnabled) {
                    $('body').animate({
                        scrollTop: $("#" + attrs.autoScroll).offset().top - heightOfNavigationBar
                    }, 500);
                }
            });
            scope.$on('$destroy', function () {
                $timeout.cancel();
                $('body').animate({
                    scrollTop: -1 * heightOfNavigationBar
                }, 0);
            });
        }
    };
}]);
