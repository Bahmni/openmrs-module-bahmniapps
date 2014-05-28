'use strict';

angular.module('bahmni.clinical').factory('initialization',
    ['$rootScope', '$q', 'configurationService', 'authenticator', 'appService', 'spinner',
    function ($rootScope, $q, configurationService, authenticator, appService, spinner) {
        var getConfigs = function() {
            // var configNames = ['encounterConfig', 'patientConfig', 'dosageFrequencyConfig','dosageInstructionConfig', 'consultationNoteConfig','labOrderNotesConfig', 'ruledOutDiagnosisConfig', 'allTestsAndPanelsConcept'];
            var configNames = ['encounterConfig', 'consultationNoteConfig', 'labOrderNotesConfig', 'allTestsAndPanelsConcept'];
            return configurationService.getConfigurations(configNames).then(function (configurations) {
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig);
                $rootScope.consultationNoteConcept = configurations.consultationNoteConfig.results[0];
                $rootScope.labOrderNotesConcept = configurations.labOrderNotesConfig.results[0];
                $rootScope.allTestsAndPanelsConcept = configurations.allTestsAndPanelsConcept.results[0];
                // $rootScope.patientConfig = configurations.patientConfig;
                // $rootScope.dosageFrequencyConfig = configurations.dosageFrequencyConfig;
                // $rootScope.dosageInstructionConfig = configurations.dosageInstructionConfig;
                // $rootScope.ruledOutDiagnosisConcept = configurations.ruledOutDiagnosisConfig.results[0];
            });
        };

        var initApp = function() {
            return appService.initApp('clinical', {'app': true, 'extension' : true });
        };

        return spinner.forPromise(authenticator.authenticateUser().then(initApp).then(getConfigs));
    }]
);
