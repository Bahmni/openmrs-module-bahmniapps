'use strict';

angular.module('bahmni.common.conceptSet')
   .directive('conceptSet', ['contextChangeHandler', 'spinner', function (contextChangeHandler, spinner) {
        var template =
            '<form>' +
                '<div class="illegalValue" ng-if="!conceptSet">Concept "{{ conceptSetName }}" does not exist. Please contact "ADMIN".</div>' +
                '<concept ng-if="conceptSet" node="rootNode" at-least-one-value-is-set="atLeastOneValueIsSet"></concept>' +
            '</form>';

        var controller = function ($scope, conceptSetService, conceptSetUiConfigService, $rootScope, $q) {
            var conceptSetName = $scope.conceptSetName;
            var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
            var conceptSetPromise = conceptSetService.getConceptSetMembers({name: conceptSetName, v: "fullchildren"});
            var xCompoundConceptPromise = conceptSetService.getConceptSetMembers({name: Bahmni.Common.Constants.compoundObservationConceptName, v: "full"});

            $scope.atLeastOneValueIsSet = false;

            var promises = [conceptSetPromise, xCompoundConceptPromise];

            spinner.forPromise($q.all(promises).then(function(responses) {
                var xCompoundConcept = responses[1].data.results[0];
                $scope.conceptSet = responses[0].data.results[0];
                if($scope.conceptSet) {
                    var mapper = new Bahmni.ConceptSet.CompundObservationNodeMapper(conceptSetUIConfig.value || {}, xCompoundConcept);
                    $scope.rootNode = mapper.map($scope.observations, $scope.conceptSet);
                }
                updateObservations();
            }));

            var updateObservations = function() {
                if(!$scope.rootNode) return;
                for (var i = 0; i < $scope.observations.length; i++) {
                    var primaryObservation = getPrimaryObservation($scope.observations[i]);
                    if(primaryObservation && primaryObservation.concept.uuid === $scope.rootNode.primaryObservation.concept.uuid) {
                        $scope.observations[i] = $scope.rootNode.compoundObservation;
                        return;
                    }
                }
                $scope.observations.push($scope.rootNode.compoundObservation);
            };

            var getPrimaryObservation = function(observation){
                if(observation.concept.name === Bahmni.Common.Constants.compoundObservationConceptName) {
                    return observation.groupMembers.filter(function(memberObs){
                        return memberObs.concept.name !== Bahmni.Common.Constants.abnormalObservationConceptName;
                    })[0];
                } else {
                    return observation;
                }
            }

            var allowContextChange = function () {
                $scope.atLeastOneValueIsSet = $scope.rootNode && $scope.rootNode.atLeastOneValueSet();
                var invalidNodes = $scope.rootNode && $scope.rootNode.children.filter(function(childNode){
                    return !childNode.isValid($scope.atLeastOneValueIsSet);
                });
                return !invalidNodes || invalidNodes.length === 0;
            };

            contextChangeHandler.add(allowContextChange);
        };

        return {
            restrict: 'E',
            scope: {
                conceptSetName: "=",
                observations: "="
            },
            template: template,
            controller: controller
        }
    }]);
