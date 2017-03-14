'use strict';

ddescribe("Construct Section Into Form Functions", function () {
    it("should construct dummy obs group for single observation in section from form", function () {
        var value = {
            "groupMembers": [{
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "test section with an obs.1/3-0",
                "concept": {
                    "shortName": "WEIGHT",
                    "name": "WEIGHT",
                    "conceptClass": null
                },
                "valueAsString": "50.0"
            }], "concept": {"shortName": "test section with an obs", "conceptClass": null}
        };

        var formDetails = {
            "name": "test section with an obs",
            "id": 81,
            "uuid": "7defedec-d983-4b59-a1a7-cb40cf6b0cf1",
            "controls": [{
                "type": "section",
                "label": {"type": "label", "value": "Outer Section"},
                "id": "2",
                "controls": [{
                    "type": "obsControl",
                    "label": {"type": "label", "value": "WEIGHT"},
                    "id": "3",
                    "concept": {
                        "name": "WEIGHT",
                        "properties": {"allowDecimal": false}
                    }
                }]
            }]
        };

        var dummyObsGroup = new Bahmni.Common.DisplayControl.Observation.ConstructSectionIntoFormFunctions().createSectionForForm(value, formDetails);

        expect(dummyObsGroup.groupMembers[0].concept.shortName).toBe("Outer Section");
        expect(dummyObsGroup.groupMembers[0].groupMembers.length).toBe(1);

        expect(dummyObsGroup.groupMembers[0].groupMembers[0].concept.shortName).toBe("WEIGHT");
        expect(dummyObsGroup.groupMembers[0].groupMembers[0].valueAsString).toBe("50.0");
    });


    it("should construct dummy obs group for section and non-inside section obs from form", function () {
        var value = {
            "groupMembers": [{
                "groupMembers": [],
                "formFieldPath": "test section with an obs and outside obs.1/2-0",
                "concept": {
                    "uuid": "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                    "name": "HEIGHT",
                    "dataType": "Numeric",
                    "shortName": "HEIGHT"
                },
                "valueAsString": "30.0"
            }, {
                "groupMembers": [],
                "formFieldPath": "test section with an obs and outside obs.1/3-0",
                "concept": {
                    "uuid": "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                    "name": "WEIGHT",
                    "dataType": "Numeric",
                    "shortName": "WEIGHT"
                },
                "valueAsString": "50.0"
            }], "concept": {"shortName": "test section with an obs and outside obs", "conceptClass": null}
        };

        var formDetails = {
            "name": "test section with an obs and outside obs",
            "id": 82,
            "uuid": "8930383a-69ec-4a27-a7f9-1238ae8a3b48",
            "controls": [{
                "type": "section",
                "label": {"type": "label", "value": "Outer Section"},
                "controls": [{
                    "type": "obsControl",
                    "label": {"type": "label", "value": "HEIGHT"},
                    "id": "2",
                    "concept": {
                        "name": "HEIGHT",
                        "uuid": "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                    }
                }]
            }, {
                "type": "obsControl",
                "label": {"type": "label", "value": "WEIGHT"},
                "id": "3",
                "concept": {
                    "name": "WEIGHT",
                    "uuid": "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                }
            }]
        };

        var dummyObsGroup = new Bahmni.Common.DisplayControl.Observation.ConstructSectionIntoFormFunctions().createSectionForForm(value, formDetails);

        expect(dummyObsGroup.groupMembers[0].concept.shortName).toBe("Outer Section");
        expect(dummyObsGroup.groupMembers[1].concept.shortName).toBe("WEIGHT");
        expect(dummyObsGroup.groupMembers[1].valueAsString).toBe("50.0");
        expect(dummyObsGroup.groupMembers[0].groupMembers.length).toBe(1);

        expect(dummyObsGroup.groupMembers[0].groupMembers[0].concept.shortName).toBe("HEIGHT");
        expect(dummyObsGroup.groupMembers[0].groupMembers[0].valueAsString).toBe("30.0");
    });
});


