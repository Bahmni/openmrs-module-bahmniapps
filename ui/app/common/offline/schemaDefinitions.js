var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.Offline = Bahmni.Common.Offline || {};

Bahmni.Common.Offline.SchemaDefinitions = {
    AddressHierarchyLevel: {
        tableName: 'address_hierarchy_level',
        columns: [
            {
                name: 'address_hierarchy_level_id',
                type: 'INTEGER'
            }, {
                name: 'name',
                type: 'STRING'
            }, {
                name: 'parent_level_id',
                type: 'INTEGER'
            }, {
                name: 'address_field',
                type: 'STRING'
            }, {
                name: 'uuid',
                type: 'STRING'
            }, {
                name: 'required',
                type: 'INTEGER'
            }
        ],
        nullableColumns: ['name', 'parent_level_id', 'address_field'],
        primaryKeyColumns: ['uuid']
    },

    AddressHierarchyEntry: {
        tableName: 'address_hierarchy_entry',
        columns: [
            {
                name: 'name',
                type: 'STRING'
            }, {
                name: 'level_id',
                type: 'INTEGER'
            }, {
                name: 'parent_id',
                type: 'INTEGER'
            }, {
                name: 'user_generated_id',
                type: 'STRING'
            }, {
                name: 'uuid',
                type: 'STRING'
            }
        ],
        nullableColumns: ['name', 'parent_id', 'user_generated_id'],
        primaryKeyColumns: ['uuid']
    },

    EventLogMarker: {
        tableName: 'event_log_marker',
        columns: [
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
        nullableColumns: [],
        primaryKeyColumns: ['catchmentNumber']
    },

    Idgen: {
        tableName: 'idgen',
        columns: [
            {
                name: 'identifier',
                type: 'INTEGER'
            }
        ],
        nullableColumns: [],
        primaryKeyColumns: ['identifier']
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
                type: 'INTEGER'
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
                name: 'relationships',
                type: 'ARRAY_BUFFER'
            }, {
                name: 'uuid',
                type: 'STRING'
            }
        ],
        nullableColumns: ['gender', 'birthdate', 'givenName', 'middleName', 'familyName'],
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
                name: 'city_village',
                type: 'STRING'
            }, {
                name: 'state_province',
                type: 'STRING'
            }, {
                name: 'postal_code',
                type: 'STRING'
            }, {
                name: 'country',
                type: 'STRING'
            }, {
                name: 'county_district',
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
        nullableColumns: ['address1', 'address2', 'city_village', 'state_province', 'postal_code', 'country', 'county_district', 'address3', 'address4', 'address5', 'address6'],
        primaryKeyColumns: ['patientUuid']
    }
};
