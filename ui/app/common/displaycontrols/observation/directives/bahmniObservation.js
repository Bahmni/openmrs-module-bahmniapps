'use strict';

angular.module('bahmni.common.displaycontrol.observation')
    .directive('bahmniObservation', ['observationsService', 'appService', '$q','spinner',
        function (observationsService, appService, $q, spinner) {
            
            var controller = function($scope){

                var mapObservation = function(response,config){
                    var observationFilter = new Bahmni.Common.DisplayControl.Observation.Filters(config.obsIgnoreList);
                    var observations = observationFilter.removeObsWithOrder(observationFilter.removeUnwantedObs(response.data));
                    var conceptsConfig = appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
                    observations = new Bahmni.Common.Obs.ObservationMapper().map(observations, conceptsConfig);

                    $scope.bahmniObservations = new Bahmni.Common.DisplayControl.Observation.GroupingFunctions().groupByEncounterDate(observations);
                    if (_.isEmpty($scope.bahmniObservations)) {
                        $scope.noObsMessage = Bahmni.Common.Constants.messageForNoObservation;
                    }
                    else{
                        $scope.bahmniObservations[0].isOpen = true;
                    }
                };

                var fetchObservations = function () {
                    spinner.forPromise(observationsService.fetch($scope.patient.uuid,$scope.config.conceptNames,$scope.config.scope,$scope.config.numberOfVisits,$scope.visitUuid).then(function (response) {
                            mapObservation(response,$scope.config);
                        }));
                };

                $scope.toggle= function(element){
                    element.isOpen = !element.isOpen;
                };

                $scope.isClickable= function(){
                    return $scope.isOnDashboard && $scope.section.allObservationDetails &&
                        ($scope.section.allObservationDetails.pivotTable || $scope.section.allObservationDetails.observationGraph);
                };

                fetchObservations();


                $scope.dialogData = {
                    "patient": $scope.patient,
                    "section": $scope.section
                };
                

            };
            return {
                restrict:'E',
                controller:controller,
                templateUrl:"../common/displaycontrols/observation/views/observationDisplayControl.html",
                scope:{
                    patient:"=",
                    visitUuid:"@",
                    section:"=",
                    config:"=",
                    title:"=sectionTitle",
                    isOnDashboard:"="
                }
            }
    }]);
