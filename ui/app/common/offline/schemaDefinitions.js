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
    }
};