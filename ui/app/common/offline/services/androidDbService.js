'use strict';

angular.module('bahmni.common.offline')
    .service('androidDbService', ['$q',
        function ($q) {
            var getMarker = function () {
                var deferred = $q.defer();
                var value = AndroidOfflineService.getMarker();
                value = value != undefined ? JSON.parse(value) : value;
                deferred.resolve(value);
                return deferred.promise;
            };

            var insertMarker = function (uuid, catchmentNumber) {
                var deferred = $q.defer();
                var value = AndroidOfflineService.insertMarker(uuid, catchmentNumber);
                deferred.resolve(value);
                return deferred.promise;
            };

            var createPatient = function (patient) {
                var deferred = $q.defer();
                var patientString = JSON.stringify(patient);
                var value = AndroidOfflineService.createPatient(patientString);
                value = value != undefined ? JSON.parse(value) : value;
                deferred.resolve(value);
                return deferred.promise;
            };

            var insertAddressHierarchy = function (addressHierarchy) {
                var deferred = $q.defer();
                var addressHierarchyString = JSON.stringify(addressHierarchy);
                var value = AndroidOfflineService.insertAddressHierarchy(addressHierarchyString);
                value = value != undefined ? JSON.parse(value) : value;
                deferred.resolve(value);
                return deferred.promise;
            };

            var init = function () {
                // Hemanth: This method is not required for android app.
            };

            var populateData = function (host) {
                //TODO: Hemanth/Abishek/Ranganathan - we don't need to pass host for this method once we build event log for patient attributes.
                AndroidOfflineService.populateData(host);
            };

            var deletePatientData = function (identifier) {
                var deferred = $q.defer();
                AndroidOfflineService.deletePatientData(identifier);
                deferred.resolve();
                return deferred.promise;
            };

            var generateOfflineIdentifier = function () {
                var deferred = $q.defer();
                var value = AndroidOfflineService.generateOfflineIdentifier();
                value = value != undefined ? JSON.parse(value) : value;
                deferred.resolve(value);
                return deferred.promise;
            };

            var getPatientByUuid = function (uuid) {
                var deferred = $q.defer();
                var value = AndroidOfflineService.getPatientByUuid(uuid);
                value = value != undefined ? JSON.parse(value) : value;
                deferred.resolve(value);
                return deferred.promise;
            };

            var getPatientByIdentifier = function (identifier) {
                var deferred = $q.defer();
                var value = AndroidOfflineService.getPatientByIdentifier(identifier);
                value = value != undefined ? JSON.parse(value) : value;
                deferred.resolve(value);
                return deferred.promise;
            };

            return {
                init: init,
                populateData: populateData,
                getPatientByUuid: getPatientByUuid,
                getPatientByIdentifier: getPatientByIdentifier,
                createPatient: createPatient,
                deletePatientData: deletePatientData,
                generateOfflineIdentifier: generateOfflineIdentifier,
                getMarker: getMarker,
                insertMarker: insertMarker,
                insertAddressHierarchy: insertAddressHierarchy
            }
        }
    ]);