var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.Offline = Bahmni.Common.Offline || {};

Bahmni.Common.Offline.SchemaDefinitions = {
    AddressHierarchyLevel: {
        tableName: 'address_hierarchy_level',
        columns: [
            {
                name: 'addressHierarchyLevelId',
                type: 'INTEGER'
            }, {
                name: 'name',
                type: 'STRING'
            }, {
                name: 'parentLevelId',
                type: 'INTEGER'
            }, {
                name: 'addressField',
                type: 'STRING'
            }, {
                name: 'uuid',
                type: 'STRING'
            }, {
                name: 'required',
                type: 'INTEGER'
            }
        ],
        nullableColumns: ['name', 'parentLevelId', 'addressField'],
        primaryKeyColumns: ['uuid']
    },

    AddressHierarchyEntry: {
        tableName: 'address_hierarchy_entry',
        columns: [
            {
                name: 'id',
                type: 'INTEGER'
            },{
                name: 'name',
                type: 'STRING'
            }, {
                name: 'levelId',
                type: 'INTEGER'
            }, {
                name: 'parentId',
                type: 'INTEGER'
            }, {
                name: 'userGeneratedId',
                type: 'STRING'
            }, {
                name: 'uuid',
                type: 'STRING'
            }
        ],
        nullableColumns: ['name', 'parentId', 'userGeneratedId'],
        primaryKeyColumns: ['uuid']
    },
    Concept: {
        tableName: 'concept',
        columns: [
            {
                name: 'data',
                type: 'STRING'
            }, {
                name: 'uuid',
                type: 'STRING'
            }, {
                name: 'name',
                type: 'STRING'
            }, {
                name: 'parents',
                type: 'OBJECT'
            }
        ],
        nullableColumns: [],
        primaryKeyColumns: ['uuid']
    },

    EventLogMarker: {
        tableName: 'event_log_marker',
        columns: [
            {
                name: 'markerName',
                type: 'STRING'
            },
            {
                name: 'lastReadEventUuid',
                type: 'STRING'
            }, {
                name: 'catchmentNumber',
                type: 'STRING'
            }, {
                name: 'lastReadTime',
                type: 'DATE_TIME'
            }
        ],
        nullableColumns: ['catchmentNumber'],
        primaryKeyColumns: ['markerName']
    },

    PatientAttributeType: {
        tableName: 'patient_attribute_type',
        columns: [
            {
                name: 'attributeTypeId',
                type: 'INTEGER'
            }, {
                name: 'attributeName',
                type: 'STRING'
            }, {
                name: 'format',
                type: 'STRING'
            }, {
                name: 'uuid',
                type: 'STRING'
            }
        ],
        nullableColumns: ['format'],
        primaryKeyColumns: ['uuid']
    },

    PatientAttribute: {
        tableName: 'patient_attribute',
        columns: [
            {
                name: 'attributeTypeId',
                type: 'INTEGER'
            }, {
                name: 'attributeValue',
                type: 'STRING'
            }, {
                name: 'patientUuid',
                type: 'STRING'
            }, {
                name: 'uuid',
                type: 'STRING'
            }
        ],
        nullableColumns: [],
        primaryKeyColumns: ['uuid']
    },

    Patient: {
        tableName: 'patient',
        columns: [
            {
                name: 'identifier',
                type: 'STRING'
            }, {
                name: 'givenName',
                type: 'STRING'
            }, {
                name: 'middleName',
                type: 'STRING'
            }, {
                name: 'familyName',
                type: 'STRING'
            }, {
                name: 'gender',
                type: 'STRING'
            }, {
                name: 'birthdate',
                type: 'DATE_TIME'
            }, {
                name: 'dateCreated',
                type: 'DATE_TIME'
            }, {
                name: 'patientJson',
                type: 'OBJECT'
            }, {
                name: 'uuid',
                type: 'STRING'
            }
        ],
        nullableColumns: ['gender', 'birthdate', 'givenName', 'middleName', 'familyName','identifier'],
        primaryKeyColumns: ['uuid'],
        indexes: [
            {
                indexName: 'givenNameIndex',
                columnNames: ['givenName']
            }, {
                indexName: 'middleNameIndex',
                columnNames: ['middleName']
            }, {
                indexName: 'familyNameIndex',
                columnNames: ['familyName']
            }, {
                indexName: 'identifierIndex',
                columnNames: ['identifier']
            }
        ]
    },
    PatientAddress: {
        tableName: 'patient_address',
        columns: [
            {
                name: 'address1',
                type: 'STRING'
            }, {
                name: 'address2',
                type: 'STRING'
            }, {
                name: 'cityVillage',
                type: 'STRING'
            }, {
                name: 'stateProvince',
                type: 'STRING'
            }, {
                name: 'postalCode',
                type: 'STRING'
            }, {
                name: 'country',
                type: 'STRING'
            }, {
                name: 'countyDistrict',
                type: 'STRING'
            }, {
                name: 'address3',
                type: 'STRING'
            }, {
                name: 'address4',
                type: 'STRING'
            }, {
                name: 'address5',
                type: 'STRING'
            }, {
                name: 'address6',
                type: 'STRING'
            }, {
                name: 'patientUuid',
                type: 'STRING'
            }
        ],
        nullableColumns: ['address1', 'address2', 'cityVillage', 'stateProvince', 'postalCode', 'country', 'countyDistrict', 'address3', 'address4', 'address5', 'address6'],
        primaryKeyColumns: ['patientUuid']
    },
    Configs: {
        tableName: 'configs',
        columns: [
            {
                name: 'key',
                type: 'STRING'
            }, {
                name: 'value',
                type: 'STRING'
            }, {
                name: 'etag',
                type: 'STRING'
            }
        ],
        nullableColumns: ['etag'],
        primaryKeyColumns: ['key']
    },
    ReferenceData: {
        tableName: 'reference_data',
        columns: [
            {
                name: 'key',
                type: 'STRING'
            }, {
                name: 'data',
                type: 'STRING'
            },{
                name: 'etag',
                type: 'STRING'
            }
        ],
        nullableColumns: ['etag'],
        primaryKeyColumns: ['key']
    },
    LoginLocations: {
        tableName: 'login_locations',
        columns: [
            {
                name: 'uuid',
                type: 'STRING'
            }, {
                name: 'value',
                type: 'STRING'
            }
        ],
        nullableColumns: [],
        primaryKeyColumns: ['uuid']
    },
    Visit: {
        tableName: 'visit',
        columns: [
            {
                name: 'uuid',
                type: 'STRING'
            },
            {
                name: 'patientUuid',
                type: 'STRING'
            },
            {
                name: 'startDatetime',
                type: 'DATE_TIME'
            },
            {
                name: 'visitJson',
                type: 'OBJECT'
            }
        ],
        nullableColumns: [],
        primaryKeyColumns: ['uuid']
    },
    Encounter: {
        tableName: 'encounter',
        columns: [
            {
                name: 'uuid',
                type: 'STRING'
            },
            {
                name: 'patientUuid',
                type: 'STRING'
            },
            {
                name: 'encounterDateTime',
                type: 'DATE_TIME'
            },
            {
                name: 'encounterType',
                type: 'STRING'
            },
            {
                name: 'providerUuid',
                type: 'STRING'
            },
            {
                name: 'visitUuid',
                type: 'STRING'
            },
            {
                name: 'encounterJson',
                type: 'OBJECT'
            }
        ],
        nullableColumns: ['visitUuid'],
        primaryKeyColumns: ['uuid']
    },
    Observation: {
        tableName: 'observation',
        columns: [
            {
                name: 'uuid',
                type: 'STRING'
            },
            {
                name: 'encounterUuid',
                type: 'STRING'
            },
            {
                name: 'visitUuid',
                type: 'STRING'
            },
            {
                name: 'patientUuid',
                type: 'STRING'
            },
            {
                name: 'conceptName',
                type: 'STRING'
            },
            {
                name: 'observationJson',
                type: 'OBJECT'
            }
        ],
        nullableColumns: ['visitUuid'],
        primaryKeyColumns: ['uuid']
    },
    ErrorLog: {
        tableName: 'error_log',
        columns: [
             {
                name: 'failedRequestUrl',
                type: 'STRING'
            }, {
                name: 'logDateTime',
                type: 'DATE_TIME'
            }, {
                name: 'responseStatus',
                type: 'INTEGER'
            }, {
                name: 'stackTrace',
                type: 'STRING'
            }, {
                name: 'requestPayload',
                type: 'STRING'
            }, {
                name: 'provider',
                type: 'OBJECT'
            }
        ],
        nullableColumns: ['responseStatus'],
        primaryKeyColumns: ['failedRequestUrl', 'requestPayload']
    }
};
