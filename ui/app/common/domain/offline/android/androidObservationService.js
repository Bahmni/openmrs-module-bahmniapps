'use strict';

angular.module('bahmni.common.domain')
    .service('observationsServiceStrategy', ['$q', 'androidDbService', function ($q, androidDbService) {

        this.fetch = function (patientUuid, numberOfVisits, params) {
            var deffered = $q.defer();
            androidDbService.getVisitUuidsByPatientUuid(patientUuid, numberOfVisits).then(function (visitUuids) {
                params.visitUuids = visitUuids;
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
        }

    }]);