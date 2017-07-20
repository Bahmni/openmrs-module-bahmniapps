'use strict';

angular.module('bahmni.common.domain')
    .service('observationsServiceStrategy', ['$q', 'androidDbService', function ($q, androidDbService) {
        this.fetch = function (patientUuid, numberOfVisits, params) {
            var deffered = $q.defer();
            androidDbService.getVisitsByPatientUuid(patientUuid, numberOfVisits).then(function (visitUuids) {
                var mappedVisitUuids = _.map(visitUuids, function (visitUuid) {
                    return visitUuid.uuid;
                });
                params.visitUuids = params.visitUuid ? [params.visitUuid] : (mappedVisitUuids || []);
                androidDbService.getObservationsFor(params).then(function (obs) {
                    var mappedObs = _.map(obs, function (ob) {
                        return ob.observation;
                    });
                    deffered.resolve({data: mappedObs});
                });
            });
            return deffered.promise;
        };

        this.getByUuid = function (observationUuid) {
            return $q.when({"data": {"results": []}});
        };

        this.fetchForEncounter = function (encounterUuid, conceptNames) {
            return $q.when({"data": {"results": []}});
        };

        this.fetchForPatientProgram = function (patientProgramUuid, conceptNames, scope) {
            return $q.when({"data": {"results": []}});
        };

        this.getObsRelationship = function (targetObsUuid) {
            return $q.when({"data": {"results": []}});
        };

        this.getObsInFlowSheet = function (patientUuid, conceptSet, groupByConcept, conceptNames,
                                           numberOfVisits, initialCount, latestCount, groovyExtension,
                                           startDate, endDate, patientProgramUuid) {
            return $q.when({"data": {"results": []}});
        };

        this.fetchObsForVisit = function (params) {
            var deferred = $q.defer();

            androidDbService.getObservationsForVisit(params.visitUuid).then(function (obs) {
                var mappedObs = _.map(obs, function (ob) {
                    return ob.observation;
                });
                deferred.resolve({data: mappedObs});
            });
            return deferred.promise;
        };

        this.getAllParentsInHierarchy = function (conceptName) {
            var deferred = $q.defer();
            androidDbService.getAllParentsInHierarchy(conceptName).then(function (results) {
                deferred.resolve({data: results});
            });
            return deferred.promise;
        };
    }]);
