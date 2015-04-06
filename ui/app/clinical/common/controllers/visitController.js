'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', '$state', 'encounterService', 'clinicalAppConfigService', 'configurations', 'visitSummary','$timeout', 'printer','visitTabConfig', 'visitHistory', '$stateParams',
        function ($scope, $state, encounterService, clinicalAppConfigService, configurations, visitSummary, $timeout, printer, visitTabConfig, visitHistory, $stateParams) {
            var encounterTypeUuid = configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
            $scope.documentsPromise = encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function (response) {
                return new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
            });

            $scope.currentVisitUrl = $state.current.views.content.templateUrl;
            $scope.visitHistory = visitHistory; // required as this visit needs to be overridden when viewing past visits
            $scope.visitSummary = visitSummary;
            $scope.visitTabConfig = visitTabConfig;
            $scope.showTrends = true;
            $scope.patientUuid = $stateParams.patientUuid;
            $scope.visitUuid = $stateParams.visitUuid;

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

            $scope.$on("event:printVisitTab", function (event) {
                printer.printFromScope("common/views/visitTabPrint.html",$scope);
            });

            $scope.$on("event:clearVisitBoard", function (event, tab) {
                $scope.clearBoard = true;
                $timeout(function(){
                    $scope.clearBoard = false;
                });
            });

            $scope.loadVisit = function (visitUuid) {
                $state.go('patient.visit', {visitUuid: visitUuid});
            };
            
            var init = function(){
                $scope.visitTabConfig.setVisitUuidsAndPatientUuidToTheSections([$scope.visitUuid], $scope.patientUuid);
                $scope.visitTabConfig.switchTab($scope.visitTabConfig.getDefaultTab());
            };
            init();
        }]);
