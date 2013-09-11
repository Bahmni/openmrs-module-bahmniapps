'use strict';

angular.module('opd.consultation').factory('initialization', ['$rootScope', '$q', '$route', 'configurationService', 'visitService',
        function ($rootScope, $q, $route, configurationService, visitService) {
            var deferrable = $q.defer();
            var configurationsPromise = configurationService.getConfigurations(['bahmniConfiguration', 'encounterConfig'])
                                            .then(function(configurations) {
                                                $rootScope.bahmniConfiguration = configurations.bahmniConfiguration;
                                                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig); 
                                            });;
            
            var getVisitPromise = visitService.getVisit($route.current.params.visitUuid).success(function(visit){
                $rootScope.visit = visit;
                $rootScope.patient = visit.patient;
            });                

            $q.all([configurationsPromise, getVisitPromise]).then(function(){
                deferrable.resolve();
            });
            
            return deferrable.promise;
     }]
);    