'use strict';

angular.module('opd.consultation').factory('initialization', ['$rootScope', '$q', '$route', 'configurationService', 'visitService', 'patientService', 'patientMapper','dispositionService',
        function ($rootScope, $q, $route, configurationService, visitService, patientService, patientMapper,dispositionService) {
            var deferrable = $q.defer();
            var dispositionNoteConcept;
            var orders;

            var configurationsPromise = configurationService.getConfigurations(['bahmniConfiguration', 'encounterConfig', 'patientConfig'])
                                            .then(function(configurations) {
                                                $rootScope.bahmniConfiguration = configurations.bahmniConfiguration;
                                                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig); 
                                                $rootScope.patientConfig = configurations.patientConfig;
                                                return dispositionService.getDispositionNoteConcept().success(function(data){
                                                    dispositionNoteConcept = data.results[0]
                                                    return dispositionService.getDispositionActions().success(function(data){
                                                        orders = data.results[0].setMembers;
                                                        return visitService.getVisit($route.current.params.visitUuid).success(function(visit){
                                                            $rootScope.visit = visit;
                                                            $rootScope.consultation = new Bahmni.Opd.ConsultationMapper($rootScope.encounterConfig).map(visit);
                                                            $rootScope.disposition = new Bahmni.Opd.DispositionMapper($rootScope.encounterConfig, dispositionNoteConcept).map(visit);
                                                            if (!$rootScope.disposition){
                                                               $rootScope.disposition ={};
                                                            }
                                                            $rootScope.disposition.dispositionActions = orders;
                                                            return patientService.getPatient(visit.patient.uuid).success(function(openMRSPatient){
                                                                $rootScope.patient = patientMapper.map(openMRSPatient);
                                                            });

                                                        })
                                                    });
                                                });
                                            });


            $q.all([configurationsPromise]).then(function(){
                deferrable.resolve();
            });
            
            return deferrable.promise;
     }]
);