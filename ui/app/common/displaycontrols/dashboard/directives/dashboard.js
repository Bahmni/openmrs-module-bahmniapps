'use strict';

angular.module('bahmni.common.displaycontrol.dashboard')
    .directive('dashboard', [ function () {

        var controller = function ($scope) {

            var init = function () {
                $scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create($scope.config || {});
                $scope.sections = $scope.dashboard.getSections($scope.diseaseTemplates);
            };

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

            var unbindWatch = $scope.$watch('config', init);
            $scope.$on("$stateChangeStart", unbindWatch);
        };

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "../common/displaycontrols/dashboard/views/dashboard.html",
            scope: {
                config: "=",
                patient: "=",
                diseaseTemplates: "=",
                visitHistory: "=",
                activeVisitUuid: "=",
                visitSummary: "="
            }
        }
    }]);
