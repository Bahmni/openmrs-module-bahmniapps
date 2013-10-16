'use strict';

angular.module('registration.patient.controllers')
    .controller('PatientCommonController', ['$scope', '$http', 'patientAttributeService', 'addressAttributeService',
        function ($scope, $http, patientAttributeService, addressAttributeService) {

            $scope.setCasteAsLastName = function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient.caste = $scope.patient.familyName;
                }
            };

            $scope.getLastNameList = function (query) {
                return patientAttributeService.search("familyName", query);
            };

            $scope.getCasteList = function (query) {
                return patientAttributeService.search("caste", query);
            };

            $scope.getDataResults = function (data) {
                return  data.resultList.results;
            };

            var addressLevels = ["cityVillage", "address3", "countyDistrict", "stateProvince"];

            $scope.getAddressDataResults = function (data) {
                return data.map(function (addressField) {
                    return {'value': addressField.name, 'label': addressField.name + ( addressField.parent ? ", " + addressField.parent.name : "" ), addressField: addressField}
                });
            };

            $scope.getVillageList = function (query) {
                return addressAttributeService.search("cityVillage", query);
            };

            $scope.villageSelected = function (item) {
                addressFieldSelected("cityVillage", item.addressField);
            };

            $scope.getDistrictList = function (query) {
                return addressAttributeService.search("countyDistrict", query);
            };

            $scope.districtSelected = function (item) {
                addressFieldSelected("countyDistrict", item.addressField);
            };

            $scope.getTehsilList = function (query) {
                return addressAttributeService.search("address3", query);
            };

            $scope.tehsilSelected = function (item) {
                addressFieldSelected("address3", item.addressField);
            };

            var addressFieldSelected = function (fieldName, addressFiled) {
                var parentFields = addressLevels.slice(addressLevels.indexOf(fieldName) + 1);
                var parent = addressFiled.parent;
                parentFields.forEach(function (parentField) {
                    if (!parent) return;
                    $scope.patient.address[parentField] = parent.name;
                    parent = parent.parent;
                });
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

