angular.module('bahmni.common.displaycontrol.programs')
    .directive('programs', ['programService',
        function (programService) {
            'use strict';
            var DateUtil = Bahmni.Common.Util.DateUtil;

            var isActive = function(patientProgram){
                return patientProgram.dateCompleted == null;
            };

            var controller = function ($scope) {
                programService.getPatientPrograms($scope.patient.uuid).success(function (data) {
                    var groupedPrograms = _.groupBy(data.results,isActive);
                    $scope.activePrograms =  _.sortBy(groupedPrograms.true, "dateEnrolled").reverse();
                    $scope.pastPrograms = _.sortBy(groupedPrograms.false, "dateCompleted").reverse();
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
