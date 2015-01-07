'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', 'encounterService', 'visitService', 'spinner', '$stateParams', 'clinicalAppConfigService', 'configurations', 'patientContext', 'visitContext',
        function ($scope, encounterService, visitService, spinner, $stateParams, clinicalAppConfigService, configurations, patientContext, visitContext) {
            var encounterTypeUuid = configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
            $scope.documentsPromise = encounterService.getEncountersForEncounterType(patientContext.patient.uuid, encounterTypeUuid).then(function (response) {
                return new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
            });

            $scope.patient = patientContext.patient;
            $scope.visit = visitContext;
            $scope.showTrends = true;

            $scope.investigationResultsParameters = clinicalAppConfigService.getVisitPageConfig().investigationResultParams || {};
            $scope.investigationResultsParameters.patientUuid = $scope.patient.uuid;
            $scope.investigationResultsParameters.visitUuids = [$scope.visit.uuid];

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
        }]);
