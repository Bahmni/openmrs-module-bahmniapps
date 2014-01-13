'use strict';

angular.module('opd.consultation').factory('initialization',
    ['$rootScope', '$route', '$q', 'configurationService', 'visitService', 'patientService', 'patientMapper', 'authenticator', 'appService', 'encounterService', 'spinner',
    function ($rootScope, $route, $q, configurationService, visitService, patientService, patientMapper, authenticator, appService, encounterService, spinner) {
        var patientUuid = $route.current.params.patientUuid;

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

        var getPatient = function() {
            return patientService.getPatient(patientUuid).success(function (openMRSPatient) {
                $rootScope.patient = patientMapper.map(openMRSPatient);
            });
        };


        var getActiveEncounter = function() {
            return encounterService.activeEncounter({ patientUuid : patientUuid, encounterTypeUuid : $rootScope.encounterConfig.getOpdConsultationEncounterTypeUuid(),providerUuid : $rootScope.currentProvider.uuid,includeAll : true
                }).success(function (encounterTransaction) {
                    $rootScope.consultation = new Bahmni.Opd.ConsultationMapper($rootScope.encounterConfig,
                    $rootScope.dosageFrequencyConfig, $rootScope.dosageInstructionConfig, $rootScope.consultationNoteConcept).map(encounterTransaction);
                    $rootScope.disposition = encounterTransaction.disposition || {};
            });
        };

        var initApp = function() {
            return appService.initApp('clinical', {'app': true, 'extension' : true });
        };

        return spinner.forPromise(authenticator.authenticateUser().then(initApp).then(getConsultationConfigs)
                            .then(function(){
                                return $q.all([getActiveEncounter(), getPatient()])
                            }));
    }]
);




