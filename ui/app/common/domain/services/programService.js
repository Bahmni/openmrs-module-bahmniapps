'use strict';
angular.module('bahmni.common.domain')
    .factory('programService', ['$http','programHelper', 'appService',function ($http, programHelper, appService) {

        var getAllPrograms = function () {
            return $http.get(Bahmni.Common.Constants.programUrl, {params: {v: 'default'}}).then(function (response) {
                var allPrograms = programHelper.filterRetiredPrograms(response.data.results);
                _.forEach(allPrograms, function (program) {
                    program.allWorkflows = programHelper.filterRetiredWorkflowsAndStates(program.allWorkflows);
                    if (program.outcomesConcept) {
                        program.outcomesConcept.setMembers = programHelper.filterRetiredOutcomes(program.outcomesConcept.setMembers);
                    }
                });
                return allPrograms;
            });
        };

        var enrollPatientToAProgram = function (patientUuid, programUuid, dateEnrolled, stateUuid, patientProgramAttributes, programAttributeTypes) {
            var attributeFormatter = new Bahmni.Common.Domain.AttributeFormatter();
            var req = {
                url: Bahmni.Common.Constants.programEnrollPatientUrl,
                content: {
                    patient: patientUuid,
                    program: programUuid,
                    dateEnrolled: moment(dateEnrolled).format(Bahmni.Common.Constants.ServerDateTimeFormat),
                    attributes: attributeFormatter.removeUnfilledAttributes(attributeFormatter.getMrsAttributes(patientProgramAttributes, programAttributeTypes))
                },
                headers: {"Content-Type": "application/json"}
            };
            if(!_.isEmpty(stateUuid)){
              req.content.states = [
                  {
                      state:stateUuid,
                      startDate:moment(dateEnrolled).format(Bahmni.Common.Constants.ServerDateTimeFormat)
                  }
              ]
            }
            return $http.post(req.url, req.content, req.headers);
        };

        var getPatientPrograms = function (patientUuid,filterAttributesForProgramDisplayControl) {
            var req = {
                url: Bahmni.Common.Constants.programEnrollPatientUrl,
                params: {
                    v: Bahmni.Common.Constants.programEnrollmentFullInformation,
                    patient: patientUuid
                }
            };
            return $http.get(req.url, {params: req.params}).then(function (response) {
                var patientPrograms = response.data.results;
                return getProgramAttributeTypes().then(function (programAttributeTypes) {
                    if(filterAttributesForProgramDisplayControl) {
                    patientPrograms = programHelper.filterProgramAttributes(response.data.results, programAttributeTypes);
                    }

                    return programHelper.groupPrograms(patientPrograms);
                });
            });
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

        var savePatientProgram = function(patientProgramUuid, content){
            var req = {
                url: Bahmni.Common.Constants.programEnrollPatientUrl + "/" + patientProgramUuid,
                content: content,
                headers: {"Content-Type": "application/json"}
            };
            return $http.post(req.url, req.content, req.headers);
        };

        var savePatientProgramStates = function(patientProgramUuid, stateUuid, onDate, currProgramStateUuid) {
            var content = {
                states: constructStatesPayload(stateUuid, onDate, currProgramStateUuid)
            };
            return savePatientProgram(patientProgramUuid, content);
        };

        var endPatientProgram = function (patientProgramUuid, asOfDate, outcomeUuid){
            var content = {
                dateCompleted: moment(asOfDate).format(Bahmni.Common.Constants.ServerDateTimeFormat),
                outcome: outcomeUuid
            };
            return savePatientProgram(patientProgramUuid, content);
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

        var getProgramAttributeTypes = function () {
            return $http.get(Bahmni.Common.Constants.programAttributeTypes, {params: {v: 'custom:(uuid,name,description,datatypeClassname,datatypeConfig,concept)'}}).then(function (response) {
                var programAttributesConfig = appService.getAppDescriptor().getConfigValue("program");

                var mandatoryProgramAttributes = [];
                for (var attributeName in programAttributesConfig) {
                    if (programAttributesConfig[attributeName].required)
                        mandatoryProgramAttributes.push(attributeName);
                }
                return new Bahmni.Common.Domain.AttributeTypeMapper().mapFromOpenmrsAttributeTypes(response.data.results, mandatoryProgramAttributes).attributeTypes;
            });
        };

        var updatePatientProgram = function (patientProgram, programAttributeTypes){
            var attributeFormatter = new Bahmni.Common.Domain.AttributeFormatter();
            var content = { dateEnrolled:patientProgram.dateEnrolled , attributes: attributeFormatter.getMrsAttributesForUpdate(patientProgram.patientProgramAttributes, programAttributeTypes, patientProgram.attributes)};
            return savePatientProgram(patientProgram.uuid,content);
        };

        var getProgramStateConfig = function () {
            var config = appService.getAppDescriptor().getConfigValue('programDisplayControl');
            return config ? config.showProgramStateInTimeline : false;
        };

        return {
            getAllPrograms: getAllPrograms,
            enrollPatientToAProgram: enrollPatientToAProgram,
            getPatientPrograms: getPatientPrograms,
            endPatientProgram: endPatientProgram,
            savePatientProgram: savePatientProgram,
            updatePatientProgram: updatePatientProgram,
            savePatientProgramStates: savePatientProgramStates,
            deletePatientState: deletePatientState,
            getProgramAttributeTypes: getProgramAttributeTypes,
            getProgramStateConfig: getProgramStateConfig
        };

    }]);
