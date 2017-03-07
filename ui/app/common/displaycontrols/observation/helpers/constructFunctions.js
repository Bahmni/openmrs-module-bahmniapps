'use strict';

Bahmni.Common.DisplayControl.Observation.ConstructFunctions = function () {
    var self = this;

    self.createDummyObsGroupForObservationsForForm = function (observations) {
        _.forEach(observations, function (obs) {
            var newValues = [];
            _.forEach(obs.value, function (value) {
                if (!value.formFieldPath) {
                    newValues.push(value);
                    return;
                }

                var dummyObsGroup = {
                    "groupMembers": [],
                    "concept": {
                        "shortName": ""
                    }
                };

                dummyObsGroup.concept.shortName = value.formFieldPath.split('.')[0];

                var flag;
                _.forEach(newValues, function (newValue) {
                    flag = (dummyObsGroup.concept.shortName == newValue.concept.shortName);
                    if (flag) {
                        newValue.groupMembers.push(value);
                        return;
                    }
                });
                if (flag) {
                    return;
                }
                dummyObsGroup.groupMembers.push(value);
                newValues.push(dummyObsGroup);
            });

            obs.value = newValues;
        });

        return observations;
    };

    return self;
};
