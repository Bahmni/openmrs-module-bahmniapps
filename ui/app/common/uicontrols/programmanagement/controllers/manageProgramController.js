'use strict';

angular.module('bahmni.common.uicontrols.programmanagment')
    .controller('ManageProgramController', ['$scope', 'retrospectiveEntryService', '$window', 'programService',
        'spinner', 'messagingService', '$stateParams', '$q', 'confirmBox',
        function ($scope, retrospectiveEntryService, $window, programService,
                  spinner, messagingService, $stateParams, $q, confirmBox) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            $scope.programSelected = {};
            $scope.workflowStateSelected = {};
            $scope.allPrograms = [];
            $scope.programWorkflowStates = [];
            $scope.programEdited = {selectedState: ""};
            $scope.workflowStatesWithoutCurrentState = [];
            $scope.outComesForProgram = [];
            $scope.configName = $stateParams.configName;
            $scope.today = DateUtil.getDateWithoutTime(DateUtil.now());
            var id = "#programEnrollmentContainer";

            var updateActiveProgramsList = function () {
                spinner.forPromise(programService.getPatientPrograms($scope.patient.uuid).then(function (programs) {
                    $scope.activePrograms = programs.activePrograms;
                    $scope.activePrograms.showProgramSection = true;

                    $scope.endedPrograms = programs.endedPrograms;
                    $scope.endedPrograms.showProgramSection = true;
                }).then(function () {
                    formatProgramDates();
                }), id);
            };

            var formatProgramDates = function () {
                _.each($scope.activePrograms, function (activeProgram) {
                    activeProgram.fromDate = Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(activeProgram.dateEnrolled);
                    activeProgram.toDate = Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(activeProgram.dateCompleted);
                });
                _.each($scope.endedPrograms, function (endedProgram) {
                    endedProgram.fromDate = Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(endedProgram.dateEnrolled);
                    endedProgram.toDate = Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(endedProgram.dateCompleted);
                });
            };

            var getCurrentDate = function () {
                var retrospectiveDate = retrospectiveEntryService.getRetrospectiveDate();
                return DateUtil.parseLongDateToServerFormat(retrospectiveDate);
            };

            var init = function () {
                spinner.forPromise(programService.getAllPrograms().then(function (programs) {
                    $scope.allPrograms = programs;
                    $scope.allPrograms.showProgramSection = true;
                }), id);
                spinner.forPromise(programService.getProgramAttributeTypes().then(function (programAttributeTypes) {
                    $scope.programAttributeTypes = programAttributeTypes;
                }), id);
                $scope.programSelected = null;
                $scope.patientProgramAttributes = {};
                $scope.programEnrollmentDate = null;

                updateActiveProgramsList();
            };

            var successCallback = function () {
                messagingService.showMessage("info", "CLINICAL_SAVE_SUCCESS_MESSAGE_KEY");
                $scope.programEdited.selectedState = null;
                $scope.programSelected = null;
                $scope.workflowStateSelected = null;
                $scope.patientProgramAttributes = {};
                $scope.programEnrollmentDate = null;
                updateActiveProgramsList();
                if ($scope.patientProgram) {
                    $scope.patientProgram.editing = false;
                }
            };

            var failureCallback = function (error) {
                var fieldErrorMsg = findFieldErrorIfAny(error);
                var errorMsg = _.isUndefined(fieldErrorMsg) ? "Failed to Save" : fieldErrorMsg;
                messagingService.showMessage("error", errorMsg);
            };

            var findFieldErrorIfAny = function (error) {
                var stateFieldError = objectDeepFind(error, "data.error.fieldErrors.states");
                var errorField = stateFieldError && stateFieldError[0];
                return errorField && errorField.message;
            };

            var objectDeepFind = function (obj, path) {
                if (_.isUndefined(obj)) {
                    return undefined;
                }
                var paths = path.split('.'), current = obj, i;
                for (i = 0; i < paths.length; ++i) {
                    if (current[paths[i]] == undefined) {
                        return undefined;
                    } else {
                        current = current[paths[i]];
                    }
                }
                return current;
            };

            var isThePatientAlreadyEnrolled = function () {
                return _.map($scope.activePrograms, function (program) {
                    return program.program.uuid;
                }).indexOf($scope.programSelected.uuid) > -1;
            };

            var isProgramSelected = function () {
                return $scope.programSelected && $scope.programSelected.uuid;
            };

            $scope.hasPatientEnrolledToSomePrograms = function () {
                return !_.isEmpty($scope.activePrograms);
            };

            $scope.hasPatientAnyPastPrograms = function () {
                return !_.isEmpty($scope.endedPrograms);
            };

            $scope.enrollPatient = function () {
                if (!isProgramSelected()) {
                    messagingService.showMessage("error", "PROGRAM_MANAGEMENT_SELECT_PROGRAM_MESSAGE_KEY");
                    return $q.when({});
                }
                if (isThePatientAlreadyEnrolled()) {
                    messagingService.showMessage("error", "PROGRAM_MANAGEMENT_ALREADY_ENROLLED_PROGRAM_MESSAGE_KEY");
                    return $q.when({});
                }
                var stateUuid = $scope.workflowStateSelected && $scope.workflowStateSelected.uuid ? $scope.workflowStateSelected.uuid : null;
                return spinner.forPromise(
                    programService.enrollPatientToAProgram($scope.patient.uuid, $scope.programSelected.uuid, $scope.programEnrollmentDate, stateUuid, $scope.patientProgramAttributes, $scope.programAttributeTypes)
                        .then(successCallback, failureCallback)
                );
            };

            var isProgramStateSelected = function () {
                return objectDeepFind($scope, "programEdited.selectedState.uuid");
            };

            var isOutcomeSelected = function (patientProgram) {
                return !_.isEmpty(objectDeepFind(patientProgram, 'outcomeData.uuid'));
            };

            var getActiveState = function (states) {
                return _.find(states, function (state) {
                    return state.endDate == null && !state.voided;
                });
            };

            $scope.getWorkflowStatesWithoutCurrent = function (patientProgram) {
                var currentState = getActiveState(patientProgram.states);
                var states = getStates(patientProgram.program);
                if (currentState) {
                    states = _.reject(states, function (state) {
                        return state.uuid === currentState.state.uuid;
                    });
                }
                return states;
            };

            $scope.updatePatientProgram = function (patientProgram) {
                $scope.patientProgram = patientProgram;
                var activeState = getActiveState(patientProgram.states);
                var activeStateDate = activeState ? DateUtil.parse(activeState.startDate) : null;
                var dateCompleted = null;

                if (isProgramStateSelected()) {
                    var startDate = getCurrentDate();
                    if (activeState && DateUtil.isBeforeDate(startDate, activeStateDate)) {
                        messagingService.showMessage("error", "PROGRAM_MANAGEMENT_STATE_CANT_START_BEFORE_KEY" + " (" + DateUtil.formatDateWithoutTime(activeStateDate) + ")");
                        return;
                    }
                    if ($scope.programEdited.selectedState.uuid) {
                        patientProgram.states.push({
                            state: {
                                uuid: $scope.programEdited.selectedState.uuid
                            },
                            startDate: startDate
                        }
                        );
                    }
                }
                if (isOutcomeSelected(patientProgram)) {
                    dateCompleted = DateUtil.getDateWithoutTime(getCurrentDate());
                    if (activeState && DateUtil.isBeforeDate(dateCompleted, activeStateDate)) {
                        messagingService.showMessage("error", "PROGRAM_MANAGEMENT_PROGRAM_CANT_END_BEFORE_KEY" + " (" + DateUtil.formatDateWithoutTime(activeStateDate) + ")");
                        return;
                    }
                }
                spinner.forPromise(
                    programService.updatePatientProgram(patientProgram, $scope.programAttributeTypes, dateCompleted)
                        .then(successCallback, failureCallback)
                );
            };

            var voidPatientProgram = function (patientProgram, closeConfirmBox) {
                patientProgram.voided = true;
                var promise = programService.updatePatientProgram(patientProgram, $scope.programAttributeTypes)
                    .then(successCallback, failureCallback)
                    .then(closeConfirmBox);
                spinner.forPromise(promise);
            };

            var unVoidPatientProgram = function (patientProgram, closeConfirmBox) {
                delete patientProgram.voidReason;
                delete patientProgram.voided;
                patientProgram.deleting = false;
                closeConfirmBox();
            };

            $scope.confirmDeletion = function (patientProgram) {
                var scope = {};
                scope.message = 'Are you sure, you want to delete ' + patientProgram.display + '?';
                scope.cancel = _.partial(unVoidPatientProgram, patientProgram, _);
                scope.delete = _.partial(voidPatientProgram, patientProgram, _);
                confirmBox({
                    scope: scope,
                    actions: ['cancel', 'delete'],
                    className: "ngdialog-theme-default delete-program-popup"
                });
            };

            $scope.toggleDelete = function (program) {
                program.deleting = !program.deleting;
            };

            $scope.toggleEdit = function (program) {
                $scope.tempProgram = angular.copy(program);
                program.editing = !program.editing;
            };

            $scope.cancelChange = function (program) {
                program.patientProgramAttributes = $scope.tempProgram.patientProgramAttributes;
                program.editing = !program.editing;
            };

            $scope.setWorkflowStates = function (program) {
                $scope.programWorkflowStates = getStates(program);
            };

            var getStates = function (program) {
                var states = [];
                if (program && program.allWorkflows && program.allWorkflows.length && program.allWorkflows[0].states.length) {
                    states = program.allWorkflows[0].states;
                }
                return states;
            };
            var getActiveProgramStates = function (patientProgram) {
                return _.reject(patientProgram.states, function (st) { return st.voided; });
            };

            $scope.canRemovePatientState = function (state) {
                return state.endDate == null;
            };

            $scope.removePatientState = function (patientProgram) {
                var currProgramState = _.find(getActiveProgramStates(patientProgram), {endDate: null});
                var currProgramStateUuid = objectDeepFind(currProgramState, 'uuid');
                spinner.forPromise(
                    programService.deletePatientState(patientProgram.uuid, currProgramStateUuid)
                        .then(successCallback, failureCallback)
                );
            };

            $scope.hasStates = function (program) {
                return program && !_.isEmpty(program.allWorkflows) && !_.isEmpty($scope.programWorkflowStates);
            };

            $scope.hasProgramWorkflowStates = function (patientProgram) {
                return !_.isEmpty(getStates(patientProgram.program));
            };

            $scope.hasOutcomes = function (program) {
                return program.outcomesConcept && !_.isEmpty(program.outcomesConcept.setMembers);
            };

            $scope.getCurrentStateDisplayName = function (program) {
                var currentState = getActiveState(program.states);
                return _.get(currentState, 'state.concept.display');
            };

            $scope.getMaxAllowedDate = function (states) {
                var minStartDate = DateUtil.getDateWithoutTime(new Date());
                if (states && Array.isArray(states)) {
                    for (var stateIndex = 0; stateIndex < states.length; stateIndex++) {
                        if (states[stateIndex].startDate < minStartDate) {
                            minStartDate = states[stateIndex].startDate;
                        }
                    }
                }
                return minStartDate;
            };

            init();
        }
    ]);
