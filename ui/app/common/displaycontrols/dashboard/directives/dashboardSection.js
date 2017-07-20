'use strict';

angular.module('bahmni.common.displaycontrol.dashboard')

    .directive('dashboardSection', function () {
        var controller = function ($scope) {
            $scope.$on("no-data-present-event", function () {
                $scope.section.isDataAvailable = !$scope.section.hideEmptyDisplayControl;
            });
        };

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "../common/displaycontrols/dashboard/views/dashboardSection.html"
        };
    });
