import axios from "axios";
import { GET_ALL_FORMS_BASE_URL } from "../../constants";
import { build } from "./BuildFormView.js";

jest.mock("axios");

const mockObservations = [
    {
        "value": [
            {
                "groupMembers": [
                    {
                        "encounterDateTime": 1715751334000,
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
                        "type": "Numeric",
                        "encounterUuid": "d67b9394-5d21-4ed5-83dd-0ea63dace91b",
                        "obsGroupUuid": null,
                        "creatorName": "Super Man",
                        "conceptSortWeight": 1,
                        "parentConceptUuid": null,
                        "hiNormal": 72,
                        "lowNormal": 72,
                        "formNamespace": "Bahmni",
                        "formFieldPath": "Vitals_Form2.1/1-0",
                        "interpretation": null,
                        "status": "FINAL",
                        "encounterTypeName": null,
                        "conceptFSN": null,
                        "complexData": null,
                        "abnormal": null,
                        "orderUuid": null,
                        "unknown": false,
                        "observationDateTime": 1715751334000,
                        "conceptNameToDisplay": "Pulse",
                        "valueAsString": "72.0",
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
                        "voided": false,
                        "voidReason": null,
                        "conceptUuid": "c36bc411-3f10-11e4-adec-0800271c1b75",
                        "uuid": "25436727-d709-4a62-ba19-8d8b505bd5ce",
                        "comment": null,
                        "value": 72
                    },
                    {
                        "encounterDateTime": 1715751334000,
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
                        "type": "Numeric",
                        "encounterUuid": "d67b9394-5d21-4ed5-83dd-0ea63dace91b",
                        "obsGroupUuid": null,
                        "creatorName": "Super Man",
                        "conceptSortWeight": 1,
                        "parentConceptUuid": null,
                        "hiNormal": null,
                        "lowNormal": 97,
                        "formNamespace": "Bahmni",
                        "formFieldPath": "Vitals_Form2.1/2-0",
                        "interpretation": null,
                        "status": "FINAL",
                        "encounterTypeName": null,
                        "conceptFSN": null,
                        "complexData": null,
                        "abnormal": null,
                        "orderUuid": null,
                        "unknown": false,
                        "observationDateTime": 1715751334000,
                        "conceptNameToDisplay": "SPO2",
                        "valueAsString": "98.0",
                        "concept": {
                            "uuid": "c3838414-3f10-11e4-adec-0800271c1b75",
                            "name": "SPO2",
                            "dataType": "Numeric",
                            "shortName": "SPO2",
                            "units": "%",
                            "conceptClass": "Misc",
                            "hiNormal": null,
                            "lowNormal": 97,
                            "set": false,
                            "mappings": []
                        },
                        "voided": false,
                        "voidReason": null,
                        "conceptUuid": "c3838414-3f10-11e4-adec-0800271c1b75",
                        "uuid": "48034746-82f1-47b8-aae1-a3ea2c954032",
                        "comment": null,
                        "value": 98
                    },
                    {
                        "encounterDateTime": 1715751334000,
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
                        "type": "Numeric",
                        "encounterUuid": "d67b9394-5d21-4ed5-83dd-0ea63dace91b",
                        "obsGroupUuid": null,
                        "creatorName": "Super Man",
                        "conceptSortWeight": 1,
                        "parentConceptUuid": null,
                        "hiNormal": 20,
                        "lowNormal": 16,
                        "formNamespace": "Bahmni",
                        "formFieldPath": "Vitals_Form2.1/4-0",
                        "interpretation": null,
                        "status": "FINAL",
                        "encounterTypeName": null,
                        "conceptFSN": null,
                        "complexData": null,
                        "abnormal": null,
                        "orderUuid": null,
                        "unknown": false,
                        "observationDateTime": 1715751334000,
                        "conceptNameToDisplay": "RR",
                        "valueAsString": "18.0",
                        "concept": {
                            "uuid": "c37e0f37-3f10-11e4-adec-0800271c1b75",
                            "name": "RR",
                            "dataType": "Numeric",
                            "shortName": "RR",
                            "units": "/min",
                            "conceptClass": "Misc",
                            "hiNormal": 20,
                            "lowNormal": 16,
                            "set": false,
                            "mappings": []
                        },
                        "voided": false,
                        "voidReason": null,
                        "conceptUuid": "c37e0f37-3f10-11e4-adec-0800271c1b75",
                        "uuid": "95615b5d-80f2-4bdd-b609-42e6eec22b09",
                        "comment": null,
                        "value": 18
                    },
                    {
                        "encounterDateTime": 1715751334000,
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
                        "type": "Numeric",
                        "encounterUuid": "d67b9394-5d21-4ed5-83dd-0ea63dace91b",
                        "obsGroupUuid": null,
                        "creatorName": "Super Man",
                        "conceptSortWeight": 1,
                        "parentConceptUuid": null,
                        "hiNormal": 98.6,
                        "lowNormal": 98.6,
                        "formNamespace": "Bahmni",
                        "formFieldPath": "Vitals_Form2.1/3-0",
                        "interpretation": "ABNORMAL",
                        "status": "FINAL",
                        "encounterTypeName": null,
                        "conceptFSN": null,
                        "complexData": null,
                        "abnormal": null,
                        "orderUuid": null,
                        "unknown": false,
                        "observationDateTime": 1715751334000,
                        "conceptNameToDisplay": "Temperature",
                        "valueAsString": "98.0",
                        "concept": {
                            "uuid": "c37bd733-3f10-11e4-adec-0800271c1b75",
                            "name": "Temperature",
                            "dataType": "Numeric",
                            "shortName": "Temperature",
                            "units": "F",
                            "conceptClass": "Misc",
                            "hiNormal": 98.6,
                            "lowNormal": 98.6,
                            "set": false,
                            "mappings": []
                        },
                        "voided": false,
                        "voidReason": null,
                        "conceptUuid": "c37bd733-3f10-11e4-adec-0800271c1b75",
                        "uuid": "6b9214d3-03af-4411-9f74-656429eff100",
                        "comment": null,
                        "value": 98
                    }
                ],
                "concept": {
                    "shortName": "Vitals_Form2",
                    "conceptClass": null
                },
                "encounterUuid": "d67b9394-5d21-4ed5-83dd-0ea63dace91b"
            }
        ]
    }
]

describe('build function', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch all forms and update observations when hasNoHierarchy is false', async () => {
        axios.get.mockResolvedValueOnce({ status: 200, data: [] });
        await build(mockObservations, false);
        expect(axios.get).toHaveBeenCalledWith(GET_ALL_FORMS_BASE_URL, { params: { v: "custom:(version,name,uuid)" } });
    });

    // it('should update observations without fetching forms when hasNoHierarchy is true', async () => {
    //     await build(mockObservations, true);
    //     expect(axios.get).not.toHaveBeenCalled();
    // });

});






