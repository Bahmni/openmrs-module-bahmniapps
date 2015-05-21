'use strict';

describe('Order Observations mapper', function () {
    it("should mark observations not in active encounter", function () {
        var mapper = new Bahmni.Orders.OrderObservationsMapper();
        var rootConcept = {uuid: "DrugOrderFormConceptUuid"};
        var order= {uuid: "orderUuid"};
        var mappedObservations = mapper.map(order,rootConcept, getActiveEncounter(), getObservationsForOrderFromPreviousEncounter());

        expect(mappedObservations).not.toBeNull();
        expect(mappedObservations.length).toBe(1);

        var rootObs = mappedObservations[0];

        expect(rootObs.uuid).toBe("DrugOrderFormObsUuid");
        expect(rootObs.groupMembers.length).toBe(3);


        expect(rootObs.groupMembers[0].uuid).toBe("DrugOrderFormConceptOneObsUuid");
        expect(rootObs.groupMembers[1].uuid).toBe("DrugOrderFormConceptTwoObsUuid");
        expect(rootObs.groupMembers[2].uuid).toBe("DrugOrderFormConceptThreeObsUuid");
    });

    var getActiveEncounter = function () {
        return {
            "patientId": "SEM1193",
            "drugOrders": [],
            "observations": [{
                "uuid": "DrugOrderFormObsUuid",
                "voided": false,
                "concept": {
                    "uuid": "DrugOrderFormConceptUuid",
                    "name": "DrugOrderForm",
                    "set": true
                },
                "groupMembers": [{
                    "uuid": "DrugOrderFormConceptOneObsUuid",
                    "voided": false,
                    "concept": {
                        "uuid": "DrugOrderFormConceptOneUuid",
                        "name": "DrugOrderFormConceptOne",
                        "set": false
                    },
                    "groupMembers": [],
                    "observationDateTime": "2015-03-31T17:36:37.000+0530",
                    "encounterUuid": "activeEncounterUuid",
                    "orderUuid": "orderUuid",
                    "value": 123
                }],
                "observationDateTime": "2015-03-31T17:36:37.000+0530",
                "encounterUuid": "activeEncounterUuid",
                "orderUuid": "orderUuid",
                "value": null
            }, {
                "uuid": "obsFiveUuid",
                "voided": false,
                "concept": {
                    "uuid": "RandomConceptUuid",
                    "name": "Random",
                    "set": false
                },
                "groupMembers": [],
                "observationDateTime": "2015-03-31T17:36:37.000+0530",
                "encounterUuid": "activeEncounterUuid",
                "orderUuid": "randomOrderUuid",
                "value": 123
            }],
            "encounterDateTime": "2015-05-14T16:57:28.000+0530",
            "patientUuid": "patientOneUuid",
            "encounterUuid": "activeEncounterUuid"
        }
    }

    var getObservationsForOrderFromPreviousEncounter = function () {
        return [{
            "uuid": "DrugOrderFormPreviousEncounterObsUuid",
            "voided": false,
            "concept": {
                "uuid": "DrugOrderFormConceptUuid",
                "name": "DrugOrderFormConcept",
                "set": true
            },
            "groupMembers": [{
                "uuid": "DrugOrderFormConceptTwoObsUuid",
                "voided": false,
                "concept": {
                    "uuid": "DrugOrderFormConceptTwoUuid",
                    "name": "DrugOrderFormConceptTwo",
                    "set": false
                },
                "groupMembers": [],
                "observationDateTime": "2015-03-31T17:36:37.000+0530",
                "encounterUuid": "previousEncounterUuid",
                "orderUuid": "orderUuid",
                "value": 123
            }],
            "observationDateTime": "2015-03-31T17:36:37.000+0530",
            "encounterUuid": "previousEncounterUuid",
            "orderUuid": "orderUuid",
            "value": null
        }, {
            "uuid": "DrugOrderFormSecondPreviousEncounterObsUuid",
            "voided": false,
            "concept": {
                "uuid": "DrugOrderFormConceptUuid",
                "name": "DrugOrderFormConcept",
                "set": true
            },
            "groupMembers": [{
                "uuid": "DrugOrderFormConceptThreeObsUuid",
                "voided": false,
                "concept": {
                    "uuid": "DrugOrderFormConceptThreeUuid",
                    "name": "DrugOrderFormConceptThree",
                    "set": false
                },
                "groupMembers": [],
                "observationDateTime": "2015-03-31T17:36:37.000+0530",
                "encounterUuid": "secondPreviousEncounterUuid",
                "orderUuid": "orderUuid",
                "value": 321
            }],
            "observationDateTime": "2015-03-31T17:36:37.000+0530",
            "encounterUuid": "secondPreviousEncounterUuid",
            "orderUuid": "orderUuid",
            "value": null
        }]
    }
});


describe('no observation in active encounter', function () {
    it("should mark observations in previous encounter as root", function () {
        var mapper = new Bahmni.Orders.OrderObservationsMapper();
        var rootConcept = {uuid: "DrugOrderFormConceptUuid"};
        var order= {uuid: "orderUuid"};
        var mappedObservations = mapper.map(order,rootConcept, getActiveEncounter(), getObservationsForOrderFromPreviousEncounter());

        expect(mappedObservations).not.toBeNull();
        expect(mappedObservations.length).toBe(1);

        var rootObs = mappedObservations[0];

        expect(rootObs.uuid).toBe(undefined);
        expect(rootObs.groupMembers.length).toBe(2);


        expect(rootObs.groupMembers[0].uuid).toBe("DrugOrderFormConceptTwoObsUuid");
        expect(rootObs.groupMembers[0].encounterUuid).toBe("previousEncounterUuid");
        expect(rootObs.groupMembers[1].uuid).toBe("DrugOrderFormConceptThreeObsUuid");
        expect(rootObs.groupMembers[1].encounterUuid).toBe("secondPreviousEncounterUuid");
    });

    var getActiveEncounter = function () {
        return {
            "patientId": "SEM1193",
            "drugOrders": [],
            "observations": [{
                "uuid": "DrugOrderFormObsUuid",
                "voided": false,
                "concept": {
                    "uuid": "randomUuid",
                    "name": "randomName",
                    "set": true
                },
                "groupMembers": [{
                    "uuid": "DrugOrderFormConceptOneObsUuid",
                    "voided": false,
                    "concept": {
                        "uuid": "DrugOrderFormConceptOneUuid",
                        "name": "DrugOrderFormConceptOne",
                        "set": false
                    },
                    "groupMembers": [],
                    "observationDateTime": "2015-03-31T17:36:37.000+0530",
                    "encounterUuid": "activeEncounterUuid",
                    "orderUuid": "orderUuid",
                    "value": 123
                }],
                "observationDateTime": "2015-03-31T17:36:37.000+0530",
                "encounterUuid": "activeEncounterUuid",
                "orderUuid": "orderUuid",
                "value": null
            }, {
                "uuid": "obsFiveUuid",
                "voided": false,
                "concept": {
                    "uuid": "RandomConceptUuid",
                    "name": "Random",
                    "set": false
                },
                "groupMembers": [],
                "observationDateTime": "2015-03-31T17:36:37.000+0530",
                "encounterUuid": "activeEncounterUuid",
                "orderUuid": "randomOrderUuid",
                "value": 123
            }],
            "encounterDateTime": "2015-05-14T16:57:28.000+0530",
            "patientUuid": "patientOneUuid",
            "encounterUuid": "activeEncounterUuid"
        }
    }

    var getObservationsForOrderFromPreviousEncounter = function () {
        return [{
            "uuid": "DrugOrderFormPreviousEncounterObsUuid",
            "voided": false,
            "concept": {
                "uuid": "DrugOrderFormConceptUuid",
                "name": "DrugOrderFormConcept",
                "set": true
            },
            "groupMembers": [{
                "uuid": "DrugOrderFormConceptTwoObsUuid",
                "voided": false,
                "concept": {
                    "uuid": "DrugOrderFormConceptTwoUuid",
                    "name": "DrugOrderFormConceptTwo",
                    "set": false
                },
                "groupMembers": [],
                "observationDateTime": "2015-03-31T17:36:37.000+0530",
                "encounterUuid": "previousEncounterUuid",
                "orderUuid": "orderUuid",
                "value": 123
            }],
            "observationDateTime": "2015-03-31T17:36:37.000+0530",
            "encounterUuid": "previousEncounterUuid",
            "orderUuid": "orderUuid",
            "value": null
        }, {
            "uuid": "DrugOrderFormSecondPreviousEncounterObsUuid",
            "voided": false,
            "concept": {
                "uuid": "DrugOrderFormConceptUuid",
                "name": "DrugOrderFormConcept",
                "set": true
            },
            "groupMembers": [{
                "uuid": "DrugOrderFormConceptThreeObsUuid",
                "voided": false,
                "concept": {
                    "uuid": "DrugOrderFormConceptThreeUuid",
                    "name": "DrugOrderFormConceptThree",
                    "set": false
                },
                "groupMembers": [],
                "observationDateTime": "2015-03-31T17:36:37.000+0530",
                "encounterUuid": "secondPreviousEncounterUuid",
                "orderUuid": "orderUuid",
                "value": 321
            }, {
                    "uuid": "DrugOrderFormConceptTwoObsUuid",
                    "voided": false,
                    "concept": {
                        "uuid": "DrugOrderFormConceptThreeUuid",
                        "name": "DrugOrderFormConceptThree",
                        "set": false
                    },
                    "groupMembers": [],
                    "observationDateTime": "2015-03-31T17:36:37.000+0530",
                    "encounterUuid": "secondPreviousEncounterUuid",
                    "orderUuid": "orderUuid",
                    "value": 321
                }],
            "observationDateTime": "2015-03-31T17:36:37.000+0530",
            "encounterUuid": "secondPreviousEncounterUuid",
            "orderUuid": "orderUuid",
            "value": null
        }]
    }
});

