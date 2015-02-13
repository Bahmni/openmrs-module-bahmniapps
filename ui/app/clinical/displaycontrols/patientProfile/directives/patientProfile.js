'use strict';

angular.module('bahmni.clinical')
    .directive('patientProfile', function () {
        var controller = function ($scope) {
            var patient = $scope.patient;
            $scope.getPatientGenderAndAge = function () {
                var patientGenderAndAge = [patient.genderText, patient.ageText];
                return patientGenderAndAge.join(", ");
            };
            $scope.getAddress = function () {
                var address = [];
                if ($scope.config.addressFields != undefined && $scope.config.addressFields.length != 0) {
                    $scope.config.addressFields.forEach(function (addressField) {
                        if (patient.address[addressField]) {
                            address.push(patient.address[addressField]);
                        }
                    });
                    if(!_.contains($scope.config,"cityVillage")) {
                        address.push(patient.address["cityVillage"]);
                    }
                    return address.join(", ");
                }
                return patient.address.cityVillage;
            }
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                patient: "=",
                config: "="
            },
            templateUrl: "displaycontrols/patientProfile/views/patientProfile.html"
        };
    });