'use strict';

angular.module('bahmni.common.domain')
    .factory('configurationService', ['$q', 'androidDbService',
        function ($q, androidDbService) {

            var configurationFunctions = {};

            configurationFunctions.encounterConfig = function () {
                return androidDbService.getReferenceData('RegistrationConcepts').then(function (registrationConcepts) {
                    return {"data": registrationConcepts.value};
                });
            };

            configurationFunctions.patientConfig = function () {
                return androidDbService.getReferenceData('PatientConfig').then(function (patientConfig) {
                    return {"data": patientConfig.value};
                });
            };

            configurationFunctions.patientAttributesConfig = function () {
                return androidDbService.getReferenceData('PersonAttributeType').then(function (relationshipTypes) {
                    return {"data": relationshipTypes.value};
                });
            };

            configurationFunctions.dosageFrequencyConfig = function () {

                return androidDbService.getReferenceData('DosageFrequencyConfig').then(function (dosageFrequencyConfig) {
                    return {"data": dosageFrequencyConfig.value};

                });
            };

            configurationFunctions.dosageInstructionConfig = function () {

                return androidDbService.getReferenceData('DosageInstructionConfig').then(function (dosageInstructionConfig) {
                    return {"data": dosageInstructionConfig.value};
                });
            };

            configurationFunctions.stoppedOrderReasonConfig = function () {
                return androidDbService.getReferenceData('StoppedOrderReasonConfig').then(function (stoppedOrderReasonConfig) {
                    return {"data": stoppedOrderReasonConfig.value};
                });
            };

            configurationFunctions.consultationNoteConfig = function () {
                return androidDbService.getReferenceData('ConsultationNote').then(function (consultationNote) {
                    return {"data": consultationNote.value};
                });
            };

            configurationFunctions.radiologyObservationConfig = function () {
                return $q.when({});
            };

            configurationFunctions.labOrderNotesConfig = function () {
                return androidDbService.getReferenceData('LabOrderNotes').then(function (labOrderNotes) {
                    return {"data": labOrderNotes.value};
                });
            };

            configurationFunctions.defaultEncounterType = function () {
                return androidDbService.getReferenceData('DefaultEncounterType').then(function (defaultEncounterType) {
                    return {"data": defaultEncounterType.value};
                });
            };

            configurationFunctions.radiologyImpressionConfig = function () {
                return androidDbService.getReferenceData('RadiologyImpressionConfig').then(function (radiologyImpressionConfig) {
                    return {"data": radiologyImpressionConfig.value};
                });
            };


            configurationFunctions.addressLevels = function () {
                return androidDbService.getReferenceData('AddressHierarchyLevels').then(function (addressHierarchyLevels) {
                    return {"data": addressHierarchyLevels.value};
                });
            };

            configurationFunctions.allTestsAndPanelsConcept = function () {
                return androidDbService.getReferenceData('AllTestsAndPanelsConcept').then(function (allTestsAndPanelsConcept) {
                    return {"data": allTestsAndPanelsConcept.value};
                });
            };

            configurationFunctions.identifierSourceConfig = function () {
                return androidDbService.getReferenceData('IdentifierSources').then(function (identifierSources) {
                    return {"data": identifierSources.value};
                });
            };

            configurationFunctions.genderMap = function () {
                return androidDbService.getReferenceData('Genders').then(function (genders) {
                    return {"data": genders.value};
                });
            };


            configurationFunctions.relationshipTypeMap = function () {
                return androidDbService.getReferenceData('RelationshipTypeMap').then(function (relationshipTypeMap) {
                    return {"data": relationshipTypeMap.value};
                });
            };

            configurationFunctions.relationshipTypeConfig = function () {
                return androidDbService.getReferenceData('RelationshipType').then(function (relationshipTypes) {
                    return {"data": relationshipTypes.value};
                });
            };

            configurationFunctions.loginLocationToVisitTypeMapping = function () {
                return androidDbService.getReferenceData('LoginLocationToVisitTypeMapping').then(function (mapping) {
                    return {"data": mapping.value};
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
