'use strict';

angular.module('opd.adt').factory('initialization',
    ['$rootScope', '$q', '$route', 'appService', 'configurationService', 'visitService', 'patientService', 'patientMapper',
        'conceptSetService', 'authenticator',
        function ($rootScope, $q, $route, appService, configurationService, visitService, patientService, patientMapper,
                  conceptSetService, authenticator) {
            var getVisit = function() {
                if($route.current.params.visitUuid != 'null') {
                    return visitService.getVisit($route.current.params.visitUuid).success(function (visit) {
                        $rootScope.visit = visit;
                     });
                } else {
                    var deferrable = $q.defer();
                    deferrable.resolve({
                        id: 1,
                        status: "Returned from service.",
                        promiseComplete: true });
                    return deferrable.promise;
                }
            };

            var getPatient = function(visitResponse) {
                var visit = visitResponse.data;
                return patientService.getPatient($route.current.params.patientUuid).success(function (openMRSPatient) {
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
                return $q.all([getConsultationConfigs(), getPatientVisitInfo()]);
            };

            var initApp = function() {
                return appService.initApp('adt');
            };

            return authenticator.authenticateUser().then(initApp).then(getConfigAndVisitInfo);
        }]
);
