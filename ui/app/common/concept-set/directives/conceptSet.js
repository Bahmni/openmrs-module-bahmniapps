'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('conceptSet', ['contextChangeHandler', 'appService', 'observationsService', '$timeout', 'messagingService', function (contextChangeHandler, appService, observationsService, $timeout, messagingService) {
        var controller = function ($scope, conceptSetService, conceptSetUiConfigService, spinner) {
            var conceptSetName = $scope.conceptSetName;
            var ObservationUtil = Bahmni.Common.Obs.ObservationUtil;
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
                return conceptSetService.getConcept({
                    name: conceptSetName,
                    v: "bahmni"
                }).then(function (response) {
                    $scope.conceptSet = response.data.results[0];
                    $scope.rootObservation = $scope.conceptSet ? observationMapper.map($scope.observations, $scope.conceptSet, conceptSetUIConfig) : null;
                    if ($scope.rootObservation) {
                        $scope.rootObservation.conceptSetName = $scope.conceptSetName;
                        focusFirstObs();
                        updateObservationsOnRootScope();
                        var groupMembers = getObservationsOfCurrentTemplate()[0].groupMembers;
                        var defaults = getDefaults();
                        setDefaultsForGroupMembers(groupMembers, defaults);
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

            var getObservationsOfCurrentTemplate = function () {
                return _.filter($scope.observations, function (observation) {
                    return observation.conceptSetName === $scope.rootObservation.concept.name;
                });
            };

            var updateFormConditions = function () {
                var observationsOfCurrentTemplate = getObservationsOfCurrentTemplate();
                var flattenedObs = ObservationUtil.flattenObsToArray(observationsOfCurrentTemplate);
                var conceptSetObsValues = getFlattenedObsValues(flattenedObs);
                if (Bahmni.ConceptSet.FormConditions.rules) {
                    _.each(Bahmni.ConceptSet.FormConditions.rules, function (conditionFn, conceptName) {
                        if (_.has(conceptSetObsValues, conceptName)) {
                            var conditions = conditionFn($scope.rootObservation.concept.name, conceptSetObsValues);
                            processConditions(flattenedObs, conditions.disable, true);
                        }
                    })
                }
            };

            var getDefaults = function () {
                var conceptSetUI = appService.getAppDescriptor().getConfigValue("conceptSetUI");
                if (!conceptSetUI || !conceptSetUI.defaults) {
                    return
                }
                return conceptSetUI.defaults || {};
            };

            var getCodedAnswerWithDefaultAnswerString = function (defaults, groupMember) {
                var possibleAnswers = groupMember.possibleAnswers;
                var defaultAnswer = defaults[groupMember.label];
                var defaultCodedAnswer;
                if (defaultAnswer instanceof Array) {
                    defaultCodedAnswer = [];
                    _.each(defaultAnswer, function (answer) {
                        defaultCodedAnswer.push(_.findWhere(possibleAnswers, {displayString: answer}));
                    });
                }
                else {
                    defaultCodedAnswer = _.findWhere(possibleAnswers, {displayString: defaultAnswer});
                }
                return defaultCodedAnswer;
            };

            var setDefaultsForGroupMembers = function (groupMembers, defaults) {
                if (defaults) {
                    _.each(groupMembers, function (groupMember) {
                        var conceptFullName = groupMember.concept.name;
                        var present = _.contains(_.keys(defaults), conceptFullName);
                        if (present && groupMember.value == undefined) {
                            if (groupMember.concept.dataType == "Coded") {
                                setDefaultsForCodedObservations(groupMember, defaults);
                            } else {
                                groupMember.value = defaults[conceptFullName];
                            }
                        }
                        if (groupMember.groupMembers && groupMember.groupMembers.length > 0) {
                            setDefaultsForGroupMembers(groupMember.groupMembers, defaults);
                            if (groupMember instanceof Bahmni.ConceptSet.ObservationNode && defaults[groupMember.label] && groupMember.abnormalObs && groupMember.abnormalObs.value == undefined) {
                                groupMember.onValueChanged(groupMember.value);
                            }
                        }
                    });
                }
            };

            var setDefaultsForCodedObservations = function (observation, defaults) {
                var defaultCodedAnswer = getCodedAnswerWithDefaultAnswerString(defaults, observation);
                if (observation.isMultiSelect) {
                    if (!observation.hasValue()) {
                        _.each(defaultCodedAnswer, function (answer) {
                            observation.selectAnswer(answer);
                        });
                    }
                }
                else if (!(defaultCodedAnswer instanceof Array)) {
                    observation.value = defaultCodedAnswer;
                }
            };

            var getFlattenedObsValues = function (flattenedObs) {
                return _.reduce(flattenedObs, function (flattenedObsValues, obs) {
                    if (flattenedObsValues[obs.concept.name] == undefined) {
                        if (obs.isMultiSelect) {
                            var selectedObsConceptNames = [];
                            _.each(obs.selectedObs, function (observation) {
                                selectedObsConceptNames.push(observation.value.name);
                            });
                            flattenedObsValues[obs.concept.name] = selectedObsConceptNames;
                        }
                        else if (obs.value instanceof Object) {
                            flattenedObsValues[obs.concept.name] = obs.value.name;
                        }
                        else {
                            flattenedObsValues[obs.concept.name] = obs.value;
                        }
                    }
                    return flattenedObsValues;
                }, {});
            };


            var contextChange = function () {
                $scope.atLeastOneValueIsSet = $scope.rootObservation && $scope.rootObservation.atLeastOneValueSet();
                $scope.conceptSetRequired = $scope.required ? $scope.required : true;
                var errorMessage = null;
                var invalidNodes = $scope.rootObservation && $scope.rootObservation.groupMembers.filter(function (childNode) {
                        if (childNode.voided)
                            return false;
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


            $scope.$on('event:showPrevious' + conceptSetName, function (event) {

                return spinner.forPromise(observationsService.fetch($scope.patient.uuid, $scope.conceptSetName, null, $scope.numberOfVisits, null, true)).then(function (response) {
                    var recentObservations = ObservationUtil.flattenObsToArray(response.data);
                    var conceptSetObservation = $scope.observations.filter(function (observation) {
                        return observation.conceptSetName === $scope.conceptSetName;
                    });
                    ObservationUtil.flattenObsToArray(conceptSetObservation).forEach(function (obs) {
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

            $scope.$root.$on("event:observationUpdated-" + conceptSetName, function (event, conceptName) {
                var formName = $scope.rootObservation.concept.name;
                var allObsValues = Bahmni.Common.Obs.ObservationUtil.flatten($scope.rootObservation);
                var formCondition = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[conceptName];
                if (formCondition) {
                    var flattenedObs = ObservationUtil.flattenObsToArray([$scope.rootObservation]);
                    var conditions = formCondition(formName, allObsValues);
                    if (conditions.error && !_.isEmpty(conditions.error)) {
                        messagingService.showMessage('formError', conditions.error);
                        processConditions(flattenedObs, [conceptName], false, true);
                        return
                    } else {
                        processConditions(flattenedObs, [conceptName], false, false);
                    }
                    processConditions(flattenedObs, conditions.enable, false);
                    processConditions(flattenedObs, conditions.disable, true);
                }
            });

            var processConditions = function (flattenedObs, fields, disable, error) {
                _.each(fields, function (field) {
                    var matchingObs = _.find(flattenedObs, function (obs) {
                        return obs.concept.name === field;
                    });
                    if (matchingObs) {
                        setObservationState(matchingObs, disable, error);
                    } else {
                        messagingService.showMessage("error", "No element found with name : " + field);
                    }
                });
            };

            var setObservationState = function (obs, disable, error) {
                obs.disabled = disable;
                obs.error = error;
                if (obs.disabled) {
                    clearFieldValuesOnDisabling(obs);
                }
                if (obs.groupMembers) {
                    _.each(obs.groupMembers, function (groupMember) {
                        setObservationState(groupMember, disable, error);
                    });
                }
            };

            var clearFieldValuesOnDisabling = function (obs) {
                if (obs.value || obs.isBoolean) {
                    obs.value = undefined;
                } else if (obs.isMultiSelect) {
                    for (var key in obs.selectedObs) {
                        obs.toggleSelection(obs.selectedObs[key].value);
                    }
                }
            }
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
