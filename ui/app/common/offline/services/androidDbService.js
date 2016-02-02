'use strict';

angular.module('bahmni.common.offline')
    .service('androidDbService', ['$q',
        function ($q) {
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

            var populateData = function (host) {
                //TODO: Hemanth/Abishek/Ranganathan - we don't need to pass host for this method once we build event log for patient attributes.
                AndroidOfflineService.populateData(host);
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

            return {
                init: init,
                populateData: populateData,
                getPatientByUuid: getPatientByUuid,
                createPatient: createPatient,
                deletePatientData: deletePatientData,
                getMarker: getMarker,
                insertMarker: insertMarker,
                insertAddressHierarchy: insertAddressHierarchy
            }
        }
    ]);