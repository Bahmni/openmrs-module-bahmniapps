/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.clinical')
    .directive('investigationChart', function () {
        var controller = function ($scope) {
            var defaultParams = {
                noLabOrdersMessage: "No Lab Orders for this patient."
            };

            $scope.params = angular.extend(defaultParams, $scope.params);

            $scope.showChart = false;

            $scope.toggleChart = function () {
                $scope.showChart = !$scope.showChart;
            };

            $scope.getUploadedFileUrl = function (uploadedFileName) {
                return Bahmni.Common.Constants.labResultUploadedFileNameUrl + uploadedFileName;
            };
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                accessions: "=",
                params: "="
            },
            templateUrl: "displaycontrols/investigationresults/views/investigationChart.html"
        };
    });
