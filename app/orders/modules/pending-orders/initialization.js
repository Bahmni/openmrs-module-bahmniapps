'use strict';

angular.module('orders.pending').factory('initialization', ['$rootScope', '$q', 'configurationService', 'authenticator', 'appService', '$route',
    function ($rootScope, $q, configurationService, authenticator, appService, $route) {
        var appContext = $route.current.params["appContext"];
        var initializationPromise = $q.defer();

        var getConfigs = function () {
            var configurationsPromises = $q.defer();
            configurationService.getConfigurations(['radiologyObservationConfig','encounterConfig']).then(function (configurations) {
                $rootScope.encounterTypes = configurations.encounterConfig.encounterTypes;
                $rootScope.radiologyObservationConcept = configurations.radiologyObservationConfig.results[0];
                configurationsPromises.resolve();
            });
            return configurationsPromises.promise;
        };

        authenticator.authenticateUser().then(function () {
            getConfigs().then(function () {
                appService.initialize('clinical', appContext).then(function () {
                    initializationPromise.resolve();
                });
            });
        });

        return initializationPromise.promise;
    }]
);    