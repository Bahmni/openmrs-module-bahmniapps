'use strict';

Bahmni.Common.Obs.ObservationUtil = (function () {

    var sortSameConceptsWithObsDateTime = function (observation) {
        var sortedObservations = [];
        for (var i = 0; i < observation.length; i++) {
            if (i != observation.length - 1) {
                if (observation[i].conceptUuid != observation[i + 1].conceptUuid) {
                    sortedObservations.push(observation[i]);
                } else {
                    var sameConceptsSubArray = [];
                    var j = i + 1;
                    sameConceptsSubArray.push(observation[i]);
                    while (j < observation.length && observation[i].conceptUuid == observation[j].conceptUuid) {
                        sameConceptsSubArray.push(observation[j++]);
                    }
                    sameConceptsSubArray = _.sortBy(sameConceptsSubArray, ['observationDateTime']);
                    sortedObservations.push(sameConceptsSubArray);
                    i = j - 1;
                }
            } else {
                sortedObservations.push(observation[i]);
            }
        }
        return _.flatten(sortedObservations);
    };

    var disable = function (parentConceptSet, field, disable) {
        var conceptElement = parentConceptSet.find("[data-concept-name='" + field + "']");
        if (!_.isEmpty(conceptElement.children())) {
            conceptElement.find("input").attr("disabled", disable);
            conceptElement.find("textarea").attr("disabled", disable);
            conceptElement.find("button").attr("disabled", disable);
        } else {
            conceptElement.attr("disabled", disable);
        }
    };

    var flatten = function (observation) {
        var flattenedObservation = {};
        findLeafObservations(flattenedObservation, observation);
        return flattenedObservation;
    };

    var findLeafObservations = function (flattenedObservations, observation) {
        if (!_.isEmpty(observation.groupMembers)) {
            _.each(observation.groupMembers, function (member) {
                findLeafObservations(flattenedObservations, member);
            });
        } else {
            flattenedObservations[observation.concept.name] = observation.value;
        }
    };

    return {
        sortSameConceptsWithObsDateTime: sortSameConceptsWithObsDateTime,
        disable: disable,
        flatten: flatten
    };
})();
