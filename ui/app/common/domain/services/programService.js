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

        var constructStatesPayload = function(stateUuid, onDate){
            var states =[];
            if (stateUuid) {
                states.push({
                        state: {
                            uuid: stateUuid
                        },
                        startDate: onDate
                    }
                );
            }
            return states;
        };

        var savePatientProgram = function(patientProgramUuid, stateUuid, onDate) {
            var req = {
                url: Bahmni.Common.Constants.programEnrollPatientUrl + "/" + patientProgramUuid,
                content: {
                    states: constructStatesPayload(stateUuid, onDate)
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

        return {
            getAllPrograms: getAllPrograms,
            enrollPatientToAProgram: enrollPatientToAProgram,
            getPatientPrograms: getPatientPrograms,
            endPatientProgram: endPatientProgram,
            savePatientProgram: savePatientProgram
        };

    }]);
