angular.module('bahmni.common.displaycontrol.programs')
    .directive('programs', ['programService',
        function (programService) {
            'use strict';
            var controller = function ($scope) {
                programService.getPatientPrograms($scope.patient.uuid).then(function (patientPrograms) {
                    $scope.activePrograms = patientPrograms.activePrograms;
                    $scope.pastPrograms = patientPrograms.endedPrograms;
                });
                $scope.hasPatientAnyActivePrograms = function(){
                    return !_.isEmpty($scope.activePrograms);
                };
                $scope.hasPatientAnyPastPrograms = function(){
                    return !_.isEmpty($scope.pastPrograms);
                };
                $scope.hasPatientAnyPrograms = function(){
                    return $scope.hasPatientAnyPastPrograms() || $scope.hasPatientAnyActivePrograms();
                };
                $scope.showProgramStateInTimeline = function () {
                    return programService.getProgramStateConfig();
                };
                $scope.hasStates = function (program) {
                    return !_.isEmpty(program.states);
                };
            };
            return {
                restrict: 'E',
                controller: controller,
                templateUrl: "../common/displaycontrols/programs/views/programs.html",
                scope: {
                    patient: "="
                }
            }
        }]);
