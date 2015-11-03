'use strict';

angular.module('bahmni.common.displaycontrol.drugOGram').directive('drugOGram', [
    function () {
        var controller = function ($scope, DrugService, spinner) {
            $scope.config = $scope.isOnDashboard ? $scope.section.dashboardParams : $scope.section.allDetailsParams;
            var patient = $scope.patient;

            var init = function () {
                return DrugService.getRegimen(patient.uuid, $scope.config.drugs).success(function (data) {
                    $scope.regimen = data;
                });
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
            templateUrl: '../common/displaycontrols/drugOGram/views/drugOGram.html'
        }
    }]);