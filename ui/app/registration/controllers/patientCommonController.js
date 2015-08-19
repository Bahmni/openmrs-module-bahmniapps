'use strict';

angular.module('bahmni.registration')
    .controller('PatientCommonController', ['$scope', '$rootScope', '$http', 'patientAttributeService', 'addressAttributeService', 'appService',
        function ($scope, $rootScope, $http, patientAttributeService, addressAttributeService, appService) {

            var autoCompleteFields = appService.getAppDescriptor().getConfigValue("autoCompleteFields", []);
            var showCasteSameAsLastNameCheckbox = appService.getAppDescriptor().getConfigValue("showCasteSameAsLastNameCheckbox");
            $scope.showMiddleName = appService.getAppDescriptor().getConfigValue("showMiddleName");
            $scope.genderCodes = Object.keys($rootScope.genderMap);

            $scope.getConcepts =function(searchTerm){
                return $http.get(Bahmni.Common.Constants.conceptUrl, { params: {q: searchTerm.term, v: "custom:(uuid,name)"}}).then(function(result) {
                    return result.data.results;
                });
            };

            $scope.mapConcepts = function(results){
                return results.map(function (concept) {
                    return {'concept': {uuid: concept.uuid, name: concept.name.name, editableName: concept.name.name}, 'value': concept.name.name}
                });
            };


            $scope.isAutoComplete = function (fieldName) {
                return autoCompleteFields.indexOf(fieldName) > -1;
            };

            $scope.showCasteSameAsLastName = function() {
                var personAttributeHasCaste = (_.find($rootScope.patientConfiguration.personAttributeTypes, {name: 'caste'}) != null);
                return showCasteSameAsLastNameCheckbox && personAttributeHasCaste;
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
                return  data.results;
            };

            $scope.clearDeathDetails = function() {
                $scope.patient.deathDate = null;
                $scope.patient.causeOfDeath = null;
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

        }]);

