var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.Offline = Bahmni.Common.Offline || {};

Bahmni.Common.Offline.SchemaDefinitions = {
    AddressHierarchyLevel: {
        tableName: 'address_hierarchy_level',
        columns: [
            {
                name: 'address_hierarchy_level_id',
                type: lf.Type.INTEGER
            }, {
                name: 'name',
                type: lf.Type.STRING
            }, {
                name: 'parent_level_id',
                type: lf.Type.INTEGER
            }, {
                name: 'address_field',
                type: lf.Type.STRING
            }, {
                name: 'uuid',
                type: lf.Type.STRING
            }, {
                name: 'required',
                type: lf.Type.INTEGER
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
                type: lf.Type.STRING
            }, {
                name: 'level_id',
                type: lf.Type.INTEGER
            }, {
                name: 'parent_id',
                type: lf.Type.INTEGER
            }, {
                name: 'user_generated_id',
                type: lf.Type.STRING
            }, {
                name: 'uuid',
                type: lf.Type.STRING
            }
        ],
        nullableColumns: ['name', 'parent_id', 'user_generated_id'],
        primaryKeyColumns: ['uuid']
    }
};