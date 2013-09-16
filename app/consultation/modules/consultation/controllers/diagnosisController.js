'use strict';

angular.module('opd.consultation.controllers')
    .controller('DiagnosisController', ['$scope', 'DiagnosisService', 'observationSelectionService', function ($scope, diagnosisService, observationSelectionService) {

    $scope.placeholder = "Add Diagnosis";
    $scope.hasAnswers = false;
    $scope.diagnosisList = observationSelectionService.getSelectedObservations();

    $scope.getDiagnosis = function (searchTerm) {
        return diagnosisService.getAllFor(searchTerm);
    }

    $scope.selectItem = function (item) {
        observationSelectionService.addObservation(item);
        $scope.$apply();
    }

    $scope.removeObservation = function(item){
        observationSelectionService.remove(item);
    }
}])
.directive('uiAutocomplete', function () {
    return function (scope, element) {
        element.autocomplete({
            autofocus:true,
            minLength:2,
            source:function (request, response) {
                scope.getDiagnosis(request.term).success(function (data) {
                    response(data.map(
                        function (concept) {
                            if (concept.conceptName === concept.matchedName) {
                                return {
                                    'value':concept.matchedName,
                                    'concept':concept
                                }
                            }
                            return {
                                'value':concept.matchedName + "=>" + concept.conceptName,
                                'concept':concept
                            }
                        }
                    ));
                });
            },
            search:function (event) {
                var searchTerm = $.trim(element.val());
                if (searchTerm.length < 2) {
                    event.preventDefault();
                }
            },
            select:function (event, ui) {
                scope.selectItem(ui.item)

            }
        });
    }
})
.directive('uiSelectable', function () {
    return function (scope, el, attrs) {
        el.selectable({
            stop:function (evt, ui) {
                var idx = el.find('.ui-selected').index();
                scope.selectedAnswer = scope.selectedItem.answers[idx].name;
                scope.$apply()
            }
        });
    };
});
