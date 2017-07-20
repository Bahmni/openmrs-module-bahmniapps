"use strict";

angular.module('bahmni.clinical')
    .directive('orderSelector', [function () {
        var link = function ($scope) {
            $scope.hasTests = function () {
                var rootConcept = $scope.tab.leftCategory;
                return rootConcept && !_.isEmpty(rootConcept.setMembers);
            };

            $scope.filterByConceptClass = function (test) {
                return test.conceptClass.name === $scope.group.name;
            };

            var filterBySearchString = function (testName) {
                return _.includes(_.toLower(testName.name), _.toLower($scope.search.string));
            };

            $scope.filterBySearchString = function (test) {
                return _.some(test.names, filterBySearchString);
            };
        };

        return {
            restrict: 'E',
            link: link,
            templateUrl: './consultation/views/orderSelector.html',
            scope: false
        };
    }]);
