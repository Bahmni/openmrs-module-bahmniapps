'use strict';

angular.module('bahmni.common.domain')
    .factory('configurationService', ['$q', 'androidDbService',
        function ($q, androidDbService) {
            var configurationFunctions = {};

            configurationFunctions.encounterConfig = function () {
                return androidDbService.getReferenceData('RegistrationConcepts');
            };

            configurationFunctions.patientConfig = function () {
                return androidDbService.getReferenceData('PatientConfig');
            };

            configurationFunctions.patientAttributesConfig = function () {
                return androidDbService.getReferenceData('PersonAttributeType');
            };

            configurationFunctions.dosageFrequencyConfig = function () {
                return androidDbService.getReferenceData('DosageFrequencyConfig');
            };

            configurationFunctions.dosageInstructionConfig = function () {
                return androidDbService.getReferenceData('DosageInstructionConfig');
            };

            configurationFunctions.stoppedOrderReasonConfig = function () {
                return androidDbService.getReferenceData('StoppedOrderReasonConfig');
            };

            configurationFunctions.consultationNoteConfig = function () {
                return androidDbService.getReferenceData('ConsultationNote');
            };

            configurationFunctions.radiologyObservationConfig = function () {
                return $q.when({});
            };

            configurationFunctions.labOrderNotesConfig = function () {
                return androidDbService.getReferenceData('LabOrderNotes');
            };

            configurationFunctions.defaultEncounterType = function () {
                return androidDbService.getReferenceData('DefaultEncounterType');
            };

            configurationFunctions.radiologyImpressionConfig = function () {
                return androidDbService.getReferenceData('RadiologyImpressionConfig');
            };

            configurationFunctions.addressLevels = function () {
                return androidDbService.getReferenceData('AddressHierarchyLevels');
            };

            configurationFunctions.allTestsAndPanelsConcept = function () {
                return androidDbService.getReferenceData('AllTestsAndPanelsConcept');
            };

            configurationFunctions.identifierTypesConfig = function () {
                return androidDbService.getReferenceData('IdentifierTypes');
            };

            configurationFunctions.genderMap = function () {
                return androidDbService.getReferenceData('Genders');
            };

            configurationFunctions.relationshipTypeMap = function () {
                return androidDbService.getReferenceData('RelationshipTypeMap');
            };

            configurationFunctions.relationshipTypeConfig = function () {
                return androidDbService.getReferenceData('RelationshipType');
            };

            configurationFunctions.loginLocationToVisitTypeMapping = function () {
                return androidDbService.getReferenceData('LoginLocationToVisitTypeMapping');
            };

            configurationFunctions.loginLocationToEncounterTypeMapping = function () {
                return androidDbService.getReferenceData('LoginLocationToEncounterTypeMapping');
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
