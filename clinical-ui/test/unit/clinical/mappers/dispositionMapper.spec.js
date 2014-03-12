'use strict';


var testVisitData = {
    "uuid": "64834164-1a21-4fab-a55d-58bc72975dc7",
    "encounters": [
        {
            "uuid": "16a8d77d-b89b-4fc8-9a12-4234db6879c7",
            "encounterType": {
                "uuid": "c9614b8a-00e7-11e3-8c55-0800271c1b75",
                "display": "OPD",
                "name": "OPD",
                "description": "OPD consultation encounter",
                "retired": false,
                "links": [
                    {
                        "uri": "NEED-TO-CONFIGURE/ws/rest/v1/encountertype/c9614b8a-00e7-11e3-8c55-0800271c1b75",
                        "rel": "self"
                    },
                    {
                        "uri": "NEED-TO-CONFIGURE/ws/rest/v1/encountertype/c9614b8a-00e7-11e3-8c55-0800271c1b75?v=full",
                        "rel": "full"
                    }
                ],
                "resourceVersion": "1.8"
            },
            "orders": [
                {
                    "uuid": "0c657a01-9e55-4802-b8fa-8ca7f72dbea8",
                    "display": "Admit Patient",
                    "orderType":{
                      display: Bahmni.Common.PatientSearch.Constants.dispositionOrderType
                    },
                    "patient": {
                        "uuid": "ad45fc7d-708a-4704-8bee-a84b43c7ba96",
                        "display": "GAN654321 - ram kapoor",
                        "links": [
                            {
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/patient/ad45fc7d-708a-4704-8bee-a84b43c7ba96",
                                "rel": "self"
                            }
                        ]
                    },
                    "concept": {
                        "uuid": "85b1f086-c41a-4d0a-875a-1c64060a0a8b",
                        "display": "Admit Patient",
                        "links": [
                            {
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/85b1f086-c41a-4d0a-875a-1c64060a0a8b",
                                "rel": "self"
                            }
                        ]
                    },
                    "instructions": null,
                    "startDate": null,
                    "autoExpireDate": null,
                    "encounter": {
                        "uuid": "16a8d77d-b89b-4fc8-9a12-4234db6879c7",
                        "display": "OPD 18/09/2013",
                        "links": [
                            {
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/encounter/16a8d77d-b89b-4fc8-9a12-4234db6879c7",
                                "rel": "self"
                            }
                        ]
                    },
                    "orderer": null,
                    "accessionNumber": null,
                    "discontinuedBy": null,
                    "discontinuedDate": null,
                    "discontinuedReason": null,
                    "discontinuedReasonNonCoded": null,
                    "links": [
                        {
                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/order/0c657a01-9e55-4802-b8fa-8ca7f72dbea8",
                            "rel": "self"
                        },
                        {
                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/order/0c657a01-9e55-4802-b8fa-8ca7f72dbea8?v=full",
                            "rel": "full"
                        }
                    ],
                    "type": null,
                    "resourceVersion": "1.8"
                },
                {
                    "uuid": "0c657a01-9e55-4802-b8fa-8ca7f72dbea9",
                    "display": "Some Random Order",
                    "orderType": null,
                    "patient": {
                        "uuid": "ad45fc7d-708a-4704-8bee-a84b43c7ba96",
                        "display": "GAN654321 - ram kapoor",
                        "links": [
                            {
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/patient/ad45fc7d-708a-4704-8bee-a84b43c7ba96",
                                "rel": "self"
                            }
                        ]
                    },
                    "concept": {
                        "uuid": "85b1f086-c41a-4d0a-875a-1c64060a0a8a",
                        "display": "Admit Patient",
                        "links": [
                            {
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/85b1f086-c41a-4d0a-875a-1c64060a0a8b",
                                "rel": "self"
                            }
                        ]
                    },
                    "instructions": null,
                    "startDate": null,
                    "autoExpireDate": null,
                    "encounter": {
                        "uuid": "16a8d77d-b89b-4fc8-9a12-4234db6879c7",
                        "display": "OPD 18/09/2013",
                        "links": [
                            {
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/encounter/16a8d77d-b89b-4fc8-9a12-4234db6879c7",
                                "rel": "self"
                            }
                        ]
                    },
                    "orderer": null,
                    "accessionNumber": null,
                    "discontinuedBy": null,
                    "discontinuedDate": null,
                    "discontinuedReason": null,
                    "discontinuedReasonNonCoded": null,
                    "links": [
                        {
                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/order/0c657a01-9e55-4802-b8fa-8ca7f72dbea8",
                            "rel": "self"
                        },
                        {
                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/order/0c657a01-9e55-4802-b8fa-8ca7f72dbea8?v=full",
                            "rel": "full"
                        }
                    ],
                    "type": null,
                    "resourceVersion": "1.8"
                }
            ],
            "obs": [
                {
                    "uuid": "d4902d41-566e-426b-9b13-7fa2103f4ea0",
                    "concept": {
                        "uuid": "9ea8d5a3-d5fd-4a97-9632-a31b71ad67ad",
                        "name": {
                            "display": "Disposition Note",
                            "uuid": "47a32153-b538-4a4b-84f8-dc520dfba43a",
                            "name": "Disposition Note",
                            "locale": "en",
                            "localePreferred": true,
                            "conceptNameType": "FULLY_SPECIFIED",
                            "links": [
                                {
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/9ea8d5a3-d5fd-4a97-9632-a31b71ad67ad/name/47a32153-b538-4a4b-84f8-dc520dfba43a",
                                    "rel": "self"
                                },
                                {
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/9ea8d5a3-d5fd-4a97-9632-a31b71ad67ad/name/47a32153-b538-4a4b-84f8-dc520dfba43a?v=full",
                                    "rel": "full"
                                }
                            ],
                            "resourceVersion": "1.9"
                        }
                    },
                    "value": "ppp"
                }
            ]
        },
        {
            "uuid": "9ab1acb0-137a-4eab-a884-4f2bb9b92590",
            "encounterType": {
                "uuid": "b469afaa-c79a-11e2-b284-107d46e7b2c5",
                "display": "REG",
                "name": "REG",
                "description": "Registration encounter",
                "retired": false,
                "links": [
                    {
                        "uri": "NEED-TO-CONFIGURE/ws/rest/v1/encountertype/b469afaa-c79a-11e2-b284-107d46e7b2c5",
                        "rel": "self"
                    },
                    {
                        "uri": "NEED-TO-CONFIGURE/ws/rest/v1/encountertype/b469afaa-c79a-11e2-b284-107d46e7b2c5?v=full",
                        "rel": "full"
                    }
                ],
                "resourceVersion": "1.8"
            },
            "orders": [],
            "obs": [
                {
                    "uuid": "03ed488e-6fcc-4f4a-9b9a-183825bf39e8",
                    "concept": {
                        "uuid": "b4b371da-c79a-11e2-b284-107d46e7b2c5",
                        "name": {
                            "display": "HEIGHT",
                            "uuid": "b4b4c134-c79a-11e2-b284-107d46e7b2c5",
                            "name": "HEIGHT",
                            "locale": "en",
                            "localePreferred": true,
                            "conceptNameType": "FULLY_SPECIFIED",
                            "links": [
                                {
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/b4b371da-c79a-11e2-b284-107d46e7b2c5/name/b4b4c134-c79a-11e2-b284-107d46e7b2c5",
                                    "rel": "self"
                                },
                                {
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/b4b371da-c79a-11e2-b284-107d46e7b2c5/name/b4b4c134-c79a-11e2-b284-107d46e7b2c5?v=full",
                                    "rel": "full"
                                }
                            ],
                            "resourceVersion": "1.9"
                        }
                    },
                    "value": 170
                },
                {
                    "uuid": "c4651b0a-07bb-41ec-a2b2-b3cdb2dbdc93",
                    "concept": {
                        "uuid": "b4b5fbe4-c79a-11e2-b284-107d46e7b2c5",
                        "name": {
                            "display": "WEIGHT",
                            "uuid": "b4b74d0a-c79a-11e2-b284-107d46e7b2c5",
                            "name": "WEIGHT",
                            "locale": "en",
                            "localePreferred": true,
                            "conceptNameType": "FULLY_SPECIFIED",
                            "links": [
                                {
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/b4b5fbe4-c79a-11e2-b284-107d46e7b2c5/name/b4b74d0a-c79a-11e2-b284-107d46e7b2c5",
                                    "rel": "self"
                                },
                                {
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/b4b5fbe4-c79a-11e2-b284-107d46e7b2c5/name/b4b74d0a-c79a-11e2-b284-107d46e7b2c5?v=full",
                                    "rel": "full"
                                }
                            ],
                            "resourceVersion": "1.9"
                        }
                    },
                    "value": 80
                },
                {
                    "uuid": "c4da6ef6-485a-4f8a-ae68-a7f8b8f49b07",
                    "concept": {
                        "uuid": "b4afc27e-c79a-11e2-b284-107d46e7b2c5",
                        "name": {
                            "display": "REGISTRATION FEES",
                            "uuid": "b4b23946-c79a-11e2-b284-107d46e7b2c5",
                            "name": "REGISTRATION FEES",
                            "locale": "en",
                            "localePreferred": true,
                            "conceptNameType": "FULLY_SPECIFIED",
                            "links": [
                                {
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/b4afc27e-c79a-11e2-b284-107d46e7b2c5/name/b4b23946-c79a-11e2-b284-107d46e7b2c5",
                                    "rel": "self"
                                },
                                {
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/b4afc27e-c79a-11e2-b284-107d46e7b2c5/name/b4b23946-c79a-11e2-b284-107d46e7b2c5?v=full",
                                    "rel": "full"
                                }
                            ],
                            "resourceVersion": "1.9"
                        }
                    },
                    "value": 10
                },
                {
                    "uuid": "d2f1db9d-c738-44df-85c5-cafe8c077198",
                    "concept": {
                        "uuid": "b4b885c6-c79a-11e2-b284-107d46e7b2c5",
                        "name": {
                            "display": "BMI",
                            "uuid": "b4b9d80e-c79a-11e2-b284-107d46e7b2c5",
                            "name": "BMI",
                            "locale": "en",
                            "localePreferred": true,
                            "conceptNameType": "FULLY_SPECIFIED",
                            "links": [
                                {
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/b4b885c6-c79a-11e2-b284-107d46e7b2c5/name/b4b9d80e-c79a-11e2-b284-107d46e7b2c5",
                                    "rel": "self"
                                },
                                {
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/b4b885c6-c79a-11e2-b284-107d46e7b2c5/name/b4b9d80e-c79a-11e2-b284-107d46e7b2c5?v=full",
                                    "rel": "full"
                                }
                            ],
                            "resourceVersion": "1.9"
                        }
                    },
                    "value": 27.68
                }
            ]
        }
    ]
}

var testDispositionData = {
    "uuid": "9ea8d5a3-d5fd-4a97-9632-a31b71ad67ad",
    "name": {
        "display": "Disposition Note",
        "uuid": "47a32153-b538-4a4b-84f8-dc520dfba43a",
        "name": "Disposition Note",
        "locale": "en",
        "localePreferred": true,
        "conceptNameType": "FULLY_SPECIFIED",
        "links": [
            {
                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/9ea8d5a3-d5fd-4a97-9632-a31b71ad67ad/name/47a32153-b538-4a4b-84f8-dc520dfba43a",
                "rel": "self"
            },
            {
                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/9ea8d5a3-d5fd-4a97-9632-a31b71ad67ad/name/47a32153-b538-4a4b-84f8-dc520dfba43a?v=full",
                "rel": "full"
            }
        ],
        "resourceVersion": "1.9"
    }
};

describe("ConsultationModule", function () {
    var encounterConfig;
    var visit =  testVisitData;
    var dispositionNoteConcept = testDispositionData;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function () {

        encounterConfig = jasmine.createSpyObj('EncounterConfig', ['getOpdConsultationEncounterTypeUuid'])
        encounterConfig.getOpdConsultationEncounterTypeUuid.andReturn("c9614b8a-00e7-11e3-8c55-0800271c1b75");


    }));

    describe("dispositionMapperTest", function () {
        it('should map orders and observations within an encounter', function () {

        //    var dispositionMapper = new Bahmni.DispositionMapper(encounterConfig,dispositionNoteConcept)

         //   var foundResult = dispositionMapper.map(visit);

       //     var expectedDispositionNoteUuid = dispositionNoteConcept.uuid;
     //       expect(foundResult.dispositions[0].adtNoteConcept).toBe(expectedDispositionNoteUuid);
          //  var expectedDispositionOrder = visit.encounters[0].orders[0];
           // expect(foundResult.dispositionOrder.order.conceptUuid).toBe(expectedDispositionOrder.concept.uuid);

        });
    });

});

