'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('concept', ['RecursionHelper','spinner', 'conceptSetService', '$filter', '$location', 'scrollToService',function (RecursionHelper,spinner, conceptSetService, $filter, $location, scrollToService) {
        var link = function ($scope, $element,$attr) {
            var conceptMapper = new Bahmni.Common.Domain.ConceptMapper();
            $scope.showTitle = $scope.showTitle === undefined ? true : $scope.showTitle;

            $scope.cloneNew = function(observation, parentObservation) {
                var newObs = observation.cloneNew();
                var index = parentObservation.groupMembers.indexOf(observation);
                parentObservation.groupMembers.splice(index+1, 0, newObs);
                var elementToScroll = event.currentTarget.parentNode.parentNode.parentNode.parentNode;
                scrollToService.scrollTo(elementToScroll);
            };

            $scope.getStringValue = function(observations) {
                return observations.map(function(observation) {
                    return observation.value + ' (' + $filter('bahmniDate')(observation.date) + ")";
                }).join(", ");
            };
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
                        results: function (data) {
                            return {
                                //Remove uniq logic after web service rest bug is fixed
                                results: _.sortBy(_.uniq(data.results, _.property('uuid')).map(conceptMapper.map), 'name'),
                                more: !!_.find(data.links, function(link) { return link.rel === "next"; })
                            };
                        }
                    },
                    allowClear: true,
                    placeholder: 'Select',
                    formatResult: _.property('name'),
                    formatSelection: _.property('name'),
                    id: _.property('uuid')
                };
            };
        };

        var compile = function(element) {
            return RecursionHelper.compile(element, link);
        };

        return {
            restrict: 'E',
            compile:compile,
            scope: {
                observation: "=",
                atLeastOneValueIsSet : "=",
                showTitle: "=",
                conceptSetRequired: "=",
                rootObservation: "=",
                patient: "="
            },
            templateUrl:'../common/concept-set/views/observation.html'
        }
    }]).directive('conceptSet', ['contextChangeHandler', 'appService', 'observationsService', function (contextChangeHandler, appService, observationsService) {
        var template =
            '<form novalidate>' +
                '<concept concept-set-required="conceptSetRequired" root-observation="rootObservation" patient="patient" ' +
                'observation="rootObservation" at-least-one-value-is-set="atLeastOneValueIsSet" ' +
                'show-title="showTitleValue" ng-if="!rootObservation.hidden">' +
                '</concept>' +
            '</form>';

        var numberOfLevels = appService.getAppDescriptor().getConfigValue('maxConceptSetLevels') || 4;
        var fields = ['uuid', 'name', 'names', 'set', 'hiNormal', 'lowNormal', 'hiAbsolute', 'lowAbsolute', 'units', 'conceptClass', 'datatype', 'handler', 'answers:(uuid,name,displayString,names)', 'descriptions'];
        var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', numberOfLevels);

        var controller = function ($scope, conceptSetService, conceptSetUiConfigService, spinner) {
            var conceptSetName = $scope.conceptSetName;
            var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
            var observationMapper = new Bahmni.ConceptSet.ObservationMapper();
            var validationHandler = $scope.validationHandler() || contextChangeHandler;

            var focusFirstObs = function() {
                if($scope.conceptSetFocused && $scope.rootObservation.groupMembers && $scope.rootObservation.groupMembers.length > 0) {
                    var firstObs = _.find($scope.rootObservation.groupMembers, function(obs){
                        return obs.isFormElement && obs.isFormElement();
                    });
                    firstObs && (firstObs.isFocused = true);
                }
            };

            var init = function(){
                return conceptSetService.getConceptSetMembers({name: conceptSetName, v: "custom:" + customRepresentation}).then(function (response) {
                    $scope.conceptSet = response.data.results[0];
                    $scope.rootObservation = $scope.conceptSet ? observationMapper.map($scope.observations, $scope.conceptSet, conceptSetUIConfig) : null;
                    $scope.rootObservation.conceptSetName = $scope.conceptSetName;
                    focusFirstObs();
                    updateObservationsOnRootScope();
                });
            };
            spinner.forPromise(init());

            $scope.atLeastOneValueIsSet = false;
            $scope.conceptSetRequired = false;
            $scope.showTitleValue = $scope.showTitle();
            $scope.numberOfVisits = conceptSetUIConfig[conceptSetName] && conceptSetUIConfig[conceptSetName].numberOfVisits ? conceptSetUIConfig[conceptSetName].numberOfVisits : null;

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

            var contextChange = function () {
                $scope.atLeastOneValueIsSet = $scope.rootObservation && $scope.rootObservation.atLeastOneValueSet();
                $scope.conceptSetRequired = $scope.required? $scope.required: true;
                var errorMessage = null;
                var invalidNodes = $scope.rootObservation && $scope.rootObservation.groupMembers.filter(function(childNode){
                        //Other than Bahmni.ConceptSet.Observation  and Bahmni.ConceptSet.ObservationNode, other concepts does not have isValueInAbsoluteRange fn
                    if(typeof childNode.isValueInAbsoluteRange == 'function'  && !childNode.isValueInAbsoluteRange()){
                       errorMessage = "The value you entered (red field) is outside the range of allowable values for that record. Please check the value.";
                       return true;
                    }
                    return !childNode.isValid($scope.atLeastOneValueIsSet, $scope.conceptSetRequired);
                });
                return {allow: !invalidNodes || invalidNodes.length === 0, errorMessage: errorMessage};
            };
            contextChangeHandler.add(contextChange);
            var validateObservationTree = function () {
                if(!$scope.rootObservation) return true;
                $scope.atLeastOneValueIsSet = $scope.rootObservation.atLeastOneValueSet();
                var invalidNodes = $scope.rootObservation.groupMembers.filter(function(childNode){
                    return childNode.isObservationNode && !childNode.isValid($scope.atLeastOneValueIsSet);
                });
                return {allow: (!invalidNodes || invalidNodes.length === 0)};
            };

            validationHandler.add(validateObservationTree);

            var flattenObs = function(observations) {
                var flattened = [];
                flattened.push.apply(flattened, observations);
                observations.forEach(function(obs) {
                    if(obs.groupMembers && obs.groupMembers.length > 0) {
                        flattened.push.apply(flattened, flattenObs(obs.groupMembers));
                    }
                });
                return flattened;
            };

            $scope.$on('event:showPrevious' + conceptSetName, function (event) {

                return spinner.forPromise(observationsService.fetch($scope.patient.uuid, $scope.conceptSetName, null, $scope.numberOfVisits, null, true)).then(function (response) {
                    var recentObservations = flattenObs(response.data);
                    var conceptSetObservation = $scope.observations.filter(function(observation){
                        return observation.conceptSetName === $scope.conceptSetName;
                    });
                    flattenObs(conceptSetObservation).forEach(function (obs) {
                        var correspondingRecentObs = _.filter(recentObservations, function (recentObs) {
                            return obs.concept.uuid === recentObs.concept.uuid;
                        });
                        if (correspondingRecentObs != null && correspondingRecentObs.length > 0) {
                            correspondingRecentObs.sort(function (obs1, obs2) {
                                return new Date(obs2.encounterDateTime) - new Date(obs1.encounterDateTime);
                            });
                            obs.previous = correspondingRecentObs.map(function (previousObs) {
                                return {
                                    value: new Bahmni.Common.Domain.ObservationValueMapper().map(previousObs),
                                    date: previousObs.observationDateTime
                                };
                            });
                        }
                    });
                });
            });
        };

        return {
            restrict: 'E',
            scope: {
                conceptSetName: "=",
                observations: "=",
                required: "=",
                showTitle: "&",
                validationHandler: "&",
                patient: "=",
                conceptSetFocused: "="
            },
            template: template,
            controller: controller
        }
    }]);