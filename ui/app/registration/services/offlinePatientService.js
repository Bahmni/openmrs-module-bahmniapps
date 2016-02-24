'use strict';

angular.module('bahmni.registration')
    .factory('offlinePatientService', ['$http', '$q', 'offlineService', 'offlineDbService', 'offlineSearchDbService', 'androidDbService',
        function ($http, $q, offlineService, offlineDbService, offlineSearchDbService, androidDbService) {

            if (offlineService.isAndroidApp()) {
                offlineDbService = androidDbService;
            }

            var search = function (params) {
                if (offlineService.isAndroidApp()) {
                    return $q.when(JSON.parse(AndroidOfflineService.search(JSON.stringify(params))));
                }
                else {
                    return offlineSearchDbService.search(params);
                }
            };

            var get = function (uuid) {
                return offlineDbService.getPatientByUuid(uuid);
            };

            var create = function (postRequest) {
                postRequest.patient.person.auditInfo = {dateCreated: new Date()};
                if (!postRequest.patient.uuid) {
                    postRequest.patient.uuid = Bahmni.Common.Offline.UUID.generateUuid();
                }
                postRequest.patient.person.preferredName = postRequest.patient.person.names[0];
                postRequest.patient.person.preferredAddress = postRequest.patient.person.addresses[0];
                return offlineDbService.createPatient(postRequest, "POST");
            };

            var update = function (postRequest) {
                return offlineDbService.deletePatientData(postRequest.patient.uuid).then(function () {
                    return create(postRequest, "POST").then(function (result) {
                        return result.data;
                    });
                });
            };

            return {
                search: search,
                get: get,
                create: create,
                update: update
            };
        }]);
