'use strict';

angular.module('opd.consultation.controllers')
    .controller('DiagnosisController', ['$scope','DiagnosisService', function ($scope, diagnosisService) {

    $scope.placeholder = "Add Diagnosis";
    $scope.hasAnswers = false;
    $scope.diagnosisList = [];

    $scope.getDiagnosis = function(searchTerm){
        return diagnosisService.getAllFor(searchTerm);
    }

    $scope.selectItem = function(item){
        $scope.setSelectedItem(item);
        $scope.$apply();
    }

    $scope.setSelectedItem= function(item){
        $scope.selectedItem = item;
        $scope.hasAnswers = false;

        if($scope.selectedItem.datatype === "Boolean"){
            $scope.selectedItem.answers = [{'name': 'yes'},{ 'name': 'no'}]
        }
        if($scope.selectedItem.answers !== undefined){
            $scope.hasAnswers = true;
        }
    }

    $scope.addDiagnosis = function(){
        $scope.diagnosisList.push($scope.selectedItem.label + "-" + $scope.selectedAnswer)
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
                        function(concept){
                            if(concept.fullName === undefined){
                                return { 'value': concept.matchedName }
                            }
                            return { 'value': concept.matchedName + "=>" + concept.fullName }
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
})
.directive('uiSelectable', function () {
    return function (scope, el, attrs) {
        el.selectable({
            stop:function(evt,ui){
                var idx=el.find('.ui-selected').index();
                scope.selectedAnswer = scope.selectedItem.answers[idx].name;
                scope.$apply()
            }
        });
    };
});
