'use strict';
angular.module('bahmni.common.displaycontrol.chronicTreatmentChart')
    .controller('AllChronicTreatmentChartController', ['$scope',
        function ($scope) {
            $scope.patient = $scope.ngDialogData.patient;
            $scope.enrollment = $scope.ngDialogData.enrollment;
            $scope.section = $scope.ngDialogData.section;
            $scope.config = $scope.ngDialogData.section ? $scope.ngDialogData.section.expandedViewConfig : {};
        }]);
