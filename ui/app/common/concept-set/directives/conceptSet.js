'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('concept', [function () {
        var controller = function ($scope, $q, $filter) {
            var conceptMapper = new Bahmni.Common.Domain.ConceptMapper();
            $scope.showTitle = $scope.showTitle === undefined ? true : $scope.showTitle;

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
                showTitle: "=",
                conceptSetRequired: "="
            },
            template: '<ng-include src="\'../common/concept-set/views/observation.html\'" />'
        }
    }]).directive('conceptSet', ['contextChangeHandler', 'appService', function (contextChangeHandler, appService) {
        var template =
            '<form>' +
                '<concept concept-set-required="conceptSetRequired" observation="rootObservation" at-least-one-value-is-set="atLeastOneValueIsSet" show-title="showTitleValue"></concept>' +
            '</form>';

        var numberOfLevels = appService.getAppDescriptor().getConfigValue('maxConceptSetLevels') || 4;
        var fields = ['uuid','name', 'names', 'set','hiNormal','lowNormal','units','conceptClass','datatype', 'handler', 'answers:(uuid,name,displayString,names)', 'descriptions'];
        var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', numberOfLevels);

        var controller = function ($scope, conceptSetService, conceptSetUiConfigService, spinner) {
            var conceptSetName = $scope.conceptSetName;
            var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
            var observationMapper = new Bahmni.ConceptSet.ObservationMapper();
            var validationHandler = $scope.validationHandler() || contextChangeHandler;

            spinner.forPromise(conceptSetService.getConceptSetMembers({name: conceptSetName, v: "custom:" + customRepresentation})).then(function (response) {
                var conceptSet = response.data.results[0];
                $scope.rootObservation = conceptSet ? observationMapper.map($scope.observations, conceptSet, conceptSetUIConfig.value || {}) : null;
                updateObservationsOnRootScope();
            });

            $scope.atLeastOneValueIsSet = false;
            $scope.conceptSetRequired = false;
            $scope.showTitleValue = $scope.showTitle();

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
            var validateObservationTree = function () {
                if(!$scope.rootObservation) return true;
                $scope.atLeastOneValueIsSet = $scope.rootObservation.atLeastOneValueSet();
                var invalidNodes = $scope.rootObservation.groupMembers.filter(function(childNode){
                    return childNode.isObservationNode && !childNode.isValid($scope.atLeastOneValueIsSet);
                });
                return !invalidNodes || invalidNodes.length === 0;
            };

            validationHandler.add(validateObservationTree);
        };

        return {
            restrict: 'E',
            scope: {
                conceptSetName: "=",
                observations: "=",
                required: "=",
                showTitle: "&",
                validationHandler: "&"
            },
            template: template,
            controller: controller
        }
    }])
    .directive('buttonSelect', function () {
        return {
            restrict:'E',
            scope:{ observation:'='},
            link:function(scope, element, attrs){
                if(attrs.dirtyCheckFlag){
                    scope.hasDirtyFlag = true;
                }
            },
            controller:function ($scope) {
                $scope.select = function (answer) {
                    if ($scope.observation.value && $scope.observation.value.uuid === answer.uuid) {
                        $scope.observation.value = null;
                    } else {
                        $scope.observation.value = answer;
                    }
                };

                $scope.getAnswerDisplayName = function(answer) {
                    var shortName = _.first(answer.names.filter(function(name) {return name.conceptNameType === 'SHORT'}));
                    return  shortName  ? shortName.name : answer.displayString;
                };
            },
            template:"<span ng-repeat='answer in observation.possibleAnswers'><button type='button' class='grid-row-element' ng-class='{active: observation.value.uuid == answer.uuid}' ng-click='select(answer)'><i class='icon-ok'></i>{{getAnswerDisplayName(answer)}}</button></span>"
        };
    });;
