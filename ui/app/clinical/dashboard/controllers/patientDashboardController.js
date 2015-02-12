'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardController', ['$scope', '$location',
        'encounterService', 'clinicalAppConfigService', 'diseaseTemplateService', 'dashboardConfig','printer','$state','spinner',
        function ($scope, $location, encounterService, clinicalAppConfigService, diseaseTemplateService, dashboardConfig,printer,$state,spinner) {

            $scope.activeVisit = $scope.visitHistory.activeVisit;
            $scope.patientSummary = {};
            $scope.activeVisitData = {};
            $scope.obsIgnoreList = clinicalAppConfigService.getObsIgnoreList();
            $scope.dashboardConfig = dashboardConfig;

            $scope.filterOdd = function (index) {
                return function () {
                    return index++ % 2 === 0;
                };
            };

            $scope.filterEven = function (index) {
                return function () {
                    return index++ % 2 === 1;
                };
            };

            $scope.$on("event:switchDashboard", function (event, dashboard) {
                $scope.init(dashboard);
            });

            $scope.$on("event:printDashboard", function (event) {
                printer.printFromScope("dashboard/views/dashboardPrint.html",$scope);
            });

            $scope.init = function (dashboard) {
                dashboardConfig.switchDashboard(dashboard);
                return diseaseTemplateService.getLatestDiseaseTemplates($scope.patient.uuid, dashboardConfig.getDiseaseTemplateSections())
                    .then(function (diseaseTemplates) {
                        $scope.diseaseTemplates = diseaseTemplates;
                        $scope.patientDashboardSections = dashboardConfig.getDashboardSections(diseaseTemplates);
                        $scope.currentDashboardTemplateUrl = $state.current.views.content.templateUrl;
                    });
            };

            spinner.forPromise($scope.init(dashboardConfig.getDefaultDashboard()));
        }]);
