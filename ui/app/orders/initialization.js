'use strict';

angular.module('bahmni.orders')
.factory('initialization', ['$rootScope', '$q', 'appService', 'spinner', 'configurations', 'orderTypeService',
    function ($rootScope, $q, appService, spinner, configurations, orderTypeService) {

        var getConfigs = function () {
            var config = $q.defer();
            var configNames = ['encounterConfig', 'patientConfig', 'genderMap', 'relationshipTypeMap'];
            configurations.load(configNames).then(function () {
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig());
                $rootScope.patientConfig = configurations.patientConfig();
                $rootScope.genderMap = configurations.genderMap();
                $rootScope.relationshipTypeMap = configurations.relationshipTypeMap();
                config.resolve();
            });
            return config.promise;
        };

        var initApp = function () {
            return appService.initApp('orders', {'app': true, 'extension' : true });
        };

        return spinner.forPromise(initApp().then(getConfigs()).then(orderTypeService.loadAll()));
    }
]);