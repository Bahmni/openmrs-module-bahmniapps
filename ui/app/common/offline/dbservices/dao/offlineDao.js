'use strict';

angular.module('bahmni.common.offline')
    .service('offlineDao', ['$http', '$q', 'patientDao', 'patientAddressDao', 'patientAttributeDao', function ($http, $q, patientDao, patientAddressDao, patientAttributeDao) {
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

        var insertPatientData = function (patientData, addressColumnNames, requestType) {
            var patient = patientData.patient;
            var person = patient.person;
            var attributeTypeTable = db.getSchema().table('patient_attribute_types');

            return db.select(attributeTypeTable.attributeTypeId, attributeTypeTable.uuid, attributeTypeTable.attributeName, attributeTypeTable.format).from(attributeTypeTable).exec()
                .then(function (attributeTypeMap) {
                    if ("POST" === requestType) {
                        parseAttributeValues(person.attributes, attributeTypeMap);
                    }
                    return patientDao.insertPatientData(db, patientData).then(function (patientId) {
                        patientAttributeDao.insertAttributes(db, patientId, person.attributes, attributeTypeMap);
                        patientAddressDao.insertAddress(db, patientId, person.addresses[0], addressColumnNames);
                    });
                });

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


        var init = function (_db) {
            db = _db;
        };

        var generateOfflineIdentifier = function () {
            return patientDao.generateOfflineIdentifier(db);
        };

        return {
            populateData: populateData,
            getPatientByUuid: getPatientByUuid,
            getPatientByIdentifier: getPatientByIdentifier,
            createPatient: createPatient,
            deletePatientData: deletePatientData,
            generateOfflineIdentifier: generateOfflineIdentifier,
            init: init
        }
    }]);