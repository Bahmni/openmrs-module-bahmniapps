'use strict';

angular.module('bahmni.common.offline')
    .service('androidDbService', ['$q', '$http',
        function ($q, $http) {
            var getMarker = function () {
                var value = AndroidOfflineService.getMarker();
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var insertMarker = function (uuid, catchmentNumber) {
                return $q.when(AndroidOfflineService.insertMarker(uuid, catchmentNumber));

            };

            var createPatient = function (patient, requestType) {
                var patientString = JSON.stringify(patient);
                var value = AndroidOfflineService.createPatient(patientString, requestType);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var insertAddressHierarchy = function (addressHierarchy) {
                var addressHierarchyString = JSON.stringify(addressHierarchy);
                var value = AndroidOfflineService.insertAddressHierarchy(addressHierarchyString);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var init = function () {
                // Hemanth: This method is not required for android app.
            };

            var initSchema = function () {
                return $q.when(AndroidOfflineService.initSchema());
            };

            var deletePatientData = function (identifier) {
                AndroidOfflineService.deletePatientData(identifier);
                return $q.when({});

            };

            var getPatientByUuid = function (uuid) {
                var value = AndroidOfflineService.getPatientByUuid(uuid);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var searchAddress = function(requestParams){
                var addressParams = JSON.stringify(requestParams);
                var value = AndroidOfflineService.searchAddress(addressParams);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when({data:value});
            };

            var getConfig = function(module){
                var value = AndroidConfigDbService.getConfig(module);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var insertConfig = function(module, data, eTag){
                return $q.when(JSON.parse(AndroidConfigDbService.insertConfig(module, JSON.stringify(data), eTag)));
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
                getConfig: getConfig,
                insertConfig : insertConfig
            }
        }
    ]);