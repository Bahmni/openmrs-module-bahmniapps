'use strict';

angular.module('bahmni.registration').factory('initialization',
    ['$rootScope', '$q', 'configurations', 'authenticator', 'appService', 'spinner', 'preferences', 'locationService', 'offlineService', 'offlineDbService', 'androidDbService', 'mergeService',
        function ($rootScope, $q, configurations, authenticator, appService, spinner, preferences, locationService, offlineService, offlineDbService, androidDbService, mergeService) {
            var getConfigs = function () {
                var configNames = ['encounterConfig', 'patientAttributesConfig', 'identifierTypesConfig', 'addressLevels', 'genderMap', 'relationshipTypeConfig', 'relationshipTypeMap', 'loginLocationToVisitTypeMapping'];
                return configurations.load(configNames).then(function () {
                    var mandatoryPersonAttributes = appService.getAppDescriptor().getConfigValue("mandatoryPersonAttributes");
                    var patientAttributeTypes = new Bahmni.Common.Domain.AttributeTypeMapper().mapFromOpenmrsAttributeTypes(configurations.patientAttributesConfig(), mandatoryPersonAttributes);
                    $rootScope.regEncounterConfiguration = angular.extend(new Bahmni.Registration.RegistrationEncounterConfig(), configurations.encounterConfig());
                    $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig());
                    $rootScope.patientConfiguration = new Bahmni.Registration.PatientConfig(patientAttributeTypes.attributeTypes,
                    configurations.identifierTypesConfig(), appService.getAppDescriptor().getConfigValue("patientInformation"));
                    $rootScope.regEncounterConfiguration.loginLocationToVisitTypeMap = configurations.loginLocationToVisitTypeMapping();

                    $rootScope.addressLevels = configurations.addressLevels();
                    $rootScope.fieldValidation = appService.getAppDescriptor().getConfigValue("fieldValidation");
                    $rootScope.genderMap = configurations.genderMap();
                    $rootScope.relationshipTypeMap = configurations.relationshipTypeMap();
                    $rootScope.relationshipTypes = configurations.relationshipTypes();
                });
            };

            var loadValidators = function (baseUrl, contextPath) {
                var script;
                var isOfflineApp = offlineService.isOfflineApp();
                if (isOfflineApp) {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    offlineDbService.getConfig("registration").then(function (config) {
                        script = config.value['fieldValidation.js'];
                        Bahmni.Common.Util.DynamicResourceLoader.includeJs(script, isOfflineApp);
                    });
                } else {
                    script = baseUrl + contextPath + '/fieldValidation.js';
                    Bahmni.Common.Util.DynamicResourceLoader.includeJs(script, isOfflineApp);
                }
            };

            var initApp = function () {
                return appService.initApp('registration', {'app': true, 'extension': true });
            };

            var getIdentifierPrefix = function () {
                preferences.identifierPrefix = appService.getAppDescriptor().getConfigValue("defaultIdentifierPrefix");
            };

            var initAppConfigs = function () {
                $rootScope.registration = $rootScope.registration || {};
                getIdentifierPrefix();
            };

            var mapRelationsTypeWithSearch = function () {
                var relationshipTypeMap = $rootScope.relationshipTypeMap || {};
                if (!relationshipTypeMap.provider) {
                    return "patient";
                }
                $rootScope.relationshipTypes.forEach(function (relationshipType) {
                    relationshipType.searchType = (relationshipTypeMap.provider.indexOf(relationshipType.aIsToB) > -1) ? "provider" : "patient";
                });
            };

            var loggedInLocation = function () {
                return locationService.getLoggedInLocation().then(function (location) {
                    $rootScope.loggedInLocation = location;
                });
            };

            var mergeFormConditions = function () {
                var formConditions = Bahmni.ConceptSet.FormConditions;
                if (formConditions) {
                    formConditions.rules = mergeService.merge(formConditions.rules, formConditions.rulesOverride);
                }
            };

            var loadFormConditionsIfOffline = function () {
                var isOfflineApp = offlineService.isOfflineApp();
                if (isOfflineApp) {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    return offlineDbService.getConfig("clinical").then(function (config) {
                        var script = config.value['formConditions.js'];
                        eval(script); // eslint-disable-line no-eval
                    });
                }
            };

            return function () {
                return spinner.forPromise(authenticator.authenticateUser()
                .then(initApp)
                .then(getConfigs)
                .then(initAppConfigs)
                .then(mapRelationsTypeWithSearch)
                .then(loggedInLocation)
                .then(loadValidators(appService.configBaseUrl(), "registration"))
                .then(loadFormConditionsIfOffline)
                .then(mergeFormConditions)
            );
            };
        }]
);
