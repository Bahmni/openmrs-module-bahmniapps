'use strict';

angular.module('opd.consultation').factory('initialization',
    ['$rootScope', '$route', '$q', 'configurationService', 'visitService', 'patientService', 'patientMapper', 'authenticator', 'appService', 'encounterService', 'BedService', 'spinner',
    function ($rootScope, $route, $q, configurationService, visitService, patientService, patientMapper, authenticator, appService, encounterService, bedService, spinner) {
        var patientUuid = $route.current.params.patientUuid;

        var getConsultationConfigs = function() {
            var configNames = ['encounterConfig', 'patientConfig', 'dosageFrequencyConfig','dosageInstructionConfig', 'consultationNoteConfig','labOrderNotesConfig'];
            return configurationService.getConfigurations(configNames).then(function (configurations) {
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig);
                $rootScope.patientConfig = configurations.patientConfig;
                $rootScope.dosageFrequencyConfig = configurations.dosageFrequencyConfig;
                $rootScope.dosageInstructionConfig = configurations.dosageInstructionConfig;
                $rootScope.consultationNoteConcept = configurations.consultationNoteConfig.results[0];
                $rootScope.labOrderNotesConcept = configurations.labOrderNotesConfig.results[0];
            });
        };

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

        var initApp = function() {
            return appService.initApp('clinical', {'app': true, 'extension' : true });
        };

        return spinner.forPromise(
            authenticator.authenticateUser()
            .then(initApp)
            .then(getConsultationConfigs)
            .then(function(){
                return $q.all([
                    getActiveEncounter(),
                    getPatient().then(getPatientBedDetails)
                ])
            })
        );
    }]
);
