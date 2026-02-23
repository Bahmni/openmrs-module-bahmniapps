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
    .directive('toggle', function () {
        var link = function ($scope, element) {
            $scope.toggle = $scope.toggle === undefined ? false : $scope.toggle;
            $(element).click(function () {
                $scope.$apply(function () {
                    $scope.toggle = !$scope.toggle;
                });
            });

            $scope.$watch('toggle', function () {
                $(element).toggleClass('active', $scope.toggle);
            });

            $scope.$on("$destroy", function () {
                element.off('click');
            });
        };

        return {
            scope: {
                toggle: "="
            },
            link: link
        };
    });
