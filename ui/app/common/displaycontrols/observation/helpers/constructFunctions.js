'use strict';


Bahmni.Common.DisplayControl.Observation.ConstructFunctions = function () {
    var self = this;

    self.createDummyObsGroupForObservationsForForm = function(observations) {
        var dummyObsGroup = {
            "groupMembers": [],
            "concept": {
                "shortName": "Sickling Test"
            }
        };

        dummyObsGroup.concept.shortName = observations[0].value[0].formFieldPath.split('.')[0];
        dummyObsGroup.groupMembers.push(observations[0].value[0]);

        observations[0].value[0] =  dummyObsGroup;
        return observations;
    };

    return self;
};
