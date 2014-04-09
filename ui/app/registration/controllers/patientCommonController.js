'use strict';

angular.module('bahmni.registration')
    .controller('PatientCommonController', ['$scope', '$http', 'patientAttributeService', 'addressAttributeService', 'appService',
        function ($scope, $http, patientAttributeService, addressAttributeService, appService) {

            var autoCompleteFields = appService.getAppDescriptor().getConfigValue("autoCompleteFields", []);
            $scope.showMiddleName = appService.getAppDescriptor().getConfigValue("showMiddleName");
            $scope.isAutoComplete = function (fieldName) {
                return autoCompleteFields.indexOf(fieldName) > -1;
            };

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
                if ($scope.patient.sameAsLastName && ($scope.patient.familyName !== $scope.patient.caste)) {
                    $scope.patient.sameAsLastName = false;
                }
            });
        }])

