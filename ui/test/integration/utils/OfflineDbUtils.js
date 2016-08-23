var Bahmni = Bahmni || {};
Bahmni.Tests = Bahmni.Tests || {};

Bahmni.Tests.OfflineDbUtils = {

     createTable : function (schemaBuilder, tableDefinition, autoIncrement) {

         var dataTypes = {
             "INTEGER": lf.Type.INTEGER,
             "STRING": lf.Type.STRING,
             "DATE_TIME": lf.Type.DATE_TIME,
             "OBJECT": lf.Type.OBJECT,
             "ARRAY_BUFFER": lf.Type.ARRAY_BUFFER,
             "BOOLEAN": lf.Type.BOOLEAN
         };

        var table = schemaBuilder.createTable(tableDefinition.tableName);

        _.map(tableDefinition.columns, function (column) {
            table.addColumn(column.name, dataTypes[column.type]);
        });

        table.addNullable(tableDefinition.nullableColumns);
         if(autoIncrement) {
             table.addPrimaryKey(tableDefinition.primaryKeyColumns, true);
         }
         else {
             table.addPrimaryKey(tableDefinition.primaryKeyColumns);
         }
        _.each(tableDefinition.indexes, function (index) {
            table.addIndex(index.indexName, index.columnNames);
        })
    }
};