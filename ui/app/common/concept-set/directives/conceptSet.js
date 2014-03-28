'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('showConcept', [function() {
        var controller = function($scope, $q, $filter) {
            var conceptMapper = new Bahmni.ConceptSet.ConceptMapper();
            $scope.getPossibleAnswers = function() {
                return $scope.observation.getPossibleAnswers().map(conceptMapper.map);
            };

            var getPropertyFunction = function(propertyName) {
                return function(entity) {
                    return entity[propertyName];
                }
            };

            $scope.selectOptions = {
                query: function(options) {
                    return options.callback({results:  $filter('filter')($scope.getPossibleAnswers(), {name: options.term})});
                },
                width: '20em',
                allowClear: true,
                placeholder: 'Select',
                formatResult: getPropertyFunction('name'),
                formatSelection: getPropertyFunction('name'),
                id: getPropertyFunction('uuid')
            };

            $scope.getValues = function(request) {
                return $q.when({data: $filter('filter')($scope.getPossibleAnswers(), {name: request.term}) });
            };
        }

        return {
            restrict: 'E',
            scope: {
                observation: "=",
                atLeastOneValueIsSet : "="
            },
            controller: controller,
            template: '<ng-include src="\'../common/concept-set/views/observation.html\'" />'
        }
    }]).directive('showConceptSet', ['contextChangeHandler', function (contextChangeHandler) {
        var template =
            '<form>' +
                '<show-concept observation="rootObservation" at-least-one-value-is-set="atLeastOneValueIsSet"></show-concept>' +
            '</form>';

        var controller = function ($scope, conceptSetService, conceptSetUiConfigService, $rootScope, $q) {
            var conceptSetName = $scope.conceptSetName;
            var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
            var conceptSetPromise = conceptSetService.getConceptSetMembers(
                                        {name: conceptSetName, v: "fullchildren"});
            var xCompoundObservationPromise = conceptSetService.getConceptSetMembers({name: 'XCompoundObservation', v: "full"});

            $scope.atLeastOneValueIsSet = false;
            
            var promises = [conceptSetPromise, xCompoundObservationPromise];
            $q.all(promises).then(function(responses) {
                var xCompoundObservation = responses[1].data.results[0];
                var conceptSet = responses[0].data.results[0];
                $scope.rootObservation = conceptSet ? new Bahmni.ConceptSet.ObservationMapper(conceptSetUIConfig.value || {}, xCompoundObservation).map($scope.observations, conceptSet) : null;
            });

            var updateObservations = function() {
                if(!$scope.rootObservation) return;
                for (var i = 0; i < $scope.observations.length; i++) {
                    if($scope.observations[i].concept.uuid === $scope.rootObservation.concept.uuid) {
                        $scope.observations[i] = $scope.rootObservation;
                        return;
                    }
                }
                $scope.observations.push($scope.rootObservation);
            };

            var allowContextChange = function () {
                updateObservations();
                var invalidObservations = $scope.observations.filter(function(observation){
                    $scope.atLeastOneValueIsSet = observation.atLeastOneValueSet();
                    return !observation.isValid($scope.atLeastOneValueIsSet);
                });
                return invalidObservations.length === 0;
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
    }]).directive('addObsConstraints', function () {
        var attributesMap = {'Numeric': 'number', 'Date': 'date'};
        var link = function ($scope, element, attrs, ctrl) {
            var attributes = {};
            var obs = $scope.obs;
            attributes['type'] = attributesMap[$scope.obs.getDataTypeName()] || "text";
            if (obs.getHighAbsolute()) {
                attributes['max'] = $scope.obs.getHighAbsolute();
            }
            if (obs.getLowAbsolute()) {
                attributes['min'] = $scope.obs.getLowAbsolute();
            }
            if (obs.getLowAbsolute() && obs.getHighAbsolute()) {
                attributes['title'] = "Valid from " + $scope.obs.getLowAbsolute() +" to "+ $scope.obs.getHighAbsolute();
            }
            element.attr(attributes);
        };

        return {
            link: link,
            scope: {
                obs: '='
            },
            require: 'ngModel'
        }
    });
