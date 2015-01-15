'use strict';

angular.module('bahmni.clinical')
    .directive('bahmniObservation', ['observationsService', '$q','spinner', 'clinicalAppConfigService',
        function (observationsService, $q, spinner, clinicalAppConfigService) {

            var controller = function($scope){

                var mapObservation = function(response,config){
                    var observationFilter = new Bahmni.Clinical.ObservationFilters(config.obsIgnoreList);
                    var observations =response.data.filter(observationFilter.doesNotHaveOrder).filter(observationFilter.removeUnwantedObs);
                    observations = new Bahmni.Common.Obs.ObservationMapper().map(observations, clinicalAppConfigService.getAllConceptsConfig());

                    $scope.bahmniObservations = new Bahmni.Clinical.DisplayControl.GroupingFunctions().groupByEncounterDate(observations);
                    if (_.isEmpty($scope.bahmniObservations)) {
                        $scope.noObsMessage = Bahmni.Clinical.Constants.messageForNoObservation;
                    }
                    else{
                        $scope.bahmniObservations[0].isOpen = true;
                    }
                };

                var fetchObservations = function () {
                    spinner.forPromise(observationsService.fetch($scope.patientUuid,$scope.config.conceptNames,$scope.config.scope,$scope.config.numberOfVisits,$scope.visitUuid).then(function (response) {
                            mapObservation(response,$scope.config);
                        }));
                };

                $scope.toggle= function(element){
                    element.isOpen = !element.isOpen;
                };

                fetchObservations();
            };
            return {
                restrict:'E',
                controller:controller,
                templateUrl:"displaycontrols/observation/views/observationSection.html",
                scope:{
                    patientUuid:"=",
                    visitUuid : "@",
                    config : "=",
                    title:"="
                }
            }
    }]);
