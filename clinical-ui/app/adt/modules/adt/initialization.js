'use strict';

angular.module('opd.adt').factory('initialization',
    ['$rootScope', '$q', '$route', 'appService', 'configurationService', 'visitService', 'patientService', 'patientMapper',
        'conceptSetService', 'authenticator',
        function ($rootScope, $q, $route, appService, configurationService, visitService, patientService, patientMapper,
                  conceptSetService, authenticator) {
            var initializationPromise = $q.defer();

            var getVisit = function() {
                return visitService.getVisit($route.current.params.visitUuid).success(function (visit) {
                    $rootScope.visit = visit;
                });
            };

            var getPatient = function(visitResponse) {
                var visit = visitResponse.data;
                return patientService.getPatient(visit.patient.uuid).success(function (openMRSPatient) {
                    $rootScope.patient = patientMapper.map(openMRSPatient);
                });
            };

            var getPatientVisitInfo = function() {
                return getVisit().then(getPatient);
            };


            var getConsultationConfigs = function () {
                var configNames = ['encounterConfig', 'patientConfig'];
                return configurationService.getConfigurations(configNames).then(function (configurations) {
                    $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig);
                    $rootScope.patientConfig = configurations.patientConfig;
                });
            };

            var getConfigAndVisitInfo = function() {
                var deferrables = $q.defer();
                var promises = [];
                promises.push(getConsultationConfigs());
                promises.push(getPatientVisitInfo());
                $q.all(promises).then(function() {
                    deferrables.resolve();
                });
                return deferrables.promise;
            };

            var initApp = function() {
                return appService.initApp('adt');
            };


            authenticator.authenticateUser().then(initApp).then(getConfigAndVisitInfo).then(function() {
                initializationPromise.resolve();
            });

            return initializationPromise.promise;
        }]
);
