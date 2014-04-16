'use strict';

describe("CompoundObservation", function () {
    it("should flatten compound observations", function () {
        var parentConceptSetName = "Temperature";
        var observations = [
            {
                "uuid": "c2edb5e1-b9c3-447a-8d5f-d29579545afd",
                "observationDateTime": "2014-04-07T12:39:16.000+0530",
                "value": "09/04/14, 51.0, false, 52.0, false",
                "concept": {
                    "uuid": "2fbc945b-af3e-11e3-a5d1-0800271c1b75",
                    "name": "XCompoundObservation"
                },
                "groupMembers": [
                    {
                        "uuid": "f27cc50d-507f-4278-8f4d-df26d572757d",
                        "observationDateTime": "2014-04-07T12:39:16.000+0530",
                        "value": "32",
                        "concept": {
                            "uuid": "5a54af95-9bc6-11e3-b8ce-43d3573b23fb",
                            "name": parentConceptSetName
                        },
                        "groupMembers": [],
                        "is_abnormal": false
                    }
                ]
            }
        ];

        var flattenedObservation = new Bahmni.Clinical.CompoundObservation(observations).tree;
        expect(flattenedObservation[0].concept.name).toBe(parentConceptSetName);
        expect(flattenedObservation[0].groupMembers.length).toBe(0);
        expect(flattenedObservation[0].value).toBe("32");
        expect(flattenedObservation[0].is_abnormal).toBe(false);
    });

    it("should flatten compound observation tree", function () {
        var parentConceptSetName = "VITALS_CONCEPT";
        var observations = [
            {
                "groupMembers": [
                    {
                        "groupMembers": [
                            {
                                "groupMembers": [
                                    {
                                        "groupMembers": [],
                                        "uuid": "9425ad19-a979-4991-9741-ec5028b0e68a",
                                        "observationDateTime": "2014-04-07T12:39:36.000+0530",
                                        "value": "2014-04-09",
                                        "concept": {
                                            "uuid": "e7616b06-9913-4bbd-87a9-d616e4d5eeea",
                                            "name": "DateTime"
                                        }
                                    }
                                ],
                                "uuid": "2ecabf8e-4327-4004-a136-6e7758cb2f1f",
                                "observationDateTime": "2014-04-07T12:39:16.000+0530",
                                "value": "09/04/14",
                                "concept": {
                                    "uuid": "2fbc945b-af3e-11e3-a5d1-0800271c1b75",
                                    "name": "XCompoundObservation"
                                }
                            },
                            {
                                "groupMembers": [
                                    {
                                        "groupMembers": [],
                                        "uuid": "5a4f90a7-097d-4e84-9ac1-d72061c6ef07",
                                        "observationDateTime": "2014-04-07T12:39:39.000+0530",
                                        "value": 51,
                                        "concept": {
                                            "uuid": "0d632478-a43f-4b51-bf27-36dee98fe019",
                                            "name": "Temperature"
                                        },
                                        "is_abnormal": false
                                    }
                                ],
                                "uuid": "beb36652-f16c-4718-bc08-688fd0d0568a",
                                "observationDateTime": "2014-04-07T12:39:16.000+0530",
                                "value": "51.0, false",
                                "concept": {
                                    "uuid": "2fbc945b-af3e-11e3-a5d1-0800271c1b75",
                                    "name": "XCompoundObservation"
                                }
                            },
                            {
                                "groupMembers": [
                                    {
                                        "groupMembers": [],
                                        "uuid": "fa8c6a38-30b8-4f33-9f03-2b32ef9fb47e",
                                        "observationDateTime": "2014-04-07T12:39:45.000+0530",
                                        "value": 52,
                                        "concept": {
                                            "uuid": "7fae43d1-ca80-4685-8694-f827d0363252",
                                            "name": "Systolic"
                                        },
                                        "is_abnormal": true
                                    }
                                ],
                                "uuid": "01290b86-b110-4b64-99cc-6464a16d6f65",
                                "observationDateTime": "2014-04-07T12:39:16.000+0530",
                                "value": "52.0, false",
                                "concept": {
                                    "uuid": "2fbc945b-af3e-11e3-a5d1-0800271c1b75",
                                    "name": "XCompoundObservation"
                                }
                            }
                        ],
                        "uuid": "f27cc50d-507f-4278-8f4d-df26d572757d",
                        "observationDateTime": "2014-04-07T12:39:16.000+0530",
                        "value": "09/04/14, 51.0, false, 52.0, false",
                        "concept": {
                            "uuid": "5a54af95-9bc6-11e3-b8ce-43d3573b23fb",
                            "name": parentConceptSetName
                        }
                    }
                ],
                "uuid": "c2edb5e1-b9c3-447a-8d5f-d29579545afd",
                "observationDateTime": "2014-04-07T12:39:16.000+0530",
                "value": "09/04/14, 51.0, false, 52.0, false",
                "concept": {
                    "uuid": "2fbc945b-af3e-11e3-a5d1-0800271c1b75",
                    "name": "XCompoundObservation"
                }
            }
        ];

        var flattenedObservations = new Bahmni.Clinical.CompoundObservation(observations).tree;
        expect(flattenedObservations[0].concept.name).toBe(parentConceptSetName);
        expect(flattenedObservations[0].groupMembers.length).toBe(3);
        expect(flattenedObservations[0].value).toBe(undefined);
        expect(flattenedObservations[0].is_abnormal).toBe(undefined);
        expect(observationThatMatches("DateTime", "2014-04-09", undefined, flattenedObservations[0].groupMembers)).toBe(true);
        expect(observationThatMatches("Temperature", 51, false, flattenedObservations[0].groupMembers)).toBe(true);
        expect(observationThatMatches("Systolic", 52, true, flattenedObservations[0].groupMembers)).toBe(true);
    });

    var observationThatMatches = function (name, value, isAbnormal, groupMembers) {
        var matchedObs = groupMembers.filter(function (member) {
            return member.concept.name == name && member.value == value && member.is_abnormal == isAbnormal;
        });
        return matchedObs.length == 1;
    };
});

