'use strict';

angular.module('bahmni.common.displaycontrol.documents')
    .directive('bmDocuments', ['encounterService', 'spinner', 'configurations', function (encounterService, spinner, configurations) {
        var controller = function ($scope, $filter) {
            var encounterTypeUuid = configurations.encounterConfig().getEncounterTypeUuid($scope.encounterType);
            var id;
            if ($scope.config.id) {
                id = "#" + $scope.config.id;
            } else {
                var key = $scope.config.translationKey || $scope.config.title;
                id = '#' + $filter('titleTranslate')(key).toValidId();
            }
            spinner.forPromise(encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function (response) {
                $scope.records = new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
                if ($scope.config.visitUuids) {
                    $scope.records = _.filter($scope.records, function(record) {
                        return $scope.config.visitUuids.indexOf(record.visitUuid) != -1;
                    });
                }
                $scope.recordGroups = new Bahmni.Clinical.RecordsMapper().map($scope.records);

            }),id);

            $scope.shouldShowActiveVisitStar = function (records) {
                if ($scope.config.visitUuids && $scope.config.visitUuids.length === 1) {
                    return false;
                }

                return _.some(records, function (record) {
                    return !record.visitStopDate;
                });
            };
        };

        return {
            restrict: 'E',
            controller: controller,
            scope: {
                patient: "=",
                config: "=",
                encounterType: "="
            },
            templateUrl: "../common/displaycontrols/documents/views/bmDocuments.html"
        };
    }]);
