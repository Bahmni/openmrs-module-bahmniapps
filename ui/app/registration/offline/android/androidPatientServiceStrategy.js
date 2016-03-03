'use strict';

angular.module('bahmni.registration')
    .service('offlinePatientServiceStrategy', ['$http', '$q', 'androidDbService', function ($http, $q, androidDbService) {

        var search = function (config) {
            return $q.when(JSON.parse(AndroidOfflineService.search(JSON.stringify(config.params))));
        };

        var getByUuid = function(uuid) {
            return androidDbService.getPatientByUuid(uuid);
        };

        var create = function(data) {
            return androidDbService.createPatient(data, "POST");
        };

        var deletePatientData = function(patientUuid) {
            return offlineDbService.deletePatientData(patientUuid);
        };

        return {
            search: search,
            get: getByUuid,
            create: create,
            deletePatientData: deletePatientData
        }
    }]);
