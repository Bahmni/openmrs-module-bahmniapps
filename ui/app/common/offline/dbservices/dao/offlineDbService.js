'use strict';

angular.module('bahmni.common.offline')
    .service('offlineDbService', ['$http', '$q', 'patientDbService', 'patientAddressDbService', 'patientAttributeDbService', 'offlineMarkerDbService', 'offlineAddressHierarchyDbService', 'offlineConfigDbService','initializeOfflineSchema', 'referenceDataDbService', 'locationDbService',
        function ($http, $q, patientDbService, patientAddressDbService, patientAttributeDbService, offlineMarkerDbService, offlineAddressHierarchyDbService, offlineConfigDbService, initializeOfflineSchema, referenceDataDbService, locationDbService) {
        var db;


        var createPatient = function (postRequest) {
            var deferred = $q.defer();
            var uuid = postRequest.patient.uuid;
            insertPatientData(postRequest)
                .then(function () {
                    getPatientByUuid(uuid).then(function (result) {
                        deferred.resolve({data: result});
                    })
                });
            return deferred.promise;
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

        var insertPatientData = function (patientData) {
            var patient = patientData.patient;
            var person = patient.person;

            return patientDbService.insertPatientData(db, patientData).then(function (patientUuid) {
                patientAttributeDbService.insertAttributes(db, patientUuid, person.attributes);
                patientAddressDbService.insertAddress(db, patientUuid, person.addresses[0]);
                return patientData;
            });

        };

        var init = function (_db) {
            db = _db;
        };

        var initSchema = function () {
            return initializeOfflineSchema.initSchema();
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
            return offlineConfigDbService.getConfig(module);
        };

        var insertConfig = function(module, data, eTag){
            return offlineConfigDbService.insertConfig(module, data, eTag);
        };

        var getReferenceData = function(referenceDataKey){
            return referenceDataDbService.getReferenceData(referenceDataKey);

        };

        var insertReferenceData = function(key, data, eTag){
            return referenceDataDbService.insertReferenceData(key, data, eTag);
        };

        var getLocationByUuid = function(uuid){
            return locationDbService.getLocationByUuid(db, uuid);
        };

        var getAttributeTypes = function(){
            return patientAttributeDbService.getAttributeTypes(db);
        };



        return {
            init: init,
            initSchema: initSchema,
            getPatientByUuid: getPatientByUuid,
            createPatient: createPatient,
            deletePatientData: deletePatientData,
            getMarker: getMarker,
            insertMarker: insertMarker,
            insertAddressHierarchy: insertAddressHierarchy,
            searchAddress: searchAddress,
            getConfig : getConfig,
            insertConfig : insertConfig,
            getReferenceData: getReferenceData,
            insertReferenceData: insertReferenceData,
            getLocationByUuid: getLocationByUuid,
            getAttributeTypes : getAttributeTypes
        }
    }]);