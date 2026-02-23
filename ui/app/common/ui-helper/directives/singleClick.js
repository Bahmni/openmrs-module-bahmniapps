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
    .directive('singleClick', function () {
        var ignoreClick = false;
        var link = function (scope, element) {
            var clickHandler = function () {
                if (ignoreClick) {
                    return;
                }
                ignoreClick = true;
                scope.singleClick().finally(function () {
                    ignoreClick = false;
                });
            };

            element.on('click', clickHandler);

            scope.$on("$destroy", function () {
                element.off('click', clickHandler);
            });
        };
        return {
            scope: {
                singleClick: '&'
            },
            restrict: 'A',
            link: link
        };
    });
