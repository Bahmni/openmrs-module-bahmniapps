'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', 'encounterService', 'visitService', 'spinner', '$stateParams', '$rootScope', 'clinicalAppConfigService', 'configurations',
        function ($scope, encounterService, visitService, spinner, $stateParams, $rootScope, clinicalAppConfigService, configurations) {

            var encounterTypeUuid = configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
            $scope.documentsPromise = encounterService.getEncountersForEncounterType($rootScope.patient.uuid, encounterTypeUuid).then(function(response) {
                return new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
            });

            $scope.patientUuid = $stateParams.patientUuid;
            $scope.showTrends = true;
            $scope.visit = $rootScope.visit;

            $scope.investigationResultsParameters = clinicalAppConfigService
                .getVisitPageConfig()
                .investigationResultParams || {};
            $scope.investigationResultsParameters.patientUuid = $scope.patientUuid;
            $scope.investigationResultsParameters.visitUuids = [$stateParams.visitUuid];

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

            $scope.getVisitDate = function(){
                return $rootScope.visits.filter(function (visit) {
                    return visit.uuid === $rootScope.visit.uuid;
                })[0].startDatetime;
            };

            $scope.displayDate = function(date) {
                return moment(date).format("DD-MMM-YY");
            };
        }]);
