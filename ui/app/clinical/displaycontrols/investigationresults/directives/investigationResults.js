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
    .directive('investigationResults', ['labOrderResultService', 'spinner', function (labOrderResultService, spinner) {
        var controller = function ($scope) {
            var defaultParams = {
                showTable: true,
                showChart: true,
                numberOfVisits: 1,
                chartConfig: {}
            };
            $scope.params = angular.extend(defaultParams, $scope.params);

            var params = {
                patientUuid: $scope.params.patientUuid,
                numberOfVisits: $scope.params.numberOfVisits,
                visitUuids: $scope.params.visitUuids,
                initialAccessionCount: $scope.params.initialAccessionCount,
                latestAccessionCount: $scope.params.latestAccessionCount,
                sortResultColumnsLatestFirst: $scope.params.chartConfig.sortResultColumnsLatestFirst,
                groupOrdersByPanel: $scope.params.chartConfig.groupByPanel
            };
            $scope.initialization = labOrderResultService.getAllForPatient(params)
                .then(function (results) {
                    $scope.investigationResults = results;
                });
        };

        var link = function ($scope, element) {
            spinner.forPromise($scope.initialization, element);
        };

        return {
            restrict: 'E',
            controller: controller,
            link: link,
            templateUrl: "displaycontrols/investigationresults/views/investigationResults.html",
            scope: {
                params: "="
            }
        };
    }]);
