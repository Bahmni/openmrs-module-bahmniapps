describe('cdssService', function () {
    var consultationDataMock = {
        patient: {
            uuid: 'patient_uuid_here'
        },
        conditions: [
            {
                uuid: 'condition_uuid_1',
                status: 'CONFIRMED',
                concept: {
                    uuid: 'concept_uuid_1',
                    name: 'Condition Name 1'
                }
            }
        ],
        newlyAddedDiagnoses: [
            {
                uuid: 'diagnosis_uuid_1',
                certainty: 'CONFIRMED',
                codedAnswer: {
                    uuid: 'coded_answer_uuid_1',
                    name: 'Diagnosis Name 1'
                }
            },
            {
                uuid: 'diagnosis_uuid_2',
                certainty: 'CONFIRMED',
                codedAnswer: {
                    uuid: 'coded_answer_uuid_2',
                    name: 'Diagnosis Name 2'
                }
            }
        ],
        draftDrug: [
            {
                uuid: 'medication_uuid_1',
                drug: {
                    uuid: 'drug_uuid_1',
                    name: 'Drug Name 1'
                },
                instructions: 'Take once a day',
                effectiveStartDate: '2023-10-03T08:00:00Z',
                durationInDays: 7,
                durationUnit: 'DAYS',
                asNeeded: false,
                uniformDosingType: {
                    frequency: 'Once daily',
                    dose: 1
                },
                doseUnits: 'mg'
            }
        ]
    };

    var mockBundle = {
        "entry": [
            {
                "resource": {
                    "resourceType": "MedicationRequest",
                    "medicationCodeableConcept": {
                        "coding": [
                            {
                                "system": "dummySystem",
                                "code": "987654321",
                                "display": "Atorvastatin 10 mg oral tablet"
                            }
                        ],
                    }
                }
            },
            {
                "resource": {
                    "resourceType": "Condition",
                    "code": {
                        "coding": [{"system": "dummySystem", "code": "123456789", "display": "Asthma"}],
                        "text": "Asthma"
                    },
                    "subject": {"reference": "Patient/c3182a92-c3a9-415a-900d-178146c87062"}
                }
            }
        ]
    };

    var cdssService;
    var drugService = jasmine.createSpyObj('drugService', ['getDrugConceptSourceMapping']);
    drugService.getDrugConceptSourceMapping.and.callFake(function () {
        return specUtil.respondWith({
            data: {
                entry: [{
                    resource: {
                        code: {
                            coding: [{
                                system: 'http://example.com',
                                code: '12345',
                                display: 'Sample Drug'
                            }]
                        }
                    }
                }]
            }
        });
    });

    beforeEach(function () {
        module('bahmni.clinical');

        module(function ($provide) {
            $provide.value('drugService', drugService);
        });

        inject(['cdssService', '$rootScope', function (cdssServiceInjected, $rootScopeInjected) {
            cdssService = cdssServiceInjected;
            rootScope = $rootScopeInjected;
        }]);
    });

    it('Should feturn an object with parameters for cdss request', function () {
        var params = cdssService.createParams(consultationDataMock);
        expect(params.patient).toEqual(consultationDataMock.patient);
        expect(params.conditions).toEqual(consultationDataMock.conditions);
        expect(params.diagnosis).toEqual(consultationDataMock.newlyAddedDiagnoses);
        expect(params.medications).toEqual(consultationDataMock.draftDrug);
    });

    it('Should return a bundle of resources', function () {
        cdssService.createFhirBundle(consultationDataMock.patient, consultationDataMock.conditions, consultationDataMock.draftDrug, consultationDataMock.newlyAddedDiagnoses, 'http://example.com').then(function (bundle) {

            expect(bundle.resourceType).toEqual('Bundle');
            expect(bundle.type).toEqual('collection');
            expect(bundle.entry.length).toEqual(3);
            expect(bundle.entry[0].resource.resourceType).toEqual('Condition');
            expect(bundle.entry[2].resource.resourceType).toEqual('MedicationRequest');
        });
    });

    it('Should return an array of alerts sorted by status', function () {
        var alerts = [
            {
                uuid: 'alert_uuid_1',
                indicator: 'warning',
                isActive: false,
                detail: 'Alert Detail 1',
                source: {
                    url: 'http://example.com'
                }
            },
            {
                uuid: 'alert_uuid_2',
                indicator: 'critical',
                isActive: true,
                detail: 'Alert Detail 2',
                source: {
                    url: 'http://example.com'
                }
            },
            {
                uuid: 'alert_uuid_3',
                indicator: 'info',
                isActive: true,
                detail: 'Alert Detail 3',
                source: {
                    url: 'http://example.com'
                }
            }
        ];
        var sortedAlerts = cdssService.sortInteractionsByStatus(alerts);
        expect(sortedAlerts[0].indicator).toEqual('critical');
        expect(sortedAlerts[1].indicator).toEqual('warning');
        expect(sortedAlerts[2].indicator).toEqual('info');
    });

    it('Should return alerts with active status when new alerts present in bundle', function () {
        var newAlerts = [
            {
                uuid: 'alert_uuid_1',
                indicator: 'warning',
                isActive: false,
                detail: 'Alert Detail 1',
                source: {
                    url: 'http://example.com'
                },
                "referenceMedications": [
                    {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "987654321",
                                "display": "Placeholder Medication1"
                            },
                            {
                                "system": "https://example.com",
                                "code": "987654321",
                                "display": "Placeholder Medication1"
                            }
                        ]
                    },
                    {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "987654320",
                                "display": "Placeholder Medication2"
                            },
                            {
                                "system": "https://example.com",
                                "code": "987654320",
                                "display": "Placeholder Medication2"
                            }
                        ]
                    }
                ],
                "referenceConditions": [{
                    "coding": [
                        {
                            "system": "https://example.com",
                            "code": "123456789",
                            "display": "Placeholder Condition1"
                        },
                        {
                            "system": "http://snomed.info/sct",
                            "code": "123456789",
                            "display": "Placeholder Condition1"
                        }
                    ]
                },
                    {
                        "coding": [
                            {
                                "system": "https://example.com",
                                "code": "1234567890",
                                "display": "Placeholder Condition2"
                            },
                            {
                                "system": "http://snomed.info/sct",
                                "code": "1234567890",
                                "display": "Placeholder Condition2"
                            }
                        ]
                    }]
            }
        ];
        var currentAlert = [
        ];
        var updatedAlerts = cdssService.addNewAlerts(newAlerts, currentAlert, mockBundle);
        expect(updatedAlerts.length).toEqual(1);
        expect(updatedAlerts[0].isActive).toEqual(true);
    });
    it('Should return alerts with inactive status when alerts are already dismissed for the resources present in bundle', function () {
        var newAlerts = [
            {
                uuid: 'alert_uuid_1',
                indicator: 'warning',
                isActive: false,
                detail: 'Alert Detail 1',
                source: {
                    url: 'http://example.com'
                },
                "referenceMedications": [
                    {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "987654321",
                                "display": "Placeholder Medication1"
                            },
                            {
                                "system": "https://example.com",
                                "code": "987654321",
                                "display": "Placeholder Medication1"
                            }
                        ]
                    },
                    {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "987654320",
                                "display": "Placeholder Medication2"
                            },
                            {
                                "system": "https://example.com",
                                "code": "987654320",
                                "display": "Placeholder Medication2"
                            }
                        ]
                    }
                ],
                "referenceConditions": [{
                    "coding": [
                        {
                            "system": "https://example.com",
                            "code": "123456789",
                            "display": "Placeholder Condition1"
                        },
                        {
                            "system": "http://snomed.info/sct",
                            "code": "123456789",
                            "display": "Placeholder Condition1"
                        }
                    ]
                },
                    {
                        "coding": [
                            {
                                "system": "https://example.com",
                                "code": "1234567890",
                                "display": "Placeholder Condition2"
                            },
                            {
                                "system": "http://snomed.info/sct",
                                "code": "1234567890",
                                "display": "Placeholder Condition2"
                            }
                        ]
                    }]
            }
        ];
        var currentAlert = [
            {
                uuid: 'alert_uuid_1',
                indicator: 'warning',
                isActive: false,
                detail: 'Alert Detail 1',
                source: {
                    url: 'http://example.com'
                },
                "referenceMedications": [
                    {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "987654321",
                                "display": "Placeholder Medication1"
                            },
                            {
                                "system": "https://example.com",
                                "code": "987654321",
                                "display": "Placeholder Medication1"
                            }
                        ]
                    },
                    {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "987654320",
                                "display": "Placeholder Medication2"
                            },
                            {
                                "system": "https://example.com",
                                "code": "987654320",
                                "display": "Placeholder Medication2"
                            }
                        ]
                    }
                ],
                "referenceConditions": [{
                    "coding": [
                        {
                            "system": "https://example.com",
                            "code": "123456789",
                            "display": "Placeholder Condition1"
                        },
                        {
                            "system": "http://snomed.info/sct",
                            "code": "123456789",
                            "display": "Placeholder Condition1"
                        }
                    ]
                },
                    {
                        "coding": [
                            {
                                "system": "https://example.com",
                                "code": "1234567890",
                                "display": "Placeholder Condition2"
                            },
                            {
                                "system": "http://snomed.info/sct",
                                "code": "1234567890",
                                "display": "Placeholder Condition2"
                            }
                        ]
                    }]
            }
        ];
        var updatedAlerts = cdssService.addNewAlerts(newAlerts, currentAlert, mockBundle);
        expect(updatedAlerts.length).toEqual(1);
        expect(updatedAlerts[0].isActive).toEqual(false);
    });
    it('Should return alerts with active status when current alerts are  active for the resources present in bundle', function () {
        var newAlerts = [
            {
                uuid: 'alert_uuid_1',
                indicator: 'warning',
                isActive: false,
                detail: 'Alert Detail 1',
                source: {
                    url: 'http://example.com'
                },
                "referenceMedications": [
                    {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "987654321",
                                "display": "Placeholder Medication1"
                            },
                            {
                                "system": "https://example.com",
                                "code": "987654321",
                                "display": "Placeholder Medication1"
                            }
                        ]
                    },
                    {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "987654320",
                                "display": "Placeholder Medication2"
                            },
                            {
                                "system": "https://example.com",
                                "code": "987654320",
                                "display": "Placeholder Medication2"
                            }
                        ]
                    }
                ],
                "referenceConditions": [{
                    "coding": [
                        {
                            "system": "https://example.com",
                            "code": "123456789",
                            "display": "Placeholder Condition1"
                        },
                        {
                            "system": "http://snomed.info/sct",
                            "code": "123456789",
                            "display": "Placeholder Condition1"
                        }
                    ]
                },
                    {
                        "coding": [
                            {
                                "system": "https://example.com",
                                "code": "1234567890",
                                "display": "Placeholder Condition2"
                            },
                            {
                                "system": "http://snomed.info/sct",
                                "code": "1234567890",
                                "display": "Placeholder Condition2"
                            }
                        ]
                    }]
            }
        ];
        var currentAlert = [
            {
                uuid: 'alert_uuid_1',
                indicator: 'warning',
                isActive: true,
                detail: 'Alert Detail 1',
                source: {
                    url: 'http://example.com'
                },
                "referenceMedications": [
                    {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "987654321",
                                "display": "Placeholder Medication1"
                            },
                            {
                                "system": "https://example.com",
                                "code": "987654321",
                                "display": "Placeholder Medication1"
                            }
                        ]
                    },
                    {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "987654320",
                                "display": "Placeholder Medication2"
                            },
                            {
                                "system": "https://example.com",
                                "code": "987654320",
                                "display": "Placeholder Medication2"
                            }
                        ]
                    }
                ],
                "referenceConditions": [{
                    "coding": [
                        {
                            "system": "https://example.com",
                            "code": "123456789",
                            "display": "Placeholder Condition1"
                        },
                        {
                            "system": "http://snomed.info/sct",
                            "code": "123456789",
                            "display": "Placeholder Condition1"
                        }
                    ]
                },
                    {
                        "coding": [
                            {
                                "system": "https://example.com",
                                "code": "1234567890",
                                "display": "Placeholder Condition2"
                            },
                            {
                                "system": "http://snomed.info/sct",
                                "code": "1234567890",
                                "display": "Placeholder Condition2"
                            }
                        ]
                    }]
            }
        ];
        var updatedAlerts = cdssService.addNewAlerts(newAlerts, currentAlert, mockBundle);
        expect(updatedAlerts.length).toEqual(1);
        expect(updatedAlerts[0].isActive).toEqual(true);
    });
});

