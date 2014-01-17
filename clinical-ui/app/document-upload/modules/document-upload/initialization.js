'use strict';

angular.module('opd.documentupload').factory('initialization',
    ['$rootScope', '$q', '$route', 'configurationService', 'patientService', 'patientMapper', 'authenticator',
        function ($rootScope, $q, $route, configurationService, patientService, patientMapper, authenticator) {

            var initializationPromise = $q.defer();

            var getPatient = function () {
                return patientService.getPatient($route.current.params.patientUuid).success(function (openMRSPatient) {
                    $rootScope.patient = patientMapper.map(openMRSPatient);
                });
            };

            var getConsultationConfigs = function () {
                var configNames = ['encounterConfig', 'patientConfig'];
                return configurationService.getConfigurations(configNames).then(function (configurations) {
                    $rootScope.patientConfig = configurations.patientConfig;
                    $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig);
                });
            };

            var getConfigAndPatientInfo = function () {
                var deferrables = $q.defer();
                var promises = [];
                promises.push(getConsultationConfigs());
                promises.push(getPatient());
                $q.all(promises).then(function () {
                    deferrables.resolve();
                });
                return deferrables.promise;
            };

            authenticator.authenticateUser().then(getConfigAndPatientInfo).then(function () {
                initializationPromise.resolve();
            });

            return initializationPromise.promise;
        }]
);
