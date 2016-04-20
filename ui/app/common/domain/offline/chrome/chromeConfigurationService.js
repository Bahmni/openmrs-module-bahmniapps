'use strict';

angular.module('bahmni.common.domain')
        .factory('configurationService', ['$q', 'offlineDbService',
        function ($q, offlineDbService) {

            var configurationFunctions = {};

            configurationFunctions.encounterConfig = function () {
                return offlineDbService.getReferenceData('RegistrationConcepts').then(function (registrationConcepts) {
                    return {"data": registrationConcepts.value};
                });
            };

            configurationFunctions.patientConfig = function () {
                return offlineDbService.getReferenceData('PatientConfig').then(function (patientConfig) {
                    return {"data": patientConfig.value};
                });
            };

            configurationFunctions.patientAttributesConfig = function () {
                return offlineDbService.getReferenceData('PersonAttributeType').then(function (relationshipTypes) {
                    return {"data": relationshipTypes.value};
                });
            };

            configurationFunctions.dosageFrequencyConfig = function () {

                return offlineDbService.getReferenceData('DosageFrequencyConfig').then(function (dosageFrequencyConfig) {
                    return {"data": dosageFrequencyConfig.value};

                });
            };

            configurationFunctions.dosageInstructionConfig = function () {

                return offlineDbService.getReferenceData('DosageInstructionConfig').then(function (dosageInstructionConfig) {
                    return {"data": dosageInstructionConfig.value};
                });
            };

            configurationFunctions.stoppedOrderReasonConfig = function () {
                return offlineDbService.getReferenceData('StoppedOrderReasonConfig').then(function (stoppedOrderReasonConfig) {
                    return {"data": stoppedOrderReasonConfig.value};
                });
            };

            configurationFunctions.consultationNoteConfig = function () {
                return offlineDbService.getReferenceData('ConsultationNote').then(function (consultationNote) {
                    return {"data": consultationNote.value};
                });
            };

            configurationFunctions.radiologyObservationConfig = function () {
                return $q.when({});
            };

            configurationFunctions.labOrderNotesConfig = function () {
                return offlineDbService.getReferenceData('LabOrderNotes').then(function (labOrderNotes) {
                    return {"data": labOrderNotes.value};
                });
            };

            configurationFunctions.defaultEncounterType = function () {
                return offlineDbService.getReferenceData('DefaultEncounterType').then(function (defaultEncounterType) {
                    return {"data": defaultEncounterType.value};
                });
            };

            configurationFunctions.radiologyImpressionConfig = function () {
                return offlineDbService.getReferenceData('RadiologyImpressionConfig').then(function (radiologyImpressionConfig) {
                    return {"data": radiologyImpressionConfig.value};
                });
            };


            configurationFunctions.addressLevels = function () {
                return offlineDbService.getReferenceData('AddressHierarchyLevels').then(function (addressHierarchyLevels) {
                    return {"data": addressHierarchyLevels.value};
                });
            };

            configurationFunctions.allTestsAndPanelsConcept = function () {
                return offlineDbService.getReferenceData('AllTestsAndPanelsConcept').then(function (allTestsAndPanelsConcept) {
                    return {"data": allTestsAndPanelsConcept.value};
                });
            };

            configurationFunctions.identifierSourceConfig = function () {
                return offlineDbService.getReferenceData('IdentifierSources').then(function (identifierSources) {
                    return {"data": identifierSources.value};
                });
            };

            configurationFunctions.genderMap = function () {
                return offlineDbService.getReferenceData('Genders').then(function (genders) {
                    return {"data": genders.value};
                });
            };


            configurationFunctions.relationshipTypeMap = function () {
                return offlineDbService.getReferenceData('RelationshipTypeMap').then(function (relationshipTypeMap) {
                    return {"data": relationshipTypeMap.value};
                });
            };

            configurationFunctions.relationshipTypeConfig = function () {
                return offlineDbService.getReferenceData('RelationshipType').then(function (relationshipTypes) {
                    return {"data": relationshipTypes.value};
                });
            };

            configurationFunctions.loginLocationToVisitTypeMapping = function () {
                return offlineDbService.getReferenceData('LoginLocationToVisitTypeMapping').then(function (mapping) {
                    return {"data": mapping.value};
                });
            };

            configurationFunctions.loginLocationToEncounterTypeMapping =  function () {
                    return offlineDbService.getReferenceData('LoginLocationToEncounterTypeMapping').then(function (result){
                        return {"data" : result};
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
