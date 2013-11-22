'use strict';

angular.module('opd.adt').factory('initialization',
    ['$rootScope', '$q', '$route', 'configurationService', 'visitService', 'patientService', 'patientMapper',
        'ConceptSetService', 'authenticator', 'BedService',
        function ($rootScope, $q, $route, configurationService, visitService, patientService, patientMapper, conceptSetService, authenticator, bedService) {
            var initializationPromise = $q.defer();

            if (!String.prototype.trim) {
                String.prototype.trim = function () {
                    return this.replace(/^\s+|\s+$/g, '');
                };
            }

            $rootScope.getBedDetailsForPatient = function(patientUuid){
                bedService.bedDetailsForPatient(patientUuid).success(function(response){
                    if(response.results.length > 0){
                        console.log("assiging bed details");
                        $rootScope.bedDetails= {};
                        $rootScope.bedDetails.wardName = response.results[0].physicalLocation.parentLocation.display;
                        $rootScope.bedDetails.wardUuid = response.results[0].physicalLocation.parentLocation.uuid;
                        $rootScope.bedDetails.physicalLocationName = response.results[0].physicalLocation.name;
                        $rootScope.bedDetails.bedNumber = response.results[0].bedNumber;
                        $rootScope.bedDetails.bedId = response.results[0].bedId;
                    }
                });
            };


            var getConsultationConfigs = function () {
                var configurationsPromises = $q.defer();
                var configNames = ['bahmniConfiguration', 'encounterConfig', 'patientConfig'];
                configurationService.getConfigurations(configNames).then(function (configurations) {
                    $rootScope.bahmniConfiguration = configurations.bahmniConfiguration;
                    $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig);
                    $rootScope.patientConfig = configurations.patientConfig;

                    return visitService.getVisit($route.current.params.visitUuid).success(function (visit) {
                        $rootScope.visit = visit;
                        $rootScope.getBedDetailsForPatient(visit.patient.uuid);
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
                    initializationPromise.resolve();
                });
            });

            return initializationPromise.promise;
        }]
);
