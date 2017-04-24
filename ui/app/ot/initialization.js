'use strict';

angular.module('bahmni.ot').factory('initialization', ['$rootScope', '$q', '$bahmniCookieStore', 'appService', 'configurations', 'authenticator', 'spinner', 'locationService',
    function ($rootScope, $q, $bahmniCookieStore, appService, configurations, authenticator, spinner, locationService) {
        var getConfigs = function () {
            var config = $q.defer();
            var configNames = ['encounterConfig', 'patientConfig', 'genderMap', 'relationshipTypeMap'];
            configurations.load(configNames).then(function () {
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig());
                $rootScope.patientConfig = configurations.patientConfig();
                $rootScope.genderMap = configurations.genderMap();
                $rootScope.relationshipTypeMap = configurations.relationshipTypeMap();
                $rootScope.diagnosisStatus = (appService.getAppDescriptor().getConfig("diagnosisStatus") && appService.getAppDescriptor().getConfig("diagnosisStatus").value || "RULED OUT");
                config.resolve();
            });
            return config.promise;
        };

        var initApp = function () {
            return appService.initApp('ot', {'app': true, 'extension': true}).then(function (data) {
                data.baseConfigs.dashboard.value.sections = _.sortBy(data.baseConfigs.dashboard.value.sections, function (section) {
                    return section.displayOrder;
                });
            });
        };

        return spinner.forPromise(authenticator.authenticateUser().then(initApp).then(getConfigs));
    }
]);
