'use strict';
angular.module('bahmni.common.domain')
    .factory('programService', ['$http', 'programHelper', 'appService', function ($http, programHelper, appService) {
        var PatientProgramMapper = new Bahmni.Common.Domain.PatientProgramMapper();

        var getAllPrograms = function () {
            return $http.get(Bahmni.Common.Constants.programUrl, { params: { v: 'default' } }).then(function (response) {
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
                    attributes: attributeFormatter.removeUnfilledAttributes(attributeFormatter.getMrsAttributes(patientProgramAttributes, (programAttributeTypes || [])))
                },
                headers: { "Content-Type": "application/json" }
            };
            if (!_.isEmpty(stateUuid)) {
                req.content.states = [
                    {
                        state: stateUuid,
                        startDate: moment(dateEnrolled).format(Bahmni.Common.Constants.ServerDateTimeFormat)
                    }
                ];
            }
            return $http.post(req.url, req.content, req.headers);
        };

        var getPatientPrograms = function (patientUuid, filterAttributesForProgramDisplayControl, patientProgramUuid) {
            var params = {
                v: "full",
                patientProgramUuid: patientProgramUuid,
                patient: patientUuid
            };
            return $http.get(Bahmni.Common.Constants.programEnrollPatientUrl, { params: params }).then(function (response) {
                var patientPrograms = response.data.results;
                return getProgramAttributeTypes().then(function (programAttributeTypes) {
                    if (filterAttributesForProgramDisplayControl) {
                        patientPrograms = programHelper.filterProgramAttributes(response.data.results, programAttributeTypes);
                    }

                    return programHelper.groupPrograms(patientPrograms);
                });
            });
        };

        var savePatientProgram = function (patientProgramUuid, content) {
            var req = {
                url: Bahmni.Common.Constants.programEnrollPatientUrl + "/" + patientProgramUuid,
                content: content,
                headers: { "Content-Type": "application/json" }
            };
            return $http.post(req.url, req.content, req.headers);
        };

        var deletePatientState = function (patientProgramUuid, patientStateUuid) {
            var req = {
                url: Bahmni.Common.Constants.programStateDeletionUrl + "/" + patientProgramUuid + "/state/" + patientStateUuid,
                content: {
                    "!purge": "",
                    "reason": "User deleted the state."
                },
                headers: { "Content-Type": "application/json" }
            };
            return $http.delete(req.url, req.content, req.headers);
        };

        var getProgramAttributeTypes = function () {
            return $http.get(Bahmni.Common.Constants.programAttributeTypes, { params: { v: 'custom:(uuid,name,description,datatypeClassname,datatypeConfig,concept)' } }).then(function (response) {
                var programAttributesConfig = appService.getAppDescriptor().getConfigValue("program");

                var mandatoryProgramAttributes = [];
                for (var attributeName in programAttributesConfig) {
                    if (programAttributesConfig[attributeName].required) {
                        mandatoryProgramAttributes.push(attributeName);
                    }
                }
                return new Bahmni.Common.Domain.AttributeTypeMapper().mapFromOpenmrsAttributeTypes(response.data.results, mandatoryProgramAttributes, programAttributesConfig).attributeTypes;
            });
        };

        var updatePatientProgram = function (patientProgram, programAttributeTypes, dateCompleted) {
            return savePatientProgram(patientProgram.uuid, PatientProgramMapper.map(patientProgram, programAttributeTypes, dateCompleted));
        };

        var getProgramStateConfig = function () {
            var config = appService.getAppDescriptor().getConfigValue('programDisplayControl');
            return config ? config.showProgramStateInTimeline : false;
        };

        var getDefaultProgram = function () {
            var defaultProgram = appService.getAppDescriptor().getConfigValue('defaultProgram') || null;
            return defaultProgram;
        };

        var getProgramRedirectionConfig = function () {
            var config = appService.getAppDescriptor().getConfigValue('programRedirection');
            return config ? config : null;
        };

        var getEnrollmentInfoFor = function (patientUuid, representation) {
            var params = {
                patient: patientUuid,
                v: representation
            };
            return $http.get(Bahmni.Common.Constants.programEnrollPatientUrl, { params: params }).then(function (response) {
                return response.data.results;
            });
        };

        var disableProgramOutcome = function () {
            return appService.getAppDescriptor().getConfigValue('disableProgramOutcome') || false;
        };

        var getObservationFormsConfig = function () {
            return appService.getAppDescriptor().getConfigValue('observationForms') || {};
        };

        return {
            getAllPrograms: getAllPrograms,
            enrollPatientToAProgram: enrollPatientToAProgram,
            getPatientPrograms: getPatientPrograms,
            savePatientProgram: savePatientProgram,
            updatePatientProgram: updatePatientProgram,
            deletePatientState: deletePatientState,
            getProgramAttributeTypes: getProgramAttributeTypes,
            getProgramStateConfig: getProgramStateConfig,
            getEnrollmentInfoFor: getEnrollmentInfoFor,
            getDefaultProgram: getDefaultProgram,
            getProgramRedirectionConfig: getProgramRedirectionConfig,
            disableProgramOutcome: disableProgramOutcome,
            getObservationFormsConfig: getObservationFormsConfig
        };
    }]);
