'use strict';

describe("LabResultsMapper", function () {
    it('should map lab result observations', function () {
        var mappedLabResults = new Bahmni.Opd.LabResultsMapper().map(opdEncounter);
        expect(mappedLabResults).not.toBe(null);
        expect(mappedLabResults.length).toBe(2);

        expect(mappedLabResults[0].name).toBe("CD4 Test");
        expect(mappedLabResults[0].value).toBe("some cd4 count result");
        expect(mappedLabResults[0].notes).toEqual(["I am a note"]);
        expect(mappedLabResults[0].members.length).toBe(0);

        expect(mappedLabResults[1].name).toBe("Haematology");
        expect(mappedLabResults[1].value).toBe(null);
        expect(mappedLabResults[1].members.length).toBe(2);

        var panelTests = mappedLabResults[1].members;

        expect(panelTests[0].name).toBe("G6PD");
        expect(panelTests[0].value).toBe("Positive");
        expect(panelTests[0].members.length).toBe(0);

        expect(panelTests[1].name).toBe("HPLC");
        expect(panelTests[1].value).toBe("HDFC");
        expect(panelTests[1].members.length).toBe(0);
    });
});

var opdEncounter = {
    "uuid": "16a8d77d-b89b-4fc8-9a12-4234db6879c7",
    "encounterType": {
        "uuid": "c9614b8a-00e7-11e3-8c55-0800271c1b75",
        "display": "OPD",
        "name": "OPD"
    },
    "obs" : [
        {
            "uuid": "0860d351-e36c-4e7b-9769-d7c4654abc4f",
            "value": null,
            "concept": {
                "uuid": "805233b2-2c27-11e3-86f8-0800271c1b75",
                "display": "Laboratory",
                "name": {
                    "display": "Laboratory",
                    "uuid": "805262e2-2c27-11e3-86f8-0800271c1b75",
                    "name": "Laboratory"
                }
            },
            "groupMembers" : [
                {
                    "uuid": "afb8db04-fa00-4d8e-90d2-b325bc3099b5",
                    "concept": {
                        "uuid": "85660297-3bcb-4ea0-a1b0-ad5eb8459590",
                        "name": {
                            "display": "CD4 Test",
                            "uuid": "3a6bee48-2d02-11e3-86f8-0800271c1b75",
                            "name": "CD4 Test"
                        }
                    },
                    "value": null,
                    "comments": "A",
                    "groupMembers": [
                        {
                            "uuid": "ab19e071-46c4-11e3-8306-0800271c1b75",
                            "concept": {
                                "uuid": "708ac14c-26c1-4209-9e13-3234e3a74a7c",
                                "name": {
                                    "display": "COMMENTS",
                                    "uuid": "50082fa3-e41f-4030-8d6f-4b3159cdb94e",
                                    "name": "COMMENTS"
                                }
                            },
                            "value": "I am a note",
                            "groupMembers": null
                        },
                        {
                            "uuid": "ab19e071-46c4-11e3-8306-0800271c1b75",
                            "concept": {
                                "uuid": "85660297-3bcb-4ea0-a1b0-ad5eb8459590",
                                "name": {
                                    "display": "CD4 Test",
                                    "uuid": "3a6bee48-2d02-11e3-86f8-0800271c1b75",
                                    "name": "CD4 Test"
                                }
                            },
                            "value": "some cd4 count result",
                            "groupMembers": null
                        }
                    ]
                },
                {
                    "uuid": "e3731af3-c85e-4650-836e-b90d7342a236",
                    "concept": {
                        "uuid": "a7de3f2f-7ef1-4773-8cde-9f2adbd81307",
                        "name": {
                            "display": "Haematology",
                            "uuid": "3a82c8de-2d02-11e3-86f8-0800271c1b75",
                            "name": "Haematology"
                        }
                    },
                    "value": null,
                    "groupMembers": [
                        {
                            "uuid": "867b0744-b31b-43a3-b237-d7aaf7bb9ae7",
                            "concept": {
                                "uuid": "f8db2046-f019-4872-bf75-46f5b6dc5099",
                                "name": {
                                    "display": "G6PD",
                                    "uuid": "3b06c044-2d02-11e3-86f8-0800271c1b75",
                                    "name": "G6PD"
                                }
                            },
                            "value": null,
                            "groupMembers": [
                                {
                                    "uuid": "867b0744-b31b-43a3-b237-d7aaf7bb9ae7",
                                    "concept": {
                                        "uuid": "f8db2046-f019-4872-bf75-46f5b6dc5099",
                                        "name": {
                                            "display": "G6PD",
                                            "uuid": "3b06c044-2d02-11e3-86f8-0800271c1b75",
                                            "name": "G6PD"
                                        }
                                    },
                                    "value": "Positive",
                                    "groupMembers": null
                                }
                            ]
                        },
                        {
                            "uuid": "106c9d79-c783-42b4-be0d-32af8009fe7a",
                            "concept": {
                                "uuid": "72426db7-c5d7-4aeb-97ef-23e3a1e62ed5",
                                "name": {
                                    "display": "HPLC",
                                    "uuid": "3b91426e-2d02-11e3-86f8-0800271c1b75",
                                    "name": "HPLC"
                                }
                            },
                            "value": null,
                            "groupMembers": [
                                {
                                    "uuid": "106c9d79-c783-42b4-be0d-32af8009fe7a",
                                    "concept": {
                                        "uuid": "72426db7-c5d7-4aeb-97ef-23e3a1e62ed5",
                                        "name": {
                                            "display": "HPLC",
                                            "uuid": "3b91426e-2d02-11e3-86f8-0800271c1b75",
                                            "name": "HPLC"
                                        }
                                    },
                                    "value": "HDFC",
                                    "groupMembers":null
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}


