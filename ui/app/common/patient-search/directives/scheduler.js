/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.common.patientSearch')
    .directive('scheduler', ['$interval', function ($interval) {
        var link = function ($scope) {
            var promise;

            var cancelSchedule = function () {
                if (promise) {
                    $interval.cancel(promise);
                    promise = null;
                }
            };

            var startSchedule = function () {
                if (!promise) {
                    promise = $interval($scope.triggerFunction, $scope.refreshTime * 1000);
                }
            };

            $scope.$watch(function () { return $scope.watchOn; }, function (value) {
                if ($scope.refreshTime > 0) {
                    if (value) {
                        cancelSchedule();
                    } else {
                        startSchedule();
                    }
                }
            });

            $scope.triggerFunction();

            $scope.$on('$destroy', function () {
                cancelSchedule();
            });
        };

        return {
            restrict: 'A',
            link: link,
            scope: {
                refreshTime: "=",
                watchOn: "=",
                triggerFunction: "&"
            }
        };
    }]);
