'use strict';

angular.module('bahmni.common.displaycontrol.conditionsList', []);
angular.module('bahmni.common.displaycontrol.conditionsList')
    .directive('conditionsList', ['conditionsService', 'ngDialog', 'providerInfoService', function (conditionsService, ngDialog, providerInfoService) {
        var controller = function ($scope) {
            $scope.statuses = ['ACTIVE', 'HISTORY_OF'];

            $scope.openSummaryDialog = function () {
                ngDialog.open({
                    template: '../common/displaycontrols/conditionsList/views/conditionsList.html',
                    className: 'ngdialog-theme-default ng-dialog-all-details-page',
                    data: {conditions: $scope.conditions},
                    controller: function ($scope) {
                        $scope.hideTitle = true;
                        $scope.statuses = ['ACTIVE', 'HISTORY_OF', 'INACTIVE'];
                        $scope.conditions = $scope.ngDialogData.conditions;
                    }
                });
            };

            return conditionsService.getConditions($scope.patient.uuid).then(function (conditions) {
                $scope.conditions = conditions;
                providerInfoService.setProvider($scope.conditions);
            });
        };
        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "../common/displaycontrols/conditionsList/views/conditionsList.html",
            scope: {
                params: "=",
                patient: "="
            }
        };
    }]);
