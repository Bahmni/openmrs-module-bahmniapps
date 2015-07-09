'use strict';
angular.module('bahmni.common.service', []);
angular.module('bahmni.common.service')
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
                    v: Bahmni.Common.Constants.programEnrollmentDefaultInformation,
                    patient: patientUuid
                }
            };
            return $http.get(req.url, {params: req.params});
        };

        var endPatientProgram = function (patientProgramUuid, dateCompleted, outcomeUuid){
            var req = {
                url: Bahmni.Common.Constants.programEnrollPatientUrl + "/" + patientProgramUuid,
                content: {
                    dateCompleted: dateCompleted,
                    outcome: outcomeUuid
                },
                headers: {"Content-Type": "application/json"}
            };
            return $http.post(req.url, req.content, req.headers);
        };

        return {
            getAllPrograms: getAllPrograms,
            enrollPatientToAProgram: enrollPatientToAProgram,
            getActiveProgramsForAPatient: getActiveProgramsForAPatient,
            endPatientProgram: endPatientProgram
        };

    }]);
