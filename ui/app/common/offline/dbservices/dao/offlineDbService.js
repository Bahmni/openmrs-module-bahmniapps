'use strict';

angular.module('bahmni.common.offline')
    .service('offlineDbService', ['$http', '$q', 'patientDbService', 'patientAddressDbService', 'patientAttributeDbService', 'offlineMarkerDbService', 'offlineAddressHierarchyDbService', 'offlineConfigDbService',
        function ($http, $q, patientDbService, patientAddressDbService, patientAttributeDbService, offlineMarkerDbService, offlineAddressHierarchyDbService, offlineConfigDbService) {
        var db;

        var populateData = function () {
            patientAttributeDbService.insertAttributeTypes(db);
        };

        var createPatient = function (postRequest, requestType) {
            var uuid = postRequest.patient.uuid;
            return insertPatientData(postRequest, requestType)
                .then(function () {
                    return getPatientByUuid(uuid).then(function (result) {
                        return {data: result};
                    })
                });
        };

        var getPatientByUuid = function (uuid) {
            return patientDbService.getPatientByUuid(db, uuid);
        };

        var deletePatientData = function (uuid) {
            var deferred = $q.defer();
            var queries = [];

            var patientTable = db.getSchema().table('patient');
            var patientAddress = db.getSchema().table('patient_address');
            var patientAttributes = db.getSchema().table('patient_attribute');


            queries.push(db.delete().from(patientAttributes).where(patientAttributes.patientUuid.eq(uuid)));
            queries.push(db.delete().from(patientAddress).where(patientAddress.patientUuid.eq(uuid)));
            queries.push(db.delete().from(patientTable).where(patientTable.uuid.eq(uuid)));

            var tx = db.createTransaction();
            tx.exec(queries);
            deferred.resolve({});
            return deferred.promise;
        };

        var insertPatientData = function (patientData, requestType) {
            var patient = patientData.patient;
            var person = patient.person;
            var attributeTypeTable = db.getSchema().table('patient_attribute_type');

            return patientAttributeDbService.getAttributeTypes(db).then(function (attributeTypeMap) {
                    if ("POST" === requestType) {
                        parseAttributeValues(person.attributes, attributeTypeMap);
                    }
                    return patientDbService.insertPatientData(db, patientData).then(function (patientUuid) {
                        patientAttributeDbService.insertAttributes(db, patientUuid, person.attributes, attributeTypeMap);
                        patientAddressDbService.insertAddress(db, patientUuid, person.addresses[0]);
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
                        if ("java.lang.Integer" === foundAttribute.format || "java.lang.Float" === foundAttribute.format) {
                            attribute.value = parseFloat(attribute.value);
                        } else if ("java.lang.Boolean" === foundAttribute.format) {
                            attribute.value = (attribute.value === 'true');
                        } else if ("org.openmrs.Concept" === foundAttribute.format) {
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

        var getMarker = function () {
            return offlineMarkerDbService.getMarker();
        };

        var insertMarker = function (eventUuid, catchmentNumber) {
            return offlineMarkerDbService.insertMarker(eventUuid, catchmentNumber);
        };

        var insertAddressHierarchy = function (data) {
            return offlineAddressHierarchyDbService.insertAddressHierarchy(data)
        };

        var searchAddress = function(params){
            return offlineAddressHierarchyDbService.search(params);
        };

        var getConfig = function(module){
            return offlineConfigDbService.getConfig(module).then(function(config){
                return config;
            });
        };

        var insertConfig = function(module, data, eTag){
            return offlineConfigDbService.insertConfig(module, data, eTag).then(function(config){
                return config;
            });
        };
        return {
            init: init,
            populateData: populateData,
            getPatientByUuid: getPatientByUuid,
            createPatient: createPatient,
            deletePatientData: deletePatientData,
            getMarker: getMarker,
            insertMarker: insertMarker,
            insertAddressHierarchy: insertAddressHierarchy,
            searchAddress: searchAddress,
            getConfig : getConfig,
            insertConfig : insertConfig
        }
    }]);