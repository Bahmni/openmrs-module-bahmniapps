'use strict';

angular.module('bahmni.registration').factory('initialization',
    ['$rootScope', '$q', 'configurationService', 'authenticator', 'appService', 'spinner', 'Preferences',
    function ($rootScope, $q, configurationService, authenticator, appService, spinner, preferences) {
        var getConfigs = function() {
            var configNames = ['encounterConfig', 'patientAttributesConfig', 'identifierSourceConfig', 'addressLevels'];
            return configurationService.getConfigurations(configNames).then(function (configurations) {
                var patientConfig = new Bahmni.Registration.PatientConfig();
                var patientAttributeTypes = new Bahmni.Registration.PatientAttributeTypeMapper().mapFromOpenmrsPatientAttributeTypes(configurations.patientAttributesConfig.results);

                $rootScope.regEncounterConfiguration = angular.extend(new Bahmni.Registration.RegistrationEncounterConfig(), configurations.encounterConfig);
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig);
                $rootScope.patientConfiguration = angular.extend(patientConfig, patientAttributeTypes);
                $rootScope.patientConfiguration = angular.extend(patientConfig, {identifierSources: configurations.identifierSourceConfig});            
                $rootScope.addressLevels = configurations.addressLevels;
            });
        };


        var initApp = function() {
            return appService.initApp('registration', {'app': true, 'extension' : true });
        };

        var getIdentifierPrefix = function() {
            preferences.identifierPrefix = appService.getAppDescriptor().getConfigValue("defaultIdentifierPrefix");
        };

        var initAppConfigs = function(){
            $rootScope.registration = $rootScope.registration ||{};
            getIdentifierPrefix();
        };
        return spinner.forPromise(authenticator.authenticateUser().then(initApp).then(getConfigs).then(initAppConfigs));
    }]
);