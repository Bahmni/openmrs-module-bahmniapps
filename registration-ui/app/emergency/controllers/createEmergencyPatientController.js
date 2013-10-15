'use strict';

angular.module('registration.emergency.controllers')
    .controller('CreateEmergencyPatientController', ['$scope', 'patient', 'Preferences',
    function ($scope, patientModel, preferences) {
        var init = function(){
            $scope.patient = patientModel.create();
            $scope.centers = constants.centers;
            $scope.patient.centerID = $scope.centers.filter(function (center) {
                return center.name === preferences.centerID
            })[0];
        }

        init();
        $scope.create = function(){

        }

    }]);
