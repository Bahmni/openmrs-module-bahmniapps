'use strict';

Bahmni.Clinical.ObservationFilters = function(unwantedObsConcepts){
    var self = this;

    var obsHasOrder = function(bahmniObservation){
        return !bahmniObservation.orderUuid;
    };
    var isUnwantedObservation = function (observation) {
        if(!unwantedObsConcepts) return true;
        return !unwantedObsConcepts.some(function (ignoredObsName) {
            return ignoredObsName === observation.concept.name;
        });
    };

    var observationFilter = function(obsList,filterFunction){
        return _.transform(obsList, function (result, observation) {
            if (filterFunction(observation)) {
                if (!_.isEmpty(observation.groupMembers)) {
                    observation.groupMembers = observationFilter(observation.groupMembers, filterFunction);
                }
                result.push(observation);
            }
        });
    };

    self.removeObsWithOrder = function(obsList){
        return observationFilter(obsList,obsHasOrder);
    };
    self.removeUnwantedObs = function(obsList){
        return observationFilter(obsList,isUnwantedObservation);
    };

    return self;
};
