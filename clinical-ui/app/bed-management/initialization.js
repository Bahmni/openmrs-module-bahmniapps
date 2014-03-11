'use strict';

angular.module('bahmni.bedManagement').factory('initialization',
    ['$rootScope', '$route', 'authenticator', 'BedService', 'patientService', 'patientMapper', 'configurationService',
        function ($rootScope, $route, authenticator, bedService, patientService, patientMapper, configurationService) {
            var bedDetailsForPatient = function (response) {
                    var openMRSPatient = response.data;
                    $rootScope.patient = patientMapper.map(openMRSPatient);
                    return bedService.getBedDetailsForPatient($route.current.params.patientUuid);
                },
                getPatient = function (configurations) {
                    $rootScope.patientConfig = configurations.patientConfig;
                    $rootScope.encounterConfig = configurations.encounterConfig;
                    return patientService.getPatient($route.current.params.patientUuid);
                },
                getConfigurations = function () {
                    return configurationService.getConfigurations(['patientConfig', 'encounterConfig']);
                },
                authenticate = function () {
                    return authenticator.authenticateUser();
                };

            authenticate().then(getConfigurations).then(getPatient).then(bedDetailsForPatient);
        }]
    );
