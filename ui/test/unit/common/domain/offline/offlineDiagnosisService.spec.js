'use strict';

describe('offlineDiagnosisService', function () {

    var diagnosisService, encounterServiceStrategy;
    var $q = Q;
    var patientUuid = 'fc6ede09-f16f-4877-d2f5-ed8b2182ec10';

    beforeEach(module('bahmni.common.offline'));
    beforeEach(module('bahmni.common.domain'));

    beforeEach(module(function ($provide) {
        $provide.value('$q', $q);
    }));

    beforeEach(inject(['diagnosisService', 'offlineEncounterServiceStrategy', function (diagnosisServiceInjected, encounterServiceStrategyInjected) {
        diagnosisService = diagnosisServiceInjected;
        encounterServiceStrategy = encounterServiceStrategyInjected;

        spyOn(encounterServiceStrategy, 'getEncountersByPatientUuid').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback(encounterResponse);
                }
            };
        });

    }]));


    it('should return all the diagnosis for given patient', function () {

        diagnosisService.getDiagnoses(patientUuid, undefined).then(function (result) {
            expect(result.data.length).toBe(2);
        });


    });

    it('should return the sorted diagnosis based on the date and time of diagnosis for given patient', function () {
        diagnosisService.getDiagnoses(patientUuid, undefined).then(function (result) {
            expect(result.data.length).toBe(2);
            expect(result.data[0].freeTextAnswer).toBe("free text");
            expect(result.data[0].codedAnswer).toBeNull();
            expect(result.data[1].codedAnswer.name).toBe("Paracetamol");
            expect(result.data[1].freeTextAnswer).toBeNull();
        });


    });

    it('should return filter revised diagnosis for given patient', function () {
        encounterResponse[0].encounter.bahmniDiagnoses[0].revised = true;

        diagnosisService.getDiagnoses(patientUuid, undefined).then(function (result) {
            expect(result.data.length).toBe(1);
            expect(result.data[0].freeTextAnswer).toBe("free text");
            expect(result.data[0].codedAnswer).toBeNull();
            expect(result.data[1]).toBeUndefined();
        });


    });

    it('should return empty diagnosis if there are no diagnosis for given patient', function () {
        encounterResponse[0].encounter.bahmniDiagnoses = [];
        encounterResponse[1].encounter.bahmniDiagnoses = [];

        diagnosisService.getDiagnoses(patientUuid, undefined).then(function (result) {
            expect(result.data.length).toBe(0);
        });


    });

    var encounterResponse = [{
        encounter: {
            "bahmniDiagnoses": [
                {
                    "order": "SECONDARY",
                    "certainty": "CONFIRMED",
                    "freeTextAnswer": null,
                    "codedAnswer": {
                        "uuid": "9f5e82f6-2777-4af3-bc88-0b124a960c1d",
                        "name": "Paracetamol",
                        "dataType": "N/A",
                        "shortName": "Paracetamol",
                        "conceptClass": "Drug",
                        "hiNormal": null,
                        "lowNormal": null,
                        "set": false,
                        "mappings": []
                    },
                    "existingObs": "29302a72-820e-45cf-b12f-13baff5fdb04",
                    "diagnosisDateTime": "2016-05-19T10:06:04.000+0000",
                    "voided": false,
                    "voidReason": null,
                    "providers": [],
                    "diagnosisStatusConcept": null,
                    "firstDiagnosis": {
                        "order": "SECONDARY",
                        "certainty": "CONFIRMED",
                        "freeTextAnswer": null,
                        "codedAnswer": {
                            "uuid": "9f5e82f6-2777-4af3-bc88-0b124a960c1d",
                            "name": "Paracetamol",
                            "dataType": "N/A",
                            "shortName": "Paracetamol",
                            "conceptClass": "Drug",
                            "hiNormal": null,
                            "lowNormal": null,
                            "set": false,
                            "mappings": [
                                {
                                    "source": "WHO ATC-BD",
                                    "name": "Paracetamol",
                                    "code": "N02BE01"
                                }
                            ]
                        },
                        "existingObs": "29302a72-820e-45cf-b12f-13baff5fdb04",
                        "diagnosisDateTime": "2016-05-19T10:06:04.000+0000",
                        "voided": false,
                        "voidReason": null,
                        "providers": [
                            {
                                "uuid": "6a5d9c71-bb71-47ad-abed-bda86637f1b7",
                                "name": "Arman Vuiyan",
                                "encounterRoleUuid": "a0b03050-c99b-11e0-9572-0800200c9a66"
                            }
                        ],
                        "diagnosisStatusConcept": null,
                        "firstDiagnosis": null,
                        "latestDiagnosis": null,
                        "revised": false,
                        "comments": null,
                        "previousObs": null,
                        "encounterUuid": "077b4748-cead-4f0d-974b-31d63a5fdb37",
                        "creatorName": "armanvyuivan"
                    },
                    "latestDiagnosis": null,
                    "revised": false,
                    "comments": null,
                    "previousObs": null,
                    "encounterUuid": "077b4748-cead-4f0d-974b-31d63a5fdb37",
                    "creatorName": "armanvyuivan"
                }
            ],
            "observations": [],
            "accessionNotes": [],
            "encounterType": "FIELD",
            "visitType": null,
            "patientId": "BDH201500",
            "reason": null,
            "orders": [],
            "providers": [],
            "drugOrders": [],
            "encounterTypeUuid": "84386a70-8792-11e5-ade6-005056b07f03",
            "encounterUuid": "077b4748-cead-4f0d-974b-31d63a5fdb37",
            "patientUuid": "fc6ede09-f16f-4877-d2f5-ed8b2182ec10",
            "locationUuid": "6422b19f-a825-4af9-836a-016212d6eb71",
            "visitUuid": "110432f6-f09c-44d5-8570-0dbade06dea2",
            "visitTypeUuid": "84048d14-8792-11e5-ade6-005056b07f03",
            "disposition": null,
            "encounterDateTime": "2016-05-19T09:58:16.000+0000",
            "associatedToPatientProgram": false,
            "patientProgramUuid": null,
            "locationName": "Dubbati CC - Kaliganj (10005347)",
            "context": {},
            "extensions": {
                "mdrtbSpecimen": []
            }
        }
    },
        {
            encounter: {
                "bahmniDiagnoses": [
                    {
                        "order": "SECONDARY",
                        "certainty": "CONFIRMED",
                        "freeTextAnswer": "free text",
                        "codedAnswer": null,
                        "existingObs": "29302a72-82oe-45cf-b12f-13baff5fdb04",
                        "diagnosisDateTime": "2016-05-19T11:06:04.000+0000",
                        "voided": false,
                        "voidReason": null,
                        "providers": [],
                        "diagnosisStatusConcept": null,
                        "firstDiagnosis": {
                            "order": "SECONDARY",
                            "certainty": "CONFIRMED",
                            "freeTextAnswer": null,
                            "codedAnswer": {
                                "uuid": "9f5e82f6-2777-4af3-bc88-0b124a960c1d",
                                "name": "Paracetamol",
                                "dataType": "N/A",
                                "shortName": "Paracetamol",
                                "conceptClass": "Drug",
                                "hiNormal": null,
                                "lowNormal": null,
                                "set": false,
                                "mappings": []
                            },
                            "existingObs": "29302a72-820e-45cf-b12f-13baff5fdb04",
                            "diagnosisDateTime": "2016-05-19T11:06:04.000+0000",
                            "voided": false,
                            "voidReason": null,
                            "providers": [],
                            "diagnosisStatusConcept": null,
                            "firstDiagnosis": null,
                            "latestDiagnosis": null,
                            "revised": false,
                            "comments": null,
                            "previousObs": null,
                            "encounterUuid": "077b4748-cead-4f0d-974b-31d63a5fdb37",
                            "creatorName": "armanvuiyan"
                        },
                        "latestDiagnosis": null,
                        "revised": false,
                        "comments": null,
                        "previousObs": null,
                        "encounterUuid": "077b4748-cead-4f0d-974b-31d63a5fdb37",
                        "creatorName": "armanvuiyan"
                    }
                ],
                "observations": [],
                "accessionNotes": [],
                "encounterType": "FIELD",
                "visitType": null,
                "patientId": "BDH201500",
                "reason": null,
                "orders": [],
                "providers": [],
                "drugOrders": [],
                "encounterTypeUuid": "84386a70-8792-11e5-ade6-005056b07f03",
                "encounterUuid": "077b4748-cead-4f0d-974b-31d63a5fdb37",
                "patientUuid": "fc6ede09-f16f-4877-d2f5-ed8b2182ec10",
                "locationUuid": "6422b19f-a825-4af9-836a-016212d6eb71",
                "visitUuid": "110432f6-f09c-44d5-8570-0dbade06dea2",
                "visitTypeUuid": "84048d14-8792-11e5-ade6-005056b07f03",
                "disposition": null,
                "encounterDateTime": "2016-05-19T09:58:16.000+0000",
                "associatedToPatientProgram": false,
                "patientProgramUuid": null,
                "locationName": "Dubbati CC - Kaliganj (10005347)",
                "context": {},
                "extensions": {
                    "mdrtbSpecimen": []
                }
            }
        }];

});