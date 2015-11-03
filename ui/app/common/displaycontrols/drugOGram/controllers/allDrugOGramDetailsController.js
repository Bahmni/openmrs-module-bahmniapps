'use strict';
angular.module('bahmni.common.displaycontrol.drugOGram')
    .controller('AllDrugOGramDetailsController', ['$scope',
        function ($scope) {
            $scope.patient = $scope.ngDialogData.patient;
            $scope.section = $scope.ngDialogData.section;
            $scope.config = $scope.ngDialogData.section ? $scope.ngDialogData.section.allObservationDetails : {};
        }]);