"use strict";

angular.module('bahmni.clinical')
    .directive('orderSelector', ['$rootScope', function ($rootScope) {
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

            $scope.filterNameByLocale = function (test) {
                return _.find(test.names, {conceptNameType: "SHORT", locale: $rootScope.currentUser.userProperties.defaultLocale }) || _.find(test.names, {conceptNameType: "SHORT"})
                    || _.find(test.names, {conceptNameType: "FULLY_SPECIFIED"});
            };
        };

        return {
            restrict: 'E',
            link: link,
            templateUrl: './consultation/views/orderSelector.html',
            scope: false
        };
    }]);
