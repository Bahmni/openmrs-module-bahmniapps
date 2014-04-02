'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('showConcept', [function() {
        var controller = function($scope, $q, $filter) {
            var conceptMapper = new Bahmni.ConceptSet.ConceptMapper();
            $scope.getPossibleAnswers = function() {
                return $scope.node.getPossibleAnswers().map(conceptMapper.map);
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
                node: "=",
                atLeastOneValueIsSet : "="
            },
            controller: controller,
            template: '<ng-include src="\'../common/concept-set/views/observation.html\'" />'
        }
    }]).directive('showConceptSet', ['contextChangeHandler', function (contextChangeHandler) {
        var template =
            '<form>' +
                '<show-concept node="rootNode" at-least-one-value-is-set="atLeastOneValueIsSet"></show-concept>' +
            '</form>';

        var controller = function ($scope, conceptSetService, conceptSetUiConfigService, $rootScope, $q) {
            var conceptSetName = $scope.conceptSetName;
            var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
            var conceptSetPromise = conceptSetService.getConceptSetMembers({name: conceptSetName, v: "fullchildren"});
            var xCompoundConceptPromise = conceptSetService.getConceptSetMembers({name: 'XCompoundObservation', v: "full"});

            $scope.atLeastOneValueIsSet = false;
            
            var promises = [conceptSetPromise, xCompoundConceptPromise];

            $q.all(promises).then(function(responses) {
                var xCompoundConcept = responses[1].data.results[0];
                var conceptSet = responses[0].data.results[0];                
                if(conceptSet) {
                    var mapper = new Bahmni.ConceptSet.ObservationMapper(conceptSetUIConfig.value || {}, xCompoundConcept);
                    $scope.rootNode = mapper.map($scope.observations, conceptSet)        
                }
                updateObservations();
            });

            var updateObservations = function() {
                if(!$scope.rootNode) return;
                for (var i = 0; i < $scope.observations.length; i++) {
                    if(getValueObservation($scope.observations[i]).concept.uuid === $scope.rootNode.primaryObservation.concept.uuid) {
                        $scope.observations[i] = $scope.rootNode.compoundObservation;
                        return;
                    }
                }
                $scope.observations.push($scope.rootNode.compoundObservation);
            };

            //TODO: Extract constants
            var getValueObservation = function(observation){
                if(observation.concept.name === 'XCompoundObservation') {
                    return observation.groupMembers.filter(function(memberObs){
                        return memberObs.concept.name !== 'IS_ABNORMAL'
                    })[0];
                } else {
                    return observation;
                }
            }

            var allowContextChange = function () {
                var invalidNodes = $scope.rootNode.children.filter(function(childNode){
                    $scope.atLeastOneValueIsSet = childNode.atLeastOneValueSet();
                    return !childNode.isValid($scope.atLeastOneValueIsSet);
                });
                return invalidNodes.length === 0;
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
            attributes['type'] = attributesMap[$scope.obs.dataTypeName] || "text";
            if (obs.hiAbsolute) {
                attributes['max'] = $scope.obs.hiAbsolute;
            }
            if (obs.lowAbsolute) {
                attributes['min'] = $scope.obs.lowAbsolute;
            }
            if (obs.lowAbsolute && obs.hiAbsolute) {
                attributes['title'] = "Valid from " + $scope.obs.lowAbsolute +" to "+ $scope.obs.hiAbsolute;
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
