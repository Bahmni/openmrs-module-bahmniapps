'use strict';

angular.module('bahmni.registration')
    .factory('offlinePatientService', ['$http', '$q', 'offlineService', 'offlineCommonService','offlineSearchService', function ($http, $q, offlineService, offlineCommonService, offlineSearchService) {

        var search = function (params) {
            if (offlineService.getAppPlatform() === Bahmni.Common.Constants.platformType.android) {
                var returnValue = JSON.parse(Android.search(JSON.stringify(params)));
                return $q.when(returnValue);
            }
            else {
                return offlineSearchService.search(params);
            }
        };

        var get = function (uuid) {
            if (offlineService.getAppPlatform() === Bahmni.Common.Constants.platformType.android) {
                return $q.when(JSON.parse(Android.getPatient(uuid)));
            }
            else {
                return offlineCommonService.getPatient(uuid);
            }
        };

        var getByIdentifier = function (patientIdentifier) {
            if (offlineService.getAppPlatform() === Bahmni.Common.Constants.platformType.android) {
                return $q.when(JSON.parse(Android.getPatientByIdentifier(patientIdentifier)));
            }
            else {
                return offlineCommonService.getPatientByIdentifier(patientIdentifier);
            }
        };

        var create = function (postRequest) {
            postRequest.patient.person.auditInfo = {dateCreated: new Date()};
            if(!postRequest.patient.uuid)
                postRequest.patient.uuid = postRequest.patient.identifiers[0].identifier;
            postRequest.patient.person.preferredName = postRequest.patient.person.names[0];
            postRequest.patient.person.preferredAddress = postRequest.patient.person.addresses[0];
            if (offlineService.getAppPlatform() === Bahmni.Common.Constants.platformType.android) {
                return $q.when(JSON.parse(Android.createPatient(JSON.stringify(postRequest), window.location.origin)));
            }
            else {
                return offlineCommonService.createPatient(postRequest);
            }
        };

        var update = function (postRequest) {
            if (offlineService.getAppPlatform() === Bahmni.Common.Constants.platformType.android) {
                Android.deletePatientData(postRequest.patient.identifiers[0]['identifier']);
                return create(postRequest).then(function(result){
                    return result.data;
                });
            }
            else {
                return offlineCommonService.deletePatientData(postRequest.patient.identifiers[0]['identifier']).then(function () {
                    return create(postRequest).then(function (result) {
                        return result.data;
                    });
                });
            }
        };

        var generateOfflineIdentifier = function() {
            if(offlineService.getAppPlatform() === Bahmni.Common.Constants.platformType.android) {
                return $q.when(JSON.parse(Android.generateOfflineIdentifier()));
            } else {
                return offlineCommonService.generateOfflineIdentifier();
            }
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
