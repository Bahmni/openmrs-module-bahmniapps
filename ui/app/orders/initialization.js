'use strict';

angular.module('bahmni.orders').factory('initialization', ['$rootScope', '$q', 'configurationService', 'authenticator', 'patientService', 'spinner',
    function ($rootScope, $q, configurationService, authenticator, patientService, spinner) {
        return function(appContext, patientUuid) {

            var patientMapper = new Bahmni.PatientMapper($rootScope.patientConfig);

            var initializationPromise = $q.defer();
            var getConfigs = function () {
                var configurationsPromises = $q.defer();
                configurationService.getConfigurations(['radiologyObservationConfig','encounterConfig']).then(function (configurations) {
                    $rootScope.encounterTypes = configurations.encounterConfig.encounterTypes;
                    $rootScope.orderTypes = configurations.encounterConfig.orderTypes;
                    $rootScope.radiologyObservationConcept = configurations.radiologyObservationConfig.results[0];
                    configurationsPromises.resolve();
                });
                return configurationsPromises.promise;
            };

            var getPatient = function(patientUuid) {
                var patientDeferrable = $q.defer();
                patientService.getPatient(patientUuid).then(function (openMRSPatientResponse) {
                    $rootScope.patient = patientMapper.map(openMRSPatientResponse.data);
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

            return spinner.forPromise(initializationPromise.promise);
        };
    }]
);    