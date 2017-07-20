'use strict';

angular.module('bahmni.clinical').factory('consultationInitialization',
    ['$q', 'diagnosisService', '$rootScope', 'encounterService', 'sessionService', 'configurations', '$bahmniCookieStore', 'retrospectiveEntryService', 'conditionsService',
        function ($q, diagnosisService, $rootScope, encounterService, sessionService, configurations, $bahmniCookieStore, retrospectiveEntryService, conditionsService) {
            return function (patientUuid, encounterUuid, programUuid, enrollment, followUpConditionConcept) {
                if (encounterUuid === 'active') {
                    encounterUuid = undefined;
                }

                var getEncounterType = function () {
                    return encounterService.getEncounterType(programUuid, sessionService.getLoginLocationUuid());
                };

                var consultationMapper = new Bahmni.ConsultationMapper(configurations.dosageFrequencyConfig(), configurations.dosageInstructionConfig(),
                    configurations.consultationNoteConcept(), configurations.labOrderNotesConcept(), followUpConditionConcept);

                var dateUtil = Bahmni.Common.Util.DateUtil;

                var getActiveEncounter = function () {
                    var currentProviderUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                    var providerData = $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
                    return findEncounter(providerData, currentProviderUuid, null);
                };

                var getRetrospectiveEncounter = function () {
                    var currentProviderUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                    var providerData = $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
                    var encounterDateWithoutHours = dateUtil.getDateWithoutHours(retrospectiveEntryService.getRetrospectiveDate());
                    var encounterDate = dateUtil.parseLongDateToServerFormat(encounterDateWithoutHours);
                    return findEncounter(providerData, currentProviderUuid, encounterDate).then(function (consultation) {
                        consultation.encounterDateTime = encounterDateWithoutHours;
                        return consultation;
                    });
                };

                var findEncounter = function (providerData, currentProviderUuid, encounterDate) {
                    return getEncounterType().then(function (encounterType) {
                        return encounterService.find({
                            patientUuid: patientUuid,
                            providerUuids: !_.isEmpty(providerData) ? [providerData.uuid] : [currentProviderUuid],
                            includeAll: Bahmni.Common.Constants.includeAllObservations,
                            encounterDateTimeFrom: encounterDate,
                            encounterDateTimeTo: encounterDate,
                            encounterTypeUuids: [encounterType.uuid],
                            patientProgramUuid: enrollment,
                            locationUuid: $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid
                        }).then(function (encounterTransactionResponse) {
                            return consultationMapper.map(encounterTransactionResponse.data);
                        });
                    });
                };

                var getEncounter = function () {
                    if (encounterUuid) {
                        return encounterService.findByEncounterUuid(encounterUuid).then(function (response) {
                            return consultationMapper.map(response.data);
                        });
                    } else if (!_.isEmpty($rootScope.retrospectiveEntry)) {
                        return getRetrospectiveEncounter();
                    }
                    return getActiveEncounter();
                };

                return getEncounter().then(function (consultation) {
                    return diagnosisService.populateDiagnosisInformation(patientUuid, consultation).then(function (diagnosisConsultation) {
                        diagnosisConsultation.preSaveHandler = new Bahmni.Clinical.Notifier();
                        diagnosisConsultation.postSaveHandler = new Bahmni.Clinical.Notifier();
                        return diagnosisConsultation;
                    });
                }).then(function (consultation) {
                    return conditionsService.getConditions(patientUuid).then(function (conditions) {
                        consultation.conditions = conditions;
                        return consultation;
                    });
                });
            };
        }]
);
