'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', '$state', 'encounterService', 'clinicalAppConfigService', 'configurations', 'visitContext', 'visitSummary','$timeout', 'printer','visitTabConfig', 'visitHistory',
        function ($scope, $state, encounterService, clinicalAppConfigService, configurations, visitContext, visitSummary, $timeout, printer, visitTabConfig, visitHistory) {
            var encounterTypeUuid = configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
            $scope.documentsPromise = encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function (response) {
                return new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
            });

            $scope.currentVisitUrl = $state.current.views.content.templateUrl;
            $scope.visit = visitContext; // required as this visit needs to be overridden when viewing past visits
            $scope.visitHistory = visitHistory; // required as this visit needs to be overridden when viewing past visits
            $scope.visitSummary = visitSummary;
            $scope.visitTabConfig = visitTabConfig;
            $scope.showTrends = true;



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

            $scope.loadVisit = function (visitUuid) {
                $state.go('patient.visit', {visitUuid: visitUuid});
            };
            
            var init = function(){
                $scope.visitTabConfig.setVisitUuidsAndPatientUuidToTheSections([$scope.visit.uuid], $scope.patient.uuid);
                $scope.visitTabConfig.switchTab($scope.visitTabConfig.getDefaultTab());
            };
            init();
        }]);
