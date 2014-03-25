'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', 'encounterService', 'visitService', 'spinner','$stateParams',
        function ($scope, encounterService, visitService, spinner, $stateParams) {
    var visitUuid = $stateParams.visitUuid;
	$scope.visit = null;
    $scope.patientUuid = $stateParams.patientUuid;
    $scope.showTrends = true;

    spinner.forPromise(encounterService.search(visitUuid).success(function(encounterTransactions){
        $scope.visit = Bahmni.Clinical.Visit.create(encounterTransactions, $scope.consultationNoteConcept, $scope.labOrderNotesConcept, $scope.encounterConfig.orderTypes)
    }));

    $scope.isNumeric = function(value){
        return $.isNumeric(value);
    }

    $scope.toggle = function(item) {
        item.show = !item.show
    }

}]);
