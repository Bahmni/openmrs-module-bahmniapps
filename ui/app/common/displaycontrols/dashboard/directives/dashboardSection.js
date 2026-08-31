/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.common.displaycontrol.dashboard')

    .directive('dashboardSection', function () {
        var controller = function ($scope, $rootScope) {
            $scope.$on("no-data-present-event", function () {
                $scope.section.isDataAvailable = !$scope.section.hideEmptyDisplayControl;
            });
            if ($scope.section.type === "ordersV2") {
                const orderType = $rootScope.orderTypeData.filter(function (item) {
                    return item.display === $scope.section.name;
                });
                $scope.ordersData = Object.assign({}, $scope.ordersData || {}, $scope.section);
                if (orderType.length > 0) {
                    $scope.ordersData.orderType = orderType[0];
                }
            }
        };
        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "../common/displaycontrols/dashboard/views/dashboardSection.html"
        };
    });
