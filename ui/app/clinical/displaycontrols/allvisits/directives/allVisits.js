'use strict';

angular.module('bahmni.clinical')
    .directive('allVisits', [ function () {
        var controller = function ($scope, $stateParams) {
            var defaultParams = {
                showTable: true,
                maximumNoOfVisits: $scope.visits ? $scope.visits.length : 4
            };

            $scope.params = angular.extend(defaultParams, $scope.params);
            $scope.patientUuid = $stateParams.patientUuid;
            $scope.allVisists = {message: "No Visits for this patient."};

        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                params: "=",
                visits: "="
            },
            templateUrl: "displaycontrols/allvisits/views/allVisits.html"
        };
    }]);