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
            
            return getActiveEncounter().then(function (consultation) {
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
