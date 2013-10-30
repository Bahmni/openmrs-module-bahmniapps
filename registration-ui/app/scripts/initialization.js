'use strict';

angular.module('registration.initialization', ['infrastructure', 'authentication', 'infrastructure.spinner'])
    .factory('initialization', ['$rootScope', '$q', 'configurationService', 'authenticator', 'spinner',
        function ($rootScope, $q, configurationService, authenticator, spinner) {
            var initializationPromiseDefer = $q.defer();

            var loadData = function () {
                var configurationPromise = configurationService.getAll().success(function (data) {
                    $rootScope.bahmniConfiguration = data;
                });

                var encounterConfigPromise = configurationService.getEncounterConfig().success(function (data) {
                    $rootScope.encounterConfiguration = angular.extend(new EncounterConfig(), data);
                });

                var patientConfigPromise = configurationService.getPatientConfig().success(function (data) {
                    $rootScope.patientConfiguration = angular.extend(new PatientConfig(), data);
                });

                return $q.all([configurationPromise, encounterConfigPromise, patientConfigPromise]);
            };

            authenticator.authenticateUser().then(function () {
                var loadDataPromise = loadData();
                spinner.forPromise(loadDataPromise);
                loadDataPromise.then(function () {
                    initializationPromiseDefer.resolve();
                });
            });
            return initializationPromiseDefer.promise;
        }]);