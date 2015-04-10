'use strict';

angular.module('bahmni.common.displaycontrol.radiology')
    .directive('bmRadiologyDocuments', ['encounterService', 'spinner', 'configurations', function (encounterService, spinner, configurations) {
        var controller = function ($scope) {
            var encounterTypeUuid = configurations.encounterConfig().getRadiologyEncounterTypeUuid();

            spinner.forPromise(encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function (response) {
                $scope.radiologyRecords = new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
                if ($scope.config.visitUuids) {
                    $scope.radiologyRecords = _.filter($scope.radiologyRecords, function(record) {
                        return $scope.config.visitUuids.indexOf(record.visitUuid) != -1;
                    });
                }
                $scope.radiologyRecordGroups = new Bahmni.Clinical.RadiologyRecordsMapper().map($scope.radiologyRecords);

            }));

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
                config: "="
            },
            templateUrl: "../common/displaycontrols/radiology-documents/views/bmRadiologyDocuments.html"
        };
    }]);
