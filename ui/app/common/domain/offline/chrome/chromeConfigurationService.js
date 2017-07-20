'use strict';

angular.module('bahmni.common.domain')
        .factory('configurationService', ['$q', 'offlineDbService',
            function ($q, offlineDbService) {
                var configurationFunctions = {};

                configurationFunctions.encounterConfig = function () {
                    return offlineDbService.getReferenceData('RegistrationConcepts');
                };

                configurationFunctions.patientConfig = function () {
                    return offlineDbService.getReferenceData('PatientConfig');
                };

                configurationFunctions.patientAttributesConfig = function () {
                    return offlineDbService.getReferenceData('PersonAttributeType');
                };

                configurationFunctions.dosageFrequencyConfig = function () {
                    return offlineDbService.getReferenceData('DosageFrequencyConfig');
                };

                configurationFunctions.dosageInstructionConfig = function () {
                    return offlineDbService.getReferenceData('DosageInstructionConfig');
                };

                configurationFunctions.stoppedOrderReasonConfig = function () {
                    return offlineDbService.getReferenceData('StoppedOrderReasonConfig');
                };

                configurationFunctions.consultationNoteConfig = function () {
                    return offlineDbService.getReferenceData('ConsultationNote');
                };

                configurationFunctions.radiologyObservationConfig = function () {
                    return $q.when({});
                };

                configurationFunctions.labOrderNotesConfig = function () {
                    return offlineDbService.getReferenceData('LabOrderNotes');
                };

                configurationFunctions.defaultEncounterType = function () {
                    return offlineDbService.getReferenceData('DefaultEncounterType');
                };

                configurationFunctions.radiologyImpressionConfig = function () {
                    return offlineDbService.getReferenceData('RadiologyImpressionConfig');
                };

                configurationFunctions.addressLevels = function () {
                    return offlineDbService.getReferenceData('AddressHierarchyLevels');
                };

                configurationFunctions.allTestsAndPanelsConcept = function () {
                    return offlineDbService.getReferenceData('AllTestsAndPanelsConcept');
                };

                configurationFunctions.identifierTypesConfig = function () {
                    return offlineDbService.getReferenceData('IdentifierTypes');
                };

                configurationFunctions.genderMap = function () {
                    return offlineDbService.getReferenceData('Genders');
                };

                configurationFunctions.relationshipTypeMap = function () {
                    return offlineDbService.getReferenceData('RelationshipTypeMap');
                };

                configurationFunctions.relationshipTypeConfig = function () {
                    return offlineDbService.getReferenceData('RelationshipType');
                };

                configurationFunctions.loginLocationToVisitTypeMapping = function () {
                    return offlineDbService.getReferenceData('LoginLocationToVisitTypeMapping');
                };

                configurationFunctions.loginLocationToEncounterTypeMapping = function () {
                    return offlineDbService.getReferenceData('LoginLocationToEncounterTypeMapping');
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
