'use strict';

angular.module('bahmni.clinical')
    .directive('visitsTable', function () {
        var controller = function ($scope, $stateParams) {
            $scope.patientUuid = $stateParams.patientUuid;

            $scope.hasVisits = function () {
                return $scope.visits && $scope.visits.length > 0;
            };

            $scope.isVisitActive = function (visit) {
                return visit.stopDatetime === null;
            }

        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                visits: "=",
                params: "="
            },
            templateUrl: "displaycontrols/allvisits/views/visitsTable.html"
        };
    });