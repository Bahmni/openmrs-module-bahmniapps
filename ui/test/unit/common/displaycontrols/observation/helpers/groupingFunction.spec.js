'use strict';

describe("grouping Observations", function () {

    it("should return observation grouped in conceptSortWeight order", function(){
        var groupedObservation = new Bahmni.Common.DisplayControl.Observation.GroupingFunctions().groupByEncounterDate(observationsList);
        expect(groupedObservation[0].value[0].concept.name).toBe("Blood Pressure");
        expect(groupedObservation[0].value[1].concept.name).toBe("Dispensed");
        expect(groupedObservation[1].value[0].concept.name).toBe("Vitals");
        expect(groupedObservation[2].value[0].concept.name).toBe("RBS");
    })

});

var observationsList = [
    {
        "voided": false,
        "uuid": "f58a3d20-b9ac-4638-91b3-c0a5f5a97030",
        "concept": {
            "shortName": null,
            "uuid": "71624f7d-b8d2-4e4a-a59a-70c584ae0cc2",
            "conceptClass": "LabTest",
            "units": null,
            "dataType": "Numeric",
            "name": "RBS",
            "set": false
        },
        "voidReason": null,
        "groupMembers": [
            {
                "voided": false,
                "uuid": "69d01b95-90a1-490f-8fa2-f5712e494dc5",
                "concept": {
                    "shortName": null,
                    "uuid": "71624f7d-b8d2-4e4a-a59a-70c584ae0cc2",
                    "conceptClass": "LabTest",
                    "units": null,
                    "dataType": "Numeric",
                    "name": "RBS",
                    "set": false
                },
                "voidReason": null,
                "groupMembers": [
                    {
                        "voided": false,
                        "uuid": "c13dbb9b-5cdd-41d8-9657-325779925698",
                        "concept": {
                            "shortName": "LAB_MAXNORMAL",
                            "uuid": "e860874d-a2a1-11e3-af88-005056821db0",
                            "conceptClass": "Finding",
                            "units": null,
                            "dataType": "Numeric",
                            "name": "LAB_MAXNORMAL",
                            "set": false
                        },
                        "voidReason": null,
                        "groupMembers": [],
                        "conceptUuid": "e860874d-a2a1-11e3-af88-005056821db0",
                        "observationDateTime": "2014-05-08T16:29:20.000+0530",
                        "isAbnormal": null,
                        "conceptSortWeight": 0,
                        "visitStartDateTime": "2014-03-19T11:45:08.000+0530",
                        "encounterUuid": "7ee37db0-a263-4ab9-a787-c614d6b73ef7",
                        "encounterDateTime": 1399546716000,
                        "targetObsRelation": null,
                        "orderUuid": "aa5ba4e9-d3a1-4135-bc7d-6804249253a0",
                        "abnormal": null,
                        "value": 0,
                        "type": "Numeric",
                        "comment": null,
                        "providers": null,
                        "duration": null
                    },
                    {
                        "voided": false,
                        "uuid": "51e1303f-4532-45c5-8a93-ea5cf2355608",
                        "concept": {
                            "shortName": "LAB_ABNORMAL",
                            "uuid": "e8625e8a-a2a1-11e3-af88-005056821db0",
                            "conceptClass": "Finding",
                            "units": null,
                            "dataType": "Boolean",
                            "name": "LAB_ABNORMAL",
                            "set": false
                        },
                        "voidReason": null,
                        "groupMembers": [],
                        "conceptUuid": "e8625e8a-a2a1-11e3-af88-005056821db0",
                        "observationDateTime": "2014-05-08T16:29:20.000+0530",
                        "isAbnormal": null,
                        "conceptSortWeight": 0,
                        "visitStartDateTime": "2014-03-19T11:45:08.000+0530",
                        "encounterUuid": "7ee37db0-a263-4ab9-a787-c614d6b73ef7",
                        "encounterDateTime": 1399546716000,
                        "targetObsRelation": null,
                        "orderUuid": "aa5ba4e9-d3a1-4135-bc7d-6804249253a0",
                        "abnormal": null,
                        "value": false,
                        "type": "Boolean",
                        "comment": null,
                        "providers": null,
                        "duration": null
                    },
                    {
                        "voided": false,
                        "uuid": "7b50e51c-7292-4676-97f9-9ded1c2f2f64",
                        "concept": {
                            "shortName": "LAB_MINNORMAL",
                            "uuid": "e85b724b-a2a1-11e3-af88-005056821db0",
                            "conceptClass": "Finding",
                            "units": null,
                            "dataType": "Numeric",
                            "name": "LAB_MINNORMAL",
                            "set": false
                        },
                        "voidReason": null,
                        "groupMembers": [],
                        "conceptUuid": "e85b724b-a2a1-11e3-af88-005056821db0",
                        "observationDateTime": "2014-05-08T16:29:20.000+0530",
                        "isAbnormal": null,
                        "conceptSortWeight": 0,
                        "visitStartDateTime": "2014-03-19T11:45:08.000+0530",
                        "encounterUuid": "7ee37db0-a263-4ab9-a787-c614d6b73ef7",
                        "encounterDateTime": 1399546716000,
                        "targetObsRelation": null,
                        "orderUuid": "aa5ba4e9-d3a1-4135-bc7d-6804249253a0",
                        "abnormal": null,
                        "value": 0,
                        "type": "Numeric",
                        "comment": null,
                        "providers": null,
                        "duration": null
                    },
                    {
                        "voided": false,
                        "uuid": "d79140ee-67e5-4fad-b3fb-31e4014a6cb2",
                        "concept": {
                            "shortName": null,
                            "uuid": "71624f7d-b8d2-4e4a-a59a-70c584ae0cc2",
                            "conceptClass": "LabTest",
                            "units": null,
                            "dataType": "Numeric",
                            "name": "RBS",
                            "set": false
                        },
                        "voidReason": null,
                        "groupMembers": [],
                        "conceptUuid": "71624f7d-b8d2-4e4a-a59a-70c584ae0cc2",
                        "observationDateTime": "2014-05-08T16:29:20.000+0530",
                        "isAbnormal": null,
                        "conceptSortWeight": 1,
                        "visitStartDateTime": "2014-03-19T11:45:08.000+0530",
                        "encounterUuid": "7ee37db0-a263-4ab9-a787-c614d6b73ef7",
                        "encounterDateTime": 1399546716000,
                        "targetObsRelation": null,
                        "orderUuid": "aa5ba4e9-d3a1-4135-bc7d-6804249253a0",
                        "abnormal": null,
                        "value": 235,
                        "type": "Numeric",
                        "comment": null,
                        "providers": null,
                        "duration": null
                    }
                ],
                "conceptUuid": "71624f7d-b8d2-4e4a-a59a-70c584ae0cc2",
                "observationDateTime": "2014-05-08T16:29:20.000+0530",
                "isAbnormal": null,
                "conceptSortWeight": 1,
                "visitStartDateTime": "2014-03-19T11:45:08.000+0530",
                "encounterUuid": "7ee37db0-a263-4ab9-a787-c614d6b73ef7",
                "encounterDateTime": 1399546716000,
                "targetObsRelation": null,
                "orderUuid": "aa5ba4e9-d3a1-4135-bc7d-6804249253a0",
                "abnormal": null,
                "value": null,
                "type": null,
                "comment": null,
                "providers": null,
                "duration": null
            }
        ],
        "conceptUuid": "71624f7d-b8d2-4e4a-a59a-70c584ae0cc2",
        "observationDateTime": "2014-05-08T16:29:20.000+0530",
        "isAbnormal": null,
        "conceptSortWeight": 1,
        "visitStartDateTime": "2014-03-19T11:45:08.000+0530",
        "encounterUuid": "7ee37db0-a263-4ab9-a787-c614d6b73ef7",
        "encounterDateTime": 1399546716000,
        "targetObsRelation": null,
        "orderUuid": "aa5ba4e9-d3a1-4135-bc7d-6804249253a0",
        "abnormal": null,
        "value": null,
        "type": null,
        "comment": null,
        "providers": null,
        "duration": null
    },
    {
        "voided": false,
        "uuid": "67c24cff-8e74-4693-936f-dc225396eaa4",
        "concept": {
            "shortName": null,
            "uuid": "4e41484b-bb89-4bb6-adfd-3c9192f990d9",
            "conceptClass": "Misc",
            "units": null,
            "dataType": "Boolean",
            "name": "Dispensed",
            "set": false
        },
        "voidReason": null,
        "groupMembers": [],
        "conceptUuid": "4e41484b-bb89-4bb6-adfd-3c9192f990d9",
        "observationDateTime": "2015-01-11T21:25:41.000+0530",
        "isAbnormal": null,
        "conceptSortWeight": 1,
        "visitStartDateTime": "2014-03-19T11:45:08.000+0530",
        "encounterUuid": "0d6e8ed4-4c84-4de4-81e6-89ed0e544990",
        "encounterDateTime": 1420988408000,
        "targetObsRelation": null,
        "orderUuid": "15c3680e-6575-416d-91d5-4919cae15594",
        "abnormal": null,
        "value": true,
        "type": "Boolean",
        "comment": null,
        "providers": null,
        "duration": null
    },
    {
        "voided": false,
        "uuid": "67c24cff-8e74-4693-936f-dc225396eaa4",
        "concept": {
            "shortName": null,
            "uuid": "4e41484b-bb89-4bb6-adfd-3c9192f990d9",
            "conceptClass": "Misc",
            "units": null,
            "dataType": "N/A",
            "name": "Blood Pressure",
            "set": false
        },
        "voidReason": null,
        "groupMembers": [],
        "conceptUuid": "4e41484b-bb89-4bb6-adfd-3c9192f990d9",
        "observationDateTime": "2015-01-11T21:25:41.000+0530",
        "isAbnormal": null,
        "conceptSortWeight": 0,
        "visitStartDateTime": "2014-03-19T11:45:08.000+0530",
        "encounterUuid": "0d6e8ed4-4c84-4de4-81e6-89ed0e544990",
        "encounterDateTime": 1420988408000,
        "targetObsRelation": null,
        "orderUuid": "15c3680e-6575-416d-91d5-4919cae15594",
        "abnormal": null,
        "value": true,
        "type": "Boolean",
        "comment": null,
        "providers": null,
        "duration": null
    },
    {
        "voided": false,
        "uuid": "b933fdb2-0b0d-4c93-9cd0-7f213062a9b6",
        "concept": {
            "shortName": "Vitals Always",
            "uuid": "a2f2dd55-a2a1-11e3-af88-005056821db0",
            "conceptClass": "Misc",
            "units": null,
            "dataType": "N/A",
            "name": "Vitals",
            "set": true
        },
        "voidReason": null,
        "groupMembers": [
            {
                "voided": false,
                "uuid": "968f0c84-9dcd-4a24-8a62-b7880fd9aaaf",
                "concept": {
                    "shortName": "Pulse Per Min",
                    "uuid": "509ab9ba-d065-11e3-be87-005056821db0",
                    "conceptClass": "Concept Details",
                    "units": null,
                    "dataType": "N/A",
                    "name": "Pulse Daa",
                    "set": true
                },
                "voidReason": null,
                "groupMembers": [],
                "conceptUuid": "509ab9ba-d065-11e3-be87-005056821db0",
                "observationDateTime": "2014-09-26T10:23:38.000+0530",
                "isAbnormal": false,
                "conceptSortWeight": 2,
                "visitStartDateTime": "2014-03-19T11:45:08.000+0530",
                "encounterUuid": "b61f5e91-f56c-436e-af29-9ed4d833948f",
                "encounterDateTime": 1411707218000,
                "targetObsRelation": null,
                "orderUuid": null,
                "abnormal": false,
                "value": 72,
                "type": "Numeric",
                "comment": null,
                "providers": null,
                "duration": null
            }
        ],
        "conceptUuid": "a2f2dd55-a2a1-11e3-af88-005056821db0",
        "observationDateTime": "2014-09-26T10:23:38.000+0530",
        "isAbnormal": null,
        "conceptSortWeight": 1,
        "visitStartDateTime": "2014-03-19T11:45:08.000+0530",
        "encounterUuid": "b61f5e91-f56c-436e-af29-9ed4d833948f",
        "encounterDateTime": 1411707218000,
        "targetObsRelation": null,
        "orderUuid": null,
        "abnormal": null,
        "value": "72.0, false, Sitting",
        "type": null,
        "comment": null,
        "providers": null,
        "duration": null
    }
];