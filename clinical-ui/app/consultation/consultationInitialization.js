'use strict';

angular.module('opd.consultation').factory('consultationInitialization',
    ['$rootScope', '$q', 'configurationService', 'visitService', 'patientService', 'patientMapper', 'authenticator', 'appService', 'encounterService', 'BedService', 'spinner', 'initialization',
    function ($rootScope, $q, configurationService, visitService, patientService, patientMapper, authenticator, appService, encounterService, bedService, spinner, initialization) {
        return function(patientUuid) {

            var getPatient = function() {
                return patientService.getPatient(patientUuid).success(function (openMRSPatient) {
                    $rootScope.patient = patientMapper.map(openMRSPatient);
                })
            };

            var getPatientBedDetails = function() {
                return bedService.getBedDetailsForPatient($rootScope.patient.uuid);
            }

            var getActiveEncounter = function() {
                var currentProviderUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                return encounterService.activeEncounter({ patientUuid : patientUuid, encounterTypeUuid : $rootScope.encounterConfig.getOpdConsultationEncounterTypeUuid(),providerUuid: currentProviderUuid, includeAll : true
                }).success(function (encounterTransaction) {
                    $rootScope.consultation = new Bahmni.Opd.ConsultationMapper(
                        $rootScope.dosageFrequencyConfig, $rootScope.dosageInstructionConfig, $rootScope.consultationNoteConcept, $rootScope.labOrderNotesConcept).map(encounterTransaction);
                    $rootScope.disposition = encounterTransaction.disposition || {};
                });
            };

            return spinner.forPromise(
                initialization.then(function(){
                    return $q.all([getActiveEncounter(),getPatient().then(getPatientBedDetails)]);
                 })
            );
        }
    }]
);
