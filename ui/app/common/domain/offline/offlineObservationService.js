'use strict';

angular.module('bahmni.common.domain')
    .service('observationsService', ['$q', 'observationsServiceStrategy', function ($q, observationsServiceStrategy) {
        var fetchAndFilterObservations = function (conceptNames, index, params, listOfObservations) {
            return observationsServiceStrategy.getAllParentsInHierarchy(conceptNames[index]).then(function (result) {
                params.conceptNames = result.data;
                return observationsServiceStrategy.fetch(params.patientUuid, params.numberOfVisits, params).then(function (results) {
                    var acutalObs = filterObservation(results.data, conceptNames[index]);
                    listOfObservations = listOfObservations.concat(acutalObs);
                    index++;
                    if (index < conceptNames.length) {
                        return fetchAndFilterObservations(conceptNames, index, params, listOfObservations);
                    } else {
                        return $q.when(listOfObservations);
                    }
                });
            });
        };

        var fetchAndFilterObservationsForVisit = function (params) {
            if (params.conceptNames) {
                return fetchAndFilterObservations(params.conceptNames, 0, params, []);
            } else {
                return observationsServiceStrategy.fetchObsForVisit(params).then(function (results) {
                    return $q.when(results.data);
                }); }
        };

        var getObservationByIterateOverGroupMembers = function (obs, conceptName, results) {
            if (obs.concept.name === conceptName && !obs.voided) {
                results.push(obs);
            }
            _.each(obs.groupMembers, function (groupMember, index) {
                if (groupMember.voided) {
                    delete obs.groupMembers[index];
                } else if (groupMember.concept.name === conceptName) {
                    results.push(groupMember);
                } else {
                    getObservationByIterateOverGroupMembers(groupMember, conceptName, results);
                }
            });
            _.remove(obs.groupMembers, function (member) {
                return member == undefined;
            });
        };

        var filterObservation = function (obsArray, conceptName) {
            var actualObs = [];
            _.each(obsArray, function (obs) {
                getObservationByIterateOverGroupMembers(obs, conceptName, actualObs);
            });
            return actualObs;
        };

        this.fetch = function (patientUuid, conceptNames, scope, numberOfVisits, visitUuid, obsIgnoreList, filterObsWithOrders, patientProgramUuid) {
            var params = {};
            if (obsIgnoreList) {
                params.obsIgnoreList = obsIgnoreList;
            }
            if (filterObsWithOrders != null) {
                params.filterObsWithOrders = filterObsWithOrders;
            }

            if (visitUuid) {
                params.visitUuid = visitUuid;
                params.patientUuid = patientUuid;
                params.scope = scope;
                params.conceptNames = conceptNames;
                return fetchAndFilterObservationsForVisit(params).then(function (results) {
                    return {"data": results};
                });
            } else {
                params.patientUuid = patientUuid;
                params.numberOfVisits = numberOfVisits;
                params.scope = scope;
                params.patientProgramUuid = patientProgramUuid;
            }

            var listOfObservations = [];
            var index = 0;
            return fetchAndFilterObservations(conceptNames, index, params, listOfObservations).then(function (results) {
                return {"data": results};
            });
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
    }]);
