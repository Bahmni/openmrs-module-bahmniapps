'use strict';

angular.module('opd.infrastructure.services')
    .factory('initialization', ['$rootScope', '$q', 'configurationService',
        function ($rootScope, $q, configurationService) {
            var initializationPromiseDefer = $q.defer();

            var loadData = function () {
                var configurationPromise = configurationService.getAll().success(function (data) {
                    $rootScope.bahmniConfiguration = data;
                });

                var encounterConfigPromise = configurationService.getEncounterConfig().success(function (data) {
                    $rootScope.encounterConfig = angular.extend(new EncounterConfig(), data);
                });

                return $q.all([configurationPromise, encounterConfigPromise]);
            };

            var loadDataPromise = loadData();
            loadDataPromise.then(function () {
                initializationPromiseDefer.resolve();
            });

            return initializationPromiseDefer.promise;
        }]);