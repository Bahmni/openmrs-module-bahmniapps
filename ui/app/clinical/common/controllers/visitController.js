'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', '$state', 'encounterService', 'visitService', 'spinner', '$stateParams', 'clinicalAppConfigService', 'configurations', 'visitContext', 'visitSummary','$timeout', 'printer',
        function ($scope, $state, encounterService, visitService, spinner, $stateParams, clinicalAppConfigService, configurations, visitContext, visitSummary, $timeout, printer) {
            var encounterTypeUuid = configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
            $scope.documentsPromise = encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function (response) {
                return new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
            });

            $scope.currentVisitUrl = $state.current.views.content.templateUrl;

            var setAppConfig = function(isDefault){
                var defaultConfig=Bahmni.Clinical.VisitPageDefaultConfig;
                defaultConfig.pivotTable = clinicalAppConfigService.getVisitConfig().filter(function(visitPageConfig){
                    return visitPageConfig.default
                })[0].pivotTable;

                var getConfigFor = function(sectionName){
                    var config = (isDefault || _.isEmpty($scope.visitPageConfig[sectionName])) ? defaultConfig[sectionName] : $scope.visitPageConfig[sectionName];
                    config.patientUuid = $scope.patient.uuid;
                    config.visitUuids = [$scope.visit.uuid]
                    return config;
                };

                $scope.investigationResultsParameters = getConfigFor("investigationResult");
                $scope.observationConfig = getConfigFor("observationDisplay");
                $scope.diagnosisConfig = getConfigFor("diagnosis");
                $scope.treatmentParameters = getConfigFor("treatment");
                $scope.dispositionParameters = getConfigFor("disposition");
                $scope.pivotTableConfigs = $scope.visitPageConfig["pivotTable"] || [];
            };

            $scope.visit = visitContext; // required as this visit needs to be overridden when viewing past visits
            $scope.visitSummary = visitSummary;
            $scope.showTrends = true;

            $scope.visitPageConfig = Bahmni.Clinical.VisitPageDefaultConfig;

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
                setAppConfig($scope.visitPageConfig.default);
                $scope.hide = {};
                if(!_.isEmpty($scope.visitPageConfig.hideSections)) {
                    $scope.visitPageConfig.hideSections.forEach(function(section){
                        $scope.hide[section] = $scope.visitPageConfig.default !== true ;
                    })
                }
            };
            init();
        }]);

Bahmni.Clinical.VisitPageDefaultConfig ={
    title:"visit",
    investigationResult: {
        title: "Lab Investigations",
        showChart: false,
        showTable: true,
        showNormalLabResults: true,
        showCommentsExpanded: true,
        showAccessionNotes: true,
        numberOfVisits: 10
    },
    treatment: {
        title: "Treatments",
        showFlowSheet: true,
        showListView: true,
        showOtherActive: false,
        showDetailsButton : true
    },
    disposition :{
        numOfVisits: 1
    },
    observationDisplay:{},
    diagnosis :{},
    pivotTable:{}
};
