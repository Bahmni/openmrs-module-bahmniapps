'use strict';

angular.module('registration.patient.controllers')
    .controller('PatientCommonController', ['$scope', '$http', 'patientAttributeService', 'addressAttributeService',
        function ($scope, $http, patientAttributeService, addressAttributeService) {

            $scope.setCasteAsLastName = function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient.caste = $scope.patient.familyName;
                }
            };

            $scope.getAutoCompleteList = function (attributeName, query, type) {
                return patientAttributeService.search(attributeName, query, type);
            };

            $scope.getDataResults = function (data) {
                return  data.resultList.results;
            };

            $scope.$watch('patient.familyName', function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient.caste = $scope.patient.familyName;
                }
            });

            $scope.$watch('patient.caste', function () {
                if ($scope.patient.sameAsLastName && ($scope.patient.familyName != $scope.patient.caste)) {
                    $scope.patient.sameAsLastName = false;
                }
            });
        }])

