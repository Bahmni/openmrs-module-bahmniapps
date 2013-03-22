'use strict';

angular.module('resources.patientService', ['resources.patient'])
    .factory('patientService', ['$http', '$rootScope', 'patient', function ($http, $rootScope, patientModule) {
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

        var search = function (query) {
            return $http.get($rootScope.BaseUrl + "/ws/rest/v1/patient", {
                method: "GET",
                params: {q: query, v: "custom:(uuid,identifiers:(uuid,identifier),person:(addresses,gender,age,names:(givenName,familyName)))"},
                withCredentials: true
            });
        }

        var create = function (patient) {
            return $http.post($rootScope.BaseUrl + "/ws/rest/v1/raxacore/patient", patient,
                {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
        }

        return {
            search: search,
            create: create,
            getPatient: getPatient,
            rememberPatient: rememberPatient
        };
    }]);
