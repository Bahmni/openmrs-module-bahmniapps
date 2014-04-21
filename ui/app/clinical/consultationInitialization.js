'use strict';

angular.module('bahmni.clinical').factory('consultationInitialization',
    ['$rootScope', '$q', 'configurationService', 'visitService', 'patientService', 'patientMapper', 'authenticator', 'appService', 'encounterService', 'bedService', 'spinner', 'initialization', 'diagnosisService',
    function ($rootScope, $q, configurationService, visitService, patientService, patientMapper, authenticator, appService, encounterService, bedService, spinner, initialization, diagnosisService) {
        return function(patientUuid) {

            var getPatient = function() {
                return patientService.getPatient(patientUuid).success(function (openMRSPatient) {
                    $rootScope.patient = patientMapper.map(openMRSPatient);
                })
            };

            var getPatientBedDetails = function() {
                return bedService.getBedDetailsForPatient($rootScope.patient.uuid);
            };

            var getActiveEncounter = function() {
                var currentProviderUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                return encounterService.activeEncounter({ 
                    patientUuid : patientUuid,
                    encounterTypeUuid : $rootScope.encounterConfig.getOpdConsultationEncounterTypeUuid(),
                    providerUuid: currentProviderUuid,
                    includeAll :  Bahmni.Common.Constants.includeAllObservations
                }).success(function (encounterTransaction) {
                    $rootScope.consultation = new Bahmni.ConsultationMapper(
                        $rootScope.dosageFrequencyConfig, $rootScope.dosageInstructionConfig, $rootScope.consultationNoteConcept, $rootScope.labOrderNotesConcept).map(encounterTransaction);
                    $rootScope.disposition = encounterTransaction.disposition || {};
                });
            };

            var getPastDiagnoses = function() {
                return diagnosisService.getPastDiagnoses(patientUuid).success(function (response) {
                    var diagnosisMapper = new Bahmni.DiagnosisMapper();
                    $rootScope.allDiagnoses = diagnosisMapper.mapDiagnoses(response); 
                    $rootScope.consultation.pastDiagnoses = diagnosisMapper.mapPastDiagnosis($rootScope.allDiagnoses, $rootScope.consultation.encounterUuid);
                    $rootScope.consultation.savedDiagnosesFromCurrentEncounter = diagnosisMapper.mapSavedDiagnosesFromCurrentEncounter($rootScope.allDiagnoses, $rootScope.consultation.encounterUuid);
                });
            };

            return spinner.forPromise(
                initialization.then(function(){
                    return $q.all([getActiveEncounter().then(getPastDiagnoses),getPatient().then(getPatientBedDetails)]);
                 })
            );
        }
    }]
);
