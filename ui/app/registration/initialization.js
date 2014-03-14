'use strict';

angular.module('bahmni.registration').factory('initialization',
    ['$rootScope', '$q', 'configurationService', 'authenticator', 'appService', 'spinner', 'Preferences',
    function ($rootScope, $q, configurationService, authenticator, appService, spinner, preferences) {
        var getConfigs = function() {
            var configNames = ['encounterConfig', 'patientAttributesConfig', 'identifierSourceConfig', 'addressLevels'];
            return configurationService.getConfigurations(configNames).then(function (configurations) {
                var patientConfig = new PatientConfig();
                var patientAttributeTypes = new PatientAttributeTypeMapper().mapFromOpenmrsPatientAttributeTypes(configurations.patientAttributesConfig.results);

                $rootScope.encounterConfiguration = angular.extend(new RegistrationEncounterConfig(), configurations.encounterConfig);
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
        }

        return spinner.forPromise(authenticator.authenticateUser().then(initApp).then(getConfigs).then(getIdentifierPrefix));
    }]
);