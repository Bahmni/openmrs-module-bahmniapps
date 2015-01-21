'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', 'encounterService', 'visitService', 'spinner', '$stateParams', 'clinicalAppConfigService', 'configurations', 'visitContext',
        function ($scope, encounterService, visitService, spinner, $stateParams, clinicalAppConfigService, configurations, visitContext) {
            var encounterTypeUuid = configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
            $scope.documentsPromise = encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function (response) {
                return new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
            });

            $scope.visit = visitContext; // required as this visit needs to be overridden when viewing past visits
            $scope.showTrends = true;

            var visitPageConfig = clinicalAppConfigService.getVisitPageConfig();

            $scope.investigationResultsParameters = visitPageConfig.investigationResultParams || {};
            $scope.investigationResultsParameters.patientUuid = $scope.patient.uuid;
            $scope.investigationResultsParameters.visitUuids = [$scope.visit.uuid];

            var defaultTreatmentParams = {
                patientUuid: $scope.patient.uuid,
                visitUuids: [$scope.visit.uuid],
                showFlowSheet: true
            };
            $scope.treatmentParameters = angular.extend(defaultTreatmentParams, visitPageConfig.treatmentParams);
            $scope.treatmentParameters.showOtherActive = false;

            $scope.isNumeric = function (value) {
                return $.isNumeric(value);
            };

            $scope.toggle = function (item) {
                item.show = !item.show
            };
            $scope.isEmpty = function (notes) {
                if (notes) {
                    return notes.trim().length < 2;
                }
                return true;
            };

            $scope.testResultClass = function (line) {
                var style = {};
                if ($scope.pendingResults(line)) {
                    style["pending-result"] = true;
                }
                if (line.isSummary) {
                    style["header"] = true;
                }
                return style;
            };
            $scope.pendingResults = function (line) {
                return line.isSummary && !line.hasResults && line.name !== "";
            };

            $scope.displayDate = function (date) {
                return moment(date).format("DD-MMM-YY");
            };

            $scope.observationConfig = clinicalAppConfigService.getVisitPageConfig("observationDisplayParams")
        }]);
