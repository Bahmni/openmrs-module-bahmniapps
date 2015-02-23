"use strict";

angular.module('bahmni.common.displaycontrol.admissiondetails')
    .directive('admissionDetails', ['visitService','$q','spinner',function (visitService, $q ,spinner) {

        var controller = function($scope){
            if($scope.visitUuid) {
                visitService.getVisitForAdmissionDetails($scope.visitUuid).success(function (visit) {
                    $scope.visit = new Bahmni.ADT.Visit(visit);
                    $scope.admissionEncounter = $scope.visit.getAdmissionEncounter();
                    $scope.dischargeEncounter = $scope.visit.getDischargeEncounter();
                });
            }
            
            $scope.getProviderDetails = function(encounter){
                if(encounter && encounter.creator && encounter.creator.display){
                    return encounter.creator.display;
                }
                return "";
            };

            $scope.getNotes = function(encounter){
                return " ";
            };

            $scope.showDetailsButton = function(encounter){
                return $scope.params && $scope.params.showDetailsButton;
            };

            $scope.toggle= function(element){
                if($scope.showDetailsButton(element)){
                    element.show = !element.show;
                }else{
                    element.show = true;
                }
                return false;
            };
        };
        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "../common/displaycontrols/admissiondetails/views/admissionDetails.html",
            scope: {
                params: "=",
                visitUuid: "="
            }
        };
    }]);
