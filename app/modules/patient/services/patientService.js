'use strict';

angular.module('resources.patientService', ['resources.patient', 'resources.patientMapper'])
    .factory('patientService', ['$http', '$rootScope', 'patient', 'patientMapper', function ($http, $rootScope, patientModule, patientMapper) {
        var patient;

        var getPatient = function () {
            return patient ? patient : {};
        }

        var rememberPatient = function (patientObj) {
            patient = patientObj;
        }

        var clearPatient = function () {
            patient = null;
        }

        var search = function (query) {
            return $http.get(constants.openmrsUrl + "/ws/rest/v1/patient", {
                method: "GET",
                params: {q: query, v: "custom:(uuid,identifiers:(uuid,identifier),person:(addresses,gender,age,names:(givenName,familyName)))"},
                withCredentials: true
            });
        }

        var get =  function (uuid) {
            return $http.get(constants.openmrsUrl + "/ws/rest/v1/patient/" + uuid, {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            });
        }

        var create = function (patient) {
            var patientJson = patientMapper.map(patient);
            return $http.post(constants.openmrsUrl + "/ws/rest/v1/bahmnicore/patient", patientJson, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        }

        var update = function(patient, uuid) {
            var patientJson = patientMapper.map(patient);
            return $http.post(constants.openmrsUrl + "/ws/rest/v1/bahmnicore/patient/" + uuid, patientJson, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        }

        return {
            search: search,
            create: create,
            getPatient: getPatient,
            rememberPatient: rememberPatient,
			clearPatient: clearPatient,
            update: update,
            get: get
        };
    }]);
