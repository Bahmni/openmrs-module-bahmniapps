'use strict';

angular.module('opd.adt').factory('initialization',
    ['$rootScope', '$q', '$route', 'appService', 'configurationService', 'visitService', 'patientService', 'patientMapper',
        'ConceptSetService', 'authenticator',
        function ($rootScope, $q, $route, appService, configurationService, visitService, patientService, patientMapper,
                  conceptSetService, authenticator) {
            var initializationPromise = $q.defer();

            if (!String.prototype.trim) {
                String.prototype.trim = function () {
                    return this.replace(/^\s+|\s+$/g, '');
                };
            }

            var getConsultationConfigs = function () {
                var configurationsPromises = $q.defer();
                var configNames = ['bahmniConfiguration', 'encounterConfig', 'patientConfig'];
                configurationService.getConfigurations(configNames).then(function (configurations) {
                    $rootScope.bahmniConfiguration = configurations.bahmniConfiguration;
                    $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig);
                    $rootScope.patientConfig = configurations.patientConfig;

                    return visitService.getVisit($route.current.params.visitUuid).success(function (visit) {
                        $rootScope.visit = visit;
                        return patientService.getPatient(visit.patient.uuid).success(function (openMRSPatient) {
                            $rootScope.patient = patientMapper.map(openMRSPatient);
                            configurationsPromises.resolve();
                        });

                    })
                });
                return configurationsPromises.promise;
            };

            authenticator.authenticateUser().then(function () {
                var configPromise = getConsultationConfigs();
                configPromise.then(function () {
                    appService.initApp('adt', {'extension' : true}).then(function () {
                        initializationPromise.resolve();
                    });
                });
            });

            return initializationPromise.promise;
        }]
);
