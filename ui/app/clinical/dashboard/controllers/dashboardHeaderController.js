'use strict';

angular.module('bahmni.clinical')
    .controller('DashboardHeaderController', ['$window', '$scope', 'clinicalAppConfigService', 'patientContext', 'visitHistory', 'clinicalDashboardConfig',
        function ($window, $scope, clinicalAppConfigService, patientContext, visitHistory, clinicalDashboardConfig) {

            $scope.patient = patientContext.patient;
            $scope.visitHistory = visitHistory;

            $scope.consultationBoardLink = clinicalAppConfigService.getConsultationBoardLink();
            $scope.showControlPanel = false;
            $scope.clinicalDashboardConfig = clinicalDashboardConfig;

            $scope.openConsultationInNewTab = function () {
                $window.open('#' + $scope.consultationBoardLink, '_blank');
            };

            $scope.showDashboard = function (dashboard) {
                if (!clinicalDashboardConfig.isCurrentDashboard(dashboard)) {
                    $scope.$parent.$parent.$broadcast("event:switchDashboard", dashboard);
                }
            };

            $scope.printDashboard = function () {
                $scope.$parent.$parent.$broadcast("event:printDashboard", clinicalDashboardConfig.getCurrentDashboard().printing);
            };

            $scope.closeDashboard = function (dashboard) {
                clinicalDashboardConfig.closeDashboard(dashboard);
                $scope.$parent.$parent.$broadcast("event:switchDashboard", clinicalDashboardConfig.getCurrentDashboard());
            };

        }]);
