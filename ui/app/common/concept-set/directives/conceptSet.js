'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('concept', [function () {
        var controller = function ($scope, $q, $filter) {
            var conceptMapper = new Bahmni.ConceptSet.ConceptMapper();

            $scope.selectOptions = function(codedConcept){
                var limit = 1000;
                return {
                    ajax: {
                        url: Bahmni.Common.Constants.conceptUrl,
                        dataType: 'json',
                        quietMillis: 100,
                        cache: true,
                        data: function (term, page) {
                            return {
                                q: term,
                                limit: limit,
                                startIndex: (page - 1) * limit,
                                answerTo: codedConcept.uuid,
                                v: "custom:(uuid,name:(name))"
                            };
                        },
                        results: function (data, page) {
                            return {
                                //Remove uniq logic after web service rest bug is fixed
                                results: _.sortBy(_.uniq(data.results, _.property('uuid')).map(conceptMapper.map), 'name'),
                                more: !!_.find(data.links, function(link) { return link.rel === "next"; })
                            };
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
                atLeastOneValueIsSet : "=",
                conceptSetRequired: "="
            },
            template: '<ng-include src="\'../common/concept-set/views/observation.html\'" />'
        }
    }]).directive('conceptSet', ['contextChangeHandler', 'appService', function (contextChangeHandler, appService) {
        var template =
            '<form>' +
                '<concept concept-set-required="conceptSetRequired" observation="rootObservation" at-least-one-value-is-set="atLeastOneValueIsSet"></concept>' +
            '</form>';

        var numberOfLevels = appService.getAppDescriptor().getConfigValue('maxConceptSetLevels') || 4;
        var fields = ['uuid','name','set','hiNormal','lowNormal','units','conceptClass','datatype'];
        var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', numberOfLevels)

        var controller = function ($scope, conceptSetService, conceptSetUiConfigService, spinner) {
            var conceptSetName = $scope.conceptSetName;
            var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
            var observationMapper = new Bahmni.ConceptSet.ObservationMapper();
            spinner.forPromise(conceptSetService.getConceptSetMembers({name: conceptSetName, v: "custom:" + customRepresentation}, true)).success(function (response) {
                var conceptSet = response.results[0];
                $scope.rootObservation = conceptSet ? observationMapper.map($scope.observations, conceptSet, conceptSetUIConfig.value || {}) : null;
                updateObservationsOnRootScope();
            });

            $scope.atLeastOneValueIsSet = false;
            $scope.conceptSetRequired = false;

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
                $scope.conceptSetRequired = $scope.required;
                var invalidNodes = $scope.rootObservation && $scope.rootObservation.groupMembers.filter(function(childNode){
                    return !childNode.isValid($scope.atLeastOneValueIsSet, $scope.conceptSetRequired);
                });
                return !invalidNodes || invalidNodes.length === 0;
            };
            contextChangeHandler.reset();
            contextChangeHandler.add(allowContextChange);
        };

        return {
            restrict: 'E',
            scope: {
                conceptSetName: "=",
                observations: "=",
                required: "="
            },
            template: template,
            controller: controller
        }
    }]);
