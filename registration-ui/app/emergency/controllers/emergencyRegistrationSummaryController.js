'use strict';

angular.module('registration.emergency.controllers')
    .controller('EmergencyRegistrationSummaryController', ['$scope', '$location', 'patientService',
    function ($scope, $location, patientService) {
        var init = function(){
            $scope.patient = patientService.getPatient();
        };
        init();

        $scope.back = function() {
            $location.path("/create");
        }
    }]);
