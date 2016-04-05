'use strict';

angular.module('bahmni.orders')
.factory('initialization', ['$rootScope', '$q', 'appService', 'spinner', 'configurations', 'orderTypeService','locationService',
    function ($rootScope, $q, appService, spinner, configurations, orderTypeService, locationService) {

        var getConfigs = function () {
            var config = $q.defer();
            var configNames = ['encounterConfig', 'patientConfig', 'genderMap', 'relationshipTypeMap'];
            configurations.load(configNames).then(function () {
                var conceptConfig = appService.getAppDescriptor().getConfigValue("conceptSetUI");
                if(conceptConfig && conceptConfig.facilityLocationTags){
                   getLocationUuidsFromLocationTags(conceptConfig.facilityLocationTags);
                }
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig());
                $rootScope.patientConfig = configurations.patientConfig();
                $rootScope.genderMap = configurations.genderMap();
                $rootScope.relationshipTypeMap = configurations.relationshipTypeMap();
                config.resolve();
            });
            return config.promise;
        };

        var getLocationUuidsFromLocationTags = function (tags) {
            $rootScope.facilityLocationUuids = [];
            return locationService.getAllByTag(tags).then(function (response) {
                $rootScope.facilityLocationUuids = _.map(response.data.results, function (location) {
                    return location.uuid;
                });
            });
        };

        var initApp = function () {
            return appService.initApp('orders', {'app': true, 'extension' : true });
        };

        return spinner.forPromise(initApp().then(getConfigs()).then(orderTypeService.loadAll()));
    }
]);