'use strict';

angular.module('bahmni.clinical')
    .controller('patientDashboardAllFormsController', ['$scope',
        function ($scope) {
            $scope.patient = $scope.ngDialogData.patient;
            $scope.section = $scope.ngDialogData.section;
        }]);
