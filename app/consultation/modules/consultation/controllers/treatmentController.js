'use strict';

angular.module('opd.consultation.controllers')
    .controller('TreatmentController', ['$scope', 'treatmentService', function ($scope, treatmentService) {
        $scope.placeholder = "Add Treatment Advice";
        var drug = function () {
            return {
                uuid: "",
                name: "",
                strength: '',
                numberPerDosage: "",
                dosageFrequency: "",
                dosageInstruction: "",
                numberOfDosageDays: "",
                notes: ""
            }
        };

        $scope.searchResults = [];

        $scope.selectedDrugs = [
            new drug()
        ];

        $scope.addNewRowIfNotExists = function () {
            var length = $scope.selectedDrugs.length;
            if ($scope.selectedDrugs[length - 1]) {
                var lastItem = $scope.selectedDrugs[length - 1];
                if (lastItem.name) {
                    $scope.selectedDrugs.push(new drug());
                }
                else if ($scope.selectedDrugs[length - 2] && !$scope.selectedDrugs[length - 2].name) {
                    $scope.selectedDrugs.pop();
                }
            }
        };

        $scope.getDataResults = function (data) {
            var labels = [];
            $scope.searchResults = data.results;
            data.results.forEach(
                function(record) {
                    labels.push(
                        {
                            label: record.name,
                            value: record.uuid
                        }
                    );
                }
            );
            return labels;
        };

        $scope.getDrugList = function (query) {
            return treatmentService.search(query);
        };

        $scope.dosageFrequencyAnswers = $scope.dosageFrequencyConfig.results[0].answers;
        $scope.dosageInstructionAnswers = $scope.dosageInstructionConfig.results[0].answers;


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
