'use strict';

angular.module('opd.consultation').factory('initialization', ['$rootScope', '$q', '$route', 'configurationService', 'visitService', 'patientService', 'patientMapper', 'dispositionService','BedService',
    function ($rootScope, $q, $route, configurationService, visitService, patientService, patientMapper, dispositionService, bedService) {
        var deferrable = $q.defer();
        var dispositionNoteConcept;

        if (!String.prototype.trim) {
            String.prototype.trim = function () {
                return this.replace(/^\s+|\s+$/g, '');
            };
        }

        var configurationsPromise = configurationService.getConfigurations(['bahmniConfiguration', 'encounterConfig', 'patientConfig', ,'dosageFrequencyConfig','dosageInstructionConfig'])
            .then(function (configurations) {
                $rootScope.bahmniConfiguration = configurations.bahmniConfiguration;
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig);
                $rootScope.patientConfig = configurations.patientConfig;
                $rootScope.dosageFrequencyConfig = configurations.dosageFrequencyConfig;
                $rootScope.dosageInstructionConfig = configurations.dosageInstructionConfig;


                return visitService.getVisit($route.current.params.visitUuid).success(function (visit) {
                    $rootScope.visit = visit;
                    $rootScope.consultation = new Bahmni.Opd.ConsultationMapper($rootScope.encounterConfig, $rootScope.dosageFrequencyConfig, $rootScope.dosageInstructionConfig).map(visit);


                    bedService.bedDetailsForPatient(visit.patient.uuid).success(function(response){
                        $rootScope.bedDetails= {};
                        $rootScope.bedDetails.wardName = response.results[0].physicalLocation.parentLocation.display;
                        $rootScope.bedDetails.physicalLocationName = response.results[0].physicalLocation.name;
                        $rootScope.bedDetails.bedNumber = response.results[0].bedNumber;
                        $rootScope.bedDetails.bedId = response.results[0].bedId;
                    })

                    $rootScope.disposition = new Bahmni.Opd.DispositionMapper($rootScope.encounterConfig).map(visit);
                    $rootScope.disposition.currentActionIndex = 0; // this will be used in case we have multiple encounters with dispositions

                    return patientService.getPatient(visit.patient.uuid).success(function (openMRSPatient) {
                        $rootScope.patient = patientMapper.map(openMRSPatient);

                    });

                })
            });


        $q.all([configurationsPromise]).then(function () {
            deferrable.resolve();
        });

        return deferrable.promise;
    }]
);