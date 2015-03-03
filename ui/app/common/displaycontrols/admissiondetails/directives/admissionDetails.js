"use strict";

angular.module('bahmni.common.displaycontrol.admissiondetails')
    .directive('admissionDetails', ['bedService', 'visitService','$q','spinner',function (bedService, visitService, $q ,spinner) {

        var controller = function($scope){
            if($scope.visitUuid) {
                visitService.getVisitForAdmissionDetails($scope.visitUuid).success(function (visit) {
                    $scope.visit = new Bahmni.ADT.Visit(visit);
                    $scope.admissionEncounter = $scope.visit.getAdmissionEncounter();
                    $scope.dischargeEncounter = $scope.visit.getDischargeEncounter();
                });
            }

            if($scope.patientUuid) {
                bedService.getAssignedBedForPatient($scope.patientUuid).then(function(bedDetails){
                    $scope.bedDetails = bedDetails;
                })
            }
            
            $scope.getProviderDetails = function(encounter){
                return encounter && encounter.provider && encounter.provider.display || "";
            };

            $scope.getNotes = function(encounter){
                return null;
            };

            $scope.showDetailsButton = function(encounter){
                return $scope.params && $scope.params.showDetailsButton && !$scope.getNotes(encounter);
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
                visitUuid: "=",
                patientUuid: "="
            }
        };
    }]);
