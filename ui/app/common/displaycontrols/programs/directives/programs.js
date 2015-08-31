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
                    $scope.activePrograms = [];
                    $scope.pastPrograms = [];
                    if (data.results) {
                        _.each(data.results, function (result) {
                            if (isActive(result)){
                                $scope.activePrograms.push(result);
                            }
                            else {
                                $scope.pastPrograms.push(result);
                            }
                        });
                    }
                    $scope.activePrograms =  _.sortBy($scope.activePrograms, function(program){
                        return moment(program.dateEnrolled)
                    }).reverse();
                    $scope.pastPrograms = _.sortBy($scope.pastPrograms, function(program){
                        return moment(program.dateCompleted)
                    }).reverse();
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
