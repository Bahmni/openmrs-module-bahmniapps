'use strict';

angular.module('bahmni.common.displaycontrol.patientprofile')
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
                }
                else if(!_.contains($scope.config,"cityVillage")) {
                        address.push(patient.address["cityVillage"]);
                }
                return address.join(", ");
            }
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                patient: "=",
                config: "="
            },
            templateUrl: "../common/displaycontrols/patientprofile/views/patientProfile.html"
        };
    });
