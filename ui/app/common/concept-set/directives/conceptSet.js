'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('conceptSet', ['contextChangeHandler', 'appService', 'observationsService', 'messagingService', 'conceptSetService', 'conceptSetUiConfigService', 'spinner',
        function (contextChangeHandler, appService, observationsService, messagingService, conceptSetService, conceptSetUiConfigService, spinner) {
            var controller = function ($scope) {
                var conceptSetName = $scope.conceptSetName;
                var ObservationUtil = Bahmni.Common.Obs.ObservationUtil;
                var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
                var observationMapper = new Bahmni.ConceptSet.ObservationMapper();
                var validationHandler = $scope.validationHandler() || contextChangeHandler;
                var id = "#" + $scope.sectionId;

                $scope.atLeastOneValueIsSet = $scope.atLeastOneValueIsSet || false;
                $scope.conceptSetRequired = false;
                $scope.showTitleValue = $scope.showTitle();
                $scope.numberOfVisits = conceptSetUIConfig[conceptSetName] && conceptSetUIConfig[conceptSetName].numberOfVisits ? conceptSetUIConfig[conceptSetName].numberOfVisits : null;
                $scope.hideAbnormalButton = conceptSetUIConfig[conceptSetName] && conceptSetUIConfig[conceptSetName].hideAbnormalButton;

                var focusFirstObs = function () {
                    if ($scope.conceptSetFocused && $scope.rootObservation.groupMembers && $scope.rootObservation.groupMembers.length > 0) {
                        var firstObs = _.find($scope.rootObservation.groupMembers, function (obs) {
                            return obs.isFormElement && obs.isFormElement();
                        });
                        if (firstObs) {
                            firstObs.isFocused = true;
                        }
                    }
                };

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
                        return _.toLower(observation.conceptSetName) === _.toLower($scope.rootObservation.concept.name);
                    });
                };

                var getDefaults = function () {
                    var conceptSetUI = appService.getAppDescriptor().getConfigValue("conceptSetUI");
                    if (!conceptSetUI || !conceptSetUI.defaults) {
                        return;
                    }
                    return conceptSetUI.defaults || {};
                };

                var getCodedAnswerWithDefaultAnswerString = function (defaults, groupMember) {
                    var possibleAnswers = groupMember.possibleAnswers;
                    var defaultAnswer = defaults[groupMember.concept.name];
                    var defaultCodedAnswer;
                    if (defaultAnswer instanceof Array) {
                        defaultCodedAnswer = [];
                        _.each(defaultAnswer, function (answer) {
                            defaultCodedAnswer.push(_.find(possibleAnswers, {displayString: answer}));
                        });
                    } else {
                        defaultCodedAnswer = _.find(possibleAnswers, {displayString: defaultAnswer});
                    }
                    return defaultCodedAnswer;
                };

                var setDefaultsForGroupMembers = function (groupMembers, defaults) {
                    if (defaults) {
                        _.each(groupMembers, function (groupMember) {
                            var conceptFullName = groupMember.concept.name;
                            var present = _.includes(_.keys(defaults), conceptFullName);
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
                    } else if (!(defaultCodedAnswer instanceof Array)) {
                        observation.value = defaultCodedAnswer;
                    }
                };

                var getFlattenedObsValues = function (flattenedObs) {
                    return _.reduce(flattenedObs, function (flattenedObsValues, obs) {
                        if (flattenedObsValues[obs.concept.name + '|' + obs.uniqueId] == undefined) {
                            if (obs.isMultiSelect) {
                                var selectedObsConceptNames = [];
                                _.each(obs.selectedObs, function (observation) {
                                    if (!observation.voided) {
                                        selectedObsConceptNames.push(observation.value.name);
                                    }
                                    if (!observation.voided) {
                                        selectedObsConceptNames.push(observation.value.name);
                                    }
                                });
                                flattenedObsValues[obs.concept.name + '|' + obs.uniqueId] = selectedObsConceptNames;
                            } else if (obs.conceptUIConfig.multiSelect) {
                                var alreadyProcessedMultiSelect = [];
                                _.each(_.keys(flattenedObsValues), function (eachObsKey) {
                                    eachObsKey.split('|')[0] == obs.concept.name && alreadyProcessedMultiSelect.push(eachObsKey);
                                });
                                if (alreadyProcessedMultiSelect.length < 2) {
                                    flattenedObsValues[obs.concept.name + '|' + obs.uniqueId] = flattenedObsValues[obs.concept.name + '|' + undefined];
                                    // Set the individual Observation of Multi Select to be the MultiSelect Obs
                                }
                            } else if (obs.value instanceof Object) {
                                flattenedObsValues[obs.concept.name + '|' + obs.uniqueId] = (obs.value.name instanceof Object) ? obs.value.name.name : obs.value.name;
                            } else {
                                flattenedObsValues[obs.concept.name + '|' + obs.uniqueId] = obs.value;
                            }
                        }
                        return flattenedObsValues;
                    }, {});
                };

                var clearFieldValuesOnDisabling = function (obs) {
                    obs.comment = undefined;
                    if (obs.value || obs.isBoolean) {
                        obs.value = undefined;
                    } else if (obs.isMultiSelect) {
                        for (var key in obs.selectedObs) {
                            if (!obs.selectedObs[key].voided) {
                                obs.toggleSelection(obs.selectedObs[key].value);
                            }
                        }
                    }
                };

                var setObservationState = function (obsArray, disable, error, hide) {
                    if (!_.isEmpty(obsArray)) {
                        _.each(obsArray, function (obs) {
                            obs.disabled = disable || hide;
                            obs.error = error;
                            obs.hide = hide;
                            if (hide || obs.disabled) {
                                clearFieldValuesOnDisabling(obs);
                            }
                            if (obs.groupMembers) {
                                _.each(obs.groupMembers, function (groupMember) {
                                    // TODO : Hack to fix issue with formconditions on multiselect - Swathi
                                    groupMember && setObservationState([groupMember], disable, error, hide);
                                });
                            }
                        });
                    }
                };

                var processConditions = function (flattenedObs, fields, disable, error, hide) {
                    _.each(fields, function (field) {
                        var matchingObsArray = [];
                        var clonedObsInSameGroup;
                        flattenedObs.forEach(function (obs) {
                            if (clonedObsInSameGroup != false && obs.concept.name == field) {
                                matchingObsArray.push(obs);
                                clonedObsInSameGroup = true;
                            } else if (clonedObsInSameGroup && obs.concept.name != field) {
                                clonedObsInSameGroup = false;
                            }
                        });

                        if (!_.isEmpty(matchingObsArray)) {
                            setObservationState(matchingObsArray, disable, error, hide);
                        } else {
                            messagingService.showMessage("error", "No element found with name : " + field);
                        }
                    });
                };

                var runFormConditionForObs = function (enableCase, formName, formCondition, conceptName, flattenedObs) {
                    var conceptSetObsValues = getFlattenedObsValues(flattenedObs);
                    _.each(_.keys(conceptSetObsValues), function (eachObsKey) {
                        if (eachObsKey.split('|')[0] == conceptName && eachObsKey.split('|')[1] != 'undefined') {
                            var valueMap = _.reduce(conceptSetObsValues, function (conceptSetValueMap, obsValue, conceptName) {
                                conceptSetValueMap[conceptName.split('|')[0]] = obsValue;
                                return conceptSetValueMap;
                            }, {});
                            var conditions = formCondition(formName, valueMap, $scope.patient);
                            if (!_.isUndefined(conditions)) {
                                if (conditions.error && !_.isEmpty(conditions.error)) {
                                    messagingService.showMessage('error', conditions.error);
                                    processConditions(flattenedObs, [conceptName], false, true, false);
                                } else {
                                    enableCase && processConditions(flattenedObs, [conceptName], false, false, false);
                                }
                                processConditions(flattenedObs, conditions.disable, true);
                                processConditions(flattenedObs, conditions.enable, false);
                                processConditions(flattenedObs, conditions.show, false, undefined, false);
                                processConditions(flattenedObs, conditions.hide, false, undefined, true);
                                _.each(conditions.enable, function (subConditionConceptName) {
                                    var conditionFn = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[subConditionConceptName];
                                    if (conditionFn != null) {
                                        runFormConditionForObs(true, formName, conditionFn, subConditionConceptName, flattenedObs);
                                    }
                                });
                                _.each(conditions.disable, function (subConditionConceptName) {
                                    var conditionFn = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[subConditionConceptName];
                                    if (conditionFn != null) {
                                        _.each(flattenedObs, function (obs) {
                                            if (obs.concept.name == subConditionConceptName) {
                                                runFormConditionForObs(false, formName, conditionFn, subConditionConceptName, flattenedObs);
                                            }
                                        });
                                    }
                                });
                                _.each(conditions.show, function (subConditionConceptName) {
                                    var conditionFn = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[subConditionConceptName];
                                    if (conditionFn) {
                                        runFormConditionForObs(true, formName, conditionFn, subConditionConceptName, flattenedObs);
                                    }
                                });
                                _.each(conditions.hide, function (subConditionConceptName) {
                                    var conditionFn = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[subConditionConceptName];
                                    if (conditionFn) {
                                        _.each(flattenedObs, function (obs) {
                                            if (obs.concept.name == subConditionConceptName) {
                                                runFormConditionForObs(false, formName, conditionFn, subConditionConceptName, flattenedObs);
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                };

                var updateFormConditions = function (observationsOfCurrentTemplate, rootObservation) {
                    if (Bahmni.ConceptSet.FormConditions.rules) {
                        runFormConditionForAllObsRecursively(rootObservation.concept.name, rootObservation);
                    }
                };

                var runFormConditionForAllObsRecursively = function (formName, rootObservation) {
                    _.each(rootObservation.groupMembers, function (observation) {
                        var conditionFn = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[observation.concept.name];
                        if (conditionFn != null) {
                            var flattenedObs = ObservationUtil.flattenObsToArray([rootObservation]);
                            runFormConditionForObs(false, formName, conditionFn, observation.concept.name, flattenedObs);
                        }
                        if (observation.groupMembers && observation.groupMembers.length > 0) {
                            runFormConditionForAllObsRecursively(formName, observation);
                        }
                    });
                };
                var addDummyImage = function () {
                    _.each($scope.rootObservation.groupMembers, function (observation) {
                        addDummyImageObservationForSavedObs(observation, $scope.rootObservation);
                    });
                };
                var addDummyImageObservationForSavedObs = function (observation, rootObservation) {
                    _.each(observation.groupMembers, function (childObservation) {
                        addDummyImageObservationForSavedObs(childObservation, observation);
                    });
                    if (observation.getControlType() === 'image' && observation.value && rootObservation.groupMembers.indexOf(observation) === rootObservation.groupMembers.length - 1) {
                        rootObservation.groupMembers.push(observation.cloneNew());
                        return;
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
                            addDummyImage();
                            setDefaultsForGroupMembers(groupMembers, defaults);
                            var observationsOfCurrentTemplate = getObservationsOfCurrentTemplate();
                            updateFormConditions(observationsOfCurrentTemplate, $scope.rootObservation);
                        } else {
                            $scope.showEmptyConceptSetMessage = true;
                        }
                    }).catch(function (error) {
                        messagingService.showMessage('error', error.message);
                    });
                };
                spinner.forPromise(init(), id);

                var validateObservationTree = function () {
                    if (typeof $scope.rootObservation === "undefined" || $scope.rootObservation === null) {
                        return {allow: true, errorMessage: null };
                    }
                    $scope.atLeastOneValueIsSet = $scope.rootObservation && $scope.rootObservation.atLeastOneValueSet();
                    $scope.conceptSetRequired = $scope.required ? $scope.required : true;
                    var nodes = $scope.rootObservation && findInvalidNodes($scope.rootObservation.groupMembers, $scope.rootObservation);
                    return {allow: !nodes.status, errorMessage: nodes.message};
                }; // TODO: Write unit test for this function

                var findInvalidNodes = function (members, parentNode) {
                    var errorMessage = null;
                    var status = members.some(function (childNode) {
                        if (childNode.voided) {
                            return false;
                        }
                        var groupMembers = childNode.groupMembers || [];
                        for (var index in groupMembers) {
                            var information = groupMembers[index].groupMembers && groupMembers[index].groupMembers.length ? findInvalidNodes(groupMembers[index].groupMembers, groupMembers[index]) : validateChildNode(groupMembers[index], childNode);
                            if (information.status) {
                                errorMessage = information.message;
                                return true;
                            }
                        }
                        information = validateChildNode(childNode, parentNode);
                        if (information.status) {
                            errorMessage = information.message;
                            return true;
                        }
                        return !childNode.isValid($scope.atLeastOneValueIsSet, $scope.conceptSetRequired);
                    });
                    return {message: errorMessage, status: status};
                };
                var validateChildNode = function (childNode, parentNode) {
                    var errorMessage;
                    if (childNode.possibleAnswers && !childNode.possibleAnswers.length) {
                        if (typeof childNode.isValueInAbsoluteRange == 'function' && !childNode.isValueInAbsoluteRange()) {
                            errorMessage = "The value you entered (red field) is outside the range of allowable values for that record. Please check the value.";
                            return {message: errorMessage, status: true};
                        }

                        if (childNode.isNumeric()) {
                            if (!childNode.isValidNumeric()) {
                                errorMessage = "Please enter Integer value, decimal value is not allowed";
                                return {message: errorMessage, status: true};
                            }
                            if (parentNode) {
                                if (!childNode.isValidNumericValue() || !parentNode.isValidNumericValue()) {
                                    errorMessage = "Please enter Numeric values";
                                    return {message: errorMessage, status: true};
                                }
                            } else {
                                if (!childNode.isValidNumericValue()) {
                                    errorMessage = "Please enter Numeric values";
                                    return {message: errorMessage, status: true};
                                }
                            }
                        }
                    }
                    return {status: false};
                };

                validationHandler.add(validateObservationTree);

                var cleanUpListenerShowPrevious = $scope.$on('event:showPrevious' + conceptSetName, function () {
                    return spinner.forPromise(observationsService.fetch($scope.patient.uuid, $scope.conceptSetName, null, $scope.numberOfVisits, null, true), id).then(function (response) {
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

                var deregisterAddMore = $scope.$root.$on("event:addMore", function (event, observation) {
                    updateFormConditions([observation], observation);
                });

                var deregisterObservationUpdated = $scope.$root.$on("event:observationUpdated-" + conceptSetName, function (event, conceptName, rootObservation) {
                    var formName = rootObservation.concept.name;
                    var formCondition = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[conceptName];
                    if (formCondition) {
                        var flattenedObs = ObservationUtil.flattenObsToArray([rootObservation]);
                        runFormConditionForObs(true, formName, formCondition, conceptName, flattenedObs);
                    }
                });

                $scope.$on('$destroy', function () {
                    deregisterObservationUpdated();
                    deregisterAddMore();
                    cleanUpListenerShowPrevious();
                });
            };

            return {
                restrict: 'E',
                scope: {
                    conceptSetName: "=",
                    observations: "=?",
                    required: "=?",
                    showTitle: "&",
                    validationHandler: "&",
                    patient: "=",
                    conceptSetFocused: "=?",
                    collapseInnerSections: "=?",
                    atLeastOneValueIsSet: "=?",
                    sectionId: "="
                },
                templateUrl: '../common/concept-set/views/conceptSet.html',
                controller: controller
            };
        }]);
