'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', '$state', 'encounterService', 'clinicalAppConfigService', 'configurations', 'visitContext', 'visitSummary','$timeout', 'printer',
        function ($scope, $state, encounterService, clinicalAppConfigService, configurations, visitContext, visitSummary, $timeout, printer) {
            var encounterTypeUuid = configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
            $scope.documentsPromise = encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function (response) {
                return new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
            });

            $scope.currentVisitUrl = $state.current.views.content.templateUrl;
            $scope.visit = visitContext; // required as this visit needs to be overridden when viewing past visits
            $scope.visitSummary = visitSummary;
            $scope.showTrends = true;
            $scope.visitPageConfig = Bahmni.Clinical.VisitPageDefaultConfig;

            $scope.setAppConfig = function(visitConfig){
                var defaultConfig=Bahmni.Clinical.VisitPageDefaultConfig;
                var config = clinicalAppConfigService.getVisitConfig().filter(function(visitPageConfig){
                    return visitPageConfig.default
                })[0]||{};
                defaultConfig.pivotTable = config.pivotTable?config.pivotTable:[];

                $scope.visitPageConfig = visitConfig.default? defaultConfig : angular.extend({},defaultConfig,visitConfig);
                for(var configName in $scope.visitPageConfig){
                    if(_.isPlainObject($scope.visitPageConfig[configName])){
                        $scope.visitPageConfig[configName].visitUuids = [$scope.visit.uuid];
                        $scope.visitPageConfig[configName].patientUuid = $scope.patient.uuid;
                    }
                }
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
                init(visitTabConfig);
            });

            $scope.$on("event:printVisitTab", function (event) {
                printer.printFromScope("common/views/visitTabPrint.html",$scope);
            });

            var init = function(visitConfig){
                $scope.clearBoard = true;
                $timeout(function(){
                    $scope.clearBoard = false;
                });
                $scope.setAppConfig(visitConfig);
                $scope.hide = {};
                if(!_.isEmpty($scope.visitPageConfig.hideSections)) {
                    $scope.visitPageConfig.hideSections.forEach(function(section){
                        $scope.hide[section] = $scope.visitPageConfig.default !== true ;
                    })
                }
            };
            init(Bahmni.Clinical.VisitPageDefaultConfig);
        }]);

Bahmni.Clinical.VisitPageDefaultConfig ={
    title:"visit",
    default:true,
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
        showDetailsButton : true,
        showRoute: true,
        showDrugForm: true
    },
    disposition :{
        numOfVisits: 1
    },
    observationDisplay:{},
    diagnosis :{
        title: "Diagnoses"
    },
    pivotTable:[]
};
