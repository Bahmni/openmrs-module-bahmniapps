'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('concept', [function () {
        var controller = function ($scope, $q, $filter) {
            var conceptMapper = new Bahmni.ConceptSet.ConceptMapper();

            $scope.selectOptions = function(codedConcept){
                return {
                    ajax: {
                        url: Bahmni.Common.Constants.conceptUrl,
                        dataType: 'json',
                        quietMillis: 100,
                        data: function (term, page) {
                            return {
                                q: term,
                                answerTo: codedConcept.uuid,
                                v: "custom:(uuid,name)"
                            };
                        },
                        results: function (data, page) {
                            return {results: data.results.map(conceptMapper.map), more: false};
                        }
                    },
                    width: '20em',
                    allowClear: true,
                    placeholder: 'Select',
                    formatResult: _.property('name'),
                    formatSelection: _.property('name'),
                    id: _.property('uuid')
                };
            }
        };

        return {
            restrict: 'E',
            controller: controller,
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

        var controller = function ($scope, conceptSetService, conceptSetUiConfigService, spinner) {
            var conceptSetName = $scope.conceptSetName;
            var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
            var observationMapper = new Bahmni.ConceptSet.ObservationMapper();
            spinner.forPromise(conceptSetService.getConceptSetMembers({name: conceptSetName, v: "custom:(uuid,name,set,hiNormal,lowNormal,units,conceptClass,datatype,setMembers:(uuid,name,set,hiNormal,lowNormal,units,conceptClass,datatype,setMembers:(uuid,name,set,hiNormal,lowNormal,units,conceptClass,datatype,setMembers:(uuid,name,set,hiNormal,lowNormal,units,conceptClass,datatype,setMembers:(uuid,name,set,hiNormal,lowNormal,units)))))"}, true)).success(function (response) {
                var conceptSet = response.results[0];
                $scope.rootObservation = conceptSet ? observationMapper.map($scope.observations, conceptSet, conceptSetUIConfig.value || {}) : null;
                updateObservationsOnRootScope();
            });

            $scope.atLeastOneValueIsSet = false;

            var updateObservationsOnRootScope = function () {
                if($scope.rootObservation){
                    for (var i = 0; i < $scope.observations.length; i++) {
                        if ($scope.observations[i].concept.uuid === $scope.rootObservation.concept.uuid) {
                            $scope.observations[i] = $scope.rootObservation;
                            return;
                        }
                    }
                    $scope.observations.push($scope.rootObservation);
                }
            };

            var allowContextChange = function () {
                $scope.atLeastOneValueIsSet = $scope.rootObservation && $scope.rootObservation.atLeastOneValueSet();
                var invalidNodes = $scope.rootObservation && $scope.rootObservation.groupMembers.filter(function(childNode){
                    return childNode.isObservationNode && !childNode.isValid($scope.atLeastOneValueIsSet);
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
