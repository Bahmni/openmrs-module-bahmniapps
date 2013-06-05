'use strict';

angular.module('opd.diagnosisController', ['opd.diagnosisService'])
    .controller('DiagnosisController', ['$scope','DiagnosisService', function ($scope, diagnosisService) {
            $scope.placeholder = "Add Diagnosis";

    $scope.getDiagnosis = function(searchTerm){
        return diagnosisService.getAllFor(searchTerm, "Diagnosis");
    }
}])
.directive('uiAutocomplete', function () {
    return function (scope, element) {
        element.autocomplete({
            autofocus: true,
            minLength: 2,
            source: function (request, response) {
                scope.getDiagnosis(request.term).success(function(data){
                    var suggestionList= [];
                    data.forEach(function(datum){suggestionList.push(datum.name)});
                    response(suggestionList);
                });
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
