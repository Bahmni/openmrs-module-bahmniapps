'use strict';

describe("SurgicalBlockMapper", function () {
    var surgicalBlockMapper;
    beforeEach(function () {
        surgicalBlockMapper = new Bahmni.OT.SurgicalBlockMapper();
    });
    var singlePrimaryDiagnosis = [
        {
            "uuid": "adbd89ba-c847-4d6c-abda-ac32ff6fac7b",
            "display": "Coded Diagnosis: Pneumonia",
            "concept": {
                "display": "Coded Diagnosis"
            },
            "obsDatetime": "2024-02-10T10:00:00.000+0000",
            "obsGroup": {
                "display": "Visit Diagnoses: Pneumonia, Confirmed, Primary"
            },
            "value": {
                "display": "Pneumonia"
            },
            "links": [
                {
                    "rel": "self",
                    "uri": "http://example.com/obs/1"
                }
            ]
        },
        {
            "uuid": "5",
            "display": "Non-coded Diagnosis",
            "concept": {
                "display": "Non-coded Diagnosis"
            },
            "obsDatetime": "2024-02-13T10:00:00.000+0000",
            "obsGroup": {
                "display": "Visit Diagnoses: Uncoded, Confirmed, Primary"
            },
            "value": "Uncoded Diagnosis",
            "links": [
                {
                    "rel": "self",
                    "uri": "http://example.com/obs/5"
                }
            ]
        },
        {
            "uuid": "3",
            "display": "Coded Diagnosis: Hypertension",
            "concept": {
                "display": "Coded Diagnosis"
            },
            "obsDatetime": "2024-02-12T10:00:00.000+0000",
            "obsGroup": {
                "display": "Visit Diagnoses: Hypertension, Confirmed, Primary"
            },
            "value": {
                "display": "Hypertension"
            },
            "links": [
                {
                    "rel": "self",
                    "uri": "http://example.com/obs/3"
                }
            ]
        },
        {
            "uuid": "4",
            "display": "Coded Diagnosis: Hypertension",
            "concept": {
                "display": "Coded Diagnosis"
            },
            "obsDatetime": "2024-02-11T09:00:00.000+0000",
            "obsGroup": {
                "display": "Visit Diagnoses: Hypertension, Confirmed"
            },
            "value": {
                "display": "Hypertension"
            },
            "links": [
                {
                    "rel": "self",
                    "uri": "http://example.com/obs/4"
                }
            ]
        },
        {
            "uuid": "2",
            "display": "Coded Diagnosis: Bronchitis",
            "concept": {
                "display": "Coded Diagnosis"
            },
            "obsDatetime": "2024-02-11T10:00:00.000+0000",
            "obsGroup": {
                "display": "Visit Diagnoses: Bronchitis, Confirmed, Primary"
            },
            "value": {
                "display": "Bronchitis"
            },
            "links": [
                {
                    "rel": "self",
                    "uri": "http://example.com/obs/2"
                }
            ]
        },
        {
            "uuid": "2",
            "display": "Coded Diagnosis: Bronchitis",
            "concept": {
                "display": "Coded Diagnosis"
            },
            "obsDatetime": "2024-02-11T11:00:00.000+0000",
            "obsGroup": {
                "display": "Visit Diagnoses: Bronchitis, Confirmed, Primary"
            },
            "value": {
                "display": "Bronchitis"
            },
            "links": [
                {
                    "rel": "self",
                    "uri": "http://example.com/obs/2"
                }
            ]
        }
    ]
    var surgeonList = [
        {
            "id": 18,
            "uuid": "55b4ebe6-a00b-4ee1-8691-a71513bc3253",
            "person": {
                "uuid": "e25196dc-9934-423a-99e9-0838bc8c9856",
                "display": "Eman Fawzi"
            }
        },
        {
            "id": 47,
            "uuid": "176cc01a-1617-11e7-85a5-080027b18094",
            "person": {
                "uuid": "176bd597-1617-11e7-85a5-080027b18094",
                "display": "Hilana Alkharouf"
            }
        }
    ];

    var appointmentAttributeTypes = [
        {
            "uuid": "bde7e794-3f81-11e7-97ea-0800274a5156",
            "name": "procedure"
        },
        {
            "uuid": "bde80e15-3f81-11e7-97ea-0800274a5156",
            "name": "estTimeHours"
        },
        {
            "uuid": "bde85c99-3f81-11e7-97ea-0800274a5156",
            "name": "estTimeMinutes"
        },
        {
            "uuid": "bde8c614-3f81-11e7-97ea-0800274a5156",
            "name": "cleaningTime"
        },
        {
            "uuid": "bde8faf8-3f81-11e7-97ea-0800274a5156",
            "name": "otherSurgeon"
        },
        {
            "uuid": "bde92009-3f81-11e7-97ea-0800274a5156",
            "name": "surgicalAssistant"
        },
        {
            "uuid": "bde9429e-3f81-11e7-97ea-0800274a5156",
            "name": "anaesthetist"
        },
        {
            "uuid": "bde96224-3f81-11e7-97ea-0800274a5156",
            "name": "scrubNurse"
        },
        {
            "uuid": "bde9821c-3f81-11e7-97ea-0800274a5156",
            "name": "circulatingNurse"
        },
        {
            "uuid": "bde9821c-3f81-11e7-97ea-0800274a5156",
            "name": "notes"
        },
        {
            "uuid": "bde93f81-821c-11e7-97ea-0800274a5156",
            "name": "patientObservations"
        }
    ];

    var surgicalAppointmentAttributesResponseFromServer = [
        {
            "id": 104,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde80e15-3f81-11e7-97ea-0800274a5156",
                "name": "estTimeHours",
                "format": "java.lang.String",
                "sortWeight": 2,
                "resourceVersion": "1.8"
            },
            "value": "1",
            "resourceVersion": "1.8"
        },
        {
            "id": 105,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde9429e-3f81-11e7-97ea-0800274a5156",
                "name": "anaesthetist",
                "format": "java.lang.String",
                "sortWeight": 7,
                "resourceVersion": "1.8"
            },
            "value": "Anaesthetist",
            "resourceVersion": "1.8"
        },
        {
            "id": 106,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde8faf8-3f81-11e7-97ea-0800274a5156",
                "name": "otherSurgeon",
                "format": "org.openmrs.Provider",
                "sortWeight": 5,
                "resourceVersion": "1.8"
            },
            "value": "47",
            "resourceVersion": "1.8"
        },
        {
            "id": 107,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde92009-3f81-11e7-97ea-0800274a5156",
                "name": "surgicalAssistant",
                "format": "java.lang.String",
                "sortWeight": 6,
                "resourceVersion": "1.8"
            },
            "value": "surgicalAssistant",
            "resourceVersion": "1.8"
        },
        {
            "id": 108,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde7e794-3f81-11e7-97ea-0800274a5156",
                "name": "procedure",
                "format": "java.lang.String",
                "sortWeight": 1,
                "resourceVersion": "1.8"
            },
            "value": "procedure",
            "resourceVersion": "1.8"
        },
        {
            "id": 109,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde96224-3f81-11e7-97ea-0800274a5156",
                "name": "scrubNurse",
                "format": "java.lang.String",
                "sortWeight": 8,
                "resourceVersion": "1.8"
            },
            "value": "scrub nurse",
            "resourceVersion": "1.8"
        },
        {
            "id": 110,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde85c99-3f81-11e7-97ea-0800274a5156",
                "name": "estTimeMinutes",
                "format": "java.lang.String",
                "sortWeight": 3,
                "resourceVersion": "1.8"
            },
            "value": "30",
            "resourceVersion": "1.8"
        },
        {
            "id": 111,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde9821c-3f81-11e7-97ea-0800274a5156",
                "name": "circulatingNurse",
                "format": "java.lang.String",
                "sortWeight": 9,
                "resourceVersion": "1.8"
            },
            "value": "circulating nurse",
            "resourceVersion": "1.8"
        },
        {
            "id": 112,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde8c614-3f81-11e7-97ea-0800274a5156",
                "name": "cleaningTime",
                "format": "java.lang.String",
                "sortWeight": 4,
                "resourceVersion": "1.8"
            },
            "value": "15",
            "resourceVersion": "1.8"
        }
    ];

    var openmrsSurgicalAppointmentAttributes = [
        {
            "id": 104,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde80e15-3f81-11e7-97ea-0800274a5156",
                "name": "estTimeHours"
            },
            "value": "0"
        },
        {
            "id": 105,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde9429e-3f81-11e7-97ea-0800274a5156",
                "name": "anaesthetist"
            },
            "value": "Anaesthetist"
        },
        {
            "id": 106,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde8faf8-3f81-11e7-97ea-0800274a5156",
                "name": "otherSurgeon"
            },
            "value": "47"
        },
        {
            "id": 107,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde92009-3f81-11e7-97ea-0800274a5156",
                "name": "surgicalAssistant"
            },
            "value": ""
        },
        {
            "id": 108,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde7e794-3f81-11e7-97ea-0800274a5156",
                "name": "procedure"
            },
            "value": "procedure"
        },
        {
            "id": 109,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde96224-3f81-11e7-97ea-0800274a5156",
                "name": "scrubNurse"
            },
            "value": "scrub nurse"
        },
        {
            "id": 110,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde85c99-3f81-11e7-97ea-0800274a5156",
                "name": "estTimeMinutes"
            },
            "value": "30"
        },
        {
            "id": 111,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde9821c-3f81-11e7-97ea-0800274a5156",
                "name": "circulatingNurse"
            },
            "value": "circulating nurse"
        },
        {
            "id": 112,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde8c614-3f81-11e7-97ea-0800274a5156",
                "name": "cleaningTime"
            },
            "value": "15"
        },
        {
            "id": 113,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde8c614-3f81-11e7-97ea-0800274a5156",
                "name": "notes"
            },
            "value": "notes"
        }
    ];

    var uiSurgicalAppointmentAttributes = {
        "estTimeHours": {
            "id": 104,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde80e15-3f81-11e7-97ea-0800274a5156",
                "name": "estTimeHours"
            },
            "value": 0
        }, "anaesthetist": {
            "id": 105,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde9429e-3f81-11e7-97ea-0800274a5156",
                "name": "anaesthetist"
            },
            "value": "Anaesthetist"
        }, "otherSurgeon": {
            "id": 106,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde8faf8-3f81-11e7-97ea-0800274a5156",
                "name": "otherSurgeon"
            },
            "value": {
                "id": 47,
                "uuid": "176cc01a-1617-11e7-85a5-080027b18094",
                "person": {
                    "uuid": "176bd597-1617-11e7-85a5-080027b18094",
                    "display": "Hilana Alkharouf"
                }
            }
        }, "surgicalAssistant": {
            "id": 107,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde92009-3f81-11e7-97ea-0800274a5156",
                "name": "surgicalAssistant"
            },
            "value": null
        }, "procedure": {
            "id": 108,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde7e794-3f81-11e7-97ea-0800274a5156",
                "name": "procedure"
            },
            "value": "procedure"
        }, "scrubNurse": {
            "id": 109,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde96224-3f81-11e7-97ea-0800274a5156",
                "name": "scrubNurse"
            },
            "value": "scrub nurse"
        }, "estTimeMinutes": {
            "id": 110,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde85c99-3f81-11e7-97ea-0800274a5156",
                "name": "estTimeMinutes"
            },
            "value": 30
        }, "circulatingNurse": {
            "id": 111,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde9821c-3f81-11e7-97ea-0800274a5156",
                "name": "circulatingNurse"
            },
            "value": "circulating nurse"
        }, "cleaningTime": {
            "id": 112,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde8c614-3f81-11e7-97ea-0800274a5156",
                "name": "cleaningTime"
            },
            "value": 15
        }, "notes": {
            "id": 113,
            "surgicalAppointmentAttributeType": {
                "uuid": "bde8c614-3f81-11e7-97ea-0800274a5156",
                "name": "notes"
            },
            "value": "notes"
        }
    };

    it('Should map the openmrsSurgicalBlock with appointments and appointment attributes to the UISurgicalBlock', function () {
        var surgicalBlock = {};
        surgicalBlock.id = 10;
        surgicalBlock.uuid = "blockUuid";
        surgicalBlock.voided = false;
        surgicalBlock.startDatetime = "2017-05-25T09:00:00.000+0530";
        surgicalBlock.endDatetime = "2017-05-25T18:00:00.000+0530";
        surgicalBlock.provider = {uuid: "providerUuid"};
        surgicalBlock.location = {uuid: "locationUuid"};
        surgicalBlock.surgicalAppointments = [{id: 11, patientObservations: singlePrimaryDiagnosis, uuid: "appointmentUuid", voided: false, patient: {uuid: "patientUuid"}, notes: "need more assistants", sortWeight: 1, bedLocation: "Ward", bedNumber: "209/2", surgicalAppointmentAttributes: surgicalAppointmentAttributesResponseFromServer},
            {id: 12, uuid: "appointmentUuid", voided: false, patient: {uuid: "patientUuid"}, notes: "need more assistants", bedLocation: null, bedNumber: null, sortWeight: 0, surgicalAppointmentAttributes: []}];

        var surgicalForm = {};
        surgicalForm.id = 10;
        surgicalForm.uuid = "blockUuid";
        surgicalForm.voided = false;
        surgicalForm.startDatetime = "Date(Thu May 25 2017 09:00:00 GMT+0530 (IST))";
        surgicalForm.endDatetime = "Date(Thu May 25 2017 18:00:00 GMT+0530 (IST))";
        surgicalForm.provider = {uuid: "providerUuid"};
        surgicalForm.location = {uuid: "locationUuid"};
        surgicalForm.surgicalAppointments = [{id: "11", uuid: "appointmentUuid", voided: false, patient: {uuid: "patientUuid"}, notes: "need more assistants", sortWeight: 0, surgicalAppointmentAttributes: uiSurgicalAppointmentAttributes}];

        var mappedToUISurgicalBlock = surgicalBlockMapper.map(surgicalBlock, appointmentAttributeTypes, surgeonList);

        expect(mappedToUISurgicalBlock.id).toBe(surgicalForm.id);
        expect(mappedToUISurgicalBlock.voided).toBeFalsy();
        expect(mappedToUISurgicalBlock.provider).toEqual(surgicalForm.provider);
        expect(mappedToUISurgicalBlock.location).toEqual(surgicalForm.location);
        expect(mappedToUISurgicalBlock.surgicalAppointments[0].sortWeight).toBe(0);
        expect(mappedToUISurgicalBlock.surgicalAppointments[0].id).toBe(12);
        expect(mappedToUISurgicalBlock.surgicalAppointments[1].sortWeight).toBe(1);
        expect(mappedToUISurgicalBlock.surgicalAppointments[1].id).toBe(11);
        expect(mappedToUISurgicalBlock.surgicalAppointments[0].bedLocation).toBe("");
        expect(mappedToUISurgicalBlock.surgicalAppointments[0].bedNumber).toBe("");
        expect(mappedToUISurgicalBlock.surgicalAppointments[1].bedLocation).toBe("Ward");
        expect(mappedToUISurgicalBlock.surgicalAppointments[1].bedNumber).toBe("209/2");
        expect(mappedToUISurgicalBlock.surgicalAppointments[1].primaryDiagnosis).toBe("Pneumonia, Uncoded Diagnosis, Hypertension, Bronchitis")
    });

    it('Should map the UISurgicalBlock with appointments and appointment attributes to the openmrsSurgicalBlock', function () {
        var surgicalBlock = {};
        surgicalBlock.id = 10;
        surgicalBlock.uuid = "blockUuid";
        surgicalBlock.voided = false;
        surgicalBlock.startDatetime = "2017-05-25T09:00:00.000+0530";
        surgicalBlock.endDatetime = "2017-05-25T18:00:00.000+0530";
        surgicalBlock.provider = {uuid: "providerUuid"};
        surgicalBlock.location = {uuid: "locationUuid"};
        surgicalBlock.surgicalAppointments = [{id: "11", uuid: "appointmentUuid",status: undefined,
            notes : undefined, voided: false, patient: {uuid: "patientUuid"}, sortWeight: 0, actualStartDatetime: "2017-05-25T10:00:00.000+0530", actualEndDatetime: "2017-05-25T12:00:00.000+0530", surgicalAppointmentAttributes: openmrsSurgicalAppointmentAttributes}];

        var surgicalForm = {};
        surgicalForm.id = 10;
        surgicalForm.uuid = "blockUuid";
        surgicalForm.voided = false;
        surgicalForm.startDatetime = "Date(Thu May 25 2017 09:00:00 GMT+0530 (IST))";
        surgicalForm.endDatetime = "Date(Thu May 25 2017 18:00:00 GMT+0530 (IST))";
        surgicalForm.provider = {uuid: "providerUuid"};
        surgicalForm.location = {uuid: "locationUuid"};
        surgicalForm.surgicalAppointments = [{
            id: "11",
            uuid: "appointmentUuid",
            voided: false,
            patient: {uuid: "patientUuid"},
            sortWeight: 0,
            actualStartDatetime: "2017-05-25T10:00:00.000+0530",
            actualEndDatetime: "2017-05-25T12:00:00.000+0530",
            surgicalAppointmentAttributes: uiSurgicalAppointmentAttributes
        }];

        var mappedToOpenmrsSurgicalBlock = surgicalBlockMapper.mapSurgicalBlockUIToDomain(surgicalForm);

        expect(mappedToOpenmrsSurgicalBlock.id).toBe(surgicalBlock.id);
        expect(mappedToOpenmrsSurgicalBlock.voided).toBeFalsy();
        expect(mappedToOpenmrsSurgicalBlock.provider).toEqual(surgicalBlock.provider);
        expect(mappedToOpenmrsSurgicalBlock.location).toEqual(surgicalBlock.location);
        expect(mappedToOpenmrsSurgicalBlock.surgicalAppointments).toEqual(surgicalBlock.surgicalAppointments);
    });

    it("Should add the missing attributes to UISurgicalBlock attributes from the attributeTypes and default values for cleaningTime, estTimeHours, estTimeMinutes", function () {
        var attributes = {
            "surgicalAssistant": {
                "id": 107,
                "surgicalAppointmentAttributeType": {
                    "uuid": "bde92009-3f81-11e7-97ea-0800274a5156",
                    "name": "surgicalAssistant"
                },
                "value": "Dr. yaya"
            }, "procedure": {
                "id": 108,
                "surgicalAppointmentAttributeType": {
                    "uuid": "bde7e794-3f81-11e7-97ea-0800274a5156",
                    "name": "procedure"
                },
                "value": "surgery on left leg"
            }
        };

        var mappedAttributes = surgicalBlockMapper.mapAttributes(attributes, appointmentAttributeTypes);


        expect(_.keys(mappedAttributes).length).toBe(11);
        expect(mappedAttributes.cleaningTime.value).toBe(15);
        expect(mappedAttributes.estTimeMinutes.value).toBe(0);
        expect(mappedAttributes.estTimeHours.value).toBe(0);
        expect(mappedAttributes.surgicalAssistant.value).toBe("Dr. yaya");
        expect(mappedAttributes.procedure.value).toBe("surgery on left leg");
        expect(mappedAttributes.otherSurgeon.value).toBe("");
        expect(mappedAttributes.otherSurgeon.surgicalAppointmentAttributeType.name).toBe("otherSurgeon");
        expect(mappedAttributes.anaesthetist.value).toBe("");
        expect(mappedAttributes.anaesthetist.surgicalAppointmentAttributeType.name).toBe("anaesthetist");
        expect(mappedAttributes.scrubNurse.value).toBe("");
        expect(mappedAttributes.scrubNurse.surgicalAppointmentAttributeType.name).toBe("scrubNurse");
        expect(mappedAttributes.circulatingNurse.value).toBe("");
        expect(mappedAttributes.circulatingNurse.surgicalAppointmentAttributeType.name).toBe("circulatingNurse");
        expect(mappedAttributes.notes.value).toBe("");
        expect(mappedAttributes.notes.surgicalAppointmentAttributeType.name).toBe("notes");
    });

    it('should map primary Diagnosis', function () {
        const diagnosisObs =[
            {
                "uuid": "3936e653-aa98-4f55-a6d8-1fe20834f9bf",
                "display": "Coded Diagnosis: Hemarthrosis hand",
                "concept": {
                    "uuid": "81c7149b-3f10-11e4-adec-0800271c1b75",
                    "display": "Coded Diagnosis",
                },
                "obsDatetime": "2023-10-17T01:27:03.000+0530",
                "accessionNumber": null,
                "obsGroup": {
                    "uuid": "0e8b32d7-59ab-4950-b4e8-fb85e2bab5f1",
                    "display": "Visit Diagnoses: Confirmed, Primary, Hemarthrosis hand, 0e8b32d7-59ab-4950-b4e8-fb85e2bab5f1, false",
                },
                "valueCodedName": null,
                "groupMembers": null,
                "comment": null,
                "location": {
                    "uuid": "0fbbeaf4-f3ea-11ed-a05b-0242ac120002",
                    "display": "CURE Ethiopia",
                },
                "order": null,
                "encounter": {
                    "uuid": "c463dfa2-b957-48a4-b48b-f581bcabb47b",
                    "display": "Consultation 10/17/2023",
                },
                "voided": false,
                "value": {
                    "uuid": "742f0998-243c-4c86-94f7-0b176b0daf93",
                    "display": "Hemarthrosis hand",
                    "name": {
                        "display": "Hemarthrosis hand",
                        "uuid": "1cf38f1c-6fd3-4ef5-8728-880bbb1b4deb",
                        "name": "Hemarthrosis hand",
                        "locale": "en",
                        "localePreferred": true,
                        "conceptNameType": "FULLY_SPECIFIED",
                        "resourceVersion": "1.9"
                    },
                    "datatype": {
                        "uuid": "8d4a4c94-c2cc-11de-8d13-0010c6dffd0f",
                        "display": "N/A"
                    },
                    "conceptClass": {
                        "uuid": "8d4918b0-c2cc-11de-8d13-0010c6dffd0f",
                        "display": "Diagnosis",
                    },
                    "set": false,
                    "version": null,
                    "retired": false,
                    "names": [
                        {
                            "uuid": "1cf38f1c-6fd3-4ef5-8728-880bbb1b4deb",
                            "display": "Hemarthrosis hand",
                        }
                    ],
                    "descriptions": [
                        {
                            "uuid": "cfe4b845-5acd-4152-a29d-b77a42b92023",
                            "display": "Hemarthrosis hand",
                        }
                    ],
                    "mappings": [
                        {
                            "uuid": "c08ee0bc-8fed-4b49-8690-b6594e24e37d",
                            "display": "ICD 10 - WHO: M25.049 (Hemarthrosis hand)",
                        }
                    ],
                    "answers": [],
                    "setMembers": [],
                    "attributes": [],
                    "resourceVersion": "2.0"
                },
                "valueModifier": null,
                "formFieldPath": null,
                "formFieldNamespace": null,
                "resourceVersion": "1.11"
            }
        ]
        var diagnosisInfo = surgicalBlockMapper.mapPrimaryDiagnoses(diagnosisObs);
        expect(diagnosisInfo).toEqual('Hemarthrosis hand');
    })
});

