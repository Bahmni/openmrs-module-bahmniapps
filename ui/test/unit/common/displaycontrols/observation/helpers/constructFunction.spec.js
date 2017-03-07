'use strict';

describe("Construct Functions", function () {
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

        var value = dummyObsGroup[0].value[0];
        expect(value.concept.shortName).toBe("myForm");
        expect(value.groupMembers.length).toBe(1);
        expect(value.groupMembers[0].concept.shortName).toBe("Sickling Test");
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

        var firstValue = dummyObsGroup[0].value[0];
        expect(firstValue.concept.shortName).toBe('Vitals');
        expect(firstValue.groupMembers.length).toBe(1);
        expect(firstValue.groupMembers[0].concept.shortName).toBe("SPO2");

        var secondValue = dummyObsGroup[0].value[1];
        expect(secondValue.concept.shortName).toBe('test');
        expect(secondValue.groupMembers.length).toBe(1);
        expect(secondValue.groupMembers[0].concept.shortName).toBe("head nose lateral");
    });

    it('should construct dummy obs group for multiple observations from one form', function () {
        var observations = [{
            "key": "1488790440000",
            "value": [{
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "test.2/2-0",
                "concept": {
                    "shortName": "HEIGHT"
                }
            }, {
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "test.2/1-0",
                "concept": {
                    "shortName": "head nose lateral"
                }

            }]
        }]

        var dummyObsGroup = new Bahmni.Common.DisplayControl.Observation.ConstructFunctions().createDummyObsGroupForObservationsForForm(observations);

        expect(dummyObsGroup[0].value.length).toBe(1);

        var firstValue = dummyObsGroup[0].value[0];
        expect(firstValue.concept.shortName).toBe('test');
        expect(firstValue.groupMembers.length).toBe(2);
        expect(firstValue.groupMembers[0].concept.shortName).toBe("HEIGHT");
        expect(firstValue.groupMembers[1].concept.shortName).toBe("head nose lateral");
    });

    it('should construct dummy obs group for obsGroup observations from one form', function () {
        var observations = [{
            "value": [{
                "groupMembers": [{
                    "groupMembers": [{
                        "groupMembers": [],
                        "formFieldPath": "hello.1/14-0",
                        "concept": {
                            "shortName": "Temperature"
                        }
                    }, {
                        "groupMembers": [],
                        "formFieldPath": "hello.1/13-0",
                        "concept": {
                            "shortName": "Temperature Abnormal"
                        }
                    }],
                    "formFieldPath": "hello.1/26-0",
                    "concept": {
                        "shortName": "Blood Pressure"
                    }
                }, {
                    "groupMembers": [],
                    "formNamespace": "Bahmni",
                    "formFieldPath": "hello.1/15-0",
                    "concept": {
                        "shortName": "Temperature"
                    }
                }, {
                    "groupMembers": [],
                    "formFieldPath": "hello.1/12-0",
                    "concept": {
                        "shortName": "RR"
                    }
                }, {
                    "groupMembers": [],
                    "formFieldPath": "hello.1/9-0",
                    "concept": {
                        "shortName": "SPO2"
                    }
                }],
                "formFieldPath": "hello.1/3-0",
                "concept": {
                    "shortName": "Vitals"
                }
            }, {
                "groupMembers": [],
                "formFieldPath": "hello.1/1-0",
                "concept": {
                    "shortName": "HEIGHT"
                }
            }, {
                "groupMembers": [],
                "formFieldPath": "hello.1/2-0",

                "concept": {
                    "shortName": "WEIGHT"
                }
            }]
        }];


        var dummyObsGroup = new Bahmni.Common.DisplayControl.Observation.ConstructFunctions().createDummyObsGroupForObservationsForForm(observations);

        expect(dummyObsGroup[0].value.length).toBe(1);
        var firstValue = dummyObsGroup[0].value[0];
        expect(firstValue.concept.shortName).toBe('hello');

        expect(firstValue.groupMembers.length).toBe(3);
        expect(firstValue.groupMembers[0].concept.shortName).toBe("Vitals");
        expect(firstValue.groupMembers[0].groupMembers.length).toBe(4);
        expect(firstValue.groupMembers[0].groupMembers[0].concept.shortName)
            .toBe("Blood Pressure");

        expect(firstValue.groupMembers[1].concept.shortName).toBe("HEIGHT");
        expect(firstValue.groupMembers[2].concept.shortName).toBe("WEIGHT");

    });

    it('should construct dummy obs group for multiple observations from different form', function () {
        var observations = [{
            "key": "1488790440000",
            "value": [{
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "test.2/2-0",
                "concept": {
                    "shortName": "HEIGHT"
                }
            }, {
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "test1.2/2-0",
                "concept": {
                    "shortName": "HEIGHT"
                }
            }, {
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "test.2/1-0",
                "concept": {
                    "shortName": "head nose lateral"
                },
            }, {
                "groupMembers": [],
                "formNamespace": "Bahmni",
                "formFieldPath": "test1.2/1-0",
                "concept": {
                    "shortName": "head nose lateral"
                },
            }]
        }]

        var dummyObsGroup = new Bahmni.Common.DisplayControl.Observation.ConstructFunctions().createDummyObsGroupForObservationsForForm(observations);

        expect(dummyObsGroup[0].value.length).toBe(2);

        var firstValue = dummyObsGroup[0].value[0];
        expect(firstValue.concept.shortName).toBe('test');
        expect(firstValue.groupMembers.length).toBe(2);
        expect(firstValue.groupMembers[0].concept.shortName).toBe("HEIGHT");
        expect(firstValue.groupMembers[1].concept.shortName).toBe("head nose lateral");

        var secondValue = dummyObsGroup[0].value[1];
        expect(secondValue.concept.shortName).toBe('test1');
        expect(secondValue.groupMembers.length).toBe(2);
        expect(secondValue.groupMembers[0].concept.shortName).toBe("HEIGHT");
        expect(secondValue.groupMembers[1].concept.shortName).toBe("head nose lateral");
    });
});