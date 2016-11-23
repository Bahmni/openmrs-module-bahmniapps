'use strict';

angular.module('bahmni.common.displaycontrol.dashboard')

    .directive('dashboardSection', ["$rootScope", function ($rootScope) {
        var controller = function ($scope) {
            $scope.$on("no-data-present-event", function (event, data) {
                $scope.section.isDataAvailable = !$scope.section.hideEmptyDisplayControl;
            });
        };

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "../common/displaycontrols/dashboard/views/dashboardSection.html"
        };
    }]);
