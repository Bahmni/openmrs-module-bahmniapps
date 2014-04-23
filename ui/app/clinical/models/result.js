'use strict';

//Holds a single instance of result
//Use Bahmni.Clinical.LabResult
Bahmni.Clinical.Result = (function () {
    var Result = function (options) {
        options = options || {};
        this.name = options.name;
        this.value = options.value;
        this.minNormal = options.minNormal;
        this.maxNormal = options.maxNormal;
        this.isAbnormal = options.isAbnormal;
        this.providerName = options.providerName;
        this.observationDateTime = options.observationDateTime;
        this.notes = options.notes;
        this.referredOut = options.referredOut;
        this.isSummary = false;
    };

    var matchingObservations = function (observationList, conceptName) {
            var result = observationList.filter(function (observation) {
                return observation.concept.name === conceptName;
            });
            return result;
        },
        valueOf = function (observationList, conceptName) {
            var result = matchingObservations(observationList, conceptName);
            return result[0] && result[0].value;
        },
        getRealObs = function (observationList) {
            var invalidConcepts = ["LAB_ABNORMAL", "LAB_MINNORMAL", "LAB_MAXNORMAL", "LAB_NOTES", "REFERRED_OUT"];
            return observationList.filter(function (observation) {
                return invalidConcepts.indexOf(observation.concept.name) < 0;
            })[0];
        },
        latestMatchingObservationValue = function (observationList, conceptName) {
            var matchingObs = matchingObservations(observationList, conceptName);
            var sortedObservations = Bahmni.Common.Util.ArrayUtil.sortReverse(matchingObs, 'observationDateTime');
            return sortedObservations[0] && sortedObservations[0].value;
        };

    Result.create = function (parentName, observationList) {
        var realObs = getRealObs(observationList);
        if (realObs) {
            return new Bahmni.Clinical.Result({
                name: realObs.concept.name,
                value: realObs.value,
                isAbnormal: valueOf(observationList, "LAB_ABNORMAL"),
                minNormal: valueOf(observationList, "LAB_MINNORMAL"),
                maxNormal: valueOf(observationList, "LAB_MAXNORMAL"),
                notes: latestMatchingObservationValue(observationList, "LAB_NOTES"),
                referredOut: matchingObservations(observationList, "REFERRED_OUT").length > 0,
                observationDateTime: realObs.observationDateTime,
                providerName: realObs.provider.name
            });
        }

        return new Bahmni.Clinical.Result({
            name: parentName,
            isAbnormal: valueOf(observationList, "LAB_ABNORMAL"),
            minNormal: valueOf(observationList, "LAB_MINNORMAL"),
            maxNormal: valueOf(observationList, "LAB_MAXNORMAL"),
            notes: latestMatchingObservationValue(observationList, "LAB_NOTES"),
            referredOut: matchingObservations(observationList, "REFERRED_OUT").length > 0
        });

    };

    return Result;

})();