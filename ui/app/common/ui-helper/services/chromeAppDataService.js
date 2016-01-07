'use strict';

angular.module('bahmni.common.uiHelper')
    .service('chromeAppDataService', ['$http', '$q', '$rootScope', 'spinner', function ($http, $q, $rootScope, spinner) {
        var schemaBuilder;
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
            "age",
            "dateCreated",
            "patientJson"];
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

        this.populateData = function () {
            schemaBuilder = lf.schema.create('Bahmni', 2);

            createTable(schemaBuilder, 'patient_attribute_types', attributeTypeColumnNames);
            createTable(schemaBuilder, 'patient', patientColumnNames, columnsToBeIndexed);
            createTable(schemaBuilder, 'patient_attributes', attributeColumnNames);

            getAddressColumns().then(function (addressColumns) {
                createTable(schemaBuilder, 'patient_address', addressColumns);
                schemaBuilder.connect().then(function (db) {
                    insertAttributeTypes(db);
                    insertPatients(db, addressColumns, 0);
                });
            });

        };

        this.getPatient = function (uuid) {
            var deferred = $q.defer();
            schemaBuilder = lf.schema.create('Bahmni', 2);
            createTable(schemaBuilder, 'patient_attribute_types', attributeTypeColumnNames);


            createTable(schemaBuilder, 'patient', patientColumnNames, columnsToBeIndexed);

            createTable(schemaBuilder, 'patient_attributes', attributeColumnNames);

            getAddressColumns().then(function (addressColumns) {
                createTable(schemaBuilder, 'patient_address', addressColumns);
                schemaBuilder.connect().then(function (db) {
                    var p = db.getSchema().table('patient');
                    db.select(p.patientJson.as('patient'))
                        .from(p)
                        .where(p.uuid.eq(uuid)).exec()
                        .then(function (result) {
                            result[0].relationships = [];
                            deferred.resolve(result[0]);
                        });
                })
            });
            return deferred.promise;
        };

        this.createPatient = function (postRequest) {
            var deferred = $q.defer();
            schemaBuilder = lf.schema.create('Bahmni', 2);
            createTable(schemaBuilder, 'patient_attribute_types', attributeTypeColumnNames);


            createTable(schemaBuilder, 'patient', patientColumnNames, columnsToBeIndexed);

            createTable(schemaBuilder, 'patient_attributes', attributeColumnNames);

            getAddressColumns().then(function (addressColumns) {
                createTable(schemaBuilder, 'patient_address', addressColumns);
                schemaBuilder.connect().then(function (db) {
                    insertPatientData(db, postRequest, addressColumns, "POST")
                        .then(function(){
                            deferred.resolve({data: postRequest});
                        });
                });
            });
            return deferred.promise;

        };

        this.search = function (params) {
            var response = {
                pageOfResults: []
            };
            if ($rootScope.searching) {
                response.pageOfResults.push({});
                return $q.when(response);
            }
            $rootScope.searching = true;
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

            schemaBuilder = lf.schema.create('Bahmni', 2);
            createTable(schemaBuilder, 'patient_attribute_types', attributeTypeColumnNames);
            createTable(schemaBuilder, 'patient', patientColumnNames, columnsToBeIndexed);
            createTable(schemaBuilder, 'patient_attributes', attributeColumnNames);

            getAddressColumns().then(function (addressColumns) {
                createTable(schemaBuilder, 'patient_address', addressColumns);
                schemaBuilder.connect().then(function (db) {
                    var p = db.getSchema().table('patient');
                    var pa = db.getSchema().table('patient_attributes');
                    var pat = db.getSchema().table('patient_attribute_types');
                    var padd = db.getSchema().table('patient_address');

                    db.select(pat.attributeTypeId)
                        .from(pat)
                        .where(pat.attributeName.in(params.patientAttributes)).exec()
                        .then(function (attributeTypeIds) {


                            var query = db.select(p.identifier.as('identifier'))
                                .from(p)
                                .innerJoin(padd, p._id.eq(padd.patientId))
                                .leftOuterJoin(pa, p._id.eq(pa.patientId))
                                .leftOuterJoin(pat, pa.attributeTypeId.eq(pat.attributeTypeId));
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
                                        nameSearchCondition.push(lf.op.or(p.givenName.match(new RegExp(namePart, 'i')), p.middleName.match(new RegExp(namePart, 'i')),
                                            p.familyName.match(new RegExp(namePart, 'i')), p.identifier.eq(namePart)));
                                    });
                                    predicates.push(lf.op.and.apply(null, nameSearchCondition));
                                }
                            }

                            if (!_.isEmpty(params.custom_attribute)) {
                                predicates.push(pa.attributeTypeId.in(_.map(attributeTypeIds, function (attributeTypeId) {
                                    return attributeTypeId.attributeTypeId;
                                })));
                                predicates.push(pa.attributeValue.match(new RegExp(params.custom_attribute, 'i')));
                            }

                            var whereCondition = lf.op.and.apply(null, predicates);

                            if (!_.isEmpty(predicates))
                                query = query.where(whereCondition);

                            query.limit(50).skip(params.startIndex).orderBy(p.dateCreated, lf.Order.DESC).groupBy(p.identifier).exec()
                                .then(function (tempResults) {
                                    db.select(p.identifier.as('identifier'), p.givenName.as('givenName'), p.middleName.as('middleName'), p.familyName.as('familyName'),
                                        p.dateCreated.as('dateCreated'), p.age.as('age'), p.gender.as('gender'), p.uuid.as('uuid'), padd[addressFieldName].as('addressFieldValue'),
                                        pat.attributeName.as('attributeName'), pa.attributeValue.as('attributeValue'), pat.format.as('attributeFormat'))
                                        .from(p)
                                        .innerJoin(padd, p._id.eq(padd.patientId))
                                        .leftOuterJoin(pa, p._id.eq(pa.patientId))
                                        .leftOuterJoin(pat, pa.attributeTypeId.eq(pat.attributeTypeId))
                                        .where(p.identifier.in(_.map(tempResults, function (tempResult) {
                                            return tempResult.identifier;
                                        }))).exec()
                                        .then(function (results) {
                                            var groupedResults = _.groupBy(results, function (res) {
                                                return res.identifier
                                            });
                                            var patient;
                                            angular.forEach(groupedResults, function (groupedResult) {
                                                var customAttributes = {};
                                                patient = groupedResult[0];
                                                angular.forEach(groupedResult, function (result) {
                                                    if (result.attributeName) {
                                                        if(_.isObject(result.attributeValue)){
                                                            customAttributes[result.attributeName] = result.attributeValue.display;
                                                        }
                                                        else{
                                                            customAttributes[result.attributeName] = result.attributeValue;
                                                        }
                                                    }
                                                });
                                                patient.customAttribute = JSON.stringify(customAttributes);
                                                response.pageOfResults.push(patient);
                                            });
                                            $rootScope.searching = false;
                                            deferred.resolve(response);
                                        });

                                }, function (e) {
                                    console.log(e);
                                });
                        })

                });
            });

            return deferred.promise;
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

        var insertPatients = function (db, addressColumnNames, nextIndex) {
            var pageSize = 1;
            spinner.forPromise($http.get(window.location.origin + "/openmrs/ws/rest/v1/bahmnicore/patientData?startIndex=" + nextIndex + "&limit=" + pageSize).then(function (patientJson) {
                if (patientJson.data.pageOfResults.length == 0) {
                    return;
                }
                insertPatientData(db, patientJson.data.pageOfResults[0].patient, addressColumnNames);
                insertPatients(db, addressColumnNames, ++nextIndex)
            }));
        };

        //var parseAttributeValues = function (value, attributeTypeMap) {
        //    return _.mapValues(value, function (val, key) {
        //        if (_.isObject(val)) {
        //            return parseAttributeValues(val)
        //        } else {
        //            if (!_.isNaN(parseFloat(val))) {
        //                return parseFloat(val)
        //            }
        //            return val;
        //        }
        //    });
        //};

        var parseAttributeValues = function(attributes, attributeTypeMap){
            angular.forEach(attributes, function(attribute){
               if(!attribute.voided){
                   var format = _.find(attributeTypeMap, function (attributeType) {
                       return attributeType.uuid === attribute.attributeType.uuid
                   }).format;
                   if("java.lang.Integer" === format || "java.lang.Float" === format){
                       attribute.value = parseFloat(attribute.value);
                   } else if("java.lang.Boolean" === format){
                       attribute.value = (attribute.value === 'true');
                   } else if("org.openmrs.Concept" === format){
                       var value = attribute.value;
                       attribute.value = { display : value, uuid: attribute.hydratedObject};

                   }
               }
            });
        };

        var insertPatientData = function (db, postRequest, addressColumnNames, requestType) {

            var patient = postRequest.patient;
            var patientTable, patientIdentifier, person, patientId, attributeTypeTable;
            patientTable = db.getSchema().table('patient');
            attributeTypeTable = db.getSchema().table('patient_attribute_types');
            person = patient.person;
            var personName = person.names[0];
            patientIdentifier = patient.identifiers[0].identifier;
            return db.select(attributeTypeTable.attributeTypeId, attributeTypeTable.uuid, attributeTypeTable.attributeName, attributeTypeTable.format).from(attributeTypeTable).exec()
                .then(function (attributeTypeMap) {
                    if ("POST" === requestType) {
                        //patient.person.attributes = _.values(parseAttributeValues(patient.person.attributes, attributeTypeMap));
                        parseAttributeValues(patient.person.attributes, attributeTypeMap);
                    }
                    var row = patientTable.createRow({
                        'identifier': patientIdentifier,
                        'uuid': patient.uuid,
                        'givenName': personName.givenName,
                        'middleName': personName.middleName,
                        'familyName': personName.familyName,
                        'gender': person.gender,
                        'age': person.age,
                        'dateCreated': patient.person.auditInfo.dateCreated,
                        'patientJson': patient
                    });
                    db.insertOrReplace().into(patientTable).values([row]).exec();

                    return db.select(patientTable._id).from(patientTable).where(patientTable.identifier.eq(patientIdentifier)).exec()
                        .then(function (results) {
                            patientId = results[0]._id;
                            insertAttributes(db, patientId, person.attributes, attributeTypeMap);
                            insertAddress(db, patientId, person.addresses[0], addressColumnNames);
                        })
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

            return db.insertOrReplace().into(patientAddressTable).values([row]).exec()
        };

        var insertAttributes = function (db, patientId, attributes, attributeTypeMap) {
            var attributeTable, value;
            attributeTable = db.getSchema().table('patient_attributes');
            var queries = [];
            if (attributes != null && attributes.length > 0) {
                for (var j = 0; j < attributes.length; j++) {
                    (function () {
                        if (!attributes[j].voided) {
                            var personAttribute = attributes[j];
                            var attributeValue = personAttribute.value;
                            if (typeof(attributeValue) == "object") {
                                value = attributeValue.display;
                            } else
                                value = attributeValue;
                            var attributeTypeId = _.find(attributeTypeMap, function (attributeType) {
                                return attributeType.uuid === personAttribute.attributeType.uuid
                            }).attributeTypeId;
                            var row = attributeTable.createRow({
                                'attributeTypeId': attributeTypeId,
                                'attributeValue': value,
                                'patientId': patientId
                            });
                            queries.push(db.insertOrReplace().into(attributeTable).values([row]));
                        }
                    })();
                }
            }
            var tx = db.createTransaction();
            tx.exec(queries);
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
            $http.get(window.location.origin + "/openmrs/ws/rest/v1/personattributetype?v=custom:(name,uuid,format)").then(function (attributesResponse) {
                var personAttributeTypeList = attributesResponse.data.results;
                var row, table;
                table = db.getSchema().table('patient_attribute_types');
                for (var i = 0; i < personAttributeTypeList.length; i++) {
                    row = table.createRow({
                        'attributeTypeId': i,
                        'uuid': personAttributeTypeList[i].uuid,
                        'attributeName': personAttributeTypeList[i].name,
                        'format': personAttributeTypeList[i].format
                    });
                    db.insertOrReplace().into(table).values([row]).exec();
                }
                db.insertOrReplace().into(table).values([row]).exec();
            });
        };

    }
    ])
;