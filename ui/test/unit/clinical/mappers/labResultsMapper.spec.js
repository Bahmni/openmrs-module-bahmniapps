'use strict';

describe("LabResultsMapper", function () {
    it('should map lab result observations', function () {
        var mappedLabResults = new Bahmni.LabResultsMapper().map(encounterTransaction);
        expect(mappedLabResults).not.toBe(null);
        expect(mappedLabResults.length).toBe(1);

        expect(mappedLabResults[0].name).toBe("Anaemia Panel");
        expect(mappedLabResults[0].value).toBe("100.0");
       // expect(mappedLabResults[0].notes).toEqual(["I am a note"]);
        expect(mappedLabResults[0].members.length).toBe(1);

       /* expect(mappedLabResults[1].name).toBe("Haematology");
        expect(mappedLabResults[1].value).toBe(null);
        expect(mappedLabResults[1].members.length).toBe(2);

        var panelTests = mappedLabResults[1].members;

        expect(panelTests[0].name).toBe("G6PD");
        expect(panelTests[0].value).toBe("Positive");
        expect(panelTests[0].members.length).toBe(0);

        expect(panelTests[1].name).toBe("HPLC");
        expect(panelTests[1].value).toBe("HDFC");
        expect(panelTests[1].members.length).toBe(0);*/
    });
});

var encounterTransaction = {
    "disposition": {
    "code": "TRANSFER",
        "conceptName": "Transfer Patient",
        "voided": false,
        "voidReason": null,
        "existingObs": "c61436b6-7813-42fd-8af2-eb5d23ed726c",
        "additionalObs": [

    ],
        "dispositionDateTime": "2013-10-30T11:19:42.000+0530"
},
    "drugOrders": [

],
    "visitUuid": "5b80bd12-567c-4d80-a3a8-89705d02a9cb",
    "diagnoses": [
    {
        "order": "PRIMARY",
        "freeTextAnswer": null,
        "codedAnswer": {
            "uuid": "136f3581-2d4e-42a2-ad86-6b48a334d881",
            "name": "Headache, Migraine"
        },
        "certainty": "PRESUMED",
        "existingObs": "33010d9f-7530-416b-bcda-996dfbaabeba",
        "diagnosisDateTime": "2013-12-10T16:55:06.000+0530"
    },
    {
        "order": "PRIMARY",
        "freeTextAnswer": null,
        "codedAnswer": {
            "uuid": "116786AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            "name": "Stomach Injury"
        },
        "certainty": "PRESUMED",
        "existingObs": "fb64a33f-e11e-4ff0-853e-ac17d3d29317",
        "diagnosisDateTime": "2013-12-10T16:55:06.000+0530"
    },
    {
        "order": "PRIMARY",
        "freeTextAnswer": null,
        "codedAnswer": {
            "uuid": "3cd24178-26fe-102b-80cb-0017a47871b2",
            "name": "Headache"
        },
        "certainty": "PRESUMED",
        "existingObs": "48344681-eb38-4abe-b91c-cb3fc6309faa",
        "diagnosisDateTime": "2013-12-10T16:55:06.000+0530"
    },
    {
        "order": "PRIMARY",
        "freeTextAnswer": null,
        "codedAnswer": {
            "uuid": "3ccdf6b8-26fe-102b-80cb-0017a47871b2",
            "name": "Pharyngitis"
        },
        "certainty": "PRESUMED",
        "existingObs": "1d8e6bc5-408c-486f-8d40-2f94d9964556",
        "diagnosisDateTime": "2013-12-10T16:55:06.000+0530"
    },
    {
        "order": "PRIMARY",
        "freeTextAnswer": null,
        "codedAnswer": {
            "uuid": "116786AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            "name": "Stomach Injury"
        },
        "certainty": "PRESUMED",
        "existingObs": "43397666-8260-43b7-84e2-0339a7262280",
        "diagnosisDateTime": "2013-12-10T16:55:06.000+0530"
    },
    {
        "order": "PRIMARY",
        "freeTextAnswer": null,
        "codedAnswer": {
            "uuid": "136f3581-2d4e-42a2-ad86-6b48a334d881",
            "name": "Headache, Migraine"
        },
        "certainty": "PRESUMED",
        "existingObs": "aa0d2c5f-caa1-491c-93c4-36b42769e6ad",
        "diagnosisDateTime": "2013-12-10T16:55:06.000+0530"
    },
    {
        "order": "PRIMARY",
        "freeTextAnswer": null,
        "codedAnswer": {
            "uuid": "3cd24178-26fe-102b-80cb-0017a47871b2",
            "name": "Headache"
        },
        "certainty": "PRESUMED",
        "existingObs": "4168fbb4-43c0-41a0-a8a4-3af38561bb10",
        "diagnosisDateTime": "2013-12-10T16:55:06.000+0530"
    }
],
    "encounterTypeUuid": "df95a01c-0a6a-11e3-87b2-05a83b2f3a98",
    "locationUuid": null,
    "visitTypeUuid": "9174aa52-3c7f-11e3-8f4c-005056823ee5",
    "encounterUuid": "c99a67b6-0d89-4428-8967-b9949dadbd10",
    "patientUuid": "e45a520d-31c6-4782-a4f7-e73f011d3325",
    "orders": [
    {
        "instructions": null,
        "uuid": "b44fb9d9-61ea-4f44-bbbe-82f9cb8540fa",
        "voided": false,
        "voidReason": null,
        "orderTypeUuid": "9089fcd9-3c7f-11e3-8f4c-005056823ee5",
        "concept": {
            "uuid": "8620c5e3-28e1-4aa9-83ea-8b3254d61057",
            "name": "Urine Microscopy"
        }
    },
    {
        "instructions": null,
        "uuid": "0a5ef9f7-62d6-4ffe-b823-e64b881960bb",
        "voided": false,
        "voidReason": null,
        "orderTypeUuid": "9089fcd9-3c7f-11e3-8f4c-005056823ee5",
        "concept": {
            "uuid": "ec3aac64-4994-4da0-827d-866e5c9137a6",
            "name": "Hb1AC"
        }
    },
    {
        "instructions": null,
        "uuid": "028fcf04-4f4b-464f-820b-5d2af33e36cd",
        "voided": false,
        "voidReason": null,
        "orderTypeUuid": "9089fcd9-3c7f-11e3-8f4c-005056823ee5",
        "concept": {
            "uuid": "6e12daa4-488f-4104-b8d8-b0a6f07d53ee",
            "name": "Haemoglobin"
        }
    },
    {
        "instructions": null,
        "uuid": "16116d20-60fe-4a84-b23c-2a7b773cf8ba",
        "voided": false,
        "voidReason": null,
        "orderTypeUuid": "9089fcd9-3c7f-11e3-8f4c-005056823ee5",
        "concept": {
            "uuid": "98e4000d-f400-474b-83c0-0ac2981ec5aa",
            "name": "Anaemia Panel"
        }
    },
    {
        "instructions": null,
        "uuid": "9f4c5029-47e8-47f6-b376-2e421a945799",
        "voided": false,
        "voidReason": null,
        "orderTypeUuid": "9089fcd9-3c7f-11e3-8f4c-005056823ee5",
        "concept": {
            "uuid": "095e38c4-dac7-4127-94db-8ca44df3fa08",
            "name": "Urine LE/Nitrite"
        }
    },
    {
        "instructions": null,
        "uuid": "5b2b2a50-396c-4612-a33f-03630722cabd",
        "voided": false,
        "voidReason": null,
        "orderTypeUuid": "9089fcd9-3c7f-11e3-8f4c-005056823ee5",
        "concept": {
            "uuid": "91c219b6-8a06-4f74-8240-c4b214ea2af0",
            "name": "Coagulation Factor"
        }
    },
    {
        "instructions": null,
        "uuid": "931090b9-d0b1-49a5-8c7d-bbedfba8e648",
        "voided": false,
        "voidReason": null,
        "orderTypeUuid": "9089fcd9-3c7f-11e3-8f4c-005056823ee5",
        "concept": {
            "uuid": "88e77bea-1675-47cf-818d-657a1ceafc7b",
            "name": "CD4 Test"
        }
    },
    {
        "instructions": null,
        "uuid": "6de2b7a4-9969-420e-b829-80c6e61ec41b",
        "voided": false,
        "voidReason": null,
        "orderTypeUuid": "9089fcd9-3c7f-11e3-8f4c-005056823ee5",
        "concept": {
            "uuid": "6c13029c-d411-44c7-a38d-430d6429d0ec",
            "name": "Differential Count"
        }
    },
    {
        "instructions": null,
        "uuid": "a2e48f80-ea34-42a8-ba37-543d85ed8470",
        "voided": false,
        "voidReason": null,
        "orderTypeUuid": "9089fcd9-3c7f-11e3-8f4c-005056823ee5",
        "concept": {
            "uuid": "edb38f72-6b87-4120-8245-104fbcd6d14b",
            "name": "Cross Match"
        }
    },
    {
        "instructions": null,
        "uuid": "d56c83a0-18b2-4e6c-87a3-cc9909f1461c",
        "voided": false,
        "voidReason": null,
        "orderTypeUuid": "9089fcd9-3c7f-11e3-8f4c-005056823ee5",
        "concept": {
            "uuid": "79b4cc56-84c6-49db-81e4-33b79e24bcbb",
            "name": "Hb Electrophoresis"
        }
    }
],
    "encounterDateTime": "2013-10-30T11:19:42.000+0530",
    "providers": [

],
    "observations": [
    {
        "groupMembers": [

        ],
        "uuid": "656fc921-daf0-4ab6-8e12-fb4a1192ab52",
        "voidReason": null,
        "observationDateTime": "2013-12-10T16:55:06.000+0530",
        "orderUuid": null,
        "value": "notes 3 notes 2 notes 1",
        "comment": null,
        "concept": {
            "uuid": "84b1fa76-4c48-11e3-af13-005056821db0",
            "name": "Consultation Note"
        },
        "voided": false
    },
    {
        "groupMembers": [
            {
                "groupMembers": [
                    {
                        "groupMembers": [
                            {
                                "groupMembers": [

                                ],
                                "uuid": "a3a08e07-93dc-44c2-b321-2520f44c3408",
                                "voidReason": null,
                                "observationDateTime": "2013-10-30T11:19:42.000+0530",
                                "orderUuid": null,
                                "value": "Hello World",
                                "comment": null,
                                "concept": {
                                    "uuid": "b4a3ebc0-c79a-11e2-b284-107d46e7b2c5",
                                    "name": "COMMENTS"
                                },
                                "voided": false
                            }
                        ],
                        "uuid": "e12a2b80-44cf-4283-8302-4a0700adf0ad",
                        "voidReason": null,
                        "observationDateTime": "2013-10-30T11:19:42.000+0530",
                        "orderUuid": null,
                        "value": 100.0,
                        "comment": null,
                        "concept": {
                            "uuid": "ab137c0f-5a23-4314-ab8d-29b8ff91fbfb",
                            "name": "Absolute Eosinphil Count"
                        },
                        "voided": false
                    }
                ],
                "uuid": "b4df7079-e804-46ff-b20a-620075b79aa8",
                "voidReason": null,
                "observationDateTime": "2013-10-30T11:19:42.000+0530",
                "orderUuid": null,
                "value": "100.0",
                "comment": null,
                "concept": {
                    "uuid": "98e4000d-f400-474b-83c0-0ac2981ec5aa",
                    "name": "Anaemia Panel"
                },
                "voided": false
            }
        ],
        "uuid": "fcc035fd-6526-476f-87ad-fe3bac44bf7b",
        "voidReason": null,
        "observationDateTime": "2013-10-30T11:19:42.000+0530",
        "orderUuid": null,
        "value": "100.0",
        "comment": null,
        "concept": {
            "uuid": "db6fcf3d-0a6a-11e3-87b2-05a83b2f3a98",
            "name": Bahmni.Clinical.Constants.labConceptSetName
        },
        "voided": false
    }
]
}






