'use strict';

angular.module('bahmni.clinical')
    .directive('observationData', [ function () {
        var controller = function ($scope) {
            $scope.hasGroupMembers = function () {
                return $scope.observation.groupMembers && $scope.observation.groupMembers.length > 0;
            };
            $scope.getDisplayValue = function () {
                return $scope.observation.value ? ($scope.observation.value.display || $scope.observation.value) : (null);
            };
        };
        return {
            restrict: 'E',
            template: '<ng-include src="\'../clinical/displaycontrols/observationData/views/observationData.html\'" />',
            scope: {
                observation: "="
            },
            controller: controller
        };
    }]);
