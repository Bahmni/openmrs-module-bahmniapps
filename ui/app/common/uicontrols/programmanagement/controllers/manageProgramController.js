'use strict';

angular.module('bahmni.common.uicontrols.programmanagment')
    .controller('ManageProgramController', ['$scope', 'retrospectiveEntryService', '$window', 'programService',
        'spinner', 'messagingService', '$stateParams', '$q', 'confirmBox', '$state',
        function ($scope, retrospectiveEntryService, $window, programService,
            spinner, messagingService, $stateParams, $q, confirmBox, $state) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            $scope.programSelected = {};
            $scope.workflowStateSelected = {};
            $scope.allPrograms = [];
            $scope.programWorkflowStates = [];
            $scope.workflowStatesWithoutCurrentState = [];
            $scope.outComesForProgram = [];
            $scope.configName = $stateParams.configName;
            $scope.today = DateUtil.getDateWithoutTime(DateUtil.now());
            var id = "#programEnrollmentContainer";
            const defaultProgram = programService.getDefaultProgram();
            const programRedirectionConfig = programService.getProgramRedirectionConfig();

            $scope.observationFormData = {
                patientUuid: $scope.patient.uuid,
                showEditForActiveEncounter: programService.getObservationFormsConfig().showEditForActiveEncounter || true,
                numberOfVisits: programService.getObservationFormsConfig().numberOfVisits || 10,
                hasNoHierarchy: $scope.hasNoHierarchy
            };

            var updateActiveProgramsList = function () {
                spinner.forPromise(programService.getPatientPrograms($scope.patient.uuid).then(function (programs) {
                    $scope.activePrograms = programs.activePrograms;
                    _.each($scope.activePrograms, function (patientProgram) {
                        populateDefaultSelectedState(patientProgram);
                    });
                    $scope.activePrograms.showProgramSection = true;

                    $scope.endedPrograms = programs.endedPrograms;
                    $scope.endedPrograms.showProgramSection = true;
                }).then(function () {
                    formatProgramDates();
                }), id);
            };

            var populateDefaultSelectedState = function (patientProgram) {
                var activePatientProgramState = getActivePatientProgramState(patientProgram.states);
                patientProgram.selectedState = activePatientProgramState ? activePatientProgramState.state : null;
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
                    setDefaultProgram();
                    $scope.programSelected = defaultProgram !== null ? $scope.initialProgram : null;
                    $scope.workflowStateSelected = defaultProgram !== null ? $scope.initialProgramWorkflowState : null;
                }), id);
                spinner.forPromise(programService.getProgramAttributeTypes().then(function (programAttributeTypes) {
                    $scope.programAttributeTypes = programAttributeTypes;
                }), id);
                $scope.patientProgramAttributes = {};
                $scope.programEnrollmentDate = new Date($scope.today + ".00:00:00");
                $scope.disableProgramOutcome = programService.disableProgramOutcome();
                updateActiveProgramsList();
            };

            var successCallback = function () {
                messagingService.showMessage("info", "CLINICAL_SAVE_SUCCESS_MESSAGE_KEY");
                $scope.programSelected = defaultProgram !== null ? $scope.initialProgram : null;
                $scope.programSelected != null && $scope.setWorkflowStates($scope.programSelected);
                $scope.workflowStateSelected = defaultProgram !== null ? $scope.initialProgramWorkflowState : null;
                $scope.patientProgramAttributes = {};
                $scope.programEnrollmentDate = new Date($scope.today + ".00:00:00");
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

            var isProgramStateChanged = function (patientProgram, activePatientProgramState) {
                if (_.isEmpty(activePatientProgramState) && patientProgram.selectedState != undefined) {
                    return true;
                }
                return patientProgram.selectedState
                    && (patientProgram.selectedState.uuid != activePatientProgramState.state.uuid);
            };

            var isOutcomeSelected = function (patientProgram) {
                return !_.isEmpty(objectDeepFind(patientProgram, 'outcomeData.uuid'));
            };

            var getActivePatientProgramState = function (states) {
                return _.find(states, function (state) {
                    return state.endDate == null && !state.voided;
                });
            };

            $scope.updatePatientProgram = function (patientProgram) {
                $scope.patientProgram = patientProgram;
                var activePatientProgramState = getActivePatientProgramState(patientProgram.states);
                var activeStateDate = activePatientProgramState ? DateUtil.parse(activePatientProgramState.startDate) : null;
                var dateCompleted = null;

                if (isProgramStateChanged(patientProgram, activePatientProgramState)) {
                    var startDate = getCurrentDate();
                    if (activePatientProgramState && DateUtil.isBeforeDate(startDate, activeStateDate)) {
                        messagingService.showMessage("error", "PROGRAM_MANAGEMENT_STATE_CANT_START_BEFORE_KEY"
                            + " (" + DateUtil.formatDateWithoutTime(activeStateDate) + ")");
                        return;
                    }
                    patientProgram.states.push({
                        state: {
                            uuid: patientProgram.selectedState.uuid
                        },
                        startDate: startDate
                    });
                }
                if (isOutcomeSelected(patientProgram)) {
                    dateCompleted = DateUtil.getDateWithoutTime(getCurrentDate());
                    if (activePatientProgramState && DateUtil.isBeforeDate(dateCompleted, activeStateDate)) {
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
                    actions: [{ name: 'cancel', display: 'cancel' }, { name: 'delete', display: 'delete' }],
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
                populateDefaultSelectedState(program);
                program.patientProgramAttributes = $scope.tempProgram.patientProgramAttributes;
                program.editing = !program.editing;
            };

            $scope.setWorkflowStates = function (program) {
                $scope.patientProgramAttributes = {};
                $scope.programWorkflowStates = $scope.getStates(program);
            };

            var setDefaultProgram = function () {
                if (defaultProgram !== null) {
                    const initialProgram = $scope.allPrograms.filter(function (program) {
                        if (program.name === defaultProgram.programName) {
                            return program;
                        }
                    });
                    $scope.initialProgram = initialProgram.length > 0 ? initialProgram[0] : "";
                    $scope.setWorkflowStates($scope.initialProgram);
                    const initialProgramWorkflowState = $scope.programWorkflowStates.filter(function (state) {
                        if (state.concept.display === defaultProgram.stateName) {
                            return state;
                        }
                    });
                    $scope.initialProgramWorkflowState = initialProgramWorkflowState.length > 0 ? initialProgramWorkflowState[0] : "";
                }
            };

            $scope.getStates = function (program) {
                var states = [];
                if (program && program.allWorkflows && program.allWorkflows.length && program.allWorkflows[0].states.length) {
                    states = program.allWorkflows[0].states;
                }
                return states;
            };

            $scope.canRemovePatientState = function (state) {
                return state.endDate == null;
            };

            $scope.openPatientObservations = function () {
                const redirectionPoint = programRedirectionConfig ? programRedirectionConfig.redirectionPoint : "patient.dashboard.show";
                const url = $state.href(redirectionPoint, {
                    patientUuid: $scope.patient.uuid,
                    programUuid: $scope.patientProgram && $scope.patientProgram.program && $scope.patientProgram.program.uuid,
                    conceptSetGroupName: 'observations',
                    dateEnrolled: $scope.patientProgram && $scope.patientProgram.fromDate,
                    dateCompleted: $scope.patientProgram && $scope.patientProgram.toDate,
                    enrollment: $scope.patientProgram && $scope.patientProgram.uuid
                });
                programRedirectionConfig && programRedirectionConfig.newTab ? $window.open(url, '_blank') : $window.open(url, '_self');
            };

            $scope.removePatientState = function (patientProgram) {
                var currProgramState = getActivePatientProgramState(patientProgram.states);
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
                return !_.isEmpty($scope.getStates(patientProgram.program));
            };

            $scope.hasOutcomes = function (program) {
                return program.outcomesConcept && !_.isEmpty(program.outcomesConcept.setMembers);
            };

            $scope.getCurrentStateDisplayName = function (program) {
                var currentState = getActivePatientProgramState(program.states);
                return _.get(currentState, 'state.concept.display');
            };

            $scope.getMaxAllowedDate = function (states) {
                var minStartDate = DateUtil.getDateWithoutTime(new Date());
                if (states && angular.isArray(states)) {
                    for (var stateIndex = 0; stateIndex < states.length; stateIndex++) {
                        if (states[stateIndex].startDate < minStartDate) {
                            minStartDate = states[stateIndex].startDate;
                        }
                    }
                }
                return minStartDate;
            };

            $scope.isIncluded = function (attribute) {
                return !($scope.programSelected && _.includes(attribute.excludeFrom, $scope.programSelected.name));
            };

            init();
        }
    ]);
