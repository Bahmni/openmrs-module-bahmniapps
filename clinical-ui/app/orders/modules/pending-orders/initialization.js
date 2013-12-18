'use strict';

angular.module('orders.pending').factory('initialization', ['$rootScope', '$q', 'configurationService', 'authenticator', '$route', 'patientService', 'patientMapper',
    function ($rootScope, $q, configurationService, authenticator, $route,patientService,patientMapper) {
        var appContext = $route.current.params["appContext"];
        var patientUuid = $route.current.params["patientUuid"];

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

        var getPatient = function(patientUuid) {
            var patientDeferrable = $q.defer();
            patientService.getPatient(patientUuid).success(function (openMRSPatient) {
                $rootScope.patient = patientMapper.map(openMRSPatient);
                patientDeferrable.resolve();
            });
            return patientDeferrable.promise;
        };

        authenticator.authenticateUser().then(function () {
            getConfigs().then(function () {
                 getPatient(patientUuid).then(function(){
                     initializationPromise.resolve();
                 })
            });
        });

        return initializationPromise.promise;
    }]
);    