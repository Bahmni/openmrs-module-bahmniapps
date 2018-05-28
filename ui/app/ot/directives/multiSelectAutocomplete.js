'use strict';

angular.module('bahmni.ot')
    .directive('multiSelectAutocomplete', [function () {
        var link = function ($scope, element) {
            $scope.focusOnTheTest = function () {
                var autoselectInput = $("input.input");
                autoselectInput[0].focus();
            };
            $scope.addItem = function (item) {
                item[item.name] = true;
                $scope.selectedValues = _.union($scope.selectedValues, item, $scope.keyProperty);
            };

            $scope.removeItem = function (item) {
                $scope.selectedValues = _.filter($scope.selectedValues, function (value) {
                    return value[$scope.keyProperty] !== item[$scope.keyProperty];
                });
            };

            $scope.search = function (query) {
                var matchingAnswers = [];
                var unselectedValues = _.xorBy($scope.inputItems, $scope.selectedValues, $scope.keyProperty);
                _.forEach(unselectedValues, function (answer) {
                    if (typeof answer.name != "object" && answer.name.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                        matchingAnswers.push(answer);
                    }
                });
                return _.uniqBy(matchingAnswers, $scope.keyProperty);
            };
        };
        return {
            restrict: 'E',
            link: link,
            scope: {
                inputItems: "=",
                selectedValues: "=",
                displayProperty: "=",
                keyProperty: "=",
                placeholder: "=",
                loadOnDownArrow: "=",
                autoCompleteMinLength: "="
            },
            templateUrl: "../ot/views/multiSelectAutocomplete.html"
        };
    }]);
