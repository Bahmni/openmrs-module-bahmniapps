'use strict';

angular.module('registration.patient.services')
    .factory('patientService', ['$http', '$rootScope', 'patient', function ($http, $rootScope) {
        var patient;

        var getPatient = function () {
            return patient ? patient : {};
        };

        var rememberPatient = function (patientObj) {
            patient = patientObj;
        };

        var clearPatient = function () {
            patient = null;
        };

        var search = function (query, village) {
            return $http.get(constants.openmrsUrl + "/ws/rest/v1/patient", {
                method: "GET",
                params: {q: query, 'city_village': village, v: "custom:(uuid,identifiers:(uuid,identifier),person:(addresses,gender,age,personDateCreated,names:(givenName,familyName)))"},
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

        var create = function (patient) {
            var patientJson = new PatientMapper().map($rootScope.patientConfiguration, patient);
            return $http.post(constants.openmrsUrl + "/ws/rest/v1/bahmnicore/patient", patientJson, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        var update = function (patient, uuid) {
            var patientJson = new PatientMapper().map($rootScope.patientConfiguration, patient);
            return $http.post(constants.openmrsUrl + "/ws/rest/v1/bahmnicore/patient/" + uuid, patientJson, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        var updateImage = function (uuid, image) {
            var updateImageUrl = constants.openmrsUrl + "/ws/rest/v1/bahmnicore/patient/" + uuid + "/image";
            return $http.post(updateImageUrl, {"image": image}, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });

        };

        return {
            search: search,
            create: create,
            getPatient: getPatient,
            rememberPatient: rememberPatient,
            clearPatient: clearPatient,
            update: update,
            get: get,
            updateImage: updateImage
        };
    }]);
