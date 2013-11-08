'use strict';

angular.module('opd.patient').factory('initialization', ['$rootScope', '$q', 'configurationService', 'authenticator','appService',
        function ($rootScope, $q, configurationService, authenticator, appService) {
            var initializationPromise = $q.defer();

            var getConfigs = function() {
            	var configurationsPromises = $q.defer();
            	configurationService.getConfigurations(['bahmniConfiguration']).then(function(configurations) {
	                $rootScope.bahmniConfiguration = configurations.bahmniConfiguration;
	                configurationsPromises.resolve();
	            });
            	return configurationsPromises.promise;
            };

            authenticator.authenticateUser().then(function () {
                appService.initialize('patientsearch').then(function() {
                    getConfigs().then(function() {
                        initializationPromise.resolve();
                    });
                });
            });

            return initializationPromise.promise;
     }]
);    