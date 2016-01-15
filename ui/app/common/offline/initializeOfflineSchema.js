angular.module('bahmni.common.offline').service('initializeOfflineSchema', ['$rootScope', '$q', '$http', 'offlineService', function ($rootScope, $q, $http, offlineService) {

    var attributeTypeColumnNames = [
        "attributeTypeId",
        "uuid",
        "attributeName",
        "format"
    ];
    var patientColumnNames = [
        "identifier",
        "uuid",
        "givenName",
        "middleName",
        "familyName",
        "gender",
        "birthdate",
        "dateCreated",
        "patientJson",
        "relationships"];
    var attributeColumnNames = [
        "attributeTypeId",
        "attributeValue",
        "patientId"
    ];

    var markerColumnNames = [
        "lastReadUuid",
        "catchmentNumber",
        "lastReadTime"
    ];

    var columnsToBeIndexed = {
        'givenNameIndex': 'givenName',
        'middleNameIndex': 'middleName',
        'familyNameIndex': 'familyName',
        'identifierIndex': 'identifier'
    };

    var addressColumns;

    var dataTypes = {
        "INTEGER": lf.Type.INTEGER,
        "STRING": lf.Type.STRING,
        "DATE_TIME": lf.Type.DATE_TIME
    };

    this.initSchema = function () {

        if (!offlineService.isOfflineApp()) {
            return $q.when({});
        }

        var schemaBuilder = lf.schema.create('Bahmni', 2);

        createTable(schemaBuilder, 'patient_attribute_types', attributeTypeColumnNames);
        createTable(schemaBuilder, 'patient', patientColumnNames, columnsToBeIndexed);
        createTable(schemaBuilder, 'patient_attributes', attributeColumnNames);
        createTableGeneric(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.EventLogMarker);
        createTableGeneric(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.AddressHierarchyEntry);
        createTableGeneric(schemaBuilder, Bahmni.Common.Offline.SchemaDefinitions.AddressHierarchyLevel);
        createIdgenTable(schemaBuilder, 'idgen');

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
    };

    var createTable = function (schemaBuilder, tableName, columnNames, columnsToBeIndexed) {
        var table = schemaBuilder.createTable(tableName).addColumn('_id', lf.Type.INTEGER).addPrimaryKey(['_id'], true);
        angular.forEach(columnNames, function (columnName) {
            table.addColumn(columnName, lf.Type.STRING)
        });
        table.addNullable(columnNames);
        if (columnsToBeIndexed) {
            angular.forEach(Object.keys(columnsToBeIndexed), function (indexName) {
                table.addIndex(indexName, [columnsToBeIndexed[indexName]]);
            });
        }
    };

    var createIdgenTable = function (schemaBuilder, tableName) {
        var table = schemaBuilder.createTable(tableName)
            .addColumn('_id', lf.Type.INTEGER).addPrimaryKey(['_id'], true)
            .addColumn('identifier', lf.Type.INTEGER);
    };

    var getAddressColumns = function () {
        var deferred = $q.defer();
        $http.get(window.location.origin + "/openmrs/module/addresshierarchy/ajax/getOrderedAddressHierarchyLevels.form").then(function (addressHierarchyFields) {
            var addressColumnNames = [];
            var addressColumns = addressHierarchyFields.data;
            for (var i = 0; i < addressColumns.length; i++) {
                addressColumnNames[i] = addressColumns[i].addressField;
            }
            addressColumnNames[addressColumns.length] = "patientId";
            deferred.resolve(addressColumnNames);
        });
        return deferred.promise;
    };
}]);