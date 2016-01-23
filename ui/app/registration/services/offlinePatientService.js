'use strict';

angular.module('bahmni.registration')
    .factory('offlinePatientService', ['$http', '$q', 'offlineService', 'offlineDbService', 'offlineSearchDbService', 'androidDbService',
        function ($http, $q, offlineService, offlineDbService, offlineSearchDbService, androidDbService) {

            if (offlineService.isAndroidApp()) {
                offlineDbService = androidDbService;
            }

            var search = function (params) {
                if (offlineService.isAndroidApp()) {
                    var returnValue = JSON.parse(AndroidOfflineService.search(JSON.stringify(params)));
                    return $q.when(returnValue);
                }
                else {
                    return offlineSearchDbService.search(params);
                }
            };

            var get = function (uuid) {
                return offlineDbService.getPatientByUuid(uuid);
            };

            var getByIdentifier = function (patientIdentifier) {
                return offlineDbService.getPatientByIdentifier(patientIdentifier);
            };

            var create = function (postRequest) {
                postRequest.patient.person.auditInfo = {dateCreated: new Date()};
                if (!postRequest.patient.uuid)
                    postRequest.patient.uuid = postRequest.patient.identifiers[0].identifier;
                postRequest.patient.person.preferredName = postRequest.patient.person.names[0];
                postRequest.patient.person.preferredAddress = postRequest.patient.person.addresses[0];
                return offlineDbService.createPatient(postRequest);
            };

            var update = function (postRequest) {
                return offlineDbService.deletePatientData(postRequest.patient.identifiers[0]['identifier']).then(function () {
                    return create(postRequest).then(function (result) {
                        return result.data;
                    });
                });
            };

            var generateOfflineIdentifier = function () {
                return offlineDbService.generateOfflineIdentifier();
            };

            return {
                search: search,
                get: get,
                getByIdentifier: getByIdentifier,
                create: create,
                update: update,
                generateOfflineIdentifier: generateOfflineIdentifier
            };
        }]);
