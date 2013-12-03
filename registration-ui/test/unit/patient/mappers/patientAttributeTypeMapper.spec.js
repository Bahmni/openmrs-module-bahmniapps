'use strict';

describe('PatientAttributeTypeMapper', function () {

    beforeEach(function () {
        module('registration.patient.mappers');
    });

    it('should map values from the openmrs patientAttributeTypes to our patientConfig', function () {
        var mrspatientAttributeTypes = [
            {
                "uuid": "2a6e96f6-9d21-11e2-8137-0800271c1b75",
                "description": "Class description",
                "sortWeight": 3,
                "editPrivilege": null,
                "display": "class",
                "resourceVersion": "1.8",
                "retired": false,
                "searchable": true,
                "format": "org.openmrs.Concept",
                "concept": {
                    "uuid": "0a83758c-1481-11e3-937b-0800271c1b75",
                    "version": null,
                    "display": "Class",
                    "names": [
                        {
                            "display": "class",
                            "uuid": "0a837d7a-1481-11e3-937b-0800271c1b75",
                            "links": [
                                {
                                    "rel": "self",
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/0a83758c-1481-11e3-937b-0800271c1b75/name/0a837d7a-1481-11e3-937b-0800271c1b75"
                                }
                            ]
                        },
                        {
                            "display": "Class",
                            "uuid": "0a838306-1481-11e3-937b-0800271c1b75",
                            "links": [
                                {
                                    "rel": "self",
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/0a83758c-1481-11e3-937b-0800271c1b75/name/0a838306-1481-11e3-937b-0800271c1b75"
                                }
                            ]
                        }
                    ],
                    "conceptClass": {
                        "display": "Misc",
                        "uuid": "8d492774-c2cc-11de-8d13-0010c6dffd0f",
                        "links": [
                            {
                                "rel": "self",
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f"
                            }
                        ]
                    },
                    "descriptions": [],
                    "answers": [
                        {
                            "display": "OBC",
                            "uuid": "0a83bc2c-1481-11e3-937b-0800271c1b75",
                            "links": [
                                {
                                    "rel": "self",
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/0a83bc2c-1481-11e3-937b-0800271c1b75"
                                }
                            ]
                        },
                        {
                            "display": "General",
                            "uuid": "0a843350-1481-11e3-937b-0800271c1b75",
                            "links": [
                                {
                                    "rel": "self",
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/0a843350-1481-11e3-937b-0800271c1b75"
                                }
                            ]
                        }
                    ],
                    "resourceVersion": "1.9",
                    "retired": false,
                    "set": false,
                    "setMembers": [],
                    "links": [
                        {
                            "rel": "self",
                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/0a83758c-1481-11e3-937b-0800271c1b75"
                        },
                        {
                            "rel": "full",
                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/0a83758c-1481-11e3-937b-0800271c1b75?v=full"
                        }
                    ],
                    "datatype": {
                        "display": "Coded",
                        "uuid": "8d4a48b6-c2cc-11de-8d13-0010c6dffd0f",
                        "links": [
                            {
                                "rel": "self",
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/conceptdatatype/8d4a48b6-c2cc-11de-8d13-0010c6dffd0f"
                            }
                        ]
                    },
                    "mappings": [],
                    "name": {
                        "locale": "en",
                        "display": "Class",
                        "conceptNameType": "FULLY_SPECIFIED",
                        "uuid": "0a838306-1481-11e3-937b-0800271c1b75",
                        "links": [
                            {
                                "rel": "self",
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/0a83758c-1481-11e3-937b-0800271c1b75/name/0a838306-1481-11e3-937b-0800271c1b75"
                            },
                            {
                                "rel": "full",
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/0a83758c-1481-11e3-937b-0800271c1b75/name/0a838306-1481-11e3-937b-0800271c1b75?v=full"
                            }
                        ],
                        "resourceVersion": "1.9",
                        "localePreferred": true,
                        "name": "Class"
                    }
                },
                "auditInfo": {
                    "dateCreated": "2013-04-04T00:00:00.000+0530",
                    "dateChanged": null,
                    "changedBy": null,
                    "creator": {
                        "display": "admin",
                        "uuid": "a54dad82-9d1a-11e2-8137-0800271c1b75",
                        "links": [
                            {
                                "rel": "self",
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/user/a54dad82-9d1a-11e2-8137-0800271c1b75"
                            }
                        ]
                    }
                },
                "links": [
                    {
                        "rel": "self",
                        "uri": "NEED-TO-CONFIGURE/ws/rest/v1/personattributetype/2a6e96f6-9d21-11e2-8137-0800271c1b75"
                    }
                ],
                "foreignKey": 9,
                "name": "class"
            }
        ];

        var patientConfigs = new PatientAttributeTypeMapper().mapFromOpenmrsPatientAttributeTypes(mrspatientAttributeTypes);

        expect(patientConfigs).toEqual({ personAttributeTypes: [
            {
                uuid: "2a6e96f6-9d21-11e2-8137-0800271c1b75",
                sortWeight: 3,
                name: "class",
                description: "Class description",
                format: "org.openmrs.Concept",
                answers: [
                    {
                        description: "OBC",
                        conceptId: "0a83bc2c-1481-11e3-937b-0800271c1b75"
                    },
                    {
                        description: "General",
                        conceptId: "0a843350-1481-11e3-937b-0800271c1b75"
                    }
                ]
            }
        ]});
    });
});
