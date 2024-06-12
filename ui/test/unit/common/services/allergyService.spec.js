describe('allergyService', function() {
    var _$http, appService;

    beforeEach(module('bahmni.common.util'));
    
    beforeEach(module(function () {
        _$http = jasmine.createSpyObj('$http', ['get', 'delete']);
    }));

    beforeEach(module(function ($provide) {
        _$http = jasmine.createSpyObj('$http', ['get']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        var appDescriptor = jasmine.createSpyObj('appDescriptor', ['formatUrl']);
        appDescriptor.formatUrl.and.returnValue({
            formatUrl: function(url, params) {
                return url.replace('{patientUuid}', params.patientUuid);
            }
        });
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        $provide.value('$http', _$http);
        $provide.value('appService',appService);
    }));

    beforeEach(inject(['allergyService', function (allergyServiceInjected) {
        allergyService = allergyServiceInjected;
    }]));

    describe('getAllergyForPatient', function() {
        it('should get allergies correctly when call is successful', function() {
            var patientUuid = '12345';
            var mockResponse = {
                status: 200,
                data: {
                    "resourceType": "Bundle",
                    "id": "f88a1cf9-d1d4-4c86-b77e-c50f08000768",
                    "meta": {
                        "lastUpdated": "2024-05-23T16:19:56.772+05:30",
                        "tag": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
                                "code": "SUBSETTED",
                                "display": "Resource encoded in summary mode"
                            }
                        ]
                    },
                    "type": "searchset",
                    "total": 2,
                    "link": [
                        {
                            "relation": "self",
                            "url": "http://localhost/openmrs/ws/fhir2/R4/AllergyIntolerance?_summary=data&patient=533ffc13-c06b-40b0-84db-ec2c8456e20b"
                        }
                    ],
                    "entry": [
                        {
                            "fullUrl": "http://localhost/openmrs/ws/fhir2/R4/AllergyIntolerance/bc743662-6aa3-410d-916e-45236d292726",
                            "resource": {
                                "resourceType": "AllergyIntolerance",
                                "id": "bc743662-6aa3-410d-916e-45236d292726",
                                "meta": {
                                    "lastUpdated": "2024-05-23T15:35:32.000+05:30",
                                    "tag": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
                                            "code": "SUBSETTED",
                                            "display": "Resource encoded in summary mode"
                                        }
                                    ]
                                },
                                "clinicalStatus": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                                            "code": "active",
                                            "display": "Active"
                                        }
                                    ],
                                    "text": "Active"
                                },
                                "verificationStatus": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                                            "code": "confirmed",
                                            "display": "Confirmed"
                                        }
                                    ],
                                    "text": "Confirmed"
                                },
                                "type": "allergy",
                                "category": [
                                    "medication"
                                ],
                                "criticality": "high",
                                "code": {
                                    "coding": [
                                        {
                                            "code": "162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                            "display": "ACE inhibitors"
                                        },
                                        {
                                            "system": "http://snomed.info/sct",
                                            "code": "41549009"
                                        }
                                    ]
                                },
                                "patient": {
                                    "reference": "Patient/533ffc13-c06b-40b0-84db-ec2c8456e20b",
                                    "type": "Patient",
                                    "display": "Rahul Ramesh (Patient Identifier: ABC200001)"
                                },
                                "recordedDate": "2024-05-23T15:35:32+05:30",
                                "recorder": {
                                    "reference": "Practitioner/bdea357f-f496-11ed-b179-0242ac150003",
                                    "type": "Practitioner",
                                    "display": "Super Man"
                                },
                                "reaction": [
                                    {
                                        "substance": {
                                            "coding": [
                                                {
                                                    "code": "162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                    "display": "ACE inhibitors"
                                                },
                                                {
                                                    "system": "http://snomed.info/sct",
                                                    "code": "41549009"
                                                }
                                            ]
                                        },
                                        "manifestation": [
                                            {
                                                "coding": [
                                                    {
                                                        "code": "121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                        "display": "Mental status change"
                                                    },
                                                    {
                                                        "system": "http://snomed.info/sct",
                                                        "code": "419284004"
                                                    }
                                                ]
                                            },
                                            {
                                                "coding": [
                                                    {
                                                        "code": "121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                        "display": "Anaemia"
                                                    },
                                                    {
                                                        "system": "http://snomed.info/sct",
                                                        "code": "271737000"
                                                    }
                                                ]
                                            }
                                        ],
                                        "severity": "severe"
                                    }
                                ]
                            }
                        },
                        {
                            "fullUrl": "http://localhost/openmrs/ws/fhir2/R4/AllergyIntolerance/46aaf713-06e7-45a3-89b0-03d1ce8eeaa4",
                            "resource": {
                                "resourceType": "AllergyIntolerance",
                                "id": "46aaf713-06e7-45a3-89b0-03d1ce8eeaa4",
                                "meta": {
                                    "lastUpdated": "2024-05-23T15:35:45.000+05:30",
                                    "tag": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
                                            "code": "SUBSETTED",
                                            "display": "Resource encoded in summary mode"
                                        }
                                    ]
                                },
                                "clinicalStatus": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                                            "code": "active",
                                            "display": "Active"
                                        }
                                    ],
                                    "text": "Active"
                                },
                                "verificationStatus": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                                            "code": "confirmed",
                                            "display": "Confirmed"
                                        }
                                    ],
                                    "text": "Confirmed"
                                },
                                "type": "allergy",
                                "category": [
                                    "medication"
                                ],
                                "criticality": "low",
                                "code": {
                                    "coding": [
                                        {
                                            "code": "71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                            "display": "Aspirin"
                                        },
                                        {
                                            "system": "http://snomed.info/sct",
                                            "code": "7947003"
                                        }
                                    ]
                                },
                                "patient": {
                                    "reference": "Patient/533ffc13-c06b-40b0-84db-ec2c8456e20b",
                                    "type": "Patient",
                                    "display": "Rahul Ramesh (Patient Identifier: ABC200001)"
                                },
                                "recordedDate": "2024-05-23T15:35:45+05:30",
                                "recorder": {
                                    "reference": "Practitioner/bdea357f-f496-11ed-b179-0242ac150003",
                                    "type": "Practitioner",
                                    "display": "Super Man"
                                },
                                "reaction": [
                                    {
                                        "substance": {
                                            "coding": [
                                                {
                                                    "code": "71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                    "display": "Aspirin"
                                                },
                                                {
                                                    "system": "http://snomed.info/sct",
                                                    "code": "7947003"
                                                }
                                            ]
                                        },
                                        "manifestation": [
                                            {
                                                "coding": [
                                                    {
                                                        "code": "148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                        "display": "Anaphylaxis"
                                                    },
                                                    {
                                                        "system": "http://snomed.info/sct",
                                                        "code": "39579001"
                                                    }
                                                ]
                                            }
                                        ],
                                        "severity": "mild"
                                    }
                                ]
                            }
                        }
                    ]
                }
            };
            _$http.get.and.callFake(function () {
                return mockResponse;
            });
            var patientAllergyURL = appService.getAppDescriptor().formatUrl(Bahmni.Common.Constants.patientAllergiesURL, {'patientUuid': patientUuid});
            var result = allergyService.getAllergyForPatient(patientUuid);

            expect(_$http.get).toHaveBeenCalled();
            expect(_$http.get).toHaveBeenCalledWith(patientAllergyURL, {
                method: "GET",
                withCredentials: true,
                cache: false
            });
            expect(result).toBe(mockResponse);
        });

        it('should return an empty string if there are no allergies', function() {
            var patientUuid = '12345';
            var mockResponse = {
                status: 200,
                data: {
                    "resourceType": "Bundle",
                    "id": "f88a1cf9-d1d4-4c86-b77e-c50f08000768",
                    "meta": {
                        "lastUpdated": "2024-05-23T16:19:56.772+05:30",
                        "tag": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
                                "code": "SUBSETTED",
                                "display": "Resource encoded in summary mode"
                            }
                        ]
                    },
                    "type": "searchset",
                    "total": 2,
                    "link": [
                        {
                            "relation": "self",
                            "url": "http://localhost/openmrs/ws/fhir2/R4/AllergyIntolerance?_summary=data&patient=533ffc13-c06b-40b0-84db-ec2c8456e20b"
                        }
                    ],
                    "entry": [
                        {
                            "fullUrl": "http://localhost/openmrs/ws/fhir2/R4/AllergyIntolerance/bc743662-6aa3-410d-916e-45236d292726",
                            "resource": {
                                "resourceType": "AllergyIntolerance",
                                "id": "bc743662-6aa3-410d-916e-45236d292726",
                                "meta": {
                                    "lastUpdated": "2024-05-23T15:35:32.000+05:30",
                                    "tag": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
                                            "code": "SUBSETTED",
                                            "display": "Resource encoded in summary mode"
                                        }
                                    ]
                                },
                                "clinicalStatus": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                                            "code": "active",
                                            "display": "Active"
                                        }
                                    ],
                                    "text": "Active"
                                },
                                "verificationStatus": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                                            "code": "confirmed",
                                            "display": "Confirmed"
                                        }
                                    ],
                                    "text": "Confirmed"
                                },
                                "type": "allergy",
                                "category": [
                                    "medication"
                                ],
                                "criticality": "high",
                                "code": {
                                    "coding": [
                                        {
                                            "code": "162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                            "display": "ACE inhibitors"
                                        },
                                        {
                                            "system": "http://snomed.info/sct",
                                            "code": "41549009"
                                        }
                                    ]
                                },
                                "patient": {
                                    "reference": "Patient/533ffc13-c06b-40b0-84db-ec2c8456e20b",
                                    "type": "Patient",
                                    "display": "Rahul Ramesh (Patient Identifier: ABC200001)"
                                },
                                "recordedDate": "2024-05-23T15:35:32+05:30",
                                "recorder": {
                                    "reference": "Practitioner/bdea357f-f496-11ed-b179-0242ac150003",
                                    "type": "Practitioner",
                                    "display": "Super Man"
                                },
                                "reaction": [
                                    {
                                        "substance": {
                                            "coding": [
                                                {
                                                    "code": "162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                    "display": "ACE inhibitors"
                                                },
                                                {
                                                    "system": "http://snomed.info/sct",
                                                    "code": "41549009"
                                                }
                                            ]
                                        },
                                        "manifestation": [
                                            {
                                                "coding": [
                                                    {
                                                        "code": "121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                        "display": "Mental status change"
                                                    },
                                                    {
                                                        "system": "http://snomed.info/sct",
                                                        "code": "419284004"
                                                    }
                                                ]
                                            },
                                            {
                                                "coding": [
                                                    {
                                                        "code": "121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                        "display": "Anaemia"
                                                    },
                                                    {
                                                        "system": "http://snomed.info/sct",
                                                        "code": "271737000"
                                                    }
                                                ]
                                            }
                                        ],
                                        "severity": "severe"
                                    }
                                ]
                            }
                        },
                        {
                            "fullUrl": "http://localhost/openmrs/ws/fhir2/R4/AllergyIntolerance/46aaf713-06e7-45a3-89b0-03d1ce8eeaa4",
                            "resource": {
                                "resourceType": "AllergyIntolerance",
                                "id": "46aaf713-06e7-45a3-89b0-03d1ce8eeaa4",
                                "meta": {
                                    "lastUpdated": "2024-05-23T15:35:45.000+05:30",
                                    "tag": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
                                            "code": "SUBSETTED",
                                            "display": "Resource encoded in summary mode"
                                        }
                                    ]
                                },
                                "clinicalStatus": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                                            "code": "active",
                                            "display": "Active"
                                        }
                                    ],
                                    "text": "Active"
                                },
                                "verificationStatus": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                                            "code": "confirmed",
                                            "display": "Confirmed"
                                        }
                                    ],
                                    "text": "Confirmed"
                                },
                                "type": "allergy",
                                "category": [
                                    "medication"
                                ],
                                "criticality": "low",
                                "code": {
                                    "coding": [
                                        {
                                            "code": "71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                            "display": "Aspirin"
                                        },
                                        {
                                            "system": "http://snomed.info/sct",
                                            "code": "7947003"
                                        }
                                    ]
                                },
                                "patient": {
                                    "reference": "Patient/533ffc13-c06b-40b0-84db-ec2c8456e20b",
                                    "type": "Patient",
                                    "display": "Rahul Ramesh (Patient Identifier: ABC200001)"
                                },
                                "recordedDate": "2024-05-23T15:35:45+05:30",
                                "recorder": {
                                    "reference": "Practitioner/bdea357f-f496-11ed-b179-0242ac150003",
                                    "type": "Practitioner",
                                    "display": "Super Man"
                                },
                                "reaction": [
                                    {
                                        "substance": {
                                            "coding": [
                                                {
                                                    "code": "71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                    "display": "Aspirin"
                                                },
                                                {
                                                    "system": "http://snomed.info/sct",
                                                    "code": "7947003"
                                                }
                                            ]
                                        },
                                        "manifestation": [
                                            {
                                                "coding": [
                                                    {
                                                        "code": "148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                        "display": "Anaphylaxis"
                                                    },
                                                    {
                                                        "system": "http://snomed.info/sct",
                                                        "code": "39579001"
                                                    }
                                                ]
                                            }
                                        ],
                                        "severity": "mild"
                                    }
                                ]
                            }
                        }
                    ]
                }
            };
            _$http.get.and.callFake(function () {
                return mockResponse;
            });
            var result = allergyService.getAllergyForPatient(patientUuid);

            expect(result).toBe(mockResponse);
        });
    });

    describe('fetchAndProcessAllergies', function() {
        it('should handle errors gracefully', function() {
            var patientUuid = '12345';
            var mockResponse = {
                status: 500,
                data: {}
            };
            _$http.get.and.returnValue(Promise.resolve(mockResponse));

            allergyService.fetchAndProcessAllergies(patientUuid).then(function(result) {
                expect(result).toBe("");
                done();
            });
        });

        it('should fetch and process allergies correctly', function() {
            var patientUuid = '12345';
            var mockResponse = {
                status: 200,
                data: {
                    "resourceType": "Bundle",
                    "id": "f88a1cf9-d1d4-4c86-b77e-c50f08000768",
                    "meta": {
                        "lastUpdated": "2024-05-23T16:19:56.772+05:30",
                        "tag": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
                                "code": "SUBSETTED",
                                "display": "Resource encoded in summary mode"
                            }
                        ]
                    },
                    "type": "searchset",
                    "total": 2,
                    "link": [
                        {
                            "relation": "self",
                            "url": "http://localhost/openmrs/ws/fhir2/R4/AllergyIntolerance?_summary=data&patient=533ffc13-c06b-40b0-84db-ec2c8456e20b"
                        }
                    ],
                    "entry": [
                        {
                            "fullUrl": "http://localhost/openmrs/ws/fhir2/R4/AllergyIntolerance/bc743662-6aa3-410d-916e-45236d292726",
                            "resource": {
                                "resourceType": "AllergyIntolerance",
                                "id": "bc743662-6aa3-410d-916e-45236d292726",
                                "meta": {
                                    "lastUpdated": "2024-05-23T15:35:32.000+05:30",
                                    "tag": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
                                            "code": "SUBSETTED",
                                            "display": "Resource encoded in summary mode"
                                        }
                                    ]
                                },
                                "clinicalStatus": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                                            "code": "active",
                                            "display": "Active"
                                        }
                                    ],
                                    "text": "Active"
                                },
                                "verificationStatus": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                                            "code": "confirmed",
                                            "display": "Confirmed"
                                        }
                                    ],
                                    "text": "Confirmed"
                                },
                                "type": "allergy",
                                "category": [
                                    "medication"
                                ],
                                "criticality": "high",
                                "code": {
                                    "coding": [
                                        {
                                            "code": "162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                            "display": "ACE inhibitors"
                                        },
                                        {
                                            "system": "http://snomed.info/sct",
                                            "code": "41549009"
                                        }
                                    ]
                                },
                                "patient": {
                                    "reference": "Patient/533ffc13-c06b-40b0-84db-ec2c8456e20b",
                                    "type": "Patient",
                                    "display": "Rahul Ramesh (Patient Identifier: ABC200001)"
                                },
                                "recordedDate": "2024-05-23T15:35:32+05:30",
                                "recorder": {
                                    "reference": "Practitioner/bdea357f-f496-11ed-b179-0242ac150003",
                                    "type": "Practitioner",
                                    "display": "Super Man"
                                },
                                "reaction": [
                                    {
                                        "substance": {
                                            "coding": [
                                                {
                                                    "code": "162298AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                    "display": "ACE inhibitors"
                                                },
                                                {
                                                    "system": "http://snomed.info/sct",
                                                    "code": "41549009"
                                                }
                                            ]
                                        },
                                        "manifestation": [
                                            {
                                                "coding": [
                                                    {
                                                        "code": "121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                        "display": "Mental status change"
                                                    },
                                                    {
                                                        "system": "http://snomed.info/sct",
                                                        "code": "419284004"
                                                    }
                                                ]
                                            },
                                            {
                                                "coding": [
                                                    {
                                                        "code": "121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                        "display": "Anaemia"
                                                    },
                                                    {
                                                        "system": "http://snomed.info/sct",
                                                        "code": "271737000"
                                                    }
                                                ]
                                            }
                                        ],
                                        "severity": "severe"
                                    }
                                ]
                            }
                        },
                        {
                            "fullUrl": "http://localhost/openmrs/ws/fhir2/R4/AllergyIntolerance/bc743662-6aa3-410d-916e-45236d292726",
                            "resource": {
                                "resourceType": "AllergyIntolerance",
                                "id": "bc743662-6aa3-410d-916e-45236d292726",
                                "meta": {
                                    "lastUpdated": "2024-05-23T15:35:32.000+05:30",
                                    "tag": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
                                            "code": "SUBSETTED",
                                            "display": "Resource encoded in summary mode"
                                        }
                                    ]
                                },
                                "clinicalStatus": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                                            "code": "active",
                                            "display": "Active"
                                        }
                                    ],
                                    "text": "Active"
                                },
                                "verificationStatus": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                                            "code": "confirmed",
                                            "display": "Confirmed"
                                        }
                                    ],
                                    "text": "Confirmed"
                                },
                                "type": "allergy",
                                "category": [
                                    "medication"
                                ],
                                "criticality": "high",
                                "code": {
                                },
                                "patient": {
                                    "reference": "Patient/533ffc13-c06b-40b0-84db-ec2c8456e20b",
                                    "type": "Patient",
                                    "display": "Rahul Ramesh (Patient Identifier: ABC200001)"
                                },
                                "recordedDate": "2024-05-23T15:35:32+05:30",
                                "recorder": {
                                    "reference": "Practitioner/bdea357f-f496-11ed-b179-0242ac150003",
                                    "type": "Practitioner",
                                    "display": "Super Man"
                                },
                                "reaction": [
                                    {
                                        "substance": {
                                            "coding": [
                                                {
                                                    "display": "DUST"
                                                },
                                                {
                                                    "system": "http://snomed.info/sct",
                                                    "code": "41549009"
                                                }
                                            ]
                                        },
                                        "manifestation": [
                                            {
                                                "coding": [
                                                    {
                                                        "code": "121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                        "display": "Mental status change"
                                                    },
                                                    {
                                                        "system": "http://snomed.info/sct",
                                                        "code": "419284004"
                                                    }
                                                ]
                                            },
                                            {
                                                "coding": [
                                                    {
                                                        "code": "121629AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                        "display": "Anaemia"
                                                    },
                                                    {
                                                        "system": "http://snomed.info/sct",
                                                        "code": "271737000"
                                                    }
                                                ]
                                            }
                                        ],
                                        "severity": "severe"
                                    }
                                ]
                            }
                        },
                        {
                            "fullUrl": "http://localhost/openmrs/ws/fhir2/R4/AllergyIntolerance/46aaf713-06e7-45a3-89b0-03d1ce8eeaa4",
                            "resource": {
                                "resourceType": "AllergyIntolerance",
                                "id": "46aaf713-06e7-45a3-89b0-03d1ce8eeaa4",
                                "meta": {
                                    "lastUpdated": "2024-05-23T15:35:45.000+05:30",
                                    "tag": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
                                            "code": "SUBSETTED",
                                            "display": "Resource encoded in summary mode"
                                        }
                                    ]
                                },
                                "clinicalStatus": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                                            "code": "active",
                                            "display": "Active"
                                        }
                                    ],
                                    "text": "Active"
                                },
                                "verificationStatus": {
                                    "coding": [
                                        {
                                            "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                                            "code": "confirmed",
                                            "display": "Confirmed"
                                        }
                                    ],
                                    "text": "Confirmed"
                                },
                                "type": "allergy",
                                "category": [
                                    "medication"
                                ],
                                "criticality": "low",
                                "code": {
                                    "coding": [
                                        {
                                            "code": "71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                            "display": "Aspirin"
                                        },
                                        {
                                            "system": "http://snomed.info/sct",
                                            "code": "7947003"
                                        }
                                    ]
                                },
                                "patient": {
                                    "reference": "Patient/533ffc13-c06b-40b0-84db-ec2c8456e20b",
                                    "type": "Patient",
                                    "display": "Rahul Ramesh (Patient Identifier: ABC200001)"
                                },
                                "recordedDate": "2024-05-23T15:35:45+05:30",
                                "recorder": {
                                    "reference": "Practitioner/bdea357f-f496-11ed-b179-0242ac150003",
                                    "type": "Practitioner",
                                    "display": "Super Man"
                                },
                                "reaction": [
                                    {
                                        "substance": {
                                            "coding": [
                                                {
                                                    "code": "71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                    "display": "Aspirin"
                                                },
                                                {
                                                    "system": "http://snomed.info/sct",
                                                    "code": "7947003"
                                                }
                                            ]
                                        },
                                        "manifestation": [
                                            {
                                                "coding": [
                                                    {
                                                        "code": "148888AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                                        "display": "Anaphylaxis"
                                                    },
                                                    {
                                                        "system": "http://snomed.info/sct",
                                                        "code": "39579001"
                                                    }
                                                ]
                                            }
                                        ],
                                        "severity": "mild"
                                    }
                                ]
                            }
                        }
                    ]
                }
            };
            _$http.get.and.returnValue(Promise.resolve(
                mockResponse));

            allergyService.fetchAndProcessAllergies(patientUuid).then(function(result) {
                expect(result).toBe("ACE inhibitors, Aspirin");
                done();
            });
        });
    });
});
