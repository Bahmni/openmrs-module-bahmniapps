'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', 'encounterService', 'visitService', 'spinner', '$stateParams', 'clinicalAppConfigService', 'configurations', 'visitContext', 'visitSummary',
        function ($scope, encounterService, visitService, spinner, $stateParams, clinicalAppConfigService, configurations, visitContext, visitSummary) {
            var encounterTypeUuid = configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
            $scope.documentsPromise = encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function (response) {
                return new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
            });

            $scope.visit = visitContext; // required as this visit needs to be overridden when viewing past visits
            $scope.visitSummary = visitSummary;
            $scope.showTrends = true;

            var visitPageConfig = clinicalAppConfigService.getVisitPageConfig();
            $scope.visitPageDiagnosisTitle = "Diagnoses";

            $scope.investigationResultsParameters = visitPageConfig.investigationResultParams || {};
            $scope.investigationResultsParameters.patientUuid = $scope.patient.uuid;
            $scope.investigationResultsParameters.visitUuids = [$scope.visit.uuid];

            $scope.treatmentParameters = {
                title: "Treatments",
                patientUuid: $scope.patient.uuid,
                visitUuids: [$scope.visit.uuid],
                showFlowSheet: true,
                showListView: true,
                showOtherActive: false,
                showDetailsButton : true
            };

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

            $scope.observationConfig = clinicalAppConfigService.getVisitPageConfig("observationDisplayParams") || {};
        }]);
