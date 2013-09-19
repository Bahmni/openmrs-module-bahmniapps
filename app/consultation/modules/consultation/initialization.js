'use strict';

angular.module('opd.consultation').factory('initialization', ['$rootScope', '$q', '$route', 'configurationService', 'visitService', 'patientService', 'patientMapper', 'dispositionService',
    function ($rootScope, $q, $route, configurationService, visitService, patientService, patientMapper, dispositionService) {
        var deferrable = $q.defer();
        var dispositionNoteConcept;
        var orders;

        var configurationsPromise = configurationService.getConfigurations(['bahmniConfiguration', 'encounterConfig', 'patientConfig'])
            .then(function (configurations) {
                $rootScope.bahmniConfiguration = configurations.bahmniConfiguration;
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig);
                $rootScope.patientConfig = configurations.patientConfig;


                return visitService.getVisit($route.current.params.visitUuid).success(function (visit) {
                    $rootScope.visit = visit;
                    $rootScope.consultation = new Bahmni.Opd.ConsultationMapper($rootScope.encounterConfig).map(visit);

                    return patientService.getPatient(visit.patient.uuid).success(function (openMRSPatient) {
                        $rootScope.patient = patientMapper.map(openMRSPatient);
                        return dispositionService.getDispositionNoteConcept().then(function (response) {
                            if (response.data) {
                                dispositionNoteConcept = response.data.results[0]
                            }
                            return dispositionService.getDispositionActions().then(function (response) {
                                if (response.data && response.data.results) {
                                    $rootScope.disposition = new Bahmni.Opd.DispositionMapper($rootScope.encounterConfig, dispositionNoteConcept).map(visit);
                                    if (!$rootScope.disposition) {
                                        $rootScope.disposition = {};
                                    }
                                    $rootScope.disposition.dispositionActions = response.data.results[0].setMembers;
                                }

                            });
                        });
                    });

                })
            });


        $q.all([configurationsPromise]).then(function () {
            deferrable.resolve();
        });

        return deferrable.promise;
    }]
);