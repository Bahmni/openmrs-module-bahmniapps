/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('latestObs', function () {
        var controller = function ($scope, observationsService, $q, spinner) {
            var init = function () {
                spinner.forPromise(observationsService.fetch($scope.patientUuid, $scope.conceptNames, "latest").then(function (response) {
                    var observations = new Bahmni.Common.Obs.ObservationMapper().map(response.data, []);
                    $scope.observations = _.sortBy(observations, 'sortWeight');
                }));
            };
            init();
        };

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: '../common/concept-set/views/latestObs.html',
            scope: {
                patientUuid: "=",
                conceptNames: "="
            }
        };
    });
