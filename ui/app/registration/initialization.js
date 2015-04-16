'use strict';

angular.module('bahmni.registration').factory('initialization',
    ['$rootScope', '$q', 'configurations', 'authenticator', 'appService', 'spinner', 'Preferences',
    function ($rootScope, $q, configurations, authenticator, appService, spinner, preferences) {
        var getConfigs = function() {
            var configNames = ['encounterConfig', 'patientAttributesConfig', 'identifierSourceConfig', 'addressLevels'];
            return configurations.load(configNames).then(function () {
                var mandatoryPersonAttributes = appService.getAppDescriptor().getConfigValue("mandatoryPersonAttributes");
                var patientAttributeTypes = new Bahmni.Registration.PatientAttributeTypeMapper().mapFromOpenmrsPatientAttributeTypes(configurations.patientAttributesConfig(), mandatoryPersonAttributes);
                $rootScope.regEncounterConfiguration = angular.extend(new Bahmni.Registration.RegistrationEncounterConfig(), configurations.encounterConfig());
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig());
                $rootScope.patientConfiguration = new Bahmni.Registration.PatientConfig(patientAttributeTypes.personAttributeTypes, configurations.identifierSourceConfig(), appService.getAppDescriptor().getConfigValue("additionalPatientInformation"));

                $rootScope.addressLevels = configurations.addressLevels();
                $rootScope.fieldValidation = appService.getAppDescriptor().getConfigValue("fieldValidation");
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