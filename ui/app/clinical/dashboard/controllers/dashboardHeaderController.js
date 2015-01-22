'use strict';

angular.module('bahmni.clinical')
    .controller('DashboardHeaderController', ['$window', '$scope', '$rootScope', 'clinicalAppConfigService', 'patientContext', 'visitHistory', 'dashboardConfig',
        function ($window, $scope, $rootScope, clinicalAppConfigService, patientContext, visitHistory, dashboardConfig) {
            $scope.patient = patientContext.patient;
            $scope.visitHistory = visitHistory;
            $scope.dashboardConfig = dashboardConfig;

            $scope.consultationBoardLink = clinicalAppConfigService.getConsultationBoardLink();
            $scope.showControlPanel = false;

            $scope.openConsultationInNewTab = function () {
                $window.open('#' + $scope.consultationBoardLink, '_blank');
            };

            $scope.showDashboard = function (dashboard) {
                if (!dashboardConfig.isCurrentDashboard(dashboard)) {
                    $scope.$parent.$parent.$broadcast("event:switchDashboard", dashboard);
                }
            };

            $scope.closeDashboard = function (dashboard) {
                dashboardConfig.closeDashboard(dashboard);
                $scope.$parent.$parent.$broadcast("event:switchDashboard", dashboardConfig.getDefaultDashboard());
            };

        }]);
