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
    .directive('singleSubmit', function () {
        var ignoreSubmit = false;
        var link = function (scope, element) {
            var submitHandler = function () {
                if (ignoreSubmit) {
                    return;
                }
                ignoreSubmit = true;
                scope.singleSubmit().finally(function () {
                    ignoreSubmit = false;
                });
            };

            element.on('submit', submitHandler);

            scope.$on("$destroy", function () {
                element.off('submit', submitHandler);
            });
        };
        return {
            scope: {
                singleSubmit: '&'
            },
            restrict: 'A',
            link: link
        };
    });
