'use strict';
angular.module('bahmni.common.domain')
    .factory('programService', ['$http', function ($http) {

        var getAllPrograms = function () {
            return $http.get(Bahmni.Common.Constants.programUrl);
        };

        var enrollPatientToAProgram = function (patientUuid, programUuid, dateEnrolled,workflowUuid) {
            var req = {
                url: Bahmni.Common.Constants.programEnrollPatientUrl,
                content: {
                    patient: patientUuid,
                    program: programUuid,
                    dateEnrolled: dateEnrolled,
                    states: [
                        {
                            state:workflowUuid,
                            startDate:dateEnrolled
                        }
                    ]
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
