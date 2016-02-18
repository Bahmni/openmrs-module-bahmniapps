"use strict";

angular.module('bahmni.common.displaycontrol.admissiondetails')
    .directive('admissionDetails', ['bedService', 'visitService',function (bedService) {

        var controller = function($scope){
            if($scope.patientUuid) {
                bedService.getAssignedBedForPatient($scope.patientUuid).then(function(bedDetails){
                    $scope.bedDetails = bedDetails;
                })
            }

            $scope.showDetailsButton = function(encounter){
                return $scope.params && $scope.params.showDetailsButton && !encounter.notes
            };

            $scope.toggle= function(element){
                element.show = !element.show;
            };
        };
        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "../common/displaycontrols/admissiondetails/views/admissionDetails.html",
            scope: {
                params: "=",
                patientUuid: "=",
                visitSummary: "="
            }
        };
    }]);
