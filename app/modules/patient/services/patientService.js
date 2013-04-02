'use strict';

angular.module('resources.patientService', ['resources.patient', 'resources.patientMapper'])
    .factory('patientService', ['$http', '$rootScope', 'patient', 'patientMapper', function ($http, $rootScope, patientModule, patientMapper) {
        var patient;

        var getPatient = function () {
            if(patient == null){
                return patientModule.create();
            }
            return patient;
        }

        var rememberPatient = function (patientObj) {
            patient = patientObj;
        }

        var clearPatient = function () {
            patient = null;
        }

        var search = function (query) {
            return $http.get($rootScope.BaseUrl + "/ws/rest/v1/patient", {
                method: "GET",
                params: {q: query, v: "custom:(uuid,identifiers:(uuid,identifier),person:(addresses,gender,age,names:(givenName,familyName)))"},
                withCredentials: true
            });
        }

        var create = function (patient) {
            var patientJson = patientMapper.map(patient);
            return $http.post($rootScope.BaseUrl + "/ws/rest/v1/raxacore/patient", patientJson, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        }

        return {
            search: search,
            create: create,
            getPatient: getPatient,
            rememberPatient: rememberPatient,
			clearPatient: clearPatient
        };
    }]);
