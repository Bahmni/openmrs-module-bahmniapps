"use strict";

angular.module('bahmni.common.displaycontrol.disposition')
    .directive('disposition', ['dispositionService','$q','spinner',
        function (dispositionService, $q ,spinner) {

            var controller = function($scope){


                var fetchDispositionByPatient = function(patientUuid, numOfVisits){
                    spinner.forPromise(dispositionService.getDispositionByPatient(patientUuid,numOfVisits))
                        .then(handleDispositionResponse);
                };

                var handleDispositionResponse = function(response){
                    $scope.dispositions = response.data;

                    if(_.isEmpty($scope.dispositions)){
                        $scope.noDispositionsMessage = Bahmni.Common.Constants.messageForNoDisposition;
                    }
                };

                var fetchDispositionsByVisit = function(visitUuid){
                    spinner.forPromise(dispositionService.getDispositionByVisit(visitUuid)).then(handleDispositionResponse);
                };

                $scope.getNotes = function(disposition){
                    if(disposition.additionalObs[0] && disposition.additionalObs[0].value){
                        return disposition.additionalObs[0].value;
                    }
                    return "";
                };

                $scope.showDetailsButton = function(disposition){
                    if($scope.getNotes(disposition)){
                        return false;
                    }
                    return $scope.params.showDetailsButton;
                };

                $scope.toggle= function(element){
                    if($scope.showDetailsButton(element)){
                        element.show = !element.show;
                    }else{
                        element.show = true;
                    }
                    return false;
                };

                if($scope.visitUuid){
                    fetchDispositionsByVisit($scope.visitUuid);
                }else if($scope.params.numberOfVisits && $scope.patientUuid){
                    fetchDispositionByPatient($scope.patientUuid, $scope.params.numberOfVisits);
                }

            };
            return {
                restrict:'E',
                controller:controller,
                templateUrl:"../common/displaycontrols/disposition/views/disposition.html",
                scope: {
                    params: "=",
                    patientUuid: "=",
                    visitUuid: "="
                }
            };
        }]);
