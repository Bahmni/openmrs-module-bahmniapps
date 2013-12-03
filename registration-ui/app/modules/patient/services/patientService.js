'use strict';

angular.module('registration.patient.services')
    .factory('patientService', ['$http', '$rootScope', 'patient', function ($http, $rootScope) {
        var patient;

        var getPatient = function () {
            if (patient != undefined) {
                patient.image = constants.baseOpenMRSRESTURL + "/personimage/" + patient.uuid + ".jpeg" + "?q=" + new Date().getTime();
                return patient;
            }
            return {};
        };

        var rememberPatient = function (patientObj) {
            patient = patientObj;
        };

        var clearPatient = function () {
            patient = null;
        };

        var search = function (query, village, offset) {
            offset = offset || 0;
            return $http.get(constants.openmrsUrl + "/ws/rest/v1/patient", {
                method: "GET",
                params: {q: query, s: "byIdOrNameOrVillage", 'city_village': village, startIndex: offset},
                withCredentials: true
            });
        };

        var get = function (uuid) {
            return $http.get(constants.openmrsUrl + "/ws/rest/v1/patient/" + uuid, {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            });
        };

        var generateIdentifier = function (patient) {
            var idgenJson = {"identifierSourceName": patient.centerID.name};
            return $http.post(constants.openmrsUrl + "/ws/rest/idgen", idgenJson);
        };

        var create = function (patient) {
            var patientJson = new CreatePatientRequestMapper(moment()).mapFromPatient($rootScope.patientConfiguration.personAttributeTypes, patient);
            return $http.post(constants.baseOpenMRSRESTURL + "/patientprofile", patientJson, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        var update = function (patient, openMRSPatient) {
            var patientJson = new UpdatePatientRequestMapper(moment()).mapFromPatient($rootScope.patientConfiguration.personAttributeTypes, openMRSPatient, patient);
            return $http.post(constants.baseOpenMRSRESTURL + "/patientprofile/" + openMRSPatient.uuid, patientJson, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        var updateImage = function (uuid, image) {
            var updateImageUrl = constants.baseOpenMRSRESTURL + "/personimage/";
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
            getPatient: getPatient,
            rememberPatient: rememberPatient,
            clearPatient: clearPatient,
            update: update,
            get: get,
            updateImage: updateImage
        };
    }]);
