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

    var flatten = function (observation) {
        var flattenedObservation = {};
        if (!_.isEmpty(observation)) {
            findLeafObservations(flattenedObservation, observation);
        }
        return flattenedObservation;
    };

    var findLeafObservations = function (flattenedObservations, observation) {
        if (!_.isEmpty(observation.groupMembers)) {
            _.each(observation.groupMembers, function (member) {
                findLeafObservations(flattenedObservations, member);
            });
        } else {
            collect(flattenedObservations, observation.concept.name, getValue(observation));
        }
    };

    var collect = function (flattenedObservations, key, value) {
        if (value != undefined){
            flattenedObservations[key] = flattenedObservations[key] ? _.uniq(_.flatten(_.union([flattenedObservations[key]], [value]))) : value;
        }
    };

    var getValue = function (observation) {
        if (observation.selectedObs) {
            return observation.getValues();
        }
        var obsValue;
        if(observation.value instanceof Object && observation.value.name)
            obsValue = observation.value.name;
        else
            obsValue = observation.value;
        return obsValue == undefined ? obsValue : (obsValue.displayString || obsValue);
    };

    return {
        sortSameConceptsWithObsDateTime: sortSameConceptsWithObsDateTime,
        flatten: flatten
    };
})();
