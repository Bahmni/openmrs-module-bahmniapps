'use strict';

//Holds a single instance of result
//Use Bahmni.Clinical.LabResult
Bahmni.Clinical.Result = (function () {
    var Result = function (options) {
        angular.extend(this, options);
        this.isSummary = false;
    };

    var matchingObservations = function (observations, conceptName) {
            var result = observations.filter(function (observation) {
                return observation.concept.name === conceptName;
            });
            return result;
        },
        valueOf = function (observations, conceptName) {
            var result = matchingObservations(observations, conceptName);
            return result[0] && result[0].value;
        },
        getRealObs = function (observations) {
            var invalidConcepts = ["LAB_ABNORMAL", "LAB_MINNORMAL", "LAB_MAXNORMAL", "LAB_NOTES", "REFERRED_OUT"];
            return observations.filter(function (observation) {
                return invalidConcepts.indexOf(observation.concept.name) < 0;
            })[0];
        },
        latestMatchingObservationValue = function (observations, conceptName) {
            var matchingObs = matchingObservations(observations, conceptName);
            var sortedObservations = Bahmni.Common.Util.ArrayUtil.sortReverse(matchingObs, 'observationDateTime');
            return sortedObservations[0] && sortedObservations[0].value;
        };

    Result.create = function (parentConcept, observations) {
        var realObs = getRealObs(observations);
        if (realObs) {
            return new Result({
                concept: realObs.concept,
                value: realObs.value,
                isAbnormal: valueOf(observations, "LAB_ABNORMAL") === true,
                minNormal: valueOf(observations, "LAB_MINNORMAL"),
                maxNormal: valueOf(observations, "LAB_MAXNORMAL"),
                notes: latestMatchingObservationValue(observations, "LAB_NOTES"),
                referredOut: matchingObservations(observations, "REFERRED_OUT").length > 0,
                observationDateTime: realObs.observationDateTime,
                providerName: realObs.provider? realObs.provider.name : ""
            });
        } 
        return new Result({
            concept: parentConcept,
            isAbnormal: valueOf(observations, "LAB_ABNORMAL"),
            minNormal: valueOf(observations, "LAB_MINNORMAL"),
            maxNormal: valueOf(observations, "LAB_MAXNORMAL"),
            notes: latestMatchingObservationValue(observations, "LAB_NOTES"),
            referredOut: matchingObservations(observations, "REFERRED_OUT").length > 0
        });

    };

    return Result;

})();