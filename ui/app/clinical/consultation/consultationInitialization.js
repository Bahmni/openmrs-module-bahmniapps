'use strict';

angular.module('bahmni.clinical').factory('consultationInitialization',
    ['diagnosisService', '$rootScope', 'encounterService', 'sessionService', 'configurations', '$bahmniCookieStore',
        function (diagnosisService, $rootScope, encounterService, sessionService, configurations, $bahmniCookieStore) {
            return function (patientUuid, encounterUuid) {

                var getActiveEncounter = function () {
                    var currentProviderUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                    var providerData = $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
                    var consultationMapper = new Bahmni.ConsultationMapper(configurations.dosageFrequencyConfig(), configurations.dosageInstructionConfig(),
                        configurations.consultationNoteConcept(), configurations.labOrderNotesConcept());
                    return encounterService.activeEncounter({
                        patientUuid: patientUuid,
                        providerUuid: providerData ? providerData.uuid : currentProviderUuid,
                        includeAll: Bahmni.Common.Constants.includeAllObservations,
                        locationUuid: sessionService.getLoginLocationUuid()
                    }).then(function (encounterTransactionResponse) {
                        return consultationMapper.map(encounterTransactionResponse.data);
                    });
                };

                var getRetrospectiveEncounter = function () {
                    var currentProviderUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                    var providerData = $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
                    var consultationMapper = new Bahmni.ConsultationMapper(configurations.dosageFrequencyConfig(), configurations.dosageInstructionConfig(),
                        configurations.consultationNoteConcept(), configurations.labOrderNotesConcept());
                    var dateUtil = Bahmni.Common.Util.DateUtil;
                    if(encounterUuid){
                        return encounterService.findByEncounterUuid(encounterUuid).then(function(response){
                            return consultationMapper.map(response.data);
                        });
                    }
                    var encounterDate = dateUtil.parseLongDateToServerFormat(dateUtil.getDateWithoutHours($rootScope.retrospectiveEntry.encounterDate));
                    return encounterService.find({
                        patientUuid: patientUuid,
                        providerUuids: providerData ? [providerData.uuid] : [currentProviderUuid],
                        includeAll: Bahmni.Common.Constants.includeAllObservations,
                        encounterDateTimeFrom: encounterDate,
                        encounterDateTimeTo: encounterDate
                    }).then(function (encounterTransactionResponse) {
                        return consultationMapper.map(encounterTransactionResponse.data[0]);
                    });
                };

                var getEncounter = function () {
                    if ($rootScope.retrospectiveEntry.isRetrospective || encounterUuid) {
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
