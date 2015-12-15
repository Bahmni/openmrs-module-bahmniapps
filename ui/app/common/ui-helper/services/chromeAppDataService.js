'use strict';

angular.module('bahmni.common.uiHelper')
    .service('chromeAppDataService', ['$http', '$q', function ($http, $q) {
        var schemaBuilder;
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
        var startIndex = 0;

        this.populateData = function () {

            schemaBuilder = lf.schema.create('BahmniX2', 2);

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

        this.getPatient = function (uuid) {
            var deferred = $q.defer();
            schemaBuilder = lf.schema.create('BahmniX2', 2);
            createTable(schemaBuilder, 'patient_attribute_types', attributeTypeColumnNames);
            createTable(schemaBuilder, 'patient', patientColumnNames);
            createTable(schemaBuilder, 'patient_attributes', attributeColumnNames);

            getAddressColumns().then(function (addressColumns) {
                createTable(schemaBuilder, 'patient_address', addressColumns);
                schemaBuilder.connect().then(function (db) {
                    var p = db.getSchema().table('patient');
                    db.select(p.patientJson.as('patient'))
                        .from(p)
                        .where(p.uuid.eq(uuid)).exec()
                        .then(function (result) {
                            deferred.resolve(result[0]);
                        });
                })
            });
            return deferred.promise;
        };

        this.search = function (params) {
            var deferred = $q.defer();
            var nameParts = null;
            if (params.q) {
                nameParts = params.q.split(" ");
            }

            if (!params.patientAttributes) {
                params.patientAttributes = "";
            }

            var addressFieldName = null;
            if (params.address_field_name) {
                addressFieldName = params.address_field_name.replace("_", "");
            }

            if (params.startIndex == 0) {
                startIndex = 0;
            }

            schemaBuilder = lf.schema.create('BahmniX2', 2);
            createTable(schemaBuilder, 'patient_attribute_types', attributeTypeColumnNames);
            createTable(schemaBuilder, 'patient', patientColumnNames);
            createTable(schemaBuilder, 'patient_attributes', attributeColumnNames);

            getAddressColumns().then(function (addressColumns) {
                createTable(schemaBuilder, 'patient_address', addressColumns);
                schemaBuilder.connect().then(function (db) {
                    var p = db.getSchema().table('patient');
                    var pa = db.getSchema().table('patient_attributes');
                    var pat = db.getSchema().table('patient_attribute_types');
                    var padd = db.getSchema().table('patient_address');

                    var query = db.select(p.identifier.as('identifier'), p.givenName.as('givenName'), p.middleName.as('middleName'), p.familyName.as('familyName'),
                        p.dateCreated.as('dateCreated'), p.age.as('age'), p.gender.as('gender'), p.uuid.as('uuid'), padd[addressFieldName].as('addressFieldValue'),
                        pat.attributeName.as('attributeName'), pa.attributeValue.as('attributeValue'))
                        .from(p)
                        .innerJoin(padd, p._id.eq(padd.patientId))
                        .innerJoin(pa, p._id.eq(pa.patientId))
                        .innerJoin(pat, pa.attributeTypeId.eq(pat.attributeTypeId));

                    var predicates = [];

                    if (!_.isEmpty(params.address_field_value)) {
                        predicates.push(padd[addressFieldName].match(new RegExp(params.address_field_value, 'i')));
                    }

                    if (!_.isEmpty(params.identifier)) {
                        predicates.push(p.identifier.eq(params.identifier));
                    }
                    if (!_.isEmpty(nameParts)) {
                        var nameSearchCondition = [];
                        if (!_.isEmpty(nameParts)) {
                            angular.forEach(nameParts, function (namePart) {
                                nameSearchCondition.push(lf.op.or(p.givenName.match(new RegExp(namePart, 'i')), p.middleName.match(new RegExp(namePart, 'i')), p.familyName.match(new RegExp(namePart, 'i'))));
                            });
                            predicates.push(lf.op.and.apply(null, nameSearchCondition));
                        }
                    }

                    var whereCondition = lf.op.and.apply(null, predicates);

                    if (!_.isEmpty(predicates))
                        query = query.where(whereCondition);

                    query.limit(50).skip(startIndex).orderBy(p.dateCreated, lf.Order.DESC).exec()
                        .then(function (results) {
                            var groupedResults = _.groupBy(results, function (res) {
                                return res.identifier
                            });
                            var response = {
                                pageOfResults: []
                            };
                            var patient;
                            angular.forEach(groupedResults, function (groupedResult) {
                                var customAttributes = {};
                                patient = groupedResult[0];
                                angular.forEach(groupedResult, function (result) {
                                    if (result.attributeName)
                                        customAttributes[result.attributeName] = result.attributeValue;
                                });
                                patient.customAttribute = JSON.stringify(customAttributes);
                                if (!_.isEmpty(params.custom_attribute)) {
                                    var matched = _.find(customAttributes, function (attributeValue, attributeName) {
                                        return attributeValue.toString().toLowerCase().indexOf(params.custom_attribute.toLowerCase()) != -1 && _.contains(params.patientAttributes, attributeName);
                                    });
                                    if (matched) {
                                        response.pageOfResults.push(groupedResult[0]);
                                    }
                                }
                                else {
                                    response.pageOfResults.push(patient);
                                }
                            });
                            startIndex += 50;
                            deferred.resolve(response);
                        }, function (e) {
                            console.log(e);
                        });
                });
            });

            return deferred.promise;
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
            attributeTable = db.getSchema().table('patient_attributes');
            if (attributes != null && attributes.length > 0) {
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
            else {
                var row = attributeTable.createRow({
                    'attributeTypeId': 99,
                    'attributeValue': "dummy",
                    'patientId': patientId
                });
                db.insertOrReplace().into(attributeTable).values([row]).exec();
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
                row = table.createRow({
                    'attributeTypeId': 99,
                    'attributeName': "dummy"
                });
                db.insertOrReplace().into(table).values([row]).exec();
            });
        };

    }
    ])
;