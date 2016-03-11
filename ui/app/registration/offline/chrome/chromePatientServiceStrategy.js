'use strict';

angular.module('bahmni.registration')
    .service('offlinePatientServiceStrategy', ['$http', '$q', 'offlineSearchDbService', 'offlineDbService', function ($http, $q, offlineSearchDbService, offlineDbService) {

        var search = function (config) {
            console.log("chrome")
            return offlineSearchDbService.search(config.params)
        };

        var getByUuid = function(uuid) {
            console.log("chrome")
            return offlineDbService.getPatientByUuid(uuid);
        };

        var create = function(data) {
            console.log("chrome")
            return offlineDbService.createPatient(data, "POST");
        };

        var deletePatientData = function(patientUuid) {
            console.log("chrome")
            return offlineDbService.deletePatientData(patientUuid);
        };

        return {
            search: search,
            get: getByUuid,
            create: create,
            deletePatientData: deletePatientData
        }
    }]);
