'use strict';

describe('AttributeTypeMapper', function () {
    
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
                            ],
                            name: {
                                display: "OBC",
                                conceptNameType: "FULLY_SPECIFIED"
                            },
                            names: [
                                {
                                    display: "OBC"
                                },
                                {
                                    display: "OBC"
                                }
                            ]
                        },
                        {
                            "display": "General",
                            "uuid": "0a843350-1481-11e3-937b-0800271c1b75",
                            name: {
                                display: "General",
                                conceptNameType: "FULLY_SPECIFIED"
                            },
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

        var mandatoryPersonAttributes = ["class"];

        var patientConfigs = new Bahmni.Common.Domain.AttributeTypeMapper().mapFromOpenmrsAttributeTypes(mrspatientAttributeTypes, mandatoryPersonAttributes);
        expect(patientConfigs.attributeTypes.length).toBe(1);
        expect(patientConfigs.attributeTypes[0]).toEqual(jasmine.objectContaining({
            uuid: "2a6e96f6-9d21-11e2-8137-0800271c1b75",
            sortWeight: 3,
            name: "class",
            description: "Class description",
            format: "org.openmrs.Concept",
            answers: [
                {
                    fullySpecifiedName: "OBC",
                    description: "OBC",
                    conceptId: "0a83bc2c-1481-11e3-937b-0800271c1b75"
                },
                {
                    fullySpecifiedName: "General",
                    description: "General",
                    conceptId: "0a843350-1481-11e3-937b-0800271c1b75"
                }
            ],
            required: true
        }));
    });

    it('should map name, datatypeClassname if description, format not there for attributeTypes', function () {
        var mrsAttributeTypes= [
            {
                "uuid" : "uuid2",
                "name" : "Sample regex attribute",
                "datatypeClassname" : "org.openmrs.customdatatype.datatype.RegexValidatedTextDatatype",
                "datatypeConfig" : "[0-9]*"
            }
        ];
        var mappedAttributeTypes = new Bahmni.Common.Domain.AttributeTypeMapper().mapFromOpenmrsAttributeTypes(mrsAttributeTypes, {});
        expect(mappedAttributeTypes.attributeTypes[0].pattern).toBe("[0-9]*");
        expect(mappedAttributeTypes.attributeTypes[0].format).toBe("org.openmrs.customdatatype.datatype.RegexValidatedTextDatatype");
        expect(mappedAttributeTypes.attributeTypes[0].description).toBe("Sample regex attribute");
        expect(mappedAttributeTypes.attributeTypes[0].excludeFrom.length).toBe(0);
    });

    it('should map dataType Config to pattern for RegexValidatedTextDatatype attributeTypes', function () {
        var mrsAttributeTypes= [
           {
               "uuid" : "uuid2",
               "description" : "Sample regex attribute",
               "name" : "Sample regex attribute",
               "format" : "org.openmrs.customdatatype.datatype.RegexValidatedTextDatatype",
               "datatypeConfig" : "[0-9]*"
           }
        ];
        var mappedAttributeTypes = new Bahmni.Common.Domain.AttributeTypeMapper().mapFromOpenmrsAttributeTypes(mrsAttributeTypes, {});
        expect(mappedAttributeTypes.attributeTypes[0].pattern).toBe("[0-9]*");
    });

    it('should map excludeFrom from config to attributeType', function () {
        var mrsAttributeTypes= [
            {
                "uuid" : "uuid2",
                "name" : "Sample regex attribute",
                "datatypeClassname" : "org.openmrs.customdatatype.datatype.RegexValidatedTextDatatype",
                "datatypeConfig" : "[0-9]*"
            },
            {
                "uuid" : "uuid9",
                "name" : "Age",
                "datatypeClassname" : "Number"
            }
        ];

        var attributeConfig = {
            "Sample regex attribute": { required: true, excludeFrom: ["Some Program"]},
            "Age": { required: true }
        };

        var mappedAttributeTypes = new Bahmni.Common.Domain.AttributeTypeMapper().mapFromOpenmrsAttributeTypes(mrsAttributeTypes, {}, attributeConfig);
        expect(mappedAttributeTypes.attributeTypes[0].excludeFrom.length).toBe(1);
        expect(mappedAttributeTypes.attributeTypes[0].excludeFrom[0]).toBe("Some Program");
        expect(mappedAttributeTypes.attributeTypes[1].excludeFrom.length).toBe(0);
    });

    it('should map correct locale specific name to be displayed', function () {
        var mrspatientAttributeTypes = [
            {
                "uuid": "c1f4a004-3f10-11e4-adec-0800271c1b75",
                "name": "education",
                "sortWeight": 6.0,
                "description": "Education Details",
                "format": "org.openmrs.Concept",
                "concept": {
                    "uuid": "c2084e7b-3f10-11e4-adec-0800271c1b75",
                    "display": "Education Details",
                    "name": {
                        "display": "Education Details",
                        "uuid": "c2085653-3f10-11e4-adec-0800271c1b75",
                        "name": "Education Details",
                        "locale": "en",
                        "localePreferred": true,
                        "conceptNameType": "FULLY_SPECIFIED",
                        "links": [
                            {
                                "rel": "self",
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c2084e7b-3f10-11e4-adec-0800271c1b75/name/c2085653-3f10-11e4-adec-0800271c1b75"
                            },
                            {
                                "rel": "full",
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c2084e7b-3f10-11e4-adec-0800271c1b75/name/c2085653-3f10-11e4-adec-0800271c1b75?v=full"
                            }
                        ],
                        "resourceVersion": "1.9"
                    },
                    "datatype": {
                        "uuid": "8d4a48b6-c2cc-11de-8d13-0010c6dffd0f",
                        "display": "Coded",
                        "name": "Coded",
                        "description": "Value determined by term dictionary lookup (i.e., term identifier)",
                        "hl7Abbreviation": "CWE",
                        "retired": false,
                        "links": [
                            {
                                "rel": "self",
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/conceptdatatype/8d4a48b6-c2cc-11de-8d13-0010c6dffd0f"
                            },
                            {
                                "rel": "full",
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/conceptdatatype/8d4a48b6-c2cc-11de-8d13-0010c6dffd0f?v=full"
                            }
                        ],
                        "resourceVersion": "1.8"
                    },
                    "conceptClass": {
                        "uuid": "8d492774-c2cc-11de-8d13-0010c6dffd0f",
                        "display": "Misc",
                        "name": "Misc",
                        "description": "Terms which don't fit other categories",
                        "retired": false,
                        "links": [
                            {
                                "rel": "self",
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f"
                            },
                            {
                                "rel": "full",
                                "uri": "NEED-TO-CONFIGURE/ws/rest/v1/conceptclass/8d492774-c2cc-11de-8d13-0010c6dffd0f?v=full"
                            }
                        ],
                        "resourceVersion": "1.8"
                    },
                    "set": false,
                    "version": null,
                    "retired": false,
                    "names": [
                        {
                            "display": "education",
                            "uuid": "c208531b-3f10-11e4-adec-0800271c1b75",
                            "name": "education",
                            "locale": "en",
                            "localePreferred": false,
                            "conceptNameType": "SHORT",
                            "links": [
                                {
                                    "rel": "self",
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c2084e7b-3f10-11e4-adec-0800271c1b75/name/c208531b-3f10-11e4-adec-0800271c1b75"
                                },
                                {
                                    "rel": "full",
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c2084e7b-3f10-11e4-adec-0800271c1b75/name/c208531b-3f10-11e4-adec-0800271c1b75?v=full"
                                }
                            ],
                            "resourceVersion": "1.9"
                        },
                        {
                            "display": "Education Details",
                            "uuid": "c2085653-3f10-11e4-adec-0800271c1b75",
                            "name": "Education Details",
                            "locale": "en",
                            "localePreferred": true,
                            "conceptNameType": "FULLY_SPECIFIED",
                            "links": [
                                {
                                    "rel": "self",
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c2084e7b-3f10-11e4-adec-0800271c1b75/name/c2085653-3f10-11e4-adec-0800271c1b75"
                                },
                                {
                                    "rel": "full",
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c2084e7b-3f10-11e4-adec-0800271c1b75/name/c2085653-3f10-11e4-adec-0800271c1b75?v=full"
                                }
                            ],
                            "resourceVersion": "1.9"
                        }
                    ],
                    "descriptions": [],
                    "mappings": [],
                    "answers": [
                        {
                            "uuid": "c2107f30-3f10-11e4-adec-0800271c1b75",
                            "name": {
                                "display": "Uneducated",
                                "uuid": "c21087ca-3f10-11e4-adec-0800271c1b75",
                                "name": "Uneducated",
                                "locale": "en",
                                "localePreferred": true,
                                "conceptNameType": "FULLY_SPECIFIED",
                                "links": [
                                    {
                                        "rel": "self",
                                        "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c2107f30-3f10-11e4-adec-0800271c1b75/name/c21087ca-3f10-11e4-adec-0800271c1b75"
                                    },
                                    {
                                        "rel": "full",
                                        "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c2107f30-3f10-11e4-adec-0800271c1b75/name/c21087ca-3f10-11e4-adec-0800271c1b75?v=full"
                                    }
                                ],
                                "resourceVersion": "1.9"
                            },
                            "names": [
                                {
                                    "display": "Uneducated fr fsn",
                                    "uuid": "9e57a5b1-b7ac-450c-bdb2-53bcc16d2d33",
                                    "name": "Uneducated fr fsn",
                                    "locale": "fr",
                                    "localePreferred": true,
                                    "conceptNameType": "FULLY_SPECIFIED",
                                    "links": [
                                        {
                                            "rel": "self",
                                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c2107f30-3f10-11e4-adec-0800271c1b75/name/9e57a5b1-b7ac-450c-bdb2-53bcc16d2d33"
                                        },
                                        {
                                            "rel": "full",
                                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c2107f30-3f10-11e4-adec-0800271c1b75/name/9e57a5b1-b7ac-450c-bdb2-53bcc16d2d33?v=full"
                                        }
                                    ],
                                    "resourceVersion": "1.9"
                                },
                                {
                                    "display": "Uneducated fr sn",
                                    "uuid": "c2108410-3f10-11e4-adec-0800271c1b75",
                                    "name": "Uneducated fr sn",
                                    "locale": "fr",
                                    "localePreferred": false,
                                    "conceptNameType": "SHORT",
                                    "links": [
                                        {
                                            "rel": "self",
                                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c2107f30-3f10-11e4-adec-0800271c1b75/name/c2108410-3f10-11e4-adec-0800271c1b75"
                                        },
                                        {
                                            "rel": "full",
                                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c2107f30-3f10-11e4-adec-0800271c1b75/name/c2108410-3f10-11e4-adec-0800271c1b75?v=full"
                                        }
                                    ],
                                    "resourceVersion": "1.9"
                                },
                                {
                                    "display": "Uneducated",
                                    "uuid": "c21087ca-3f10-11e4-adec-0800271c1b75",
                                    "name": "Uneducated",
                                    "locale": "en",
                                    "localePreferred": true,
                                    "conceptNameType": "FULLY_SPECIFIED",
                                    "links": [
                                        {
                                            "rel": "self",
                                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c2107f30-3f10-11e4-adec-0800271c1b75/name/c21087ca-3f10-11e4-adec-0800271c1b75"
                                        },
                                        {
                                            "rel": "full",
                                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c2107f30-3f10-11e4-adec-0800271c1b75/name/c21087ca-3f10-11e4-adec-0800271c1b75?v=full"
                                        }
                                    ],
                                    "resourceVersion": "1.9"
                                }
                            ],
                            "displayString": "Uneducated",
                            "resourceVersion": "2.0"
                        },
                        {
                            "uuid": "c211442b-3f10-11e4-adec-0800271c1b75",
                            "name": {
                                "display": "5th Pass and Below",
                                "uuid": "c2114b67-3f10-11e4-adec-0800271c1b75",
                                "name": "5th Pass and Below",
                                "locale": "en",
                                "localePreferred": true,
                                "conceptNameType": "FULLY_SPECIFIED",
                                "links": [
                                    {
                                        "rel": "self",
                                        "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c211442b-3f10-11e4-adec-0800271c1b75/name/c2114b67-3f10-11e4-adec-0800271c1b75"
                                    },
                                    {
                                        "rel": "full",
                                        "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c211442b-3f10-11e4-adec-0800271c1b75/name/c2114b67-3f10-11e4-adec-0800271c1b75?v=full"
                                    }
                                ],
                                "resourceVersion": "1.9"
                            },
                            "names": [
                                {
                                    "display": "5th Pass and Below en fsn",
                                    "uuid": "c2114b67-3f10-11e4-adec-0800271c1b75",
                                    "name": "5th Pass and Below en fsn",
                                    "locale": "en",
                                    "localePreferred": true,
                                    "conceptNameType": "FULLY_SPECIFIED",
                                    "links": [
                                        {
                                            "rel": "self",
                                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c211442b-3f10-11e4-adec-0800271c1b75/name/c2114b67-3f10-11e4-adec-0800271c1b75"
                                        },
                                        {
                                            "rel": "full",
                                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c211442b-3f10-11e4-adec-0800271c1b75/name/c2114b67-3f10-11e4-adec-0800271c1b75?v=full"
                                        }
                                    ],
                                    "resourceVersion": "1.9"
                                },
                                {
                                    "display": "5th Pass and Below en sn",
                                    "uuid": "c2114827-3f10-11e4-adec-0800271c1b75",
                                    "name": "5th Pass and Below en sn",
                                    "locale": "en",
                                    "localePreferred": false,
                                    "conceptNameType": "SHORT",
                                    "links": [
                                        {
                                            "rel": "self",
                                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c211442b-3f10-11e4-adec-0800271c1b75/name/c2114827-3f10-11e4-adec-0800271c1b75"
                                        },
                                        {
                                            "rel": "full",
                                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c211442b-3f10-11e4-adec-0800271c1b75/name/c2114827-3f10-11e4-adec-0800271c1b75?v=full"
                                        }
                                    ],
                                    "resourceVersion": "1.9"
                                }
                            ],
                            "displayString": "5th Pass and Below",
                            "resourceVersion": "2.0"
                        }
                    ],
                    "setMembers": [],
                    "auditInfo": {
                        "creator": {
                            "uuid": "62a3b753-3f10-11e4-adec-0800271c1b75",
                            "display": "admin",
                            "links": [
                                {
                                    "rel": "self",
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/user/62a3b753-3f10-11e4-adec-0800271c1b75"
                                }
                            ]
                        },
                        "dateCreated": "2014-09-18T14:19:53.000+0530",
                        "changedBy": {
                            "uuid": "62a3b753-3f10-11e4-adec-0800271c1b75",
                            "display": "admin",
                            "links": [
                                {
                                    "rel": "self",
                                    "uri": "NEED-TO-CONFIGURE/ws/rest/v1/user/62a3b753-3f10-11e4-adec-0800271c1b75"
                                }
                            ]
                        },
                        "dateChanged": "2014-09-18T14:19:53.000+0530"
                    },
                    "links": [
                        {
                            "rel": "self",
                            "uri": "NEED-TO-CONFIGURE/ws/rest/v1/concept/c2084e7b-3f10-11e4-adec-0800271c1b75"
                        }
                    ],
                    "resourceVersion": "2.0"
                }
            }
        ];

        var mandatoryPersonAttributes = ["education"];

        var patientConfigs = new Bahmni.Common.Domain.AttributeTypeMapper().mapFromOpenmrsAttributeTypes(mrspatientAttributeTypes, mandatoryPersonAttributes, undefined, 'en');
        expect(patientConfigs.attributeTypes.length).toBe(1);
        var educationAttributeType = patientConfigs.attributeTypes[0];
        expect(educationAttributeType.answers.length).toBe(2);
        expect(educationAttributeType.answers).toEqual(jasmine.objectContaining([
            {
                fullySpecifiedName: "Uneducated",
                description: "Uneducated",
                conceptId: "c2107f30-3f10-11e4-adec-0800271c1b75"
            },
            {
                fullySpecifiedName: "5th Pass and Below en fsn",
                description: "5th Pass and Below en sn",
                conceptId: "c211442b-3f10-11e4-adec-0800271c1b75"
            }
        ]));

        patientConfigs = new Bahmni.Common.Domain.AttributeTypeMapper().mapFromOpenmrsAttributeTypes(mrspatientAttributeTypes, mandatoryPersonAttributes, undefined, 'fr');
        expect(patientConfigs.attributeTypes.length).toBe(1);
        educationAttributeType = patientConfigs.attributeTypes[0];
        expect(educationAttributeType.answers.length).toBe(2);
        expect(educationAttributeType.answers).toEqual(jasmine.objectContaining([
            {
                fullySpecifiedName: "Uneducated fr fsn",
                description: "Uneducated fr sn",
                conceptId: "c2107f30-3f10-11e4-adec-0800271c1b75"
            },
            {
                fullySpecifiedName: "5th Pass and Below",
                description: "5th Pass and Below",
                conceptId: "c211442b-3f10-11e4-adec-0800271c1b75"
            }
        ]));
    });

});
