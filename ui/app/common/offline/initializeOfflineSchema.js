'use strict';

angular.module('bahmni.common.offline').service('initializeOfflineSchema', [function () {

    var dataTypes = {
        "INTEGER": lf.Type.INTEGER,
        "STRING": lf.Type.STRING,
        "DATE_TIME": lf.Type.DATE_TIME,
        "OBJECT": lf.Type.OBJECT,
        "ARRAY_BUFFER": lf.Type.ARRAY_BUFFER
    };

    this.initSchema = function () {
        var schemaBuilder = lf.schema.create('Bahmni', 2);
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

        return schemaBuilder.connect().then(function (database) {
            return database;
        });
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