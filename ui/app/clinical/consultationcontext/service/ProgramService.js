'use strict';

angular.module('bahmni.clinical')
    .factory('programService', ['$http', function ($http) {

        var getAllPrograms = function () {
            var req = {
                url: Bahmni.Common.Constants.programUrl
            };
            return $http.get(req.url);
        };

        var enrollPatientToAProgram = function (patientUuid, programUuid, dateEnrolled) {
            var req = {
                url: Bahmni.Common.Constants.programEnrollPatientUrl,
                content: {
                    patient: patientUuid,
                    program: programUuid,
                    dateEnrolled: dateEnrolled
                },
                headers: {"Content-Type": "application/json"}
            };
            return $http.post(req.url, req.content, req.headers);
        };

        var getActiveProgramsForAPatient = function (patientUuid) {
            var req = {
                url: Bahmni.Common.Constants.programEnrollPatientUrl,
                params: {
                    v: "full",
                    patient: patientUuid
                }
            };
            return $http.get(req.url, {params: req.params});
        };

        return {
            getAllPrograms: getAllPrograms,
            enrollPatientToAProgram: enrollPatientToAProgram,
            getActiveProgramsForAPatient: getActiveProgramsForAPatient
        };

    }]);
