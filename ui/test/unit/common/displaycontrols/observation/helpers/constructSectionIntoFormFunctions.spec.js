'use strict';

ddescribe("Construct Section Into Form Functions", function () {
    it("should construct dummy obs group for single observation in section from form", function () {
        var observations = [{
            "key": "1489379340011",
            "value": [{
                "groupMembers": [{
                    "groupMembers": [],
                    "formNamespace": "Bahmni",
                    "formFieldPath": "test section with an obs.1/3-0",
                    "concept": {
                        "shortName": "WEIGHT",
                        "conceptClass": null
                    }
                }], "concept": {"shortName": "test section with an obs", "conceptClass": null}
            }]
        }];
        var dummyObsGroup = new Bahmni.Common.DisplayControl.Observation.ConstructSectionIntoFormFunctions().createSectionForForm(observations);
        var value = dummyObsGroup[0].value[0];

        expect(value.groupMembers[0].concept.shortName).toBe("Name Changed");
        expect(value.groupMembers[0].groupMembers.length).toBe(1);

        expect(value.groupMembers[0].groupMembers[0].concept.shortName).toBe("WEIGHT");
    });
});