'use strict';

describe("ObservationMapper", function () {
    var ObservationMapper = Bahmni.Common.Obs.ObservationMapper;

    describe("should map observation", function () {
        it("should map openmrs observation types - coded, boolean", function () {
            var bahmniObservations = [
                {
                    "conceptUuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
                    "groupMembers": [
                        {
                            "conceptUuid": "31344a11-2157-49b9-8b66-a1df92a5ff2b", "groupMembers": [],
                            "value": {"shortName": null, "name": "Paclitaxel", "conceptClass": "Misc", "dataType": "N/A"}, "type": "Coded",
                            "concept": {"shortName": null, "name": "Regimen Type", "conceptClass": "Misc", "dataType": "Coded"}
                        },
                        {
                            "conceptUuid": "31344a11-2157-49b9-8b66-a1df92a5ff2b", "groupMembers": [],
                            "value": {"shortName": null, "name": "Another Paclitaxel", "conceptClass": "Misc", "dataType": "N/A"}, "type": "Coded",
                            "concept": {"shortName": null, "name": "Regimen Type", "conceptClass": "Misc", "dataType": "Coded"}
                        }
                    ],
                    "concept": {"shortName": null, "name": "Chemotherapy", "set": true, "units": null, "conceptClass": "Misc", "dataType": "N/A"} }
            ];
            var mappedObservation = new ObservationMapper().map(bahmniObservations, {});
            expect(mappedObservation.length).toBe(1);
            expect(mappedObservation[0] instanceof Bahmni.Common.Obs.Observation).toBe(true);
            expect(mappedObservation[0].groupMembers.length).toBe(2);
            expect(mappedObservation[0].groupMembers[0] instanceof Bahmni.Common.Obs.Observation).toBe(true);
            expect(mappedObservation[0].groupMembers[0].value.name).toBe("Paclitaxel");
            expect(mappedObservation[0].groupMembers[1] instanceof Bahmni.Common.Obs.Observation).toBe(true);
            expect(mappedObservation[0].groupMembers[1].value.name).toBe("Another Paclitaxel");
        });

        it("should map multiSelectObservations", function () {
            var bahmniObservations = [
                {
                    "groupMembers": [
                        { "observationDateTime": "2014-10-20T11:30:47.000+0530", "value": {"shortName": null, "uuid": "1cfe9542-09cd-4969-8c92-3dcaf2685c6a",
                            "name": "Invasive Ductal Carcinoma", "conceptClass": "Misc", "dataType": "N/A"}, "type": "Coded",
                            "concept": {"name": "Pathologic Diagnosis", "set": false, "units": null, "conceptClass": "Misc", "dataType": "Coded"}  },
                        { "observationDateTime": "2014-10-20T11:30:47.000+0530", "value": {"shortName": null, "uuid": "4040c132-a66e-42ba-8359-5624747f34e3",
                            "name": "Invasive Lobular Carcinoma", "conceptClass": "Misc", "dataType": "N/A"}, "type": "Coded",
                            "concept": {"name": "Pathologic Diagnosis", "set": false, "units": null, "conceptClass": "Misc", "dataType": "Coded"}  }
                    ],
                    "value": "Invasive Ductal Carcinoma, Invasive Lobular Carcinoma",
                    "concept": {"shortName": null, "uuid": "134dc2f6-e045-4927-bf47-d18984a536b9", "name": "Histopathology", "conceptClass": "Misc", "dataType": "N/A"}
                }
            ];
            var mappedObservation = new ObservationMapper().map(bahmniObservations, {"Pathologic Diagnosis": {"multiSelect": true}});
            expect(mappedObservation.length).toBe(1);
            expect(mappedObservation[0] instanceof Bahmni.Common.Obs.Observation).toBe(true);
            expect(mappedObservation[0].groupMembers.length).toBe(1);
            expect(mappedObservation[0].groupMembers[0] instanceof Bahmni.Common.Obs.MultiSelectObservation).toBe(true);
            expect(mappedObservation[0].groupMembers[0].groupMembers.length).toBe(2);
        });

        it("should map multiSelectObservations at any level", function () {
            var bahmniObservations = [
                {
                    "concept" : {
                      "name" : "Grid's parent"  
                    },
                    "groupMembers" : [
                        {
                            "groupMembers": [
                                { "observationDateTime": "2014-10-20T11:30:47.000+0530", "value": {"shortName": null, "uuid": "1cfe9542-09cd-4969-8c92-3dcaf2685c6a",
                                    "name": "Invasive Ductal Carcinoma", "conceptClass": "Misc", "dataType": "N/A"}, "type": "Coded",
                                    "concept": {"name": "Pathologic Diagnosis", "set": false, "units": null, "conceptClass": "Misc", "dataType": "Coded"}  },
                                { "observationDateTime": "2014-10-20T11:30:47.000+0530", "value": {"shortName": null, "uuid": "4040c132-a66e-42ba-8359-5624747f34e3",
                                    "name": "Invasive Lobular Carcinoma", "conceptClass": "Misc", "dataType": "N/A"}, "type": "Coded",
                                    "concept": {"name": "Pathologic Diagnosis", "set": false, "units": null, "conceptClass": "Misc", "dataType": "Coded"}  }
                            ],
                            "value": "Invasive Ductal Carcinoma, Invasive Lobular Carcinoma",
                            "concept": {"shortName": null, "uuid": "134dc2f6-e045-4927-bf47-d18984a536b9", "name": "Histopathology", "conceptClass": "Misc", "dataType": "N/A"}
                        }
                    ] 
                }
            ];
            var mappedObservation = new ObservationMapper().map(bahmniObservations, {"Pathologic Diagnosis": {"multiSelect": true}});
            expect(mappedObservation.length).toBe(1);
            expect(mappedObservation[0] instanceof Bahmni.Common.Obs.Observation).toBe(true);
            expect(mappedObservation[0].groupMembers.length).toBe(1);
            expect(mappedObservation[0].groupMembers[0] instanceof Bahmni.Common.Obs.Observation).toBe(true);
            expect(mappedObservation[0].groupMembers[0].groupMembers.length).toBe(1);
            expect(mappedObservation[0].groupMembers[0].groupMembers[0] instanceof Bahmni.Common.Obs.MultiSelectObservation).toBe(true);
            expect(mappedObservation[0].groupMembers[0].groupMembers[0].groupMembers.length).toBe(2);
        });

        it("should map grid observations", function () {
            var bahmniObservations = [
                {
                    "groupMembers": [
                        {
                            "value": {"shortName": null, "name": "ER-", "conceptClass": "Test", "dataType": "Numeric"}, "type": "Coded",
                            "concept": {"shortName": null, "name": "Estrogen Receptor", "conceptClass": "Misc", "dataType": "Coded"} 
                        },
                        {
                            "value": {"shortName": null, "name": "PR+", "conceptClass": "Test", "dataType": "Numeric"}, "type": "Coded",
                            "concept": {"shortName": null, "name": "Progesterone receptor", "conceptClass": "Misc", "dataType": "Coded"}
                        }
                    ],
                    "value": "ER-, PR+",
                    "concept": {"shortName": null, "name": "Receptor Status", "set": true, "units": null, "conceptClass": "Misc", "dataType": "N/A"}}

            ];
            var mappedObservation = new ObservationMapper().map(bahmniObservations, {"Receptor Status": {"grid": true}});
            expect(mappedObservation.length).toBe(1);
            expect(mappedObservation[0] instanceof Bahmni.Common.Obs.GridObservation).toBe(true);
            expect(mappedObservation[0].value).toBe("ER-, PR+");
            expect(mappedObservation[0].groupMembers.length).toBe(2);
            expect(mappedObservation[0].groupMembers[0] instanceof Bahmni.Common.Obs.Observation).toBe(true);
            expect(mappedObservation[0].groupMembers[1] instanceof Bahmni.Common.Obs.Observation).toBe(true);
        });

        it('should not create multiSelect Observation for form2.0 observations', function () {
            var bahmniObservations = [
                {
                    "groupMembers": [
                        {
                            "observationDateTime": "2014-10-20T11:30:47.000+0530", "value": {
                                "shortName": null, "uuid": "1cfe9542-09cd-4969-8c92-3dcaf2685c6a",
                                "name": "Invasive Ductal Carcinoma", "conceptClass": "Misc", "dataType": "N/A"
                            }, "type": "Coded",
                            "concept": {
                                "name": "Pathologic Diagnosis",
                                "set": false,
                                "units": null,
                                "conceptClass": "Misc",
                                "dataType": "Coded"
                            }
                        },
                        {
                            "observationDateTime": "2014-10-20T11:30:47.000+0530", "value": {
                                "shortName": null, "uuid": "4040c132-a66e-42ba-8359-5624747f34e3",
                                "name": "Invasive Lobular Carcinoma", "conceptClass": "Misc", "dataType": "N/A"
                            }, "type": "Coded",
                            "concept": {
                                "name": "Pathologic Diagnosis",
                                "set": false,
                                "units": null,
                                "conceptClass": "Misc",
                                "dataType": "Coded"
                            }
                        }

                    ],
                    "value": "Invasive Ductal Carcinoma, Invasive Lobular Carcinoma",
                    "concept": {
                        "shortName": null,
                        "uuid": "134dc2f6-e045-4927-bf47-d18984a536b9",
                        "name": "Histopathology",
                        "conceptClass": "Misc",
                        "dataType": "N/A"
                    }
                },
                {
                    "observationDateTime": "2014-10-20T11:30:47.000+0530", "value": {
                        "shortName": null, "uuid": "4040c132-a66e-42ba-8359-5624747f34e3",
                        "name": "Invasive Lobular Carcinoma", "conceptClass": "Misc", "dataType": "N/A"
                    }, "type": "Coded",
                    "concept": {
                        "name": "Pathologic Diagnosis",
                        "set": false,
                        "units": null,
                        "conceptClass": "Misc",
                        "dataType": "Coded"
                    },
                    "formFieldPath": "form2.1/2-0"
                },
                {
                    "observationDateTime": "2014-10-20T11:30:47.000+0530", "value": {
                        "shortName": null, "uuid": "4040c132-a66e-42ba-8359-5624747f34e3",
                        "name": "Invasive Ductal Carcinoma", "conceptClass": "Misc", "dataType": "N/A"
                    }, "type": "Coded",
                    "concept": {
                        "name": "Pathologic Diagnosis",
                        "set": false,
                        "units": null,
                        "conceptClass": "Misc",
                        "dataType": "Coded"
                    },
                    "formFieldPath": "form2.1/2-0"
                }
            ];
            var mappedObservation = new ObservationMapper().map(bahmniObservations, {"Pathologic Diagnosis": {"multiSelect": true}});
            expect(mappedObservation.length).toBe(3);
            expect(mappedObservation[0] instanceof Bahmni.Common.Obs.Observation).toBe(true);
            expect(mappedObservation[0].groupMembers.length).toBe(0);
            expect(mappedObservation[1] instanceof Bahmni.Common.Obs.Observation).toBe(true);
            expect(mappedObservation[1].groupMembers.length).toBe(0);
            expect(mappedObservation[2] instanceof Bahmni.Common.Obs.Observation).toBe(true);
            expect(mappedObservation[2].groupMembers[0] instanceof Bahmni.Common.Obs.MultiSelectObservation).toBe(true);
            expect(mappedObservation[2].groupMembers.length).toBe(1);
            expect(mappedObservation[2].groupMembers[0].groupMembers.length).toBe(2);
        });

    });

    it("should not group form one and form two multiSelect Obs", function () {
        var bahmniObservations = [
            {
                "observationDateTime": "2014-10-20T11:30:47.000+0530", "value": {
                    "shortName": null, "uuid": "4040c132-a66e-42ba-8359-5624747f34e3",
                    "name": "Invasive Lobular Carcinoma", "conceptClass": "Misc", "dataType": "N/A"
                }, "type": "Coded",
                "concept": {
                    "name": "Pathologic Diagnosis",
                    "set": false,
                    "units": null,
                    "conceptClass": "Misc",
                    "dataType": "Coded"
                }
            },
            {
                "observationDateTime": "2014-10-20T11:30:47.000+0530", "value": {
                    "shortName": null, "uuid": "4040c132-a66e-42ba-8359-5624747f34e3",
                    "name": "Invasive Ductal Carcinoma", "conceptClass": "Misc", "dataType": "N/A"
                }, "type": "Coded",
                "concept": {
                    "name": "Pathologic Diagnosis",
                    "set": false,
                    "units": null,
                    "conceptClass": "Misc",
                    "dataType": "Coded"
                }
            },
            {
                "observationDateTime": "2014-10-20T11:30:47.000+0530", "value": {
                    "shortName": null, "uuid": "4040c132-a66e-42ba-8359-5624747f34e3",
                    "name": "Invasive Lobular Carcinoma", "conceptClass": "Misc", "dataType": "N/A"
                }, "type": "Coded",
                "concept": {
                    "name": "Pathologic Diagnosis",
                    "set": false,
                    "units": null,
                    "conceptClass": "Misc",
                    "dataType": "Coded"
                },
                "formFieldPath": "form2.1/2-0"
            },
            {
                "observationDateTime": "2014-10-20T11:30:47.000+0530", "value": {
                    "shortName": null, "uuid": "4040c132-a66e-42ba-8359-5624747f34e3",
                    "name": "Invasive Ductal Carcinoma", "conceptClass": "Misc", "dataType": "N/A"
                }, "type": "Coded",
                "concept": {
                    "name": "Pathologic Diagnosis",
                    "set": false,
                    "units": null,
                    "conceptClass": "Misc",
                    "dataType": "Coded"
                },
                "formFieldPath": "form2.1/2-0"
            }
        ];
        var mappedObservation = new ObservationMapper().map(bahmniObservations,
            {"Pathologic Diagnosis": {"multiSelect": true}});
        expect(mappedObservation.length).toBe(3);
        expect(mappedObservation[0] instanceof Bahmni.Common.Obs.MultiSelectObservation).toBe(true);
        expect(mappedObservation[0].groupMembers.length).toBe(2);
        expect(mappedObservation[1] instanceof Bahmni.Common.Obs.Observation).toBe(true);
        expect(mappedObservation[1].groupMembers.length).toBe(0);
        expect(mappedObservation[1].formFieldPath).toBe("form2.1/2-0");
        expect(mappedObservation[2] instanceof Bahmni.Common.Obs.Observation).toBe(true);
        expect(mappedObservation[2].groupMembers.length).toBe(0);
        expect(mappedObservation[2].formFieldPath).toBe("form2.1/2-0");
    });
});
