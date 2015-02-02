'use strict';
angular.module('bahmni.clinical')
    .controller('PatientDashboardObservationSectionController', ['$scope',
        function ($scope) {
            $scope.patient = $scope.ngDialogData.patient;
            $scope.section = $scope.ngDialogData.section;
}]);