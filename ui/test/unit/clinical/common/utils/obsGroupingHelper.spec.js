'use strict';

describe("ObsGropingHelper", function () {
    var conceptSetUiConfigService, conceptGroupFormatService;

    var allObservations = [
        {
            "encounterDateTime": 1485752954000,
            "isAbnormal": null,
            "duration": null,
            "type": "Coded",
            "encounterUuid": "04458827-1dc1-44a5-8761-083b39f209ef",
            "formNamespace": "Bahmni",
            "formFieldPath": "Form2.3/1-0",
            "voided": false,
            "conceptUuid": "c44c3c37-3f10-11e4-adec-0800271c1b75",
            "concept": {
                "uuid": "c44c3c37-3f10-11e4-adec-0800271c1b75",
                "name": "Posture",
                "dataType": "Coded",
                "shortName": "Posture",
                "conceptClass": "Misc",
                "set": false
            },
            "groupMembers": [],
            "valueAsString": "Sitting",
            "unknown": false,
            "uuid": "3df2eb81-d69b-405e-b70f-76852f9f4747",
            "observationDateTime": "2017-01-30T05:54:22.000+0000",
            "conceptNameToDisplay": "Posture",
            "value": {
                "uuid": "c44cfed2-3f10-11e4-adec-0800271c1b75",
                "name": "Sitting",
                "dataType": "N/A",
                "shortName": "Sitting",
                "conceptClass": "Misc",
                "set": false
            }
        },
        {
            "encounterDateTime": 1485752954000,
            "groupMembers": [
                {
                    "encounterDateTime": 1485752954000,
                    "groupMembers": [],
                    "providers": [
                        {
                            "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                            "name": "Super Man",
                            "encounterRoleUuid": "a0b03050-c99b-11e0-9572-0800200c9a66"
                        }
                    ],
                    "isAbnormal": null,
                    "duration": null,
                    "type": "Numeric",
                    "encounterUuid": "04458827-1dc1-44a5-8761-083b39f209ef",
                    "obsGroupUuid": "a565686d-6228-4693-b8e2-4425684929ff",
                    "creatorName": "Super Man",
                    "conceptSortWeight": 2,
                    "parentConceptUuid": null,
                    "hiNormal": 72,
                    "lowNormal": 72,
                    "formNamespace": "Bahmni",
                    "formFieldPath": "Form2.3/2-0",
                    "voided": false,
                    "voidReason": null,
                    "conceptUuid": "c36bc411-3f10-11e4-adec-0800271c1b75",
                    "concept": {
                        "uuid": "c36bc411-3f10-11e4-adec-0800271c1b75",
                        "name": "Pulse",
                        "dataType": "Numeric",
                        "shortName": "Pulse",
                        "units": "/min",
                        "conceptClass": "Misc",
                        "hiNormal": 72,
                        "lowNormal": 72,
                        "set": false,
                        "mappings": []
                    },
                    "valueAsString": "72.0",
                    "unknown": false,
                    "uuid": "96a5e9bf-9187-4c71-afe1-1f8328a54c1e",
                    "observationDateTime": "2017-01-30T05:54:22.000+0000",
                    "comment": null,
                    "abnormal": null,
                    "orderUuid": null,
                    "conceptNameToDisplay": "Pulse",
                    "value": 72
                },
                {
                    "encounterDateTime": 1485752954000,
                    "visitStartDateTime": null,
                    "targetObsRelation": null,
                    "groupMembers": [],
                    "providers": [
                        {
                            "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                            "name": "Super Man",
                            "encounterRoleUuid": "a0b03050-c99b-11e0-9572-0800200c9a66"
                        }
                    ],
                    "isAbnormal": null,
                    "duration": null,
                    "type": "Boolean",
                    "encounterUuid": "04458827-1dc1-44a5-8761-083b39f209ef",
                    "obsGroupUuid": "a565686d-6228-4693-b8e2-4425684929ff",
                    "creatorName": "Super Man",
                    "conceptSortWeight": 3,
                    "parentConceptUuid": null,
                    "hiNormal": null,
                    "lowNormal": null,
                    "formNamespace": "Bahmni",
                    "formFieldPath": "Form2.3/3-0",
                    "voided": false,
                    "voidReason": null,
                    "conceptUuid": "c36c7c98-3f10-11e4-adec-0800271c1b75",
                    "concept": {
                        "uuid": "c36c7c98-3f10-11e4-adec-0800271c1b75",
                        "name": "Pulse Abnormal",
                        "dataType": "Boolean",
                        "shortName": "Pulse Abnormal",
                        "conceptClass": "Abnormal",
                        "hiNormal": null,
                        "lowNormal": null,
                        "set": false,
                        "mappings": []
                    },
                    "valueAsString": "No",
                    "unknown": false,
                    "uuid": "51753092-4437-44d2-8c29-5a71971bb494",
                    "observationDateTime": "2017-01-30T05:54:22.000+0000",
                    "comment": null,
                    "abnormal": null,
                    "orderUuid": null,
                    "conceptNameToDisplay": "Pulse Abnormal",
                    "value": false
                }
            ],
            "providers": [
                {
                    "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                    "name": "Super Man",
                    "encounterRoleUuid": "a0b03050-c99b-11e0-9572-0800200c9a66"
                }
            ],
            "isAbnormal": null,
            "encounterUuid": "04458827-1dc1-44a5-8761-083b39f209ef",
            "obsGroupUuid": null,
            "creatorName": "Super Man",
            "conceptSortWeight": 1,
            "formNamespace": "Bahmni",
            "formFieldPath": "Form2.3/2-0",
            "voided": false,
            "voidReason": null,
            "conceptUuid": "c36af094-3f10-11e4-adec-0800271c1b75",
            "concept": {
                "uuid": "c36af094-3f10-11e4-adec-0800271c1b75",
                "name": "Pulse Data",
                "dataType": "N/A",
                "shortName": "Pulse",
                "conceptClass": "Concept Details",
                "set": true
            },
            "valueAsString": "72.0, false",
            "unknown": false,
            "uuid": "a565686d-6228-4693-b8e2-4425684929ff",
            "observationDateTime": "2017-01-30T05:54:22.000+0000",
            "comment": null,
            "conceptNameToDisplay": "Pulse",
            "value": "72.0, false"
        },
        {
            "encounterDateTime": 1485752954000,
            "groupMembers": [
                {
                    "encounterDateTime": 1485752954000,
                    "groupMembers": [
                        {
                            "encounterDateTime": 1485752954000,
                            "groupMembers": [],
                            "isAbnormal": null,
                            "duration": null,
                            "type": "Boolean",
                            "encounterUuid": "04458827-1dc1-44a5-8761-083b39f209ef",
                            "obsGroupUuid": "abab8d0c-aa15-4bab-8115-7da739c9ffae",
                            "creatorName": "Super Man",
                            "conceptSortWeight": 3,
                            "formNamespace": null,
                            "formFieldPath": null,
                            "voided": false,
                            "voidReason": null,
                            "conceptUuid": "c36c7c98-3f10-11e4-adec-0800271c1b75",
                            "concept": {
                                "uuid": "c36c7c98-3f10-11e4-adec-0800271c1b75",
                                "name": "Pulse Abnormal",
                                "dataType": "Boolean",
                                "shortName": "Pulse Abnormal",
                                "conceptClass": "Abnormal",
                                "set": false,
                                "mappings": []
                            },
                            "valueAsString": "No",
                            "unknown": false,
                            "uuid": "90580551-d828-4180-9a1f-9c8cdc5b3d75",
                            "observationDateTime": "2017-01-30T06:14:32.000+0000",
                            "comment": null,
                            "abnormal": null,
                            "orderUuid": null,
                            "conceptNameToDisplay": "Pulse Abnormal",
                            "value": false
                        },
                        {
                            "encounterDateTime": 1485752954000,
                            "groupMembers": [],
                            "isAbnormal": null,
                            "duration": null,
                            "type": "Numeric",
                            "encounterUuid": "04458827-1dc1-44a5-8761-083b39f209ef",
                            "obsGroupUuid": "abab8d0c-aa15-4bab-8115-7da739c9ffae",
                            "creatorName": "Super Man",
                            "conceptSortWeight": 4,
                            "parentConceptUuid": null,
                            "hiNormal": 72,
                            "lowNormal": 72,
                            "formNamespace": null,
                            "formFieldPath": null,
                            "voided": false,
                            "voidReason": null,
                            "conceptUuid": "c36bc411-3f10-11e4-adec-0800271c1b75",
                            "concept": {
                                "uuid": "c36bc411-3f10-11e4-adec-0800271c1b75",
                                "name": "Pulse",
                                "dataType": "Numeric",
                                "shortName": "Pulse",
                                "units": "/min",
                                "conceptClass": "Misc",
                                "hiNormal": 72,
                                "lowNormal": 72,
                                "set": false,
                                "mappings": []
                            },
                            "valueAsString": "72.0",
                            "unknown": false,
                            "uuid": "946fc58e-4873-4054-a346-6521e853620b",
                            "observationDateTime": "2017-01-30T06:28:00.000+0000",
                            "comment": null,
                            "abnormal": null,
                            "orderUuid": null,
                            "conceptNameToDisplay": "Pulse",
                            "value": 72
                        }
                    ],
                    "isAbnormal": null,
                    "duration": null,
                    "type": null,
                    "encounterUuid": "04458827-1dc1-44a5-8761-083b39f209ef",
                    "obsGroupUuid": "248bb0f7-1d18-41e2-bb22-f09100b2e513",
                    "creatorName": "Super Man",
                    "formNamespace": "Bahmni",
                    "formFieldPath": null,
                    "voided": false,
                    "voidReason": null,
                    "conceptUuid": "c36af094-3f10-11e4-adec-0800271c1b75",
                    "concept": {
                        "uuid": "c36af094-3f10-11e4-adec-0800271c1b75",
                        "name": "Pulse Data",
                        "dataType": "N/A",
                        "shortName": "Pulse",
                        "conceptClass": "Concept Details",
                        "set": true
                    },
                    "valueAsString": "false, 72.0",
                    "unknown": false,
                    "uuid": "abab8d0c-aa15-4bab-8115-7da739c9ffae",
                    "observationDateTime": "2017-01-30T06:14:32.000+0000",
                    "comment": null,
                    "abnormal": null,
                    "orderUuid": null,
                    "conceptNameToDisplay": "Pulse",
                    "value": "false, 72.0"
                }
            ],
            "isAbnormal": null,
            "duration": null,
            "type": null,
            "encounterUuid": "04458827-1dc1-44a5-8761-083b39f209ef",
            "creatorName": "Super Man",
            "formNamespace": null,
            "formFieldPath": null,
            "voided": false,
            "voidReason": null,
            "conceptUuid": "c36a7537-3f10-11e4-adec-0800271c1b75",
            "concept": {
                "uuid": "c36a7537-3f10-11e4-adec-0800271c1b75",
                "name": "Vitals",
                "dataType": "N/A",
                "shortName": "Vitals",
                "conceptClass": "Misc",
                "set": true,
                "mappings": []
            },
            "valueAsString": "false, 72.0",
            "unknown": false,
            "uuid": "248bb0f7-1d18-41e2-bb22-f09100b2e513",
            "observationDateTime": "2017-01-30T06:14:32.000+0000",
            "comment": null,
            "abnormal": null,
            "orderUuid": null,
            "conceptNameToDisplay": "Vitals",
            "value": "false, 72.0"
        }
    ];

    beforeEach(function () {
        conceptSetUiConfigService = jasmine.createSpyObj('conceptSetUiConfigService', ['getConfig']);
        conceptSetUiConfigService.getConfig.and.returnValue({
        });
        conceptGroupFormatService = jasmine.createSpyObj('conceptGroupFormatService', ['isObsGroupFormatted', 'groupObs']);
        conceptGroupFormatService.isObsGroupFormatted.and.callFake((arg) => {
            if (arg === allObservations[2] || arg === allObservations[1]) {
                return true;
            } else {
                return false;
            }
        });
    });

    it("should not fail for empty set of observations", function () {
        var observations = [];
        var groupedObservationsArray = new Bahmni.Clinical.ObsGroupingHelper(conceptSetUiConfigService, conceptGroupFormatService).groupObservations(observations);
        expect(groupedObservationsArray.length).toBe(0);
    });

    it("should group observations with formFieldPath", function () {
        var observations = [
            allObservations[0],
            allObservations[1]
        ];
        var groupedObservationsArray = new Bahmni.Clinical.ObsGroupingHelper(conceptSetUiConfigService, conceptGroupFormatService).groupObservations(observations);
        expect(groupedObservationsArray.length).toBe(1);
        expect(groupedObservationsArray[0].conceptSetName).toBe('Form2');
        expect(groupedObservationsArray[0].groupMembers.length).toBe(2);
    });

    it("should group observations without formFieldPath", function () {
        var observations = [
            allObservations[2]
        ];
        var groupedObservationsArray = new Bahmni.Clinical.ObsGroupingHelper(conceptSetUiConfigService, conceptGroupFormatService).groupObservations(observations);
        expect(groupedObservationsArray.length).toBe(1);
        expect(groupedObservationsArray[0].conceptSetName).toBe('Vitals');
        expect(groupedObservationsArray[0].groupMembers.length).toBe(1);
    });

    it("should group observations with and without formFieldPath", function () {
        var observations = [
            allObservations[0],
            allObservations[1],
            allObservations[2]
        ];
        var groupedObservationsArray = new Bahmni.Clinical.ObsGroupingHelper(conceptSetUiConfigService, conceptGroupFormatService).groupObservations(observations);
        expect(groupedObservationsArray.length).toBe(2);

        expect(groupedObservationsArray[0].conceptSetName).toBe('Vitals');
        expect(groupedObservationsArray[0].groupMembers.length).toBe(1);

        expect(groupedObservationsArray[1].conceptSetName).toBe('Form2');
        expect(groupedObservationsArray[1].groupMembers.length).toBe(2);
    });
});
