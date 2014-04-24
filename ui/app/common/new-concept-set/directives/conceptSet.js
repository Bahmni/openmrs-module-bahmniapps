'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('showPrimaryConcept', [function () {
        var controller = function ($scope, $q, $filter) {
            var conceptMapper = new Bahmni.ConceptSet.ConceptMapper();

            $scope.getPossibleAnswers = function () {
                return $scope.observation.possibleAnswers.map(conceptMapper.map);
            };

            $scope.getValues = function (request) {
                return $q.when({data: $filter('filter')($scope.getPossibleAnswers(), {name: request.term}) });
            };

            var getPropertyFunction = function (propertyName) {
                return function (entity) {
                    return entity[propertyName];
                }
            };

            $scope.selectOptions = {
                query: function (options) {
                    return options.callback({results: $filter('filter')($scope.getPossibleAnswers(), {name: options.term})});
                },
                width: '20em',
                allowClear: true,
                placeholder: 'Select',
                formatResult: getPropertyFunction('name'),
                formatSelection: getPropertyFunction('name'),
                id: getPropertyFunction('uuid')
            };
        };

        return {
            restrict: 'E',
            controller: controller,
            scope: {
                observation: "=",
                atLeastOneValueIsSet : "="
            },
            template: '<ng-include src="\'../common/concept-set/views/primaryObservation.html\'" />'
        }

    }]).directive('concept', [function () {
        return {
            restrict: 'E',
            scope: {
                observation: "=",
                atLeastOneValueIsSet : "="
            },
            template: '<ng-include src="\'../common/concept-set/views/observation.html\'" />'
        }
    }]).directive('conceptSet', ['contextChangeHandler', function (contextChangeHandler) {
        var template =
            '<form>' +
                '<concept observation="rootObservation" at-least-one-value-is-set="atLeastOneValueIsSet"></concept>' +
                '</form>';

        var controller = function ($scope, conceptSetService, appService) {
            var conceptSetName = $scope.conceptSetName;
            var conceptSetUIConfig = appService.getAppDescriptor().getConfig("conceptSetUI") || {};
            var observationMapper = new Bahmni.ConceptSet.ObservationMapper();
            conceptSetService.getConceptSetMembers({name: conceptSetName, v: "fullchildren"}).success(function (response) {
                var conceptSet = response.results[0];
                $scope.$watch('observations', function (observations) {
                    $scope.rootObservation = conceptSet ? observationMapper.map(observations, conceptSet, conceptSetUIConfig.value || {}) : null;
                    changeObservations();
                });
            });

            $scope.atLeastOneValueIsSet = false;

            var changeObservations = function () {
                for (var i = 0; i < $scope.observations.length; i++) {
                    if ($scope.observations[i].concept.uuid === $scope.rootObservation.concept.uuid) {
                        $scope.observations[i] = $scope.rootObservation;
                        return;
                    }
                }
                $scope.observations.push($scope.rootObservation);
            };

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
