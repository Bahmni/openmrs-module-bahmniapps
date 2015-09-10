'use strict';

angular.module('bahmni.common.domain')
    .factory('configurationService', ['$http', '$q', function ($http, $q) {

        var configurationFunctions = {};

        configurationFunctions.encounterConfig = function () {
            return $http.get(Bahmni.Common.Constants.encounterConfigurationUrl, {
                params: {"callerContext": "REGISTRATION_CONCEPTS"},
                withCredentials: true
            });
        };

        configurationFunctions.patientConfig = function () {
            var patientConfig = $http.get(Bahmni.Common.Constants.patientConfigurationUrl, {
                withCredentials: true
            });
            return patientConfig;
        };

        configurationFunctions.patientAttributesConfig = function () {
            return $http.get(Bahmni.Common.Constants.personAttributeTypeUrl, {
                params: {v: 'custom:(uuid,name,sortWeight,description,format,concept)'},
                withCredentials: true
            });
        };

        configurationFunctions.dosageFrequencyConfig = function () {
            var dosageFrequencyConfig = $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                method: "GET",
                params: {v: 'custom:(uuid,name,answers)', name: Bahmni.Common.Constants.dosageFrequencyConceptName},
                withCredentials: true
            });
            return dosageFrequencyConfig;
        };

        configurationFunctions.dosageInstructionConfig = function () {
            var dosageInstructionConfig = $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                method: "GET",
                params: {v: 'custom:(uuid,name,answers)', name: Bahmni.Common.Constants.dosageInstructionConceptName},
                withCredentials: true
            });
            return dosageInstructionConfig;
        };

        configurationFunctions.consultationNoteConfig = function () {
            var consultationNoteConfig = $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                method: "GET",
                params: {v: 'custom:(uuid,name,answers)', name: Bahmni.Common.Constants.consultationNoteConceptName},
                withCredentials: true
            });
            return consultationNoteConfig;
        };

        configurationFunctions.radiologyObservationConfig = function(){
            var radiologyObservationConfig =  $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                method:"GET",
                params: { v: 'custom:(uuid,name)', name: Bahmni.Common.Constants.radiologyResultConceptName },
                withCredentials: true
            });
            return radiologyObservationConfig;
        }

        configurationFunctions.labOrderNotesConfig = function () {
            var labOrderNotesConfig = $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                method: "GET",
                params: {v: 'custom:(uuid,name)', name: Bahmni.Common.Constants.labOrderNotesConcept},
                withCredentials: true
            });
            return labOrderNotesConfig;
        };

        configurationFunctions.defaultEncounterType = function () {
            return $http.get(Bahmni.Common.Constants.globalPropertyUrl, {
                params: {
                    property: 'bahmni.encounterType.default'
                },
                withCredentials: true,
                transformResponse: [function(data){
                    return data;}]
            });
        };

        configurationFunctions.radiologyImpressionConfig = function () {
            var radiologyImpressionConfig = $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                method: "GET",
                params: {v: 'custom:(uuid,name)', name: Bahmni.Common.Constants.impressionConcept},
                withCredentials: true
            });
            return radiologyImpressionConfig;
        }


        configurationFunctions.addressLevels = function () {
            return $http.get(Bahmni.Common.Constants.openmrsUrl + "/module/addresshierarchy/ajax/getOrderedAddressHierarchyLevels.form", {
                withCredentials: true
            });
        };

        configurationFunctions.allTestsAndPanelsConcept = function () {
            var allTestsAndPanelsConcept = $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                method: "GET",
                params: {
                    v: 'custom:(uuid,name:(uuid,name),setMembers:(uuid,name:(uuid,name)))',
                    name: Bahmni.Common.Constants.allTestsAndPanelsConceptName
                },
                withCredentials: true
            });
            return allTestsAndPanelsConcept;
        };

        configurationFunctions.identifierSourceConfig = function () {
            return $http.get(Bahmni.Common.Constants.idgenConfigurationURL, {
                withCredentials: true
            });
        };

        configurationFunctions.genderMap = function() {
            return $http.get(Bahmni.Common.Constants.globalPropertyUrl, {
                method: "GET",
                params: {
                    property: 'mrs.genders'
                },
                withCredentials: true
            });
        };

        configurationFunctions.relationshipTypeMap = function() {
            return $http.get(Bahmni.Common.Constants.globalPropertyUrl, {
                method: "GET",
                params: {
                    property: 'bahmni.relationshipTypeMap'
                },
                withCredentials: true
            });
        };

        configurationFunctions.relationshipTypeConfig = function() {
            return $http.get(Bahmni.Common.Constants.relationshipTypesUrl, {
                withCredentials: true,
                params: {v: "custom:(aIsToB,bIsToA,uuid)"}
            });
        };

        var existingPromises = {};
        var configurations = {};

        var getConfigurations = function (configurationNames) {
            var configurationsPromiseDefer = $q.defer();
            var promises = [];

            configurationNames.forEach(function (configurationName) {
                if (!existingPromises[configurationName]) {
                    existingPromises[configurationName] = configurationFunctions[configurationName]().then(function (response) {
                        configurations[configurationName] = response.data;
                    });
                    promises.push(existingPromises[configurationName]);
                }
            });

            $q.all(promises).then(function () {
                configurationsPromiseDefer.resolve(configurations);
            });

            return configurationsPromiseDefer.promise;
        };

        return {
            getConfigurations: getConfigurations
        };
    }]);
