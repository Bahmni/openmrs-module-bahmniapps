'use strict';

Bahmni.Common.DisplayControl.Observation.ConstructSectionIntoFormFunctions = function () {
    var self = this;

    self.createSectionForForm = function (observations) {
        _.forEach(observations, function (obs) {
            _.forEach(obs.value, function (value) {
                if (value.concept.conceptClass) {
                    return;
                }
                var dummyObsGroup = {
                    "groupMembers": [],
                    "concept": {
                        "shortName": "",
                        "conceptClass": null
                    }
                };

                var formDetails = {
                    "name": "test section with an obs",
                    "id": 81,
                    "uuid": "7defedec-d983-4b59-a1a7-cb40cf6b0cf1",
                    "controls": [{
                        "type": "section",
                        "label": {"type": "label", "value": "Name Changed"},
                        "id": "2",
                        "controls": [{
                            "type": "obsControl",
                            "label": {"type": "label", "value": "WEIGHT"},
                            "id": "3",
                            "concept": {
                                "name": "WEIGHT",
                                "properties": {"allowDecimal": false}}}]}]};

                _.forEach(formDetails.controls, function (control) {
                    if (control.type == "section"){
                        dummyObsGroup.concept.shortName = control.label.value;
                    }
                });

                var nonSectionGroupMembers = value.groupMembers.slice();

                value.groupMembers.splice(0,value.groupMembers.length);
                dummyObsGroup.groupMembers = nonSectionGroupMembers;
                value.groupMembers.push(dummyObsGroup);
            });
        });

        return observations;
    };

    return self;
};
