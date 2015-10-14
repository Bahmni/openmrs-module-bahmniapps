'use strict';

angular.module('bahmni.common.displaycontrol.bacteriologyresults')
    .directive('bacteriologyResultsControl', ['bacteriologyResultsService', '$q','spinner', '$filter','$translate',
        function (bacteriologyResultsService, $q, spinner, $filter) {
            var controller = function($scope){

                var init = function () {
                    $scope.title = "bacteriology results";
                    var params = {
                        patientUuid:$scope.patient.uuid,
                        scope: $scope.scope,
                        numberOfVisits:2,
                        conceptNames:"BACTERIOLOGY CONCEPT SET",
                        includeObs:false
                    };
                    return bacteriologyResultsService.getBacteriologyResults(params).then(function (response) {
                        handleResponse(response);
                    });
                };

                var handleResponse = function(response){
                    var observations = response.data;
                    if(observations && observations.length > 0){
                        $scope.specimens = [];

                        _.forEach(observations, function(observation){
                            var specimen = {};
                            _.forEach(observation.groupMembers,function(testObs){
                                if(testObs.concept && testObs.concept.name === "Bacteriology Results"){
                                    specimen.sampleResult = [testObs];
                                }
                                if(testObs.concept && testObs.concept.name === "Specimen Sample Source"){
                                    specimen.specimenSource = testObs.valueAsString;
                                }
                                if(testObs.concept && testObs.concept.name === "Specimen Id"){
                                    specimen.specimenId= testObs.valueAsString;
                                }
                                if(testObs.concept && testObs.concept.name === "Specimen Collection Date"){
                                    specimen.specimenCollectionDate = testObs.valueAsString;
                                }

                            });
                            $scope.specimens.push(specimen);
                        });
                    }

                    if (_.isEmpty(observations)) {
                        $scope.noObservationsMessage = $scope.section.translationKey;
                    }
                };

                spinner.forPromise(init());
            };
            return {
                restrict:'E',
                controller: controller,
                templateUrl:"../common/displaycontrols/bacteriologyresults/views/bacteriologyResultsControl.html",
                scope:{
                    patient:"=",
                    section:"=",
                    observationUuid:"=",
                    config:"=",
                    isOnDashboard:"=",
                    visitUuid:"="
                }
            }
        }]);
