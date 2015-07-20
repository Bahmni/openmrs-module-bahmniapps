"use strict";

angular.module('bahmni.clinical')
    .directive('orderSelector', [function () {

        var link = function ($scope) {

            $scope.hasTests = function () {
                return $scope.rootConcept && !(_.isUndefined($scope.rootConcept.setMembers)) && $scope.rootConcept.setMembers.length > 0;
            };

            $scope.filterByConceptClass = function (test) {
                return test.conceptClass.name == $scope.conceptClass;
            };

            $scope.handleTestSelection = function(test) {
              $scope.$parent.toggleOrderSelection(test);
            };

            $scope.isActiveOrderPresent = function (test) {
                return $scope.$parent.isActiveOrderPresent(test);
            };

            $scope.isTestIndirectlyPresent = function (test) {
                return $scope.$parent.isTestIndirectlyPresent(test);
            };

            $scope.getName = function (test) {
                var name = _.find(test.names, {conceptNameType: "SHORT"}) || _.find(test.names, {conceptNameType: "FULLY_SPECIFIED"});
                return name ? name.name : undefined;
            };

        };

        return {
            restrict: 'E',
            link: link,
            templateUrl: './consultation/views/orderSelector.html',
            scope: {
                conceptClass: "=",
                rootConcept: "=",
                title: "="
            }
        };
    }]);
