'use strict';

angular.module('bahmni.common.uiHelper')
    .service('chromeAppDataService', ['$http', '$q', function ($http, $q) {

        this.populateData = function () {
            var attributeTypeColumnNames = [
                "attributeTypeId",
                "attributeName"
            ];
            var patientColumnNames = [
                "identifier",
                "uuid",
                "givenName",
                "middleName",
                "familyName",
                "gender",
                "age",
                "dateCreated",
                "patientJson"];
            var attributeColumnNames = [
                "attributeTypeId",
                "attributeValue",
                "patientId"
            ];
            var schemaBuilder = lf.schema.create('Bahmni', 1);
            createTable(schemaBuilder, 'patient_attribute_types', attributeTypeColumnNames);
            createTable(schemaBuilder, 'patient', patientColumnNames);
            createTable(schemaBuilder, 'patient_attributes', attributeColumnNames);

            getAddressColumns().then(function (addressColumns) {
                createTable(schemaBuilder, 'patient_address', addressColumns);
                schemaBuilder.connect().then(function (db) {
                    insertAttributeTypes(db);
                    insertPatients(db, addressColumns, 0)
                });
            });
        };

        var createTable = function (schemaBuilder, tableName, columnNames) {
            var table = schemaBuilder.createTable(tableName).addColumn('_id', lf.Type.INTEGER).addPrimaryKey(['_id'], true);
            angular.forEach(columnNames, function (columnName) {
                table.addColumn(columnName, lf.Type.STRING)
            });
            table.addNullable(columnNames);
        };

        var insertPatients = function (db, addressColumnNames, startIndex) {
            var pageSize = 1;
            $http.get(window.location.origin + "/openmrs/ws/rest/v1/bahmnicore/patientData?startIndex=" + startIndex + "&limit=" + pageSize).then(function (patientJson) {
                if (patientJson.data.pageOfResults.length == 0) {
                    return;
                }
                insertPatientData(db, patientJson.data.pageOfResults[0].patient, addressColumnNames);
                insertPatients(db, addressColumnNames, ++startIndex)
            });
        };

        var insertPatientData = function (db, patient, addressColumnNames) {
            var patientTable, patientIdentifier, person, patientId, attributeTypeTable;
            patientTable = db.getSchema().table('patient');
            attributeTypeTable = db.getSchema().table('patient_attribute_types');
            person = patient.person;
            var personName = person.preferredName;
            patientIdentifier = patient.identifiers[0].identifier;
            var row = patientTable.createRow({
                'identifier': patientIdentifier,
                'uuid': patient.uuid,
                'givenName': personName.givenName,
                'middleName': personName.middleName,
                'familyName': personName.familyName,
                'gender': person.gender,
                'age': person.age,
                'dateCreated': patient.auditInfo.dateCreated,
                'patientJson': patient
            });
            db.insertOrReplace().into(patientTable).values([row]).exec();

            db.select(patientTable._id).from(patientTable).where(patientTable.identifier.eq(patientIdentifier)).exec()
                .then(function (results) {
                    patientId = results[0]._id;
                    return db.select(attributeTypeTable.attributeTypeId, attributeTypeTable.attributeName).from(attributeTypeTable).exec()
                })
                .then(function (attributeTypeMap) {
                    insertAttributes(db, patientId, person.attributes, attributeTypeMap);
                    insertAddress(db, patientId, person.preferredAddress, addressColumnNames);
                });
        };

        var insertAddress = function (db, patientId, address, addressColumnNames) {
            var patientAddressTable = db.getSchema().table('patient_address');
            var constructedRow = {};
            angular.forEach(addressColumnNames, function (addressColumn) {
                constructedRow[addressColumn] = address[addressColumn]
            });
            constructedRow["patientId"] = patientId;
            var row = patientAddressTable.createRow(constructedRow);

            db.insertOrReplace().into(patientAddressTable).values([row]).exec()
        };

        var insertAttributes = function (db, patientId, attributes, attributeTypeMap) {
            var attributeTable, value;
            if (attributes != null && attributes.length > 0) {
                attributeTable = db.getSchema().table('patient_attributes');
                for (var j = 0; j < attributes.length; j++) {
                    (function () {
                        var personAttribute = attributes[j];
                        var object = personAttribute.value;
                        if (typeof(object) == "object") {
                            value = object.display;
                        } else
                            value = object;
                        var attributeTypeId = _.find(attributeTypeMap, function (attributeType) {
                            return attributeType.attributeName === personAttribute.attributeType.display
                        }).attributeTypeId;
                        var row = attributeTable.createRow({
                            'attributeTypeId': attributeTypeId,
                            'attributeValue': value,
                            'patientId': patientId
                        });
                        db.insertOrReplace().into(attributeTable).values([row]).exec();
                    })();

                }

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

        var insertAttributeTypes = function (db) {
            $http.get(window.location.origin + "/openmrs/ws/rest/v1/personattributetype?v=custom:(name)").then(function (attributesResponse) {
                var personAttributeTypeList = attributesResponse.data.results;
                var row, table;
                table = db.getSchema().table('patient_attribute_types');
                for (var i = 0; i < personAttributeTypeList.length; i++) {
                    row = table.createRow({
                        'attributeTypeId': i,
                        'attributeName': personAttributeTypeList[i].name
                    });
                    db.insertOrReplace().into(table).values([row]).exec();
                }
            });
        };

    }])
;