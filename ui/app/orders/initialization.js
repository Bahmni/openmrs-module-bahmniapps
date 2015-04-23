'use strict';

angular.module('bahmni.orders')
.factory('initialization', ['$rootScope', '$q', 'appService', 'spinner', 'configurations',
    function ($rootScope, $q, appService, spinner, configurations) {

        var getConfigs = function () {
            var config = $q.defer();
            var configNames = ['encounterConfig', 'patientConfig'];
            configurations.load(configNames).then(function () {
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig());
                $rootScope.patientConfig = configurations.patientConfig();
                config.resolve();
            });
            return config.promise;
        };

        var initApp = function () {
            return appService.initApp('orders', {'app': true, 'extension' : true });
        };

        return spinner.forPromise(initApp()).then(getConfigs());
    }
]);