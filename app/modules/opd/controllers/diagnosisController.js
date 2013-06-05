'use strict';

angular.module('opd.diagnosisController', ['opd.diagnosisService'])
    .controller('DiagnosisController', ['$scope','DiagnosisService', function ($scope, diagnosisService) {

    $scope.placeholder = "Add Diagnosis";

    $scope.getDiagnosis = function(searchTerm){
        return diagnosisService.getAllFor(searchTerm, "Diagnosis");
    }

    $scope.selectItem = function(item){
        $scope.setSelectedItem(item);
        $scope.$apply();
    }

    $scope.setSelectedItem= function(item){
        $scope.selectedItem = item;
        if($scope.selectedItem.datatype === "Boolean"){
            $scope.selectedItem.answers = [{'name': 'yes'},{ 'name': 'no'}]
        }
    }
}])
.directive('uiAutocomplete', function () {
    return function (scope, element) {
        element.autocomplete({
            autofocus: true,
            minLength: 2,
            source: function (request, response) {
                scope.getDiagnosis(request.term).success(function(data){
                    response(data.map(
                        function(addressField){
                            return {'value': addressField.name,
                                'datatype': addressField.properties.datatype.name,
                                'answers': addressField.properties.datatype.properties.answers
                            }
                        }
                    ));
                });
            },
            search: function (event) {
                var searchTerm = $.trim(element.val());
                if (searchTerm.length < 2) {
                    event.preventDefault();
                }
            },
            select: function(event, ui){
                scope.selectItem(ui.item)

            }
        });
    }
});
