'use strict';

angular.module('opd.bedManagement').factory('initialization',
    ['$rootScope', '$q', '$route', 'authenticator', 'BedService', 'patientService', 'patientMapper', 'configurationService',
        function ($rootScope, $q, $route, authenticator, bedService, patientService, patientMapper, configurationService) {
            var initializationPromise = $q.defer();

            if (!String.prototype.trim) {
                String.prototype.trim = function () {
                    return this.replace(/^\s+|\s+$/g, '');
                };
            }

            authenticator.authenticateUser().then(function () {
                configurationService.getConfigurations(['bahmniConfiguration', 'patientConfig']).then(function (configurations) {
                    $rootScope.bahmniConfiguration = configurations.bahmniConfiguration;
                    $rootScope.patientConfig = configurations.patientConfig;
                    $rootScope.encounterUuid = $route.current.params.encounterUuid;

                    return patientService.getPatient($route.current.params.patientUuid).success(function (openMRSPatient) {
                        $rootScope.patient = patientMapper.map(openMRSPatient);
                        bedService.getBedDetailsForPatient($route.current.params.patientUuid).then(function () {
                            initializationPromise.resolve();
                        });
                    });
                });
            });
        }]);
