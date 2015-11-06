'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardController', ['$rootScope', '$scope', 'clinicalAppConfigService', 'clinicalDashboardConfig', 'printer', '$state', 'spinner', 'visitSummary', 'latestDiseaseTemplates',
        function ($rootScope, $scope, clinicalAppConfigService, clinicalDashboardConfig, printer, $state, spinner, visitSummary, latestDiseaseTemplates) {

            $scope.activeVisit = $scope.visitHistory.activeVisit;
            $scope.activeVisitData = {};
            $scope.obsIgnoreList = clinicalAppConfigService.getObsIgnoreList();
            $scope.clinicalDashboardConfig = clinicalDashboardConfig;
            $scope.visitSummary = visitSummary;

            $scope.stateChange = function () {
                return $state.current.name === 'patient.dashboard.show'
            };

            $scope.$on("event:switchDashboard", function (event, dashboard) {
                $scope.init(dashboard);
            });

            $scope.$on("event:printDashboard", function (event) {
                printer.printFromScope("dashboard/views/dashboardPrint.html", $scope);
            });

            $scope.init = function (dashboard) {
                clinicalDashboardConfig.switchTab(dashboard);
                $scope.diseaseTemplates = latestDiseaseTemplates;
                $scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create(dashboard || {});
                $scope.sectionGroups = $scope.dashboard.getSections($scope.diseaseTemplates);
                $scope.currentDashboardTemplateUrl = $state.current.views['dashboard-content'] ? $state.current.views['dashboard-content'].templateUrl : $state.current.views['dashboard-content'];
            };

            $scope.init(clinicalDashboardConfig.currentTab);
        }]);
