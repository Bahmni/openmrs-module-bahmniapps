'use strict';

angular.module('bahmni.registration')
    .service('offlinePatientServiceStrategy', ['$http', '$q', 'offlineSearchDbService', 'offlineDbService', function ($http, $q, offlineSearchDbService, offlineDbService) {

        var search = function (config) {
             var defer = $q.defer();
           offlineDbService.reinitSchema().then(function (_db) {
               offlineDbService.init(_db);
           }).then(function() {
               return defer.resolve(offlineSearchDbService.search(config.params));
           });
            return defer.promise;
        };

        var getByUuid = function(uuid) {
            return offlineDbService.getPatientByUuid(uuid);
        };

        var create = function(data) {
            return offlineDbService.createPatient(data);
        };

        var deletePatientData = function(patientUuid) {
            return offlineDbService.deletePatientData(patientUuid);
        };

        var getAttributeTypes = function() {
            return offlineDbService.getAttributeTypes();
        };

        return {
            search: search,
            get: getByUuid,
            create: create,
            deletePatientData: deletePatientData,
            getAttributeTypes: getAttributeTypes
        }
    }]);
