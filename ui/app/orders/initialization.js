'use strict';

angular.module('bahmni.orders')
.factory('initialization', ['$rootScope', '$q', 'appService', 'spinner', 'configurations', 'orderTypeService', 'locationService',
    function ($rootScope, $q, appService, spinner, configurations, orderTypeService, locationService) {
        var getConfigs = function () {
            var config = $q.defer();
            var configNames = ['encounterConfig', 'patientConfig', 'genderMap', 'relationshipTypeMap', 'quickLogoutComboKey', 'contextCookieExpirationTimeInMinutes'];
            configurations.load(configNames).then(function () {
                var conceptConfig = appService.getAppDescriptor().getConfigValue("conceptSetUI");
                var customLocationTags = _.get(conceptConfig, 'facilityLocationTags');
                var hasCustomLocationTags = !_.isEmpty(customLocationTags);
                if (hasCustomLocationTags) {
                    getLocationUuidsFromLocationTags(customLocationTags);
                }
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig());
                $rootScope.patientConfig = configurations.patientConfig();
                $rootScope.genderMap = configurations.genderMap();
                $rootScope.relationshipTypeMap = configurations.relationshipTypeMap();
                $rootScope.quickLogoutComboKey = configurations.quickLogoutComboKey() || 'Escape';
                $rootScope.cookieExpiryTime = configurations.contextCookieExpirationTimeInMinutes() || 0;
                config.resolve();
            });
            return config.promise;
        };

        var getLocationUuidsFromLocationTags = function (tags) {
            $rootScope.facilityLocationUuids = [];
            return locationService.getAllByTag(tags, "ANY").then(function (response) {
                $rootScope.facilityLocationUuids = _.map(response.data.results, function (location) {
                    return location.uuid;
                });
            });
        };

        var checkPrivilege = function () {
            return appService.checkPrivilege("app:radiologyOrders");
        };

        var initApp = function () {
            return appService.initApp('orders', {'app': true, 'extension': true });
        };

        return spinner.forPromise(initApp().then(checkPrivilege).then(getConfigs()).then(orderTypeService.loadAll()));
    }
]);
