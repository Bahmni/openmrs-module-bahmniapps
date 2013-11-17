'use strict';

angular.module('opd.conceptSet')
    .directive('showConcept', ['$rootScope', function (rootScope) {
            return {
            restrict: 'E',
            scope: {
                conceptObsMap: "=",
                displayType: "@",
                concept: "=",
                emptyObsCheck: "@"
            },
            template: '<ng-include src="\'modules/concept-set/views/concept.html\'" />'
        }
    }]).directive('showConceptSet', ['$rootScope', function ($rootScope) {
        var template =
            '<form ng-init="getConceptSet()">' +
                '<div ng-repeat="concept in conceptSet.setMembers" >' +
                '<show-concept display-type="{{displayType}}" empty-obs-check="{{emptyObsCheck}}" concept-obs-map="$parent.conceptToObservationMap" concept="concept" ></show-concept>' +
                '</div>' +
                '</form>';

        var controller = function ($scope, $routeParams, ConceptSetService) {
            var conceptSetName = $scope.conceptSetName || $routeParams.conceptSetName;
            var observationList = $rootScope.observationList || {};

            var cachedConceptSet = observationList[conceptSetName] || {};

            $scope.getConceptSet = function () {
                if (cachedConceptSet.observations) {
                    $scope.conceptSet = cachedConceptSet.conceptSet;
                    $scope.conceptToObservationMap = cachedConceptSet.conceptToObservationMap;
                } else {
                    ConceptSetService.getConceptSetMembers(conceptSetName).success(function (response) {
                        if (response.results && response.results.length > 0) {
                            $scope.conceptSet = response.results[0];
                            $scope.conceptToObservationMap =
                                new Bahmni.Opd.ObservationMapper($rootScope.encounterConfig).map($rootScope.visit, response.results[0].setMembers);
                        }
                    });
                }
            };

            var constructObservationList = function () {
                var obsList = [];
                for (var conceptUuid in $scope.conceptToObservationMap) {
                    if ($scope.conceptToObservationMap[conceptUuid].value) {
                        obsList.push($scope.conceptToObservationMap[conceptUuid]);
                    }
                }
                return obsList;
            };

            var constructGroupedObservations = function (observations) {
                return new Bahmni.Opd.GroupedObservationMapper($rootScope.encounterConfig)
                    .map($rootScope.visit, $scope.conceptSet, observations);
            };

          /*  // this is needed so that we can display the label of the coded concept and not the concept Uuid
            var conceptToObservationMapWithValueDesc = function(){
                for(var conceptUuid in $scope.conceptToObservationMap) {
                    if($scope.conceptToObservationMap[conceptUuid].value)
                }
            }*/

            $scope.$on('$destroy', function () {
                $rootScope.observationList = $rootScope.observationList || {};
                var observations = constructObservationList();
                var groupedObservations = constructGroupedObservations(observations);
                $rootScope.observationList[conceptSetName] = {
                    conceptSet: $scope.conceptSet,
                    conceptName: conceptSetName,
                    observations: observations,
                    conceptToObservationMap: $scope.conceptToObservationMap,
                    groupedObservations: groupedObservations
                };
            });
        };

        return {
            restrict: 'E',
            scope: {
                displayType: "@",
                emptyObsCheck: "@",
                conceptSetName: "="
            },
            template: template,
            controller: controller

        }
    }]);

