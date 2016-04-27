'use strict';

angular.module('bahmni.common.offline').service('initializeOfflineSchema', [function () {

    var dataTypes = {
        "INTEGER": lf.Type.INTEGER,
        "STRING": lf.Type.STRING,
        "DATE_TIME": lf.Type.DATE_TIME,
        "OBJECT": lf.Type.OBJECT,
        "ARRAY_BUFFER": lf.Type.ARRAY_BUFFER
    };

    var onUpgrade = function (rawDb) {
        switch (rawDb.getVersion()) {
            case 2:
                console.log("Upgrade logic from 2 goes here.");
                break;
            default:
                console.log('Existing DB version', rawDb.getVersion());
        }
        return rawDb.dump();
    };

    var LOVEFIELD_DB_CONFIG = {
        storeType : lf.schema.DataStoreType.INDEXED_DB,
        onUpgrade: onUpgrade
    }, DB_NAME = 'Bahmni';

    this.databasePromise = null;

    var baseSchema = function(schemaBuilder) {
        createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Patient);
        createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.PatientAttribute);
        createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.PatientAttributeType);
        createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.EventLogMarker);
        createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.AddressHierarchyEntry);
        createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.AddressHierarchyLevel);
        createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.PatientAddress);
        createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Configs);
        createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.ReferenceData);
        createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.LoginLocations);
        createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Encounter);
    };

    this.initSchema = function () {
        if(this.databasePromise === null ) {
            var schemaBuilder = lf.schema.create(DB_NAME, 2);
            baseSchema(schemaBuilder);
            // Add migrations like this
            // schemaBuilder = lf.schema.create(DB_NAME, 3);
            // createTable(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Dummy);

            this.databasePromise = schemaBuilder.connect(LOVEFIELD_DB_CONFIG);
        }

        return this.databasePromise;
    };

    this.reinitSchema = function() {
        this.databasePromise = null;
        return this.initSchema();
    };

    var createTable = function (schemaBuilder, tableDefinition) {
        var table = schemaBuilder.createTable(tableDefinition.tableName);

        _.map(tableDefinition.columns, function (column) {
            table.addColumn(column.name, dataTypes[column.type]);
        });

        table.addNullable(tableDefinition.nullableColumns);
        table.addPrimaryKey(tableDefinition.primaryKeyColumns);
        _.each(tableDefinition.indexes, function (index) {
            table.addIndex(index.indexName, index.columnNames);
        })
    };
}]);