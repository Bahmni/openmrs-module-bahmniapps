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
    .directive('bmShow', ['$rootScope', function ($rootScope) {
        var link = function ($scope, element) {
            $scope.$watch('bmShow', function () {
                if ($rootScope.isBeingPrinted || $scope.bmShow) {
                    element.removeClass('ng-hide');
                } else {
                    element.addClass('ng-hide');
                }
            });
        };

        return {
            scope: {
                bmShow: "="
            },
            link: link
        };
    }]);
