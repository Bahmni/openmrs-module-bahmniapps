'use strict';

angular.module('bahmni.clinical').factory('consultationInitialization',
    ['$q', 'diagnosisService', '$rootScope', 'encounterService', 'sessionService', 'configurations', '$bahmniCookieStore',
        function ($q, diagnosisService, $rootScope, encounterService, sessionService, configurations, $bahmniCookieStore) {
            return function (patientUuid, encounterUuid, programUuid) {

                if(encounterUuid == 'active') {
                    encounterUuid = undefined;
                }

                var getEncounterType = function() {
                    return encounterService.getEncounterType(programUuid);
                };

                var consultationMapper = new Bahmni.ConsultationMapper(configurations.dosageFrequencyConfig(), configurations.dosageInstructionConfig(),
                    configurations.consultationNoteConcept(), configurations.labOrderNotesConcept());

                var dateUtil = Bahmni.Common.Util.DateUtil;

                var getActiveEncounter = function () {
                    var currentProviderUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                    var providerData = $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
                    var encounterDate = dateUtil.parseLongDateToServerFormat(new Date());
                    return findEncounter(providerData, currentProviderUuid, encounterDate, []);
                };

                var getRetrospectiveEncounter = function () {
                    var currentProviderUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                    var providerData = $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
                    var encounterDate = dateUtil.parseLongDateToServerFormat(dateUtil.getDateWithoutHours($rootScope.retrospectiveEntry.encounterDate));
                    return findEncounter(providerData, currentProviderUuid, encounterDate);
                };

                var findEncounter= function(providerData, currentProviderUuid, encounterDate) {
                    return getEncounterType().then(function (encounterType) {
                        return encounterService.find({
                            patientUuid: patientUuid,
                            providerUuids: !_.isEmpty(providerData) ? [providerData.uuid] : [currentProviderUuid],
                            includeAll: Bahmni.Common.Constants.includeAllObservations,
                            encounterDateTimeFrom: encounterDate,
                            encounterDateTimeTo: encounterDate,
                            encounterTypeUuids: [encounterType.uuid]
                        }).then(function (encounterTransactionResponse) {
                            return consultationMapper.map(encounterTransactionResponse.data);
                        });
                    });
                };

                var getEncounter = function () {
                     if(encounterUuid){
                        return encounterService.findByEncounterUuid(encounterUuid).then(function(response){
                            return consultationMapper.map(response.data);
                        });
                    }else if ($rootScope.retrospectiveEntry.isRetrospective ) {
                        return getRetrospectiveEncounter();
                    }
                    return getActiveEncounter();
                };

                return getEncounter().then(function (consultation) {
                    return diagnosisService.getPastAndCurrentDiagnoses(patientUuid, consultation.encounterUuid).then(function (diagnosis) {
                        consultation.pastDiagnoses = diagnosis.pastDiagnoses;
                        consultation.savedDiagnosesFromCurrentEncounter = diagnosis.savedDiagnosesFromCurrentEncounter;
                        consultation.saveHandler = new Bahmni.Clinical.SaveHandler();
                        consultation.postSaveHandler = new Bahmni.Clinical.SaveHandler();
                        return consultation;
                    })
                });
            }
        }]
);
