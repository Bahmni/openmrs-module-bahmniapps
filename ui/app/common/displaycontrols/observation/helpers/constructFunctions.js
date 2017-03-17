'use strict';

Bahmni.Common.DisplayControl.Observation.ConstructFunctions = function () {
    var self = this;

    self.preProcessMultipleSelectObsToObs = function (observations) {
        _.forEach(observations, function (obs) {
            _.forEach(obs.value, function (value, index) {
                if (value.type == "multiSelect") {
                    obs.value.push(value.groupMembers[0]);
                    obs.value.splice(index,1);
                }
            })
        })
        return observations;
    };

    return self;
};
