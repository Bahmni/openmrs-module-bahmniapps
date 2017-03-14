'use strict';

Bahmni.Common.DisplayControl.Observation.ConstructSectionIntoFormFunctions = function () {
    var self = this;
    self.createSectionForForm = function (value, formDetails) {
        var members = value.groupMembers.slice();
        value.groupMembers.splice(0, value.groupMembers.length);
        var getMemberFromValueByFormFieldPath = function (members, id) {
            return _.find(members, function (member) {
                return member.formFieldPath.split('.')[1].split('/')[1].split('-')[0] == id;
            });
        };
        var newValue = function parseSection(controls, value) {
            _.forEach(controls, function (control) {
                var dummyObsGroup = {
                    "groupMembers": [],
                    "concept": {
                        "shortName": "",
                        "conceptClass": null
                    }
                };
                if (control.type == "section") {
                    dummyObsGroup.concept.shortName = control.label.value;
                    value.groupMembers.push(dummyObsGroup);
                    parseSection(control.controls, dummyObsGroup)

                } else {
                    value.groupMembers.push(getMemberFromValueByFormFieldPath(members, control.id));
                    return;
                }
            });
            return value;
        };
        return newValue(formDetails.controls, value);
    };
    return self;
};
