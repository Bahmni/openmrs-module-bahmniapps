'use strict';

angular.module('bahmni.clinical').factory('consultationInitialization',
    ['diagnosisService', '$rootScope', 'encounterService', 'sessionService', 'configurations',
        function (diagnosisService, $rootScope, encounterService, sessionService, configurations) {
        return function (patientUuid) {

            var getActiveEncounter = function () {
                var currentProviderUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                var consultationMapper = new Bahmni.ConsultationMapper(configurations.dosageFrequencyConfig(), configurations.dosageInstructionConfig(),
                    configurations.consultationNoteConcept(), configurations.labOrderNotesConcept());
                return encounterService.activeEncounter({
                    patientUuid: patientUuid,
                    providerUuid: currentProviderUuid,
                    includeAll: Bahmni.Common.Constants.includeAllObservations,
                    locationUuid: sessionService.getLoginLocationUuid()
                }).then(function (encounterTransactionResponse) {
                        return consultationMapper.map(encounterTransactionResponse.data);
                    });
            };
            

            var getPastDiagnoses = function (encounterUuid) {
                return diagnosisService.getPastDiagnoses(patientUuid).then(function (response) {
                    var diagnosisMapper = new Bahmni.DiagnosisMapper();
                    var allDiagnoses = diagnosisMapper.mapDiagnoses(response.data);
                    var pastDiagnoses = diagnosisMapper.mapPastDiagnosis(allDiagnoses, encounterUuid);
                    var savedDiagnosesFromCurrentEncounter = diagnosisMapper.mapSavedDiagnosesFromCurrentEncounter(allDiagnoses, encounterUuid);
                    return {
                        "pastDiagnoses": pastDiagnoses,
                        "savedDiagnosesFromCurrentEncounter": savedDiagnosesFromCurrentEncounter
                    }
                });
            };
            
            return getActiveEncounter().then(function (consultation) {
                return getPastDiagnoses(consultation.encounterUuid).then(function (diagnosis) {
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
