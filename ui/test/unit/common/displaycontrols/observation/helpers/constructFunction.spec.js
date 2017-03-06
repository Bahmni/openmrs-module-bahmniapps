'use strict';

ddescribe("Construct Functions", function () {
    it("should construct dummy obs group for single observation from form", function () {
        var observations = [{
            "key": "1488782460000",
            "value": [{
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "myForm.1/1-0",
                "concept": {
                    "uuid": "72ae28f1-4be4-499a-a8f5-aff54a11c9e3",
                    "name": "Sickling Test",
                    "dataType": "Text",
                    "shortName": "Sickling Test",
                    "conceptClass": "LabTest",
                    "hiNormal": null,
                    "lowNormal": null,
                    "set": false,
                    "mappings": []
                },
                "valueAsString": "1",
                "conceptNameToDisplay": "Sickling Test",
                "value": "1",
                "conceptConfig": []
            }],
            "date": "1488782460000",
            "isOpen": true
        }];

        var dummyObsGroup = new Bahmni.Common.DisplayControl.Observation.ConstructFunctions().createDummyObsGroupForObservationsForForm(observations);

        expect(dummyObsGroup[0].value[0].concept.shortName).toBe("myForm");
        expect(dummyObsGroup[0].value[0].groupMembers.length).toBe(1);
        expect(dummyObsGroup[0].value[0].groupMembers[0].concept.shortName).toBe("Sickling Test");
    });

    it('should construct dummy obs group for single observation from form within multiple observations', function () {
        var observations = [{
            "value": [{
                "targetObsRelation": null,
                "groupMembers": [{
                    "formNamespace": null,
                    "formFieldPath": null,
                    "concept": {
                        "name": "SPO2 Data",
                        "shortName": "SPO2",
                    },
                    "valueAsString": "100.0",
                    "conceptNameToDisplay": "SPO2",
                }],
                "formNamespace": null,
                "formFieldPath": null,
                "concept": {
                    "name": "Vitals",
                    "shortName": "Vitals",
                },
            }, {
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "test.1/1-0",
                "concept": {
                    "name": "HEAD Nose lateral",
                    "shortName": "head nose lateral",
                }
            }]
        }]

        var dummyObsGroup = new Bahmni.Common.DisplayControl.Observation.ConstructFunctions().createDummyObsGroupForObservationsForForm(observations);

        expect(dummyObsGroup[0].value[0].concept.shortName).toBe('Vitals');
        expect(dummyObsGroup[0].value[0].groupMembers.length).toBe(1);
        expect(dummyObsGroup[0].value[0].groupMembers[0].concept.shortName).toBe("SPO2");

        expect(dummyObsGroup[0].value[1].concept.shortName).toBe('test');
        expect(dummyObsGroup[0].value[1].groupMembers.length).toBe(1);
        expect(dummyObsGroup[0].value[1].groupMembers[0].concept.shortName).toBe("head nose lateral");


    })

});