'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('conceptSet', ['contextChangeHandler', 'appService', 'observationsService', '$timeout', function (contextChangeHandler, appService, observationsService, $timeout) {
        var controller = function ($scope, conceptSetService, conceptSetUiConfigService, spinner) {
            var conceptSetName = $scope.conceptSetName;
            var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
            var observationMapper = new Bahmni.ConceptSet.ObservationMapper();
            var validationHandler = $scope.validationHandler() || contextChangeHandler;

            var focusFirstObs = function () {
                if ($scope.conceptSetFocused && $scope.rootObservation.groupMembers && $scope.rootObservation.groupMembers.length > 0) {
                    var firstObs = _.find($scope.rootObservation.groupMembers, function (obs) {
                        return obs.isFormElement && obs.isFormElement();
                    });
                    firstObs && (firstObs.isFocused = true);
                }
            };

            var init = function () {
                return conceptSetService.getConceptSetMembers({
                    name: conceptSetName,
                    v: "bahmni"
                }).then(function (response) {
                    $scope.conceptSet = response.data.results[0];
                    $scope.rootObservation = $scope.conceptSet ? observationMapper.map($scope.observations, $scope.conceptSet, conceptSetUIConfig) : null;
                    if ($scope.rootObservation) {
                        $scope.rootObservation.conceptSetName = $scope.conceptSetName;
                        focusFirstObs();
                        updateObservationsOnRootScope();
                        updateFormConditions();
                    } else {
                        $scope.showEmptyConceptSetMessage = true;
                    }
                });
            };
            spinner.forPromise(init());

            $scope.atLeastOneValueIsSet = false;
            $scope.conceptSetRequired = false;
            $scope.showTitleValue = $scope.showTitle();
            $scope.numberOfVisits = conceptSetUIConfig[conceptSetName] && conceptSetUIConfig[conceptSetName].numberOfVisits ? conceptSetUIConfig[conceptSetName].numberOfVisits : null;

            var updateObservationsOnRootScope = function () {
                if ($scope.rootObservation) {
                    for (var i = 0; i < $scope.observations.length; i++) {
                        if ($scope.observations[i].concept.uuid === $scope.rootObservation.concept.uuid) {
                            $scope.observations[i] = $scope.rootObservation;
                            return;
                        }
                    }
                    $scope.observations.push($scope.rootObservation);
                }
            };

            var updateFormConditions = function () {
                var flattenedObs = flattenObs($scope.observations);
                console.log("flattenedObs ", _.map(flattenedObs, function(o) { return o.label; }));
                var flattenedObsValues = _.reduce(flattenedObs, function (flattenedObsValues, obs) {
                    flattenedObsValues[obs.concept.name] = obs.value;
                    return flattenedObsValues;
                }, {});
                if (Bahmni.ConceptSet.FormConditions.rules) {
                    _.each(Bahmni.ConceptSet.FormConditions.rules, function (conditionFn, conceptName) {
                        var conditions = conditionFn($scope.rootObservation.concept.name, flattenedObsValues);
                        _.each(conditions.disable, function (field) {
                            var observationToDisable = _.find(flattenedObs, function (observation) {
                                return observation.concept.name === field;
                            });
                            console.log(observationToDisable);
                            if(observationToDisable) {
                                observationToDisable.disabled = true;
                            }
                        })
                    })
                }
            };

            var contextChange = function () {
                $scope.atLeastOneValueIsSet = $scope.rootObservation && $scope.rootObservation.atLeastOneValueSet();
                $scope.conceptSetRequired = $scope.required ? $scope.required : true;
                var errorMessage = null;
                var invalidNodes = $scope.rootObservation && $scope.rootObservation.groupMembers.filter(function (childNode) {
                        //Other than Bahmni.ConceptSet.Observation  and Bahmni.ConceptSet.ObservationNode, other concepts does not have isValueInAbsoluteRange fn
                        if (typeof childNode.isValueInAbsoluteRange == 'function' && !childNode.isValueInAbsoluteRange()) {
                            errorMessage = "The value you entered (red field) is outside the range of allowable values for that record. Please check the value.";
                            return true;
                        }
                        return !childNode.isValid($scope.atLeastOneValueIsSet, $scope.conceptSetRequired);
                    });
                return {allow: !invalidNodes || invalidNodes.length === 0, errorMessage: errorMessage};
            };
            contextChangeHandler.add(contextChange);
            var validateObservationTree = function () {
                if (!$scope.rootObservation) return true;
                $scope.atLeastOneValueIsSet = $scope.rootObservation.atLeastOneValueSet();
                var invalidNodes = $scope.rootObservation.groupMembers.filter(function (childNode) {
                    return childNode.isObservationNode && !childNode.isValid($scope.atLeastOneValueIsSet);
                });
                return {allow: (!invalidNodes || invalidNodes.length === 0)};
            };

            validationHandler.add(validateObservationTree);

            var flattenObs = function (observations) {
                var flattened = [];
                flattened.push.apply(flattened, observations);
                observations.forEach(function (obs) {
                    if (obs.groupMembers && obs.groupMembers.length > 0) {
                        flattened.push.apply(flattened, flattenObs(obs.groupMembers));
                    }
                });
                return flattened;
            };

            $scope.$on('event:showPrevious' + conceptSetName, function (event) {

                return spinner.forPromise(observationsService.fetch($scope.patient.uuid, $scope.conceptSetName, null, $scope.numberOfVisits, null, true)).then(function (response) {
                    var recentObservations = flattenObs(response.data);
                    var conceptSetObservation = $scope.observations.filter(function (observation) {
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
                                    value: Bahmni.Common.Domain.ObservationValueMapper.map(previousObs),
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
                conceptSetFocused: "=",
                collapseInnerSections: "="
            },
            templateUrl: '../common/concept-set/views/conceptSet.html',
            controller: controller
        }
    }]);