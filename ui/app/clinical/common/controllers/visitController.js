'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', '$state', 'encounterService', 'visitService', 'spinner', '$stateParams', 'clinicalAppConfigService', 'configurations', 'visitContext', 'visitSummary','$timeout', 'printer',
        function ($scope, $state, encounterService, visitService, spinner, $stateParams, clinicalAppConfigService, configurations, visitContext, visitSummary, $timeout, printer) {
            var encounterTypeUuid = configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
            $scope.documentsPromise = encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function (response) {
                return new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
            });

            $scope.currentVisitUrl = $state.current.views.content.templateUrl;

            var setDefaultConfig = function(){
                var defaultLabResultConfig = {
                    "title": "Lab Investigations",
                    "showChart": false,
                    "showTable": true,
                    "showNormalLabResults": true,
                    "showCommentsExpanded": true,
                    "showAccessionNotes": true,
                    "numberOfVisits": 10
                };
                var defaultTreatmentConfig =  {
                    title: "Treatments",
                    showFlowSheet: true,
                    showListView: true,
                    showOtherActive: false,
                    showDetailsButton : true
                };

                $scope.investigationResultsParameters = defaultLabResultConfig;
                $scope.treatmentParameters = defaultTreatmentConfig;
                $scope.observationConfig = {};
                $scope.diagnosisConfig={};

            };

            var setFromAppConfig = function(){
                $scope.investigationResultsParameters = $scope.visitPageConfig.investigationResultParams || {};
                $scope.observationConfig = $scope.visitPageConfig.observationDisplayParams || {};
                $scope.diagnosisConfig = $scope.visitPageConfig.diagnosisDisplayParams || {};
                $scope.treatmentParameters = $scope.visitPageConfig.treatmentParams || {};
            };


            $scope.visit = visitContext; // required as this visit needs to be overridden when viewing past visits
            $scope.visitSummary = visitSummary;
            $scope.showTrends = true;

            $scope.visitPageConfig = clinicalAppConfigService.getVisitConfig().filter(function(visitPageConfig){
                return visitPageConfig.default
            })[0];
            $scope.visitPageDiagnosisTitle = "Diagnoses";

            $scope.dispositionParameters = {
                patientUuid: $scope.patient.uuid,
                visitUuid: $scope.visit.uuid,
                numOfVisits: 1
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

            $scope.$on("event:visitTabSwitch", function(event,visitTabConfig){
                $scope.visitPageConfig = visitTabConfig;
                init();
            });

            $scope.$on("event:printVisitTab", function (event,visitConfig) {
                $scope.visitPageConfig = visitConfig;
                printer.printFromScope("common/views/visitTabPrint.html",$scope);
            });

            var init = function(){
                $scope.clearBoard = true;
                $timeout(function(){
                    $scope.clearBoard = false;
                });

                if($scope.visitPageConfig.default){
                    setDefaultConfig();
                }else{
                    setFromAppConfig();
                }

                $scope.investigationResultsParameters.patientUuid = $scope.patient.uuid;
                $scope.investigationResultsParameters.visitUuids = [$scope.visit.uuid];

                $scope.treatmentParameters.patientUuid = $scope.patient.uuid;
                $scope.treatmentParameters.visitUuids = [$scope.visit.uuid];

                $scope.pivotTableConfigs = clinicalAppConfigService.getVisitPageConfig("pivotTable") || [];

                $scope.hide = {};
                if(!_.isEmpty($scope.visitPageConfig.hideSections)) {
                    $scope.visitPageConfig.hideSections.forEach(function(section){
                        $scope.hide[section] = true && $scope.visitPageConfig.default !== true ;
                    })
                }

            };
            init();
        }]);
