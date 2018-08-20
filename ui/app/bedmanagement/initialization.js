'use strict';

angular.module('bahmni.ipd').factory('initialization', ['$rootScope', '$q', '$bahmniCookieStore', 'appService', 'configurations', 'authenticator', 'spinner', 'locationService',
    function ($rootScope, $q, $bahmniCookieStore, appService, configurations, authenticator, spinner, locationService) {
        var getConfigs = function () {
            var config = $q.defer();
            var configNames = ['encounterConfig', 'patientConfig', 'genderMap', 'relationshipTypeMap'];
            configurations.load(configNames).then(function () {
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig());
                $rootScope.patientConfig = configurations.patientConfig();
                $rootScope.genderMap = configurations.genderMap();
                $rootScope.relationshipTypeMap = configurations.relationshipTypeMap();
                $rootScope.diagnosisStatus = ((appService.getAppDescriptor().getConfig("diagnosisStatus") && appService.getAppDescriptor().getConfig("diagnosisStatus").value) || "RULED OUT");
                config.resolve();
            });
            return config.promise;
        };

        var initApp = function () {
            return appService.initApp('ipd', {'app': true, 'extension': true}).then(function (data) {
                var config = data.getConfig("onAdmissionForwardTo", false);
                data.baseConfigs.dashboard.value.sections = _.sortBy(data.baseConfigs.dashboard.value.sections, function (section) {
                    return section.displayOrder;
                });
                data.baseConfigs.isBedManagementEnabled = {
                    name: 'isBedManagementEnabled',
                    value: _.includes(config[0].value, 'bed')
                };
                if (config[1]) {
                    data.customConfigs.isBedManagementEnabled = {
                        name: 'isBedManagementEnabled',
                        value: _.includes(config[1].value, 'bed')
                    };
                }
                initVisitLocation();
            });
        };

        var initVisitLocation = function () {
            var loginLocationUuid = $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid;
            locationService.getVisitLocation(loginLocationUuid).then(function (response) {
                if (response.data) {
                    $rootScope.visitLocationUuid = response.data.uuid;
                }
            });
        };
        return spinner.forPromise(authenticator.authenticateUser().then(initApp).then(getConfigs));
    }
]);
