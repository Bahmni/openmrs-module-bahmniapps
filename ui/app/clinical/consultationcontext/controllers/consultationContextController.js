'use strict';

angular.module('bahmni.clinical').controller('ConsultationContextController', ['$scope', '$bahmniCookieStore', 'programService', 'spinner', 'messagingService', 'ngDialog',
    function ($scope, $bahmniCookieStore, programService, spinner, messagingService, ngDialog) {
        var DateUtil = Bahmni.Common.Util.DateUtil;
        $scope.activePrograms = [];
        $scope.programSelected = {};
        $scope.allPrograms = [];

        var updateActiveProgramsList = function () {
            programService.getActiveProgramsForAPatient($scope.patient.uuid).success(function (data) {
                $scope.activePrograms = data.results;
            });
        };

        var setCurrentDate = function() {
            var currentDate = $bahmniCookieStore.get(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName);
            $scope.programEnrollmentDate = DateUtil.getDate(currentDate || DateUtil.now());
        };

        var init = function () {
            setCurrentDate();
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

        init();
    }
]);