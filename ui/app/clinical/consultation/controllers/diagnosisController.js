'use strict';

angular.module('bahmni.clinical')
    .controller('DiagnosisController', ['$scope', '$rootScope', 'diagnosisService', 'messagingService', 'contextChangeHandler', 'spinner', 'appService', '$translate', 'retrospectiveEntryService', '$state', 'drugService', 'cdssService',
        function ($scope, $rootScope, diagnosisService, messagingService, contextChangeHandler, spinner, appService, $translate, retrospectiveEntryService, $state, drugService, cdssService) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            $scope.todayWithoutTime = DateUtil.getDateWithoutTime(DateUtil.today());
            $scope.toggles = {
                expandInactive: false
            };
            $scope.consultation.condition = $scope.consultation.condition || new Bahmni.Common.Domain.Condition({});
            $scope.conditionsStatuses = {
                'CONDITION_LIST_ACTIVE': 'ACTIVE',
                'CONDITION_LIST_INACTIVE': 'INACTIVE',
                'CONDITION_LIST_HISTORY_OF': 'HISTORY_OF'
            };
            $scope.consultation.followUpConditions = $scope.consultation.followUpConditions || [];

            _.forEach($scope.consultation.conditions, function (condition) {
                condition.isFollowUp = _.some($scope.consultation.followUpConditions, {value: condition.uuid});
            });

            $scope.placeholder = "Add Diagnosis";
            $scope.hasAnswers = false;

            $scope.cdssEnabled = false;
            $scope.conceptSource = localStorage.getItem('conceptSource') || '';

            $scope.orderOptions = {
                'CLINICAL_DIAGNOSIS_ORDER_PRIMARY': 'PRIMARY',
                'CLINICAL_DIAGNOSIS_ORDER_SECONDARY': 'SECONDARY'
            };
            $scope.certaintyOptions = {
                'CLINICAL_DIAGNOSIS_CERTAINTY_CONFIRMED': 'CONFIRMED',
                'CLINICAL_DIAGNOSIS_CERTAINTY_PRESUMED': 'PRESUMED'
            };
            $scope.translateDiagnosisLabels = function (key, type) {
                if (key) {
                    var translationKey = "CLINICAL_DIAGNOSIS_" + type + "_" + key.toUpperCase();
                    var translation = $translate.instant(translationKey);
                    if (translation != translationKey) {
                        return translation;
                    }
                }
                return key;
            };

            $scope.getDiagnosis = function (params) {
                return diagnosisService.getAllFor(params.term, $rootScope.currentUser.userProperties.defaultLocale).then(mapConcept);
            };

            var _canAdd = function (diagnosis) {
                var canAdd = true;
                $scope.consultation.newlyAddedDiagnoses.forEach(function (observation) {
                    if (observation.codedAnswer.uuid === diagnosis.codedAnswer.uuid) {
                        canAdd = false;
                    }
                });
                return canAdd;
            };

            $scope.$on('$stateChangeStart', function () {
                if ($scope.diagnosisForm.$dirty) {
                    $state.dirtyConsultationForm = true;
                }
            });

            $scope.$on("event:changes-saved", function () {
                $scope.diagnosisForm.$dirty = false;
            });

            (function () {
                drugService.getCdssEnabled().then(function (response) {
                    $scope.cdssEnabled = response.data;
                });
            })();

            $scope.getAddNewDiagnosisMethod = function (diagnosisAtIndex) {
                return function (item) {
                    var concept = item.lookup;
                    var index = $scope.consultation.newlyAddedDiagnoses.indexOf(diagnosisAtIndex);
                    var diagnosisBeingEdited = $scope.consultation.newlyAddedDiagnoses[index];
                    var diagnosis = new Bahmni.Common.Domain.Diagnosis(concept, diagnosisBeingEdited.order,
                        diagnosisBeingEdited.certainty, diagnosisBeingEdited.existingObs);
                    if (_canAdd(diagnosis)) {
                        /* TODO:
                         change to say array[index]=newObj instead array.splice(index,1,newObj);
                         */
                        $scope.consultation.newlyAddedDiagnoses.splice(index, 1, diagnosis);
                        getAlerts();
                    }
                };
            };

            function getAlerts () {
                return cdssService.getAlerts($scope.cdssEnabled, $scope.consultation, $scope.patient);
            }

            $scope.hasActiveAlerts = function (alerts) {
                return alerts.some(function (alert) {
                    return alert.isActive;
                });
            };

            var isPastDiagnosisFlagged = function () {
                var pastDiagnoses = $scope.consultation.pastDiagnoses;
                var alerts = $rootScope.cdssAlerts;
                var flaggedDiagnoses = [];
                if (pastDiagnoses && pastDiagnoses.length > 0) {
                    pastDiagnoses.forEach(function (diagnosis) {
                        diagnosis.alerts = alerts.filter(function (cdssAlert) {
                            return cdssAlert.referenceConditions && cdssAlert.referenceConditions.some(function (referenceCondition) {
                                return referenceCondition.coding.some(function (coding) {
                                    return diagnosis.codedAnswer.mappings.some(function (mapping) {
                                        return mapping.code === coding.code;
                                    });
                                });
                            });
                        });
                        if (diagnosis.alerts) {
                            diagnosis.alerts = cdssService.sortInteractionsByStatus(diagnosis.alerts);
                            flaggedDiagnoses.push(diagnosis);
                        }
                    });
                }
                $scope.pastDiagnosesAlerts = flaggedDiagnoses.length > 0;
            };

            var getFlaggedSavedDiagnosisAlert = function () {
                var alerts = $rootScope.cdssAlerts;
                var diagnoses = $scope.consultation.savedDiagnosesFromCurrentEncounter;
                if (diagnoses && diagnoses.length > 0 && alerts) {
                    diagnoses.forEach(function (diagnosis) {
                        diagnosis.alerts = alerts.filter(function (cdssAlert) {
                            return cdssAlert.referenceConditions && cdssAlert.referenceConditions.some(function (referenceCondition) {
                                return referenceCondition.coding.some(function (coding) {
                                    return diagnosis.codedAnswer.mappings.some(function (mapping) {
                                        return mapping.code === coding.code;
                                    });
                                });
                            });
                        });
                        if (diagnosis.alerts) {
                            diagnosis.alerts = cdssService.sortInteractionsByStatus(diagnosis.alerts);
                        }
                    });
                }
            };

            var getAlertForCurrentDiagnosis = function () {
                var alerts = $rootScope.cdssAlerts;
                var diagnoses = $scope.consultation.newlyAddedDiagnoses;
                var flaggedDiagnoses = [];
                if (diagnoses && diagnoses.length > 0 && alerts) {
                    diagnoses.forEach(function (diagnosis) {
                        diagnosis.alerts = alerts.filter(function (cdssAlert) {
                            return cdssAlert.referenceConditions && cdssAlert.referenceConditions.some(function (referenceCondition) {
                                return referenceCondition.coding.some(function (coding) {
                                    return diagnosis.codedAnswer.uuid === coding.code;
                                });
                            });
                        });
                        if (diagnosis.alerts) {
                            diagnosis.alerts = cdssService.sortInteractionsByStatus(diagnosis.alerts);
                            flaggedDiagnoses.push(diagnosis);
                        }
                    });
                }
                return flaggedDiagnoses;
            };

            var getConditionAlerts = function () {
                var alerts = $rootScope.cdssAlerts;
                var condition = $scope.consultation.condition;
                var flaggedConditions = [];
                if (condition && condition.concept && condition.concept.name === '' && alerts) {
                    condition.alerts = [];
                } else if (condition && condition.concept && condition.concept.uuid && alerts) {
                    condition.alerts = alerts.filter(function (cdssAlert) {
                        return cdssAlert.referenceConditions && cdssAlert.referenceConditions.some(function (referenceCondition) {
                            return referenceCondition.coding.some(function (coding) {
                                return condition.concept.uuid.includes(coding.code);
                            });
                        });
                    });
                    if (condition.alerts) {
                        condition.alerts = cdssService.sortInteractionsByStatus(condition.alerts);
                        flaggedConditions.push(condition);
                    }
                }
                return flaggedConditions;
            };

            var getConditionsAlerts = function () {
                var alerts = $rootScope.cdssAlerts;
                var conditions = $scope.consultation.conditions;
                var flaggedConditions = [];
                if (conditions && conditions.length > 0 && alerts) {
                    conditions.forEach(function (condition) {
                        condition.alerts = alerts.filter(function (cdssAlert) {
                            return cdssAlert.referenceConditions && cdssAlert.referenceConditions.some(function (referenceCondition) {
                                return referenceCondition.coding.some(function (coding) {
                                    return condition.concept.uuid.includes(coding.code);
                                });
                            });
                        });
                        if (condition.alerts) {
                            condition.alerts = cdssService.sortInteractionsByStatus(condition.alerts);
                            flaggedConditions.push(condition);
                        }
                    });
                }
                return flaggedConditions;
            };

            var alertsWatch = $rootScope.$watch('cdssAlerts', function () {
                if (!$rootScope.cdssAlerts) return;
                isPastDiagnosisFlagged();
                getFlaggedSavedDiagnosisAlert();
                getAlertForCurrentDiagnosis();
                getConditionAlerts();
                getConditionsAlerts();
            }, true);

            $scope.$on('$destroy', function () {
                alertsWatch();
            });

            var postSave = $rootScope.$on('event:save-successful', function () {
                getAlerts();
            });

            $scope.$on('$destroy', function () {
                postSave();
            });

            var addPlaceHolderDiagnosis = function () {
                var diagnosis = new Bahmni.Common.Domain.Diagnosis('');
                $scope.consultation.newlyAddedDiagnoses.push(diagnosis);
            };

            var findPrivilege = function (privilegeName) {
                return _.find($rootScope.currentUser.privileges, function (privilege) {
                    return privilegeName === privilege.name;
                });
            };

            var init = function () {
                $scope.canDeleteDiagnosis = findPrivilege(Bahmni.Common.Constants.deleteDiagnosisPrivilege);
                $scope.allowOnlyCodedDiagnosis = appService.getAppDescriptor().getConfig("allowOnlyCodedDiagnosis") &&
                                                 appService.getAppDescriptor().getConfig("allowOnlyCodedDiagnosis").value;
                $scope.hideConditions = appService.getAppDescriptor().getConfigValue("hideConditions");
                addPlaceHolderDiagnosis();
                diagnosisService.getDiagnosisConceptSet().then(function (result) {
                    $scope.diagnosisMetaData = result.data.results[0];
                    $scope.isStatusConfigured = function () {
                        var memberFound = _.find($scope.diagnosisMetaData.setMembers, function (member) {
                            return member.name.name === 'Bahmni Diagnosis Status';
                        });
                        return memberFound !== undefined;
                    };
                });
            };

            $scope.checkInvalidDiagnoses = function () {
                $scope.errorMessage = "";
                $scope.consultation.newlyAddedDiagnoses.forEach(function (diagnosis) {
                    if (isDuplicateWithNewlyAddedDiagnosis(diagnosis) || isDuplicateWithSavedDiagnosis(diagnosis)) {
                        $scope.errorMessage = "{{'CLINICAL_DUPLICATE_DIAGNOSIS_ERROR_MESSAGE' | translate }}";
                    }
                });
            };

            var isDuplicateWithNewlyAddedDiagnosis = function (diagnosis) {
                var codedAnswers = _.map(_.remove(_.map($scope.consultation.newlyAddedDiagnoses, 'codedAnswer'), undefined), function (answer) {
                    return answer.name.toLowerCase();
                });
                var codedAnswersCount = _.countBy(codedAnswers);
                diagnosis.duplicate = !!(diagnosis.codedAnswer.name && codedAnswersCount[diagnosis.codedAnswer.name.toLowerCase()] > 1);
                return diagnosis.duplicate;
            };

            var isDuplicateWithSavedDiagnosis = function (diagnosis) {
                var codedAnswers = _.map(_.remove(_.map($scope.consultation.savedDiagnosesFromCurrentEncounter, function (diagnosis) {
                    return diagnosis.codedAnswer.name || diagnosis.freeTextAnswer;
                }), function (answer) {
                    return answer !== undefined;
                }), function (answer) {
                    return answer.toLowerCase();
                });
                var codedAnswersCount = _.countBy(codedAnswers);
                diagnosis.duplicate = (diagnosis.codedAnswer.name && codedAnswersCount[diagnosis.codedAnswer.name.toLowerCase()] > 0);
                return diagnosis.duplicate;
            };

            var contextChange = function () {
                var invalidnewlyAddedDiagnoses = $scope.consultation.newlyAddedDiagnoses.filter(function (diagnosis) {
                    return isDuplicateWithNewlyAddedDiagnosis(diagnosis) || !$scope.isValid(diagnosis) || isDuplicateWithSavedDiagnosis(diagnosis);
                });
                var invalidSavedDiagnosesFromCurrentEncounter = $scope.consultation.savedDiagnosesFromCurrentEncounter.filter(function (diagnosis) {
                    return !$scope.isValid(diagnosis);
                });
                var invalidPastDiagnoses = $scope.consultation.pastDiagnoses.filter(function (diagnosis) {
                    return !$scope.isValid(diagnosis);
                });
                var isValidConditionForm = ($scope.consultation.condition.isEmpty() || $scope.consultation.condition.isValid());
                return {
                    allow: invalidnewlyAddedDiagnoses.length === 0 && invalidPastDiagnoses.length === 0 &&
                    invalidSavedDiagnosesFromCurrentEncounter.length === 0 && isValidConditionForm,
                    errorMessage: $scope.errorMessage
                };
            };
            contextChangeHandler.add(contextChange);

            $scope.$watch('consultation.condition.concept.name', function () {
                if ($scope.consultation.condition.concept.name === '') {
                    getAlerts();
                }
            });

            $scope.$watch('consultation.condition.status', getAlerts);

            $scope.$watch('consultation.conditions', getAlerts);

            $scope.$watch('consultation.newlyAddedDiagnoses', function (present, previous) {
                present.forEach(function (diagnosis, index) {
                    if (previous[index] && previous[index].diagnosisStatus !== diagnosis.diagnosisStatus) {
                        getAlerts();
                    }
                });
            }, true);

            var mapConcept = function (result) {
                return _.map(result.data, function (concept) {
                    var response = {
                        value: concept.matchedName || concept.conceptName,
                        concept: {
                            name: concept.conceptName,
                            uuid: concept.conceptUuid,
                            conceptSystem: concept.conceptSystem
                        },
                        lookup: {
                            name: concept.matchedName || concept.conceptName,
                            uuid: concept.conceptUuid,
                            conceptSystem: concept.conceptSystem
                        }
                    };

                    if (concept.matchedName && concept.matchedName !== concept.conceptName) {
                        response.value = response.value + " => " + concept.conceptName;
                    }
                    if (concept.code) {
                        response.value = response.value + " (" + concept.code + ")";
                    }
                    return response;
                });
            };

            $scope.getAddConditionMethod = function () {
                return function (item) {
                    var conceptSystem = item.lookup.conceptSystem ? item.lookup.conceptSystem + "/" : "";
                    item.lookup.uuid = conceptSystem + item.lookup.uuid;
                    $scope.consultation.condition.concept.uuid = item.lookup.uuid;
                    item.value = $scope.consultation.condition.concept.name = item.lookup.name;
                    getAlerts();
                };
            };

            var findExistingCondition = function (newCondition) {
                return _.find($scope.consultation.conditions, function (condition) {
                    if (newCondition.conditionNonCoded) {
                        return condition.conditionNonCoded == newCondition.conditionNonCoded;
                    }
                    return condition.concept.uuid == newCondition.concept.uuid;
                });
            };

            $scope.filterConditions = function (status) {
                return _.filter($scope.consultation.conditions, {status: status});
            };

            var expandInactiveOnNewInactive = function (condition) {
                if (condition.status == 'INACTIVE') {
                    $scope.toggles.expandInactive = true;
                }
            };

            var updateOrAddCondition = function (condition) {
                var existingCondition = findExistingCondition(condition);
                if (!existingCondition) {
                    $scope.consultation.conditions.push(condition);
                    expandInactiveOnNewInactive(condition);
                    clearCondition();
                    return;
                }
                if (!existingCondition.uuid) {
                    _.pull($scope.consultation.conditions, existingCondition);
                    $scope.consultation.conditions.push(condition);
                    expandInactiveOnNewInactive(condition);
                    clearCondition();
                    return;
                }
                if (existingCondition.isActive()) {
                    messagingService.showMessage('error', 'CONDITION_LIST_ALREADY_EXISTS_AS_ACTIVE');
                    return;
                }
                if (existingCondition.activeSince && condition.onSetDate) {
                    if (!DateUtil.isBeforeDate(existingCondition.activeSince - 1, condition.onSetDate)) {
                        messagingService.showMessage('error', $translate.instant('CONDITION_LIST_ALREADY_EXISTS', {
                            lastActive: DateUtil.formatDateWithoutTime(existingCondition.activeSince),
                            status: existingCondition.status
                        }));
                        return;
                    }
                }
                if (existingCondition.status != condition.status) {
                    existingCondition.onSetDate = condition.onSetDate || DateUtil.today();
                    existingCondition.status = condition.status;
                }
                existingCondition.additionalDetail = condition.additionalDetail;
                if (existingCondition.isActive()) {
                    existingCondition.activeSince = existingCondition.endDate;
                }
                expandInactiveOnNewInactive(condition);
                clearCondition();
            };
            $scope.addCondition = function (condition_) {
                var condition = _.cloneDeep(condition_);
                if (condition_.isNonCoded) {
                    condition.conditionNonCoded = condition.concept.name;
                    condition.concept = {};
                }
                condition.voided = false;
                updateOrAddCondition(new Bahmni.Common.Domain.Condition(condition));
                getConditionsAlerts();
            };
            $scope.markAs = function (condition, status) {
                condition.status = status;
                condition.onSetDate = DateUtil.today();
                expandInactiveOnNewInactive(condition);
                getAlerts();
            };
            var clearCondition = function () {
                $scope.consultation.condition = new Bahmni.Common.Domain.Condition();
                $scope.consultation.condition.showNotes = false;
            };

            $scope.addDiagnosisToConditions = function (diagnosis) {
                updateOrAddCondition(Bahmni.Common.Domain.Condition.createFromDiagnosis(diagnosis));
            };
            $scope.cannotBeACondition = function (diagnosis) {
                return diagnosis.certainty != 'CONFIRMED' || alreadyHasActiveCondition(diagnosis);
            };

            $scope.addConditionAsFollowUp = function (condition) {
                condition.isFollowUp = true;
                var followUpCondition = {
                    concept: {
                        uuid: $scope.followUpConditionConcept.uuid
                    },
                    value: condition.uuid,
                    voided: false
                };
                $scope.consultation.followUpConditions.push(followUpCondition);
            };

            var alreadyHasActiveCondition = function (diagnosis) {
                var existingCondition = findExistingCondition(Bahmni.Common.Domain.Condition.createFromDiagnosis(diagnosis));
                return existingCondition && existingCondition.isActive();
            };

            $scope.cleanOutDiagnosisList = function (allDiagnoses) {
                return allDiagnoses ? allDiagnoses.filter(function (diagnosis) {
                    return !alreadyAddedToDiagnosis(diagnosis);
                }) : [];
            };

            var alreadyAddedToDiagnosis = function (diagnosis) {
                var isPresent = false;
                $scope.consultation.newlyAddedDiagnoses.forEach(function (d) {
                    if (d.codedAnswer.uuid === diagnosis.concept.uuid) {
                        isPresent = true;
                    }
                });
                return isPresent;
            };

            $scope.removeObservation = function (index) {
                if (index >= 0) {
                    $scope.consultation.newlyAddedDiagnoses.splice(index, 1);
                    getAlerts();
                }
            };

            $scope.clearDiagnosis = function (index) {
                var diagnosisBeingEdited = $scope.consultation.newlyAddedDiagnoses[index];
                diagnosisBeingEdited.clearCodedAnswerUuid();
            };

            var reloadDiagnosesSection = function (encounterUuid) {
                return diagnosisService.getPastAndCurrentDiagnoses($scope.patient.uuid, encounterUuid).then(function (response) {
                    $scope.consultation.pastDiagnoses = response.pastDiagnoses;
                    $scope.consultation.savedDiagnosesFromCurrentEncounter = response.savedDiagnosesFromCurrentEncounter;
                });
            };

            $scope.deleteDiagnosis = function (diagnosis) {
                var obsUUid = diagnosis.existingObs !== null ? diagnosis.existingObs : diagnosis.previousObs;

                spinner.forPromise(
                    diagnosisService.deleteDiagnosis(obsUUid).then(function () {
                        messagingService.showMessage('info', 'DELETED_MESSAGE');
                        var currentUuid = $scope.consultation.savedDiagnosesFromCurrentEncounter.length > 0
                            ? $scope.consultation.savedDiagnosesFromCurrentEncounter[0].encounterUuid : "";
                        getAlerts();
                        return reloadDiagnosesSection(currentUuid);
                    }));
            };
            var clearBlankDiagnosis = true;
            var removeBlankDiagnosis = function () {
                if (clearBlankDiagnosis) {
                    $scope.consultation.newlyAddedDiagnoses = $scope.consultation.newlyAddedDiagnoses
                        .filter(function (diagnosis) {
                            return !diagnosis.isEmpty();
                        });
                    clearBlankDiagnosis = false;
                }
            };

            $scope.consultation.preSaveHandler.register("diagnosisSaveHandlerKey", removeBlankDiagnosis);
            $scope.$on('$destroy', removeBlankDiagnosis);

            $scope.processDiagnoses = function (data) {
                data.map(
                    function (concept) {
                        if (concept.conceptName === concept.matchedName) {
                            return {
                                'value': concept.matchedName,
                                'concept': concept
                            };
                        }
                        return {
                            'value': concept.matchedName + "=>" + concept.conceptName,
                            'concept': concept
                        };
                    }
                );
            };
            $scope.restEmptyRowsToOne = function (index) {
                var iter;
                for (iter = 0; iter < $scope.consultation.newlyAddedDiagnoses.length; iter++) {
                    if ($scope.consultation.newlyAddedDiagnoses[iter].isEmpty() && iter !== index) {
                        $scope.consultation.newlyAddedDiagnoses.splice(iter, 1);
                    }
                }
                var emptyRows = $scope.consultation.newlyAddedDiagnoses.filter(function (diagnosis) {
                    return diagnosis.isEmpty();
                });
                if (emptyRows.length === 0) {
                    addPlaceHolderDiagnosis();
                } else {
                    getAlerts();
                }
                clearBlankDiagnosis = true;
            };

            $scope.toggle = function (item) {
                item.show = !item.show;
            };

            $scope.isValid = function (diagnosis) {
                return diagnosis.isValidAnswer() && diagnosis.isValidOrder() && diagnosis.isValidCertainty();
            };

            $scope.isRetrospectiveMode = retrospectiveEntryService.isRetrospectiveMode;
            init();
        }
    ]);
