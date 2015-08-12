'use strict';
angular.module('bahmni.common.domain')
    .factory('programService', ['$http', function ($http) {

        var getAllPrograms = function () {
            return $http.get(Bahmni.Common.Constants.programUrl, {params: {v: 'default'}});
        };

        var enrollPatientToAProgram = function (patientUuid, programUuid, dateEnrolled, stateUuid) {
            var req = {
                url: Bahmni.Common.Constants.programEnrollPatientUrl,
                content: {
                    patient: patientUuid,
                    program: programUuid,
                    dateEnrolled: dateEnrolled
                },
                headers: {"Content-Type": "application/json"}
            };
            if(!_.isEmpty(stateUuid)){
              req.content.states = [
                  {
                      state:stateUuid,
                      startDate:dateEnrolled
                  }
              ]
            }
            return $http.post(req.url, req.content, req.headers);
        };

        var getPatientPrograms = function (patientUuid) {
            var req = {
                url: Bahmni.Common.Constants.programEnrollPatientUrl,
                params: {
                    v: Bahmni.Common.Constants.programEnrollmentDefaultInformation,
                    patient: patientUuid
                }
            };
            return $http.get(req.url, {params: req.params});
        };

        var constructStatesPayload = function(stateUuid, onDate, currProgramStateUuid){
            var states =[];
            if (stateUuid) {
                states.push({
                        state: {
                            uuid: stateUuid
                        },
                        uuid: currProgramStateUuid,
                        startDate: onDate
                    }
                );
            }
            return states;
        };

        var savePatientProgram = function(patientProgramUuid, stateUuid, onDate, currProgramStateUuid) {
            var req = {
                url: Bahmni.Common.Constants.programEnrollPatientUrl + "/" + patientProgramUuid,
                content: {
                    states: constructStatesPayload(stateUuid, onDate, currProgramStateUuid)
                },
                headers: {"Content-Type": "application/json"}
            };
            return $http.post(req.url, req.content, req.headers);
        };

        var endPatientProgram = function (patientProgramUuid, asOfDate, outcomeUuid){
            var req = {
                url: Bahmni.Common.Constants.programEnrollPatientUrl + "/" + patientProgramUuid,
                content: {
                    dateCompleted: asOfDate,
                    outcome: outcomeUuid
                },
                headers: {"Content-Type": "application/json"}
            };
            return $http.post(req.url, req.content, req.headers);
        };

        var deletePatientState = function(patientProgramUuid, patientStateUuid) {
            var req = {
                url: Bahmni.Common.Constants.programEnrollPatientUrl + "/" + patientProgramUuid + "/state/" + patientStateUuid,
                content: {
                    "!purge": "",
                    "reason": "User deleted the state."
                },
                headers: {"Content-Type": "application/json"}
            };
            return $http.delete(req.url, req.content, req.headers);
        };

        return {
            getAllPrograms: getAllPrograms,
            enrollPatientToAProgram: enrollPatientToAProgram,
            getPatientPrograms: getPatientPrograms,
            endPatientProgram: endPatientProgram,
            savePatientProgram: savePatientProgram,
            deletePatientState: deletePatientState
        };

    }]);
