'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardController', ['$rootScope', '$scope', 'clinicalAppConfigService', 'diseaseTemplateService', 'clinicalDashboardConfig', 'printer', '$state', 'spinner', 'visitSummary',
        function ($rootScope, $scope, clinicalAppConfigService, diseaseTemplateService, clinicalDashboardConfig, printer, $state, spinner, visitSummary) {

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
                return diseaseTemplateService.getLatestDiseaseTemplates($scope.patient.uuid, clinicalDashboardConfig.getDiseaseTemplateSections())
                    .then(function (diseaseTemplates) {
                        $scope.diseaseTemplates = diseaseTemplates;
                        $scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create(dashboard || {});
                        $scope.sectionGroups = $scope.dashboard.getSections($scope.diseaseTemplates);
                        $scope.currentDashboardTemplateUrl = $state.current.views['dashboard-content'] ? $state.current.views['dashboard-content'].templateUrl : $state.current.views['dashboard-content'];
                        $scope.dashboardState.stale = false;
                    });
            };

            $rootScope.$on('$stateChangeStart',
                function (event, toState, toParams, fromState, fromParams) {
                    if ((toState.name === 'patient.dashboard.show') && $scope.dashboardState.stale) {
                        //Reload the dashboard
                        spinner.forPromise($scope.init(clinicalDashboardConfig.currentTab));
                    }
                }
            );

            spinner.forPromise($scope.init(clinicalDashboardConfig.currentTab));
        }]);
