'use strict';

angular.module('bahmni.common.offline')
    .service('offlineDbService', ['$http', '$q', 'patientDbService', 'patientAddressDbService', 'patientAttributeDbService', 'offlineMarkerDbService', 'offlineAddressHierarchyDao', function ($http, $q, patientDbService, patientAddressDbService, patientAttributeDbService, offlineMarkerDbService, offlineAddressHierarchyDao) {
        var db;

        var populateData = function () {
            patientAttributeDbService.insertAttributeTypes(db);
        };

        var getPatientByIdentifier = function (patientIdentifier) {
            return {data: {pageOfResults: patientDbService.getPatientByIdentifier(db, patientIdentifier)}};
        };

        var createPatient = function (postRequest) {
            var addressColumns = [];
            return insertPatientData(postRequest, addressColumns, "POST")
                .then(function () {
                    return {data: postRequest};
                });
        };

        var getPatientByUuid = function (uuid) {
            return patientDbService.getPatientByUuid(db, uuid);
        };

        var deletePatientData = function (patientIdentifier) {
            var deferred = $q.defer();
            var queries = [];

            var patientTable = db.getSchema().table('patient');
            var patientAddress = db.getSchema().table('patient_address');
            var patientAttributes = db.getSchema().table('patient_attribute');

            db.select().from(patientTable).where(patientTable.identifier.eq(patientIdentifier)).exec()
                .then(function (results) {
                    var patientUuid = results[0].uuid;
                    if (results[0] != undefined && results[0].uuid != undefined) {
                        queries.push(db.delete().from(patientAttributes).where(patientAttributes.patientUuid.eq(patientUuid)));
                        queries.push(db.delete().from(patientAddress).where(patientAddress.patientUuid.eq(patientUuid)));
                        queries.push(db.delete().from(patientTable).where(patientTable.uuid.eq(patientUuid)));

                        var tx = db.createTransaction();
                        tx.exec(queries);
                    }
                    deferred.resolve({});
                });
            return deferred.promise;
        };

        var insertPatientData = function (patientData, addressColumnNames, requestType) {
            var patient = patientData.patient;
            var person = patient.person;
            var attributeTypeTable = db.getSchema().table('patient_attribute_type');

            return db.select(attributeTypeTable.attributeTypeId, attributeTypeTable.uuid, attributeTypeTable.attributeName, attributeTypeTable.format).from(attributeTypeTable).exec()
                .then(function (attributeTypeMap) {
                    if ("POST" === requestType) {
                        parseAttributeValues(person.attributes, attributeTypeMap);
                    }
                    return patientDbService.insertPatientData(db, patientData).then(function (patientUuid) {
                        patientAttributeDbService.insertAttributes(db, patientUuid, person.attributes, attributeTypeMap);
                        patientAddressDbService.insertAddress(db, patientUuid, person.addresses[0], addressColumnNames);
                        return patientData;
                    });
                });

        };

        var parseAttributeValues = function (attributes, attributeTypeMap) {
            angular.forEach(attributes, function (attribute) {
                if (!attribute.voided) {
                    var foundAttribute = _.find(attributeTypeMap, function (attributeType) {
                        return attributeType.uuid === attribute.attributeType.uuid
                    });
                    if (foundAttribute != undefined && foundAttribute.format != undefined) {
                        if ("java.lang.Integer" === foundAttribute || "java.lang.Float" === foundAttribute) {
                            attribute.value = parseFloat(attribute.value);
                        } else if ("java.lang.Boolean" === foundAttribute) {
                            attribute.value = (attribute.value === 'true');
                        } else if ("org.openmrs.Concept" === foundAttribute) {
                            var value = attribute.value;
                            attribute.value = {display: value, uuid: attribute.hydratedObject};

                        }
                    }
                }
            });
        };


        var init = function (_db) {
            db = _db;
        };

        var generateOfflineIdentifier = function () {
            return patientDbService.generateOfflineIdentifier(db);
        };

        var getMarker = function () {
            return offlineMarkerDbService.getMarker();
        };

        var insertMarker = function (eventUuid, catchmentNumber) {
            return offlineMarkerDbService.insertMarker(eventUuid, catchmentNumber);
        };

        var insertAddressHierarchy = function (data) {
            return offlineAddressHierarchyDao.insertAddressHierarchy(data)
        };

        return {
            populateData: populateData,
            getPatientByUuid: getPatientByUuid,
            getPatientByIdentifier: getPatientByIdentifier,
            createPatient: createPatient,
            deletePatientData: deletePatientData,
            generateOfflineIdentifier: generateOfflineIdentifier,
            getMarker: getMarker,
            insertMarker: insertMarker,
            insertAddressHierarchy: insertAddressHierarchy,
            init: init
        }
    }]);