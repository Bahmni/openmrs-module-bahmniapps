'use strict';

describe('Order group with obs', function () {
    var orderGroupWithObs = function () {
        return {
                "concept": {
                    "name": "Asitic Fluid",
                    "set": true
                },
                "provider": {
                    "name": "superman"
                },
                "obs": [{
                    "observationDateTime": "2014-04-03T14:37:15.000+0530",
                    "groupMembers": [{
                        "observationDateTime": "2014-04-03T14:37:15.000+0530",
                        "groupMembers": [{
                            "observationDateTime": "2014-04-03T14:37:15.000+0530",
                            "groupMembers": [{
                                "observationDateTime": "2014-04-03T14:37:15.000+0530",
                                "groupMembers": [],
                                "value": "false",
                                "concept": {
                                    "name": "LAB_ABNORMAL",
                                    "set": false,
                                    "dataType": "Boolean"
                                },
                                "provider": {
                                    "name": "Lab System"
                                }
                            }, {
                                "observationDateTime": "2014-04-03T14:37:15.000+0530",
                                "groupMembers": [],
                                "value": "Notes for the free text value - notes notes notes - 2",
                                "concept": {
                                    "name": "LAB_NOTES",
                                    "set": false,
                                    "dataType": "Text"
                                },
                                "voided": false,
                                "provider": {
                                    "name": "Lab System"
                                }
                            }, {
                                "observationDateTime": "2014-04-03T14:37:15.000+0530",
                                "groupMembers": [],
                                "value": "Positive",
                                "concept": {
                                    "name": "Gram Stain (Asitic Fluid)",
                                    "set": false
                                },
                                "provider": {"name": "Lab System"}
                            }],
                            "value": null,
                            "concept": {
                                "name": "Gram Stain (Asitic Fluid)",
                                "set": false
                            },
                            "orderUuid": "ccbb9eef-0d7c-48d0-a616-4de4649130cf",
                            "provider": {
                                "name": "Lab System"
                            }
                        }],
                        "value": null,
                        "concept": {
                            "name": "Gram Stain (Asitic Fluid)",
                            "set": false,
                            "dataType": "Text"
                        },
                        "provider": {"name": "Lab System"}
                    }, {
                        "observationDateTime": "2014-04-03T14:37:15.000+0530",
                        "groupMembers": [{
                            "observationDateTime": "2014-04-03T14:37:15.000+0530",
                            "voidReason": null,
                            "groupMembers": [{
                                "observationDateTime": "2014-04-03T14:37:15.000+0530",
                                "voidReason": null,
                                "groupMembers": [],
                                "value": 20,
                                "concept": {
                                    "name": "Protein (Asitic Fluid)",
                                    "set": false
                                },
                                "voided": false,
                                "provider": {"name": "Lab System"}
                            }, {
                                "observationDateTime": "2014-04-03T14:37:15.000+0530",
                                "groupMembers": [],
                                "value": "true",
                                "concept": {
                                    "name": "LAB_ABNORMAL",
                                    "set": false
                                },
                                "provider": {"name": "Lab System"}
                            }],
                            "value": null,
                            "concept": {
                                "name": "Protein (Asitic Fluid)",
                                "set": false,
                                "dataType": "Numeric"
                            },
                            "provider": {
                                "name": "Lab System"
                            }
                        }],
                        "value": null,
                        "concept": {
                            "name": "Protein (Asitic Fluid)",
                            "set": false,
                            "dataType": "Numeric"
                        },
                        "provider": {
                            "name": "Lab System"
                        }
                    }],
                    "concept": {
                        "name": "Asitic Fluid",
                        "set": true,
                        "dataType": "N/A"
                    },
                    "provider": {
                        "name": "Lab System"
                    }
                }]
            };
    };

    it("should create and map test orders with observations", function () {
        var orderGroup = orderGroupWithObs();
        var testOrder = Bahmni.Clinical.TestOrder.create(orderGroup);
        expect(testOrder.name).toBe('Asitic Fluid');
        expect(testOrder.result instanceof Bahmni.Clinical.Panel).toBe(true);
    });

    iit("should create a Result from a list of observations", function() {
        var orderGroup = new orderGroupWithObs();
        var observations = orderGroup.obs[0].groupMembers[0].groupMembers[0].groupMembers;
        var result = Bahmni.Clinical.Result.create("Gram Stain", observations);
        expect(result.name).toBe('Gram Stain (Asitic Fluid)');
        expect(result.value).toBe('Positive');
        expect(result.isAbnormal).toBe(false);
    });

    it('should create Results object from a results obs', function() {
        var orderGroup = new orderGroupWithObs();
        var obs = orderGroup.obs[0].groupMembers[0];
        var results = Bahmni.Clinical.Results.create(obs);
        expect(results.name).toBe('Gram Stain (Asitic Fluid)');
        var wrappedResult = results.results[0];
        expect(wrappedResult.name).toBe('Gram Stain (Asitic Fluid)');
    });

    it('should create a Panel object', function() {
        var orderGroup = new orderGroupWithObs();
        var panelObs = orderGroup.obs[0];
        var panel = Bahmni.Clinical.Panel.create(panelObs);
    });
});