'use strict';

Bahmni.Common.DisplayControl.Observation.ConstructSectionIntoFormFunctions = function () {
    var self = this;

    self.getMemberFromValueByFormFieldPath = function (members, id) {
        return _.find(members, function (member) {
            return member.formFieldPath.split('.')[1].split('/')[1].split('-')[0] == id;
        });
    }

    self.parseSection = function (members, controls, value) {
        var sectionIsEmpty = true;
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
                sectionIsEmpty = false;
                if (!self.parseSection(members, control.controls, dummyObsGroup)) {
                    value.groupMembers.pop();
                }
            } else {
                var member = self.getMemberFromValueByFormFieldPath(members, control.id)
                if (member) {
                    value.groupMembers.push(member);
                    sectionIsEmpty = false;
                    return;
                }
            }
        });
        if (sectionIsEmpty) {
            return null;
        }
        return value;
    }

    self.createSectionForSingleForm = function (obsFromSameForm, formDetails) {
        var members = obsFromSameForm.groupMembers.slice();
        obsFromSameForm.groupMembers.splice(0, obsFromSameForm.groupMembers.length);
        return self.parseSection(members, formDetails.controls, obsFromSameForm);
    };

    self.createDummyObsGroupForSectionsForForm = function (bahmniObservations, observationFormService) {
        _.forEach(bahmniObservations, function (observation) {
            var forms = [];
            _.forEach(observation.value, function (form) {
                if (form.concept.conceptClass) {
                    forms.push(form);
                    return;
                }

                observationFormService.getFormDetail("", {
                    v: "custom:(resources:(value))",
                    q: form.concept.shortName
                }).then(function (response) {
                    var formDetailsAsString = _.get(response, 'data.results[0].resources[0].value');

                    if (formDetailsAsString) {
                        var formDetails = JSON.parse(formDetailsAsString);
                        forms.push(self.createSectionForSingleForm(form, formDetails));
                    }
                    observation.value = forms;
                })
            });
        });
    };

    return self;
};
