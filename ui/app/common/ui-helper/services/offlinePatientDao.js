'use strict';

angular.module('bahmni.common.uiHelper')
    .service('offlinePatientDao', ['$http', '$rootScope', 'spinner', '$q', function ($http, $rootScope, spinner, $q) {
        var db;

        var populateData = function () {
            insertAttributeTypes();
            insertIntoIdgen();
        };

        var insertIntoIdgen = function (result) {
            result = result || 1;
            var idgen = db.getSchema().table('idgen');
            var row = idgen.createRow({
                '_id': 1,
                'identifier': ++result
            });
            db.insertOrReplace().into(idgen).values([row]).exec()
        };

        var getPatient = function (uuid) {
            var p = db.getSchema().table('patient');
            return db.select(p.patientJson.as('patient'), p.relationships.as('relationships'))
                .from(p)
                .where(p.uuid.eq(uuid)).exec()
                .then(function (result) {
                    return result[0];
                });
        };

        var getPatientByIdentifier = function (patientIdentifier) {
            var p = db.getSchema().table('patient');
            return db.select(p.identifier, p.givenName, p.familyName, p.gender, p.birthdate, p.uuid)
                .from(p)
                .where(p.identifier.eq(patientIdentifier.toUpperCase())).exec().th
                .then(function (result) {
                    return {data: {pageOfResults: result}};
                });
        };

        var createPatient = function (postRequest) {
            var addressColumns = [];
            return insertPatientData(postRequest, addressColumns, "POST")
                .then(function () {
                    return {data: postRequest};
                });

        };

        var deletePatientData = function (patientIdentifier) {
            var deferred = $q.defer();
            var queries = [];

            var patientTable = db.getSchema().table('patient');
            var patientAddress = db.getSchema().table('patient_address');
            var patientAttributes = db.getSchema().table('patient_attributes');

            db.select(patientTable._id).from(patientTable).where(patientTable.identifier.eq(patientIdentifier)).exec()
                .then(function (results) {
                    var patientId = results[0]._id;

                    queries.push(db.delete().from(patientAttributes).where(patientAttributes.patientId.eq(patientId)));
                    queries.push(db.delete().from(patientAddress).where(patientAddress.patientId.eq(patientId)));
                    queries.push(db.delete().from(patientTable).where(patientTable._id.eq(patientId)));

                    var tx = db.createTransaction();
                    tx.exec(queries);
                    deferred.resolve({});
                });
            return deferred.promise;
        };

        var parseAttributeValues = function (attributes, attributeTypeMap) {
            angular.forEach(attributes, function (attribute) {
                if (!attribute.voided) {
                    var format = _.find(attributeTypeMap, function (attributeType) {
                        return attributeType.uuid === attribute.attributeType.uuid
                    }).format;
                    if ("java.lang.Integer" === format || "java.lang.Float" === format) {
                        attribute.value = parseFloat(attribute.value);
                    } else if ("java.lang.Boolean" === format) {
                        attribute.value = (attribute.value === 'true');
                    } else if ("org.openmrs.Concept" === format) {
                        var value = attribute.value;
                        attribute.value = {display: value, uuid: attribute.hydratedObject};

                    }
                }
            });
        };

        var insertPatientData = function (patientData, addressColumnNames, requestType) {
            var patient = patientData.patient;
            var patientTable, patientIdentifier, person, patientId, attributeTypeTable;
            patientTable = db.getSchema().table('patient');
            attributeTypeTable = db.getSchema().table('patient_attribute_types');
            person = patient.person;
            var personName = person.names[0];

            var relationships = patientData.relationships;
            if (!_.isEmpty(relationships)) {
                _.each(relationships, function (relationship) {
                    relationship.personA = {
                        display: personName.givenName + " " + personName.familyName,
                        uuid: patient.uuid
                    };
                })
            }
            patientIdentifier = patient.identifiers[0].identifier;
            return db.select(attributeTypeTable.attributeTypeId, attributeTypeTable.uuid, attributeTypeTable.attributeName, attributeTypeTable.format).from(attributeTypeTable).exec()
                .then(function (attributeTypeMap) {
                    if ("POST" === requestType) {
                        parseAttributeValues(patient.person.attributes, attributeTypeMap);
                    }
                    var row = patientTable.createRow({
                        'identifier': patientIdentifier,
                        'uuid': patient.uuid,
                        'givenName': personName.givenName,
                        'middleName': personName.middleName,
                        'familyName': personName.familyName,
                        'gender': person.gender,
                        'birthdate': person.birthdate,
                        'dateCreated': patient.person.auditInfo.dateCreated,
                        'patientJson': patient,
                        'relationships': relationships
                    });
                    return db.insertOrReplace().into(patientTable).values([row]).exec().then(function () {
                        db.select(patientTable._id).from(patientTable).where(patientTable.identifier.eq(patientIdentifier)).exec()
                            .then(function (results) {
                                patientId = results[0]._id;
                                insertAttributes(patientId, person.attributes, attributeTypeMap);
                                insertAddress(patientId, person.addresses[0], addressColumnNames);
                            })
                    });
                });
        };

        var insertAddress = function (patientId, address, addressColumnNames) {
            var patientAddressTable = db.getSchema().table('patient_address');
            var constructedRow = {};
            angular.forEach(addressColumnNames, function (addressColumn) {
                constructedRow[addressColumn] = address[addressColumn]
            });
            constructedRow["patientId"] = patientId;
            var row = patientAddressTable.createRow(constructedRow);

            return db.insertOrReplace().into(patientAddressTable).values([row]).exec()
        };

        var insertAttributes = function (patientId, attributes, attributeTypeMap) {
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
            var tx = $rootScope.db.createTransaction();
            tx.exec(queries);
        };

        var insertAttributeTypes = function () {
            $http.get(window.location.origin + "/openmrs/ws/rest/v1/personattributetype?v=custom:(name,uuid,format)").then(function (attributesResponse) {
                var personAttributeTypeList = attributesResponse.data.results;
                var row, table, queries = [];
                table = db.getSchema().table('patient_attribute_types');
                for (var i = 0; i < personAttributeTypeList.length; i++) {
                    var row = table.createRow({
                        'attributeTypeId': i,
                        'uuid': personAttributeTypeList[i].uuid,
                        'attributeName': personAttributeTypeList[i].name,
                        'format': personAttributeTypeList[i].format
                    });
                    queries.push(db.insertOrReplace().into(table).values([row]));
                }
                var tx = db.createTransaction();
                tx.exec(queries);
                //db.insertOrReplace().into(table).values([row]).exec();
            });
        };

        var generateOfflineIdentifier = function () {
            var deferred = $q.defer();
            var idgen = db.getSchema().table('idgen');
            db.select(idgen.identifier.as('identifier'))
                .from(idgen).exec()
                .then(function (result) {
                    insertIntoIdgen(result[0].identifier);
                    deferred.resolve({data: "TMP-" + result[0].identifier});
                });

            return deferred.promise;
        };

        var init = function (_db) {
            db = _db;
        };

        return {
            populateData: populateData,
            getPatient: getPatient,
            getPatientByIdentifier: getPatientByIdentifier,
            createPatient: createPatient,
            deletePatientData: deletePatientData,
            generateOfflineIdentifier: generateOfflineIdentifier,
            init: init
        }
    }]);