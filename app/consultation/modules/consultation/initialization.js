'use strict';

angular.module('opd.consultation').factory('initialization',
    ['$rootScope', '$route', 'configurationService', 'visitService', 'patientService', 'patientMapper', 'authenticator', 'appService', 'encounterService',
    function ($rootScope, $route, configurationService, visitService, patientService, patientMapper, authenticator, appService,encounterService) {
        var getConsultationConfigs = function() {
            var configNames = ['encounterConfig', 'patientConfig', 'dosageFrequencyConfig','dosageInstructionConfig', 'consultationNoteConfig'];
            return configurationService.getConfigurations(configNames).then(function (configurations) {
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig);
                $rootScope.patientConfig = configurations.patientConfig;
                $rootScope.dosageFrequencyConfig = configurations.dosageFrequencyConfig;
                $rootScope.dosageInstructionConfig = configurations.dosageInstructionConfig;
                $rootScope.consultationNoteConcept = configurations.consultationNoteConfig.results[0];
            });
        };

        var getVisit = function() {
            return visitService.getVisit($route.current.params.visitUuid).success(function (visit) {
                $rootScope.visit = visit;
            });
        };

        var getPatient = function(visitResponse) {
            var visit = visitResponse.data;
            return patientService.getPatient(visit.patient.uuid).success(function (openMRSPatient) {
                $rootScope.patient = patientMapper.map(openMRSPatient);
            });
        };


        var getActiveEncounter = function() {
            var visit = $rootScope.visit;
            return encounterService.activeEncounter(visit.patient.uuid,$rootScope.encounterConfig.getOpdConsultationEncounterUuid(),visit.visitType.uuid,true).success(function (encounterTransaction) {
                $rootScope.activeEncounterTransaction = encounterTransaction;
                $rootScope.consultation = new Bahmni.Opd.ConsultationMapper($rootScope.encounterConfig,
                    $rootScope.dosageFrequencyConfig, $rootScope.dosageInstructionConfig, $rootScope.consultationNoteConcept).map(encounterTransaction);
                    $rootScope.disposition = encounterTransaction.disposition || {};
            });
        };

        var initApp = function() {
            return appService.initApp('clinical', {'extension' : true});
        };

        return authenticator.authenticateUser().then(initApp).then(getConsultationConfigs)
                            .then(getVisit).then(getPatient).then(getActiveEncounter);
    }]
);




