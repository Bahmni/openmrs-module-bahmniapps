'use strict';

angular.module('bahmni.common.domain')
    .service('observationsService', ['$q', 'observationsServiceStrategy', function ($q, observationsServiceStrategy) {

        this.fetch = function (patientUuid, conceptNames, scope, numberOfVisits, visitUuid, obsIgnoreList, filterObsWithOrders, patientProgramUuid) {
            var params = {conceptNames: conceptNames};
            if (obsIgnoreList) {
                params.obsIgnoreList = obsIgnoreList
            }
            if (filterObsWithOrders != null) {
                params.filterObsWithOrders = filterObsWithOrders;
            }

            if (visitUuid) {
                params.visitUuid = visitUuid;
                params.scope = scope;
            } else {
                params.patientUuid = patientUuid;
                params.numberOfVisits = numberOfVisits;
                params.scope = scope;
                params.patientProgramUuid = patientProgramUuid;
            }
            return observationsServiceStrategy.fetch(patientUuid, numberOfVisits, params)
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