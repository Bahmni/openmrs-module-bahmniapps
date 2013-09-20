'use strict';

angular.module('opd.consultation.controllers')
    .controller('DiagnosisController', ['$scope', '$rootScope', 'DiagnosisService', 'observationSelectionService', function ($scope, $rootScope, diagnosisService, observationSelectionService) {

    $scope.placeholder = "Add Diagnosis";
    $scope.hasAnswers = false;
    $scope.diagnosisList = observationSelectionService.getSelectedObservations();
    $scope.orderOptions=['PRIMARY', 'SECONDARY'];
    $scope.certaintyOptions=['CONFIRMED', 'PRESUMED'];

    $scope.getDiagnosis = function (searchTerm) {
        return diagnosisService.getAllFor(searchTerm);
    }

    $scope.selectItem = function (item) {
        observationSelectionService.addDiagnosis(item.concept);
        $scope.$apply();
    }

    $scope.removeObservation = function(item){
        observationSelectionService.remove(item);
    }

    $scope.$on('$destroy', function() {
        $rootScope.consultation.diagnoses = $scope.diagnosisList
    });
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
                scope.selectItem(ui.item);
                event.preventDefault();
                element.val('');
            }
        });
    }
})
.directive('buttonsRadio', function() {
    return {
        restrict: 'E',
        scope: { model: '=', options:'='},
        controller: function($scope){
            $scope.activate = function(option){
                $scope.model = option;
            };
        },
        template: "<button type='button' class='btn' "+
            "ng-class='{active: option == model}'"+
            "ng-repeat='option in options' "+
            "ng-click='activate(option)'>{{option}} "+
            "</button>"
    };
});
