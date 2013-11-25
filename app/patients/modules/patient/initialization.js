'use strict';

angular.module('opd.patient').factory('initialization', ['$rootScope', '$q', 'configurationService', 'authenticator', 'appService', '$route',
    function ($rootScope, $q, configurationService, authenticator, appService, $route) {
        var appContext = $route.current.params["appContext"];
        var initializationPromise = $q.defer();

        var getConfigs = function () {
            var configurationsPromises = $q.defer();
            configurationService.getConfigurations(['bahmniConfiguration']).then(function (configurations) {
                $rootScope.bahmniConfiguration = configurations.bahmniConfiguration;
                configurationsPromises.resolve();
            });
            return configurationsPromises.promise;
        };

        authenticator.authenticateUser().then(function () {
            getConfigs().then(function () {
                appService.initialize('patientsearch', appContext).then(function () {
                    initializationPromise.resolve();
                });
            });
        });

        return initializationPromise.promise;
    }]
);    