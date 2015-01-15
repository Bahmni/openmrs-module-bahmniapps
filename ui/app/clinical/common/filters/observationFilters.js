'use strict';

Bahmni.Clinical.ObservationFilters = function(unwantedObsConcepts){
    var self = this;

    self.doesNotHaveOrder = function(bahmniObservation){
        return !bahmniObservation.orderUuid;
    };

    self.removeUnwantedObs = function (observation) {
        if(!unwantedObsConcepts) return true;
        return !unwantedObsConcepts.some(function (ignoredObsName) {
            return ignoredObsName === observation.concept.name;
        });
    };

    return self;
};
