'use strict';

angular.module('opd.consultation.controllers')
    .controller('TreatmentController', ['$scope', function ($scope) {
        $scope.placeholder = "Add Treatment Advice";
        var drug = function () {
            return {
                name: "",
                strength: [],
                numberPerDosage: "",
                dosageFrequency: [],
                dosageInstructions: [],
                numberOfDosageDays: "",
                notes: ""
            }
        };

        $scope.drugs = [
            {name: "Calpol",
                strength: ["500mg", "250mg"],
                numberPerDosage: "1",
                dosageFrequency: ["OD", "BD"],
                dosageInstructions: ["AC", "PC", "HS", "SL"],
                numberOfDosageDays: "3",
                notes: "blah"
            }
        ];

        $scope.addNewRowIfNotExists = function () {
            var length = $scope.drugs.length;
            if ($scope.drugs[length - 1]) {
                var lastItem = $scope.drugs[length - 1];
                if (lastItem.name) {
                    $scope.drugs.push(new drug());
                }
                else if ($scope.drugs[length - 2] && !$scope.drugs[length - 2].name) {
                    $scope.drugs.pop();
                }
            }
        }


    }])

    .directive('myAutocomplete', function ($parse) {
        return function (scope, element, attrs) {
            var ngModel = $parse(attrs.ngModel);
            element.autocomplete({
                autofocus: true,
                minLength: 2,
                source: function (request, response) {
                    var autoCompleteConfig = angular.fromJson(attrs.myAutocomplete);
                    scope[autoCompleteConfig.src](request.term).success(function (data) {
                        var results = scope[autoCompleteConfig.responseHandler](data);
                        response(results);
                    });
                },
                select: function (event, ui) {
                    var autoCompleteConfig = angular.fromJson(attrs.myAutocomplete);
                    scope.$apply(function (scope) {
                        ngModel.assign(scope, ui.item.value);
                        scope.$eval(attrs.ngChange);
                        if (autoCompleteConfig.onSelect != null && scope[autoCompleteConfig.onSelect] != null) {
                            scope[autoCompleteConfig.onSelect](ui.item);
                        }
                    });
                    return true;
                },
                search: function (event) {
                    var searchTerm = $.trim(element.val());
                    if (searchTerm.length < 2) {
                        event.preventDefault();
                    }
                }
            });
        }
    });
