angular.module('bahmni.offline').service('initializeOfflineSchema', ['$rootScope','$q','$http', function ($rootScope, $q, $http) {

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
    var columnsToBeIndexed = {
        'givenNameIndex': 'givenName',
        'middleNameIndex': 'middleName',
        'familyNameIndex': 'familyName',
        'identifierIndex': 'identifier'
    };

    var addressColumns;

    this.initSchema = function(){
        var schemaBuilder = lf.schema.create('Bahmni', 2);

        createTable(schemaBuilder, 'patient_attribute_types', attributeTypeColumnNames);
        createTable(schemaBuilder, 'patient', patientColumnNames, columnsToBeIndexed);
        createTable(schemaBuilder, 'patient_attributes', attributeColumnNames);

        return getAddressColumns().then(function (listOfAddressColumns) {
            addressColumns = listOfAddressColumns;
            createTable(schemaBuilder, 'patient_address', addressColumns);
            schemaBuilder.connect().then(function (database) {
                $rootScope.db = database;
                console.log("Hello!!!");
            });
        });
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