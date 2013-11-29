'use strict';

angular.module('registration.initialization', ['infrastructure', 'authentication', 'infrastructure.spinner'])
    .factory('initialization', ['$rootScope', '$q', 'configurationService', 'authenticator', 'spinner', 'appService',
        function ($rootScope, $q, configurationService, authenticator, spinner, appService) {
            var initializationPromiseDefer = $q.defer();

            var loadData = function () {
                var configurationPromise = configurationService.getAll().success(function (data) {
                    $rootScope.bahmniConfiguration = data;
                });

                var encounterConfigPromise = configurationService.getEncounterConfig().success(function (data) {
                    $rootScope.encounterConfiguration = angular.extend(new EncounterConfig(), data);
                });

                var patientConfig = new PatientConfig();

                var patientConfigPromise = configurationService.getPatientConfig().success(function (data) {
                    $rootScope.patientConfiguration = angular.extend(patientConfig, data);
                });

                var identifierSourceConfigPromise = configurationService.getIdentifierSourceConfig().then(function (data) {
                    $rootScope.patientConfiguration = angular.extend(patientConfig, data);
                });

                var addressLevelsPromise = configurationService.getAddressLevels().success(function (data) {
                    $rootScope.addressLevels = data;
                });

                return $q.all([configurationPromise, encounterConfigPromise, patientConfigPromise, addressLevelsPromise, identifierSourceConfigPromise]);
            };

            authenticator.authenticateUser().then(function () {
                var appLoadOptions = {'app': true, 'extension': true};
                appService.initApp('registration', appLoadOptions).then(function (result) {
                    var loadDataPromise = loadData();
                    spinner.forPromise(loadDataPromise);
                    loadDataPromise.then(function () {
                        initializationPromiseDefer.resolve();
                    });
                });
            });
            return initializationPromiseDefer.promise;
        }]);