'use strict';

angular.module('bahmni.clinical')
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
                        $scope.noDispositionsMessage = Bahmni.Clinical.Constants.messageForNoDisposition;
                    }
                };

                var fetchDispositionsByVisit = function(visitUuid){
                    spinner.forPromise(dispositionService.getDispositionByVisit(visitUuid)).then(handleDispositionResponse);
                };

                $scope.toggle= function(element){
                    element.show = !element.show;
                };

                if($scope.params.visitUuid){
                    fetchDispositionsByVisit($scope.params.visitUuid);
                }else if($scope.params.numberOfVisits && $scope.patientUuid){
                    fetchDispositionByPatient($scope.patientUuid, $scope.params.numberOfVisits);
                }

            };
            return {
                restrict:'E',
                controller:controller,
                templateUrl:"displaycontrols/disposition/views/disposition.html",
                scope: {
                    params: "=",
                    patientUuid: "="
                }
            }
        }]);
