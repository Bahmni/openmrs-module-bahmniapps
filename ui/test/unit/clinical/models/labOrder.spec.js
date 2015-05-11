'use strict';

describe('Lab Order', function () {
    var newOrder = function () {
        return {
                "concept": {
                    "name": "Asitic Fluid",
                    "set": true
                },
                "provider": {
                    "name": "superman"
                },
                "observations": [{
                    "observationDateTime": "2014-04-03T14:37:15.000+0530",
                    "groupMembers": [{
                        "observationDateTime": "2014-04-03T14:37:15.000+0530",
                        "groupMembers": [{
                            "observationDateTime": "2014-04-03T14:37:15.000+0530",
                            "groupMembers": [{
                                "observationDateTime": "2014-04-03T14:37:15.000+0530",
                                "groupMembers": [],
                                "value": false,
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
                                "xvoided": false,
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
                                "value": true,
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

    it("should create and map lab orders with observations", function () {
        var order = newOrder();
        var labOrder = Bahmni.Clinical.LabOrder.create(order);
        expect(labOrder.concept.name).toBe('Asitic Fluid');
        expect(labOrder.orderable instanceof Bahmni.Clinical.Panel).toBe(true);
    });

    it("should be panel if concept is a set", function () {
        var order = newOrder();
        var labOrder = Bahmni.Clinical.LabOrder.create(order);
        expect(labOrder.concept.name).toBe('Asitic Fluid');
        expect(labOrder.isPanel()).toBeTruthy();
    });

    it("should create a Result from a list of observations", function() {
        var order = newOrder();
        var observations = order.observations[0].groupMembers[0].groupMembers[0].groupMembers;
        var result = Bahmni.Clinical.Result.create({name: "Gram Stain"}, observations);
        expect(result.concept.name).toBe('Gram Stain (Asitic Fluid)');
        expect(result.value).toBe('Positive');
        expect(result.isAbnormal).toBe(false);
    });

    it('should create Results object from a results observations', function() {
        var order = newOrder();
        var observations = order.observations[0].groupMembers[0];
        var test = Bahmni.Clinical.Test.create(observations);
        expect(test.concept.name).toBe('Gram Stain (Asitic Fluid)');
        var result = test.results[0];
        expect(result.concept.name).toBe('Gram Stain (Asitic Fluid)');
    });

    it('should create a Panel object', function() {
        var order = newOrder();
        var panel = Bahmni.Clinical.Panel.create(order.concept, order.observations);
    });
});