angular.module('bahmni.clinical')
    .controller('ManageProgramController', ['$scope', '$bahmniCookieStore', '$window', 'programService', 'spinner', 'messagingService', 'ngDialog',
        function ($scope, $bahmniCookieStore, $window, programService, spinner, messagingService, ngDialog) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            $scope.programSelected = {};
            $scope.workflowStateSelected = {};
            $scope.allPrograms = [];
            $scope.programWorkflowStates = [];

            var updateActiveProgramsList = function () {
                programService.getActiveProgramsForAPatient($scope.patient.uuid).success(function (data) {
                    $scope.activePrograms = [];
                    $scope.endedPrograms = [];
                    if (data.results) {
                        _.forEach(data.results, function (result) {
                            if (result.dateCompleted) {
                                $scope.endedPrograms.push(result);
                            } else {
                                $scope.activePrograms.push(result);
                            }
                        })
                    }
                })
            };

            $scope.states= {
                data: [
                    {state: "Admitted", date: new Date(2015,1,1)},
                    {state: "Counselling", date: new Date(2015,2,6)},
                    {state: "Medication", date: new Date(2015,3,12)},
                    {state: "Counselling", date: new Date(2015,4,6)},
                    {state: "Curing", date: new Date(2015,6,6)}
                ],
                completed: false
            };

            var getCurrentDate = function() {
                var currentDate = $bahmniCookieStore.get(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName);
                return DateUtil.parse(currentDate || DateUtil.endOfToday());
            };

            var init = function () {
                $scope.programEnrollmentDate = getCurrentDate();
                programService.getAllPrograms().success(function (data) {
                    $scope.allPrograms = _.filter(data.results, function (program) {
                        return program.retired != true;
                    });
                });
                updateActiveProgramsList();
            };

            var successCallback = function (data) {
                messagingService.showMessage("info", "Saved");
                updateActiveProgramsList();
            };

            var failureCallback = function (error) {
                messagingService.showMessage("error", "Failed to Save");
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
                spinner.forPromise(
                    programService.enrollPatientToAProgram($scope.patient.uuid, $scope.programSelected.uuid, $scope.programEnrollmentDate)
                        .then(successCallback, failureCallback)
                );
            };
            $scope.popupHandler = function(program) {
                $scope.popUpData = {"programName" : program.display,
                    "patientProgramUuid" : program.uuid,
                    "enrollmentDate" : DateUtil.parse(program.dateEnrolled),
                    "endEnrollmentDate" : getCurrentDate(),
                    "outcome" : program.program.outcomesConcept ? program.program.outcomesConcept.setMembers : ''};

                $scope.dialog = ngDialog.open({ template: '../common/uicontrols/programmanagement/views/endPatientProgramPopUp.html', className: 'test ngdialog-theme-default end-program-dialog', scope: $scope});
            };

            $scope.savePopUpData = function() {
                spinner.forPromise(programService.endPatientProgram($scope.popUpData.patientProgramUuid,
                        $scope.popUpData.endEnrollmentDate, $scope.popUpData.outcomeData ? $scope.popUpData.outcomeData.uuid : null)
                ).then(function(){
                        ngDialog.close();
                        updateActiveProgramsList();
                    });
            };

            $scope.closePopUp = function() {
                ngDialog.close();
            };

            $scope.getWorkflowStates = function(program){
                $scope.programWorkflowStates = [];
                if(program && program.allWorkflows.length && program.allWorkflows[0].states.length) {
                    program.allWorkflows[0].states.forEach(function(state){
                        $scope.programWorkflowStates.push(state);
                    });
                }
            };

            init();
        }
    ]);