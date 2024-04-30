'use strict';

angular.module('bahmni.clinical')
    .directive('treatmentTableRow', function () {
        var controller = function ($scope) {
            $scope.showDetails = false;
            if ($scope.params.showProvider === undefined) {
                $scope.params.showProvider = true;
            }
            $scope.toggle = function () {
                $scope.showDetails = !$scope.showDetails;
            };
        };

        return {
            restrict: 'A',
            controller: controller,
            scope: {
                drugOrder: "=",
                params: "="
            },
            templateUrl: "displaycontrols/treatmentData/views/treatmentTableRow.html"
        };
    });
