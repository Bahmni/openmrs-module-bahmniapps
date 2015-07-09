angular.module('bahmni.common.displaycontrol.programs')
    .directive('programs', ['programService',
        function (programService) {
            'use strict';
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var isActive = function(date){
                if(date == null){
                    return true;
                }
                var dateCompletedWithoutTime = DateUtil.getDateWithoutTime(date);
                var todayWithoutTime = DateUtil.getDateWithoutTime(DateUtil.now());
                return dateCompletedWithoutTime >= todayWithoutTime;
            };
            var controller = function ($scope) {
                programService.getActiveProgramsForAPatient($scope.patient.uuid).success(function (data) {
                    $scope.activePrograms = [];
                    $scope.pastPrograms = [];
                    if (data.results) {
                        _.each(data.results, function (result) {
                            if (isActive(result.dateCompleted)){
                                $scope.activePrograms.push(result);
                            }
                            else {
                                $scope.pastPrograms.push(result);
                            }
                        });
                    }
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
