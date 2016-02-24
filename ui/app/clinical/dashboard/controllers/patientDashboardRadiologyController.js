'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardRadiologyController', ['$scope',
        function ($scope) {
            $scope.config = $scope.dashboard.getSectionByName("radiology") || {};
        }]);