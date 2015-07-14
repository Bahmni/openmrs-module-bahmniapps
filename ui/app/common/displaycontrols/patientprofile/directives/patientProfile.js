'use strict';

angular.module('bahmni.common.displaycontrol.patientprofile')
    .directive('patientProfile', function () {
        var controller = function ($scope, patientService, spinner) {

            var patient = $scope.patient;

            var init = function () {
                return patientService.getRelationships($scope.patient.uuid).success(function (data) {
                    $scope.patient.relationships = data.results;
                });
            };

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
                else if (!_.contains($scope.config, "cityVillage")) {
                    address.push(patient.address["cityVillage"]);
                }
                return address.join(", ");
            };
            spinner.forPromise(init());
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                patient: "=",
                config: "=",
                visitSummary: "="
            },
            templateUrl: "../common/displaycontrols/patientprofile/views/patientProfile.html"
        };
    });
