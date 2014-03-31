'use strict';

angular.module('bahmni.registration').factory('visitPageInitialization',
    ['$rootScope', '$q', 'configurationService', 'authenticator', 'appService', 'spinner', 'Preferences','$route','patientService','encounterService','openmrsPatientMapper','$location',
        function ($rootScope, $q, configurationService, authenticator, appService, spinner, preferences,$route,patientService,encounterService,patientMapper,$location) {
            $rootScope.registration = $rootScope.registration||{};

            var patientUuid = $route.current.params['patientUuid'] ;

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


            var getPatient = function() {
                return patientService.get(patientUuid).success(function (openMRSPatient) {
                    $rootScope.registration.patient = patientMapper.map(openMRSPatient);
                    $rootScope.registration.patient.isNew = ($location.search()).newpatient;
                    $rootScope.registration.patient.name = openMRSPatient.person.names[0].display;
                    $rootScope.registration.patient.uuid = openMRSPatient.uuid;
                })
            };

            var getActiveEncounter = function(){

                var visitTypeUuid = $rootScope.encounterConfiguration.visitTypeId($rootScope.registration.patient.isNew);
                var encounterTypeUuid = $rootScope.encounterConfiguration.encounterTypes[constants.encounterType.registration];

                var encounterPromise = encounterService.getActiveEncounter($rootScope.registration.patient.uuid, visitTypeUuid, encounterTypeUuid, $rootScope.currentProvider.uuid)
                    .success(function (data) {
                        $rootScope.registration.encounter = data;

                    });
                return encounterPromise;
            }



            var initApp = function() {
                return appService.initApp('registration', {'app': true, 'extension' : true });
            };

            var getIdentifierPrefix = function() {
                preferences.identifierPrefix = appService.getAppDescriptor().getConfigValue("defaultIdentifierPrefix");
            }

            return spinner.forPromise(authenticator.authenticateUser().then(initApp).then(getConfigs).then(getIdentifierPrefix).then(getPatient).then(getActiveEncounter));
        }]
);