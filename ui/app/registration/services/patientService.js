'use strict';

angular.module('bahmni.registration')
    .factory('patientService', ['$http', '$rootScope', 'patient', function ($http, $rootScope) {
        var patient;
        var openmrsUrl = Bahmni.Registration.Constants.openmrsUrl;
        var baseOpenMRSRESTURL = Bahmni.Registration.Constants.baseOpenMRSRESTURL;
        var patientImageURL = Bahmni.Registration.Constants.patientImageURL;

        var search = function (query, village, localName, offset, localNameAttributes) {
            offset = offset || 0;
            return $http.get(openmrsUrl + "/ws/rest/v1/bahmnicore/patient", {
                method: "GET",
                params: {q: query, s: "byIdOrNameOrVillage", 'city_village': village, 'local_name': localName, startIndex: offset, patientAttributes: localNameAttributes}     ,
                withCredentials: true
            });
        };

        var get = function (uuid) {
            return $http.get(openmrsUrl + "/ws/rest/v1/patient/" + uuid, {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            });
        };

        var generateIdentifier = function (patient) {
            var idgenJson = {"identifierSourceName": patient.identifierPrefix.prefix};
            return $http.post(openmrsUrl + "/ws/rest/v1/idgen", idgenJson);
        };

        var create = function (patient) {
            var patientJson = new Bahmni.Registration.CreatePatientRequestMapper(moment()).mapFromPatient($rootScope.patientConfiguration.personAttributeTypes, patient);
            return $http.post(baseOpenMRSRESTURL + "/patientprofile", patientJson, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        var update = function (patient, openMRSPatient) {
            var patientJson = new Bahmni.Registration.UpdatePatientRequestMapper(moment()).mapFromPatient($rootScope.patientConfiguration.personAttributeTypes, openMRSPatient, patient);
            return $http.post(baseOpenMRSRESTURL + "/patientprofile/" + openMRSPatient.uuid, patientJson, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        var updateImage = function (uuid, image) {
            var updateImageUrl = baseOpenMRSRESTURL + "/personimage/";
            var imageRequest = {
                "person": {
                    "uuid": uuid
                },
                "base64EncodedImage": image
            };
            return $http.post(updateImageUrl, imageRequest, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        return {
            search: search,
            create: create,
            generateIdentifier: generateIdentifier,
            update: update,
            get: get,
            updateImage: updateImage
        };
    }]);
