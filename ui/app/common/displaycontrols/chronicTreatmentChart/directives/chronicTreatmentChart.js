'use strict';

angular.module('bahmni.common.displaycontrol.chronicTreatmentChart').directive('chronicTreatmentChart', [
    function () {
        var controller = function ($scope, spinner, $stateParams, DrugService, appService) {
            $scope.config = $scope.isOnDashboard ? $scope.section.dashboardParams : $scope.section.allDetailsParams;
            var patient = $scope.patient;

            var init = function () {
                var programConfig = appService.getAppDescriptor().getConfigValue("program") || {};
                var startDate = null, endDate = null, getOtherActive;
                if (programConfig.showDashBoardWithinDateRange) {
                    startDate = $stateParams.dateEnrolled;
                    endDate = $stateParams.dateCompleted;
                }

                return DrugService.getRegimen(patient.uuid, $scope.config.drugs, startDate, endDate).success(function (data) {
                    $scope.regimen = data;
                });
            };

            $scope.isMonthNumberRequired = function(){
                var month = $scope.regimen && $scope.regimen.rows && $scope.regimen.rows[0] && $scope.regimen.rows[0].month;
                return month;
            };

            $scope.isClickable = function () {
                return $scope.isOnDashboard && $scope.section.allDetailsParams;
            };

            $scope.dialogData = {
                "patient": $scope.patient,
                "section": $scope.section
            };

            spinner.forPromise(init());
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                patient: "=",
                section: "=",
                isOnDashboard: "="
            },
            templateUrl: '../common/displaycontrols/chronicTreatmentChart/views/chronicTreatmentChart.html'
        }
    }]);
