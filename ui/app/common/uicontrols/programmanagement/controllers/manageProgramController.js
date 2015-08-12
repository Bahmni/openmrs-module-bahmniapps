angular.module('bahmni.common.uicontrols.programmanagment')
    .controller('ManageProgramController', ['$scope', '$bahmniCookieStore', '$window', 'programService', 'spinner', 'messagingService',
        function ($scope, $bahmniCookieStore, $window, programService, spinner, messagingService) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            $scope.programSelected = {};
            $scope.workflowStateSelected = {};
            $scope.allPrograms = [];
            $scope.programWorkflowStates = [];
            $scope.programEdited = {selectedState: ""};

            var updateActiveProgramsList = function () {
                $scope.programEdited = {selectedState: ""};
                spinner.forPromise(programService.getPatientPrograms($scope.patient.uuid).then(function (data) {
                    $scope.activePrograms = [];
                    $scope.endedPrograms = [];
                    if (data.data.results) {
                        _.forEach(data.data.results, function (result) {
                            if (result.dateCompleted) {
                                $scope.endedPrograms.push(result);
                            } else {
                                $scope.activePrograms.push(result);
                            }
                        })
                    }
                }))
            };

            var getCurrentDate = function() {
                var currentDate = $bahmniCookieStore.get(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName);
                return DateUtil.parse(currentDate || DateUtil.endOfToday());
            };

            var init = function () {
                $scope.programEnrollmentDate = getCurrentDate();
                spinner.forPromise(programService.getAllPrograms().then(function (data) {
                    $scope.allPrograms = _.filter(data.data.results, function (program) {
                        return program.retired != true;
                    });
                }));
                updateActiveProgramsList();
            };

            var successCallback = function (data) {
                messagingService.showMessage("info", "Saved");
                $scope.programSelected = null;
                $scope.workflowStateSelected = null;
                updateActiveProgramsList();
            };

            var failureCallback = function (error) {
                var fieldErrorMsg = findFieldErrorIfAny(error);
                var errorMsg  = _.isUndefined(fieldErrorMsg) ? "Failed to Save" : fieldErrorMsg;
                messagingService.showMessage("error", errorMsg);
            };

            var findFieldErrorIfAny = function(error) {
                var stateFieldError = objectDeepFind(error, "data.error.fieldErrors.states");
                var errorField = stateFieldError && stateFieldError[0];
                return errorField && errorField.message;
            };

            var objectDeepFind = function(obj, path) {
                if(_.isUndefined(obj)){
                    return undefined;
                }

                var paths = path.split('.')
                    , current = obj
                    , i;

                for (i = 0; i < paths.length; ++i) {
                    if (current[paths[i]] == undefined) {
                        return undefined;
                    } else {
                        current = current[paths[i]];
                    }
                }
                return current;
            };

            var isThePatientAlreadyEnrolled = function() {
                return _.pluck( $scope.activePrograms, function (program) {
                        return program.program.uuid
                    }).indexOf($scope.programSelected.uuid) > -1;
            };

            var isProgramSelected = function () {
                return $scope.programSelected && $scope.programSelected.uuid;
            };

            $scope.hasPatientEnrolledToSomePrograms = function(){
                return !_.isEmpty($scope.activePrograms);
            };
            $scope.hasPatientAnyPastPrograms = function(){
                return !_.isEmpty($scope.endedPrograms);
            };

            $scope.enrollPatient = function () {
                if(!isProgramSelected()){
                    messagingService.showMessage("formError", "Please select a Program to Enroll the patient");
                    return ;
                }
                if (isThePatientAlreadyEnrolled()) {
                    messagingService.showMessage("formError", "Patient already enrolled to the Program");
                    return ;
                }
                if(_.isEmpty($scope.workflowStateSelected)){
                    $scope.workflowStateSelected.uuid = null;
                }
                spinner.forPromise(
                    programService.enrollPatientToAProgram($scope.patient.uuid, $scope.programSelected.uuid, $scope.programEnrollmentDate,$scope.workflowStateSelected.uuid)
                        .then(successCallback, failureCallback)
                );
            };

            var isProgramStateSelected = function(){
                return objectDeepFind($scope, "programEdited.selectedState.uuid");
            };

            var isOutcomeSelected = function(patientProgram){
              return !_.isEmpty(objectDeepFind(patientProgram, 'outcomeData.uuid'));
            };

            var getCurrentState = function(patientProgram){
                return _.find(getActiveProgramStates(patientProgram), {endDate: null});
            };

            $scope.getWorkflowStatesWithoutCurrent = function(patientProgram){
                var currState = getCurrentState(patientProgram);
                var states = getStates(patientProgram.program);
                if(currState){
                    return _.reject(states, function(d){ return d.uuid == currState.state.uuid; });
                }
                return states;
            };

            $scope.savePatientProgram = function (patientProgram) {
                var startDate = getCurrentDate();
                var currentState = getCurrentState(patientProgram);
                var currentStateDate = currentState ? DateUtil.parse(currentState.startDate): null;

                if (DateUtil.isBeforeDate(startDate, currentStateDate)) {
                    var formattedCurrentStateDate = DateUtil.formatDateWithoutTime(currentStateDate);
                    messagingService.showMessage("formError", "State cannot be started earlier than current state (" + formattedCurrentStateDate + ")");
                    return;
                }

                if (!isProgramStateSelected()) {
                    messagingService.showMessage("formError", "Please select a state to change.");
                    return;
                }
                spinner.forPromise(
                    programService.savePatientProgram(patientProgram.uuid, $scope.programEdited.selectedState.uuid, startDate)
                        .then(successCallback, failureCallback)
                );
            };

            $scope.getOutcomes = function(program) {
                var currentProgram = _.findWhere($scope.allPrograms, {uuid: program.uuid});
                return currentProgram.outcomesConcept ? currentProgram.outcomesConcept.setMembers : '';
            };

            $scope.endPatientProgram = function(patientProgram) {
                var dateCompleted = getCurrentDate();
                var currentState = getCurrentState(patientProgram);
                var currentStateDate = currentState ? DateUtil.parse(currentState.startDate): null;


                if (currentState && DateUtil.isBeforeDate(dateCompleted, currentStateDate)) {
                    var formattedCurrentStateDate = DateUtil.formatDateWithoutTime(currentStateDate);
                    messagingService.showMessage("formError", "Program cannot be ended earlier than current state (" + formattedCurrentStateDate + ")");
                    return;
                }

                if(!isOutcomeSelected(patientProgram)){
                    messagingService.showMessage("formError", "Please select an outcome.");
                    return;
                }

                var outcomeConceptUuid = patientProgram.outcomeData ? patientProgram.outcomeData.uuid : null;
                spinner.forPromise(programService.endPatientProgram(patientProgram.uuid, dateCompleted, outcomeConceptUuid)
                    .then(function () {
                        messagingService.showMessage("info", "Program ended successfully");
                        updateActiveProgramsList();
                    }));
            };

            $scope.toggleEdit = function(program) {
                program.ending = false;
                program.editing = !program.editing;
            };

            $scope.toggleEnd = function(program) {
                program.editing = false;
                program.ending = !program.ending;
            };

            $scope.getCurrentStateDisplayName = function(patientProgram){
                var currState = getCurrentState(patientProgram);
                var displayName = objectDeepFind(currState, 'state.concept.display');
                return displayName || 'No state';
            };

            var getActiveProgramStates = function(patientProgram){
                return _.reject(patientProgram.states, function(st) {return st.voided});
            };

            $scope.canRemovePatientState = function(patientProgram){
                return (getActiveProgramStates(patientProgram).length > 0);
            };

            $scope.removePatientState = function(patientProgram){
                var currProgramState = getCurrentState(patientProgram);
                var currWorkflowStateUuid = objectDeepFind(currProgramState, 'state.uuid');
                var currProgramStateUuid = objectDeepFind(currProgramState, 'uuid');
                spinner.forPromise(
                    programService.deletePatientState(patientProgram.uuid, currProgramStateUuid)
                        .then(successCallback, failureCallback)
                );
            };

            $scope.getWorkflowStates = function(program){
                $scope.programWorkflowStates = getStates(program);
            };

            var getStates = function(program){
                var states = [];
                if(program && program.allWorkflows.length ) {
                    program.allWorkflows.forEach(function(workflow){
                        if(!workflow.retired && workflow.states.length)
                            workflow.states.forEach(function(state){
                                if(!state.retired)
                                    states.push(state);
                            });
                    });
                }
                return states;
            };

            $scope.hasStates = function(program){
                return program && !_.isEmpty(program.allWorkflows) && !_.isEmpty($scope.programWorkflowStates)
            };

            init();
        }
    ]);