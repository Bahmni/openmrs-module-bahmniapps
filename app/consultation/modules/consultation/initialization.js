'use strict';

angular.module('opd.consultation').factory('initialization',
    ['$rootScope', '$q', '$route', 'configurationService', 'visitService', 'patientService', 'patientMapper', 'dispositionService','BedService', 'ConceptSetService', 'authenticator', 'appService',
    function ($rootScope, $q, $route, configurationService, visitService, patientService, patientMapper, dispositionService, bedService, conceptSetService, authenticator, appService) {
        var initializationPromise = $q.defer();
        var dispositionNoteConcept;

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

        var getConsultationConfigs = function() {
            var deferrable = $q.defer();
            var configNames = ['bahmniConfiguration', 'encounterConfig', 'patientConfig', ,'dosageFrequencyConfig','dosageInstructionConfig', 'consultationNoteConfig'];
            configurationService.getConfigurations(configNames).then(function (configurations) {
                $rootScope.bahmniConfiguration = configurations.bahmniConfiguration;
                $rootScope.encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig);
                $rootScope.patientConfig = configurations.patientConfig;
                $rootScope.dosageFrequencyConfig = configurations.dosageFrequencyConfig;
                $rootScope.dosageInstructionConfig = configurations.dosageInstructionConfig;
                $rootScope.consultationNoteConfig = configurations.consultationNoteConfig;
                deferrable.resolve();
            });
            return deferrable.promise;
        }

        var getVisit = function() {
            var visitDeferrable = $q.defer();
            visitService.getVisit($route.current.params.visitUuid).success(function (visit) {
                $rootScope.visit = visit;
                $rootScope.consultation = new Bahmni.Opd.ConsultationMapper($rootScope.encounterConfig, $rootScope.dosageFrequencyConfig, $rootScope.dosageInstructionConfig, $rootScope.consultationNoteConfig).map(visit);
                $rootScope.getBedDetailsForPatient(visit.patient.uuid);
                $rootScope.disposition = new Bahmni.Opd.DispositionMapper($rootScope.encounterConfig).map(visit);
                $rootScope.disposition.currentActionIndex = 0; // this will be used in case we have multiple encounters with dispositions
                visitDeferrable.resolve(visit);
            });
            return visitDeferrable.promise;
        };

        var getPatient = function(visit) {
            var patientDeferrable = $q.defer();
            patientService.getPatient(visit.patient.uuid).success(function (openMRSPatient) {
                $rootScope.patient = patientMapper.map(openMRSPatient);
                patientDeferrable.resolve($rootScope.patient);
            });
            return patientDeferrable.promise;
        };

        authenticator.authenticateUser().then(function () {
            appService.initialize('clinical').then(function() {
                var configPromise = getConsultationConfigs();
                configPromise.then(getVisit).then(getPatient).then(function(patient) {
                    initializationPromise.resolve();
                });
            });
        });

        return initializationPromise.promise;
    }]
);
