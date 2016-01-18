angular.module('bahmni.common.offline').service('initializeOfflineSchema', ['$rootScope', '$q', '$http', 'offlineService', function ($rootScope, $q, $http, offlineService) {


    var addressColumns;

    var dataTypes = {
        "INTEGER": lf.Type.INTEGER,
        "STRING": lf.Type.STRING,
        "DATE_TIME": lf.Type.DATE_TIME,
        "OBJECT": lf.Type.OBJECT,
        "ARRAY_BUFFER": lf.Type.ARRAY_BUFFER
    };

    this.initSchema = function () {

        if (offlineService.getAppPlatform() !== Bahmni.Common.Constants.platformType.chromeApp) {
            return $q.when({});
        }

        var schemaBuilder = lf.schema.create('Bahmni', 2);
        createTableGeneric(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Patient);
        createTableGeneric(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.PatientAttribute);
        createTableGeneric(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.PatientAttributeType);
        createTableGeneric(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.EventLogMarker);
        createTableGeneric(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.AddressHierarchyEntry);
        createTableGeneric(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.AddressHierarchyLevel);
        createTableGeneric(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.Idgen);

        return getAddressColumns().then(function (listOfAddressColumns) {
            addressColumns = listOfAddressColumns;
            createTable(schemaBuilder, 'patient_address', addressColumns);
            return schemaBuilder.connect().then(function (database) {
                return database;
            });
        });
    };


    var createTableGeneric = function (schemaBuilder, tableDefinition) {
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

    var createTable = function (schemaBuilder, tableName, columnNames) {
        var table = schemaBuilder.createTable(tableName).addColumn('_id', lf.Type.INTEGER).addPrimaryKey(['_id'], true);
        angular.forEach(columnNames, function (columnName) {
            table.addColumn(columnName, lf.Type.STRING)
        });
        table.addNullable(columnNames);
    };

    var getAddressColumns = function () {
        var deferred = $q.defer();
        $http.get(window.location.origin + "/openmrs/module/addresshierarchy/ajax/getOrderedAddressHierarchyLevels.form").then(function (addressHierarchyFields) {
            var addressColumnNames = [];
            var addressColumns = addressHierarchyFields.data;
            _.each(addressColumns, function (addressColumn) {
                addressColumnNames.push(addressColumn.addressField);
            });
            addressColumnNames.push("patientUuid");
            deferred.resolve(addressColumnNames);
        });
        return deferred.promise;
    };
}]);