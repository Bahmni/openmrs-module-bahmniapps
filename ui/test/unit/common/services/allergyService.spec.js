/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

describe('allergyService', function() {
    var _$http, appService, $rootScope, $q;

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

    beforeEach(inject(['allergyService', '$rootScope', '$q', function (allergyServiceInjected, _$rootScope_, _$q_) {
        allergyService = allergyServiceInjected;
        $rootScope = _$rootScope_;
        $q = _$q_;
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

        it('should filter out no known allergy entry by UUID when other specific allergies exist', function() {
            const noKnownAllergyUuid = 'no-known-uuid-123';
            let callCount = 0;
            let result;
            _$http.get.and.callFake(function () {
                callCount++;
                if (callCount === 1) {
                    return $q.when({
                        status: 200,
                        data: {
                            entry: [
                                { resource: { code: { coding: [{ code: 'allergy-uuid-1', display: 'Pollen' }] } } },
                                { resource: { code: { coding: [{ code: noKnownAllergyUuid, display: 'Aucune allergie connue' }] } } }
                            ]
                        }
                    });
                }
                return $q.when({ data: noKnownAllergyUuid });
            });

            allergyService.fetchAndProcessAllergies('patient-1').then(function (r) { result = r; });
            $rootScope.$apply();

            expect(result).toBe('Pollen');
        });

        it('should keep no known allergy entry when it is the only allergy', function() {
            const noKnownAllergyUuid = 'no-known-uuid-123';
            let callCount = 0;
            let result;
            _$http.get.and.callFake(function () {
                callCount++;
                if (callCount === 1) {
                    return $q.when({
                        status: 200,
                        data: {
                            entry: [
                                { resource: { code: { coding: [{ code: noKnownAllergyUuid, display: 'Aucune allergie connue' }] } } }
                            ]
                        }
                    });
                }
                return $q.when({ data: noKnownAllergyUuid });
            });

            allergyService.fetchAndProcessAllergies('patient-1').then(function (r) { result = r; });
            $rootScope.$apply();

            expect(result).toBe('Aucune allergie connue');
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
