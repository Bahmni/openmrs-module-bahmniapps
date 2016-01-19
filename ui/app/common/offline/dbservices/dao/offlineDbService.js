'use strict';

angular.module('bahmni.common.offline')
    .service('offlineDbService', ['$http', '$q', 'patientDao', 'patientAddressDao', 'patientAttributeDao', 'offlineMarkerDao', 'offlineAddressHierarchyDao', function ($http, $q, patientDao, patientAddressDao, patientAttributeDao, offlineMarkerDao, offlineAddressHierarchyDao) {
        var db;

        var populateData = function () {
            patientAttributeDao.insertAttributeTypes(db);
        };

        var getPatientByIdentifier = function (patientIdentifier) {
            return {data: {pageOfResults: patientDao.getPatientByIdentifier(db, patientIdentifier)}};
        };

        var createPatient = function (postRequest) {
            var addressColumns = [];
            return insertPatientData(postRequest, addressColumns, "POST")
                .then(function () {
                    return {data: postRequest};
                });
        };

        var getPatientByUuid = function (uuid) {
            return patientDao.getPatientByUuid(db, uuid);
        };

        var deletePatientData = function (patientIdentifier) {
            var deferred = $q.defer();
            var queries = [];

            var patientTable = db.getSchema().table('patient');
            var patientAddress = db.getSchema().table('patient_address');
            var patientAttributes = db.getSchema().table('patient_attribute');

            db.select(patientTable).from(patientTable).where(patientTable.identifier.eq(patientIdentifier)).exec()
                .then(function (results) {
                    var patientUuid = results[0].uuid;

                    queries.push(db.delete().from(patientAttributes).where(patientAttributes.patientId.eq(patientUuid)));
                    queries.push(db.delete().from(patientAddress).where(patientAddress.patientId.eq(patientUuid)));
                    queries.push(db.delete().from(patientTable).where(patientTable._id.eq(patientUuid)));

                    var tx = db.createTransaction();
                    tx.exec(queries);
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
                    return patientDao.insertPatientData(db, patientData).then(function (patientUuid) {
                        return patientAttributeDao.insertAttributes(db, patientUuid, person.attributes, attributeTypeMap).then(function(){
                            return patientAddressDao.insertAddress(db, patientUuid, person.addresses[0], addressColumnNames).then(function(){
                                return patientData;
                            });
                        });
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
            return patientDao.generateOfflineIdentifier(db);
        };

        var getMarker = function () {
            return offlineMarkerDao.getMarker();
        };

        var insertMarker = function (eventUuid, catchmentNumber) {
            return offlineMarkerDao.insertMarker(eventUuid, catchmentNumber);
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