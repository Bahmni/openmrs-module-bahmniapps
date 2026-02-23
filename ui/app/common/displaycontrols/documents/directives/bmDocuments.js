/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.common.displaycontrol.documents')
    .directive('bmDocuments', ['encounterService', 'spinner', 'configurations', function (encounterService, spinner, configurations) {
        var controller = function ($scope, $filter) {
            var encounterTypeUuid = configurations.encounterConfig().getEncounterTypeUuid($scope.encounterType);

            $scope.initialization = function () {
                return encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function (response) {
                    $scope.records = new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
                    if ($scope.config.visitUuids) {
                        $scope.records = _.filter($scope.records, function (record) {
                            return $scope.config.visitUuids.indexOf(record.visitUuid) != -1;
                        });
                    }
                    $scope.recordGroups = new Bahmni.Clinical.RecordsMapper().map($scope.records);
                    $scope.isDataPresent = function () {
                        if ($scope.recordGroups.length == 0) {
                            $scope.$emit("no-data-present-event");
                            return false;
                        }
                        return true;
                    };
                });
            };

            $scope.shouldShowActiveVisitStar = function (records) {
                if ($scope.config.visitUuids && $scope.config.visitUuids.length === 1) {
                    return false;
                }

                return _.some(records, function (record) {
                    return !record.visitStopDate;
                });
            };
        };

        var link = function ($scope, element) {
            spinner.forPromise($scope.initialization(), element);
        };

        return {
            restrict: 'E',
            controller: controller,
            scope: {
                patient: "=",
                config: "=",
                encounterType: "="
            },
            link: link,
            templateUrl: "../common/displaycontrols/documents/views/bmDocuments.html"
        };
    }]);
