'use strict';

angular.module('bahmni.clinical')
    .controller('DiagnosisController', ['$scope', '$rootScope', 'diagnosisService', 'messagingService', 'contextChangeHandler', 'spinner', 'appService',
        function ($scope, $rootScope, diagnosisService, messagingService, contextChangeHandler, spinner, appService) {
            $scope.placeholder = "Add Diagnosis";
            $scope.hasAnswers = false;

            $scope.orderOptions = ['PRIMARY', 'SECONDARY'];
            $scope.certaintyOptions = ['CONFIRMED', 'PRESUMED'];

            $scope.getDiagnosis = function (params) {
                return diagnosisService.getAllFor(params.term);
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
                    }
                };
            };

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
                    if (isInvalidDiagnosis(diagnosis)) {
                        $scope.errorMessage = "{{'CLINICAL_DUPLICATE_DIAGNOSIS_ERROR_MESSAGE' | translate }}";
                    }
                });
            };

            var isInvalidDiagnosis = function (diagnosis) {
                var codedAnswers = _.map(_.remove(_.map($scope.consultation.newlyAddedDiagnoses, 'codedAnswer'), undefined), function (answer) {
                    return answer.name.toLowerCase();
                });
                var codedAnswersCount = _.countBy(codedAnswers);
                diagnosis.invalid = !!(diagnosis.codedAnswer.name && codedAnswersCount[diagnosis.codedAnswer.name.toLowerCase()] > 1);
                return diagnosis.invalid;
            };

            var contextChange = function () {
                var invalidnewlyAddedDiagnoses = $scope.consultation.newlyAddedDiagnoses.filter(function (diagnosis) {
                    return isInvalidDiagnosis(diagnosis) || !$scope.isValid(diagnosis);
                });
                var invalidSavedDiagnosesFromCurrentEncounter = $scope.consultation.savedDiagnosesFromCurrentEncounter.filter(function (diagnosis) {
                    return !$scope.isValid(diagnosis);
                });
                var invalidPastDiagnoses = $scope.consultation.pastDiagnoses.filter(function (diagnosis) {
                    return !$scope.isValid(diagnosis);
                });
                return {
                    allow: invalidnewlyAddedDiagnoses.length === 0 && invalidPastDiagnoses.length === 0 && invalidSavedDiagnosesFromCurrentEncounter.length === 0, errorMessage: $scope.errorMessage
                };
            };
            contextChangeHandler.add(contextChange);

            $scope.cleanOutDiagnosisList = function (result) {
                var data = result.data;
                var mappedResponse = data.map(
                    function (concept) {
                        if (concept.conceptName === concept.matchedName) {
                            return {
                                'value': concept.matchedName,
                                'concept': {
                                    'name': concept.conceptName,
                                    'uuid': concept.conceptUuid
                                },
                                lookup: {
                                    'name': concept.conceptName,
                                    'uuid': concept.conceptUuid
                                }
                            };
                        }
                        return {
                            'value': concept.matchedName + "=>" + concept.conceptName,
                            'concept': {
                                'name': concept.conceptName,
                                'uuid': concept.conceptUuid
                            },
                            lookup: {
                                'name': concept.matchedName,
                                'uuid': concept.conceptUuid
                            }
                        };
                    }
                );
                return filterOutSelectedDiagnoses(mappedResponse);
            };

            var filterOutSelectedDiagnoses = function (allDiagnoses) {
                return allDiagnoses.filter(function (diagnosis) {
                    return !alreadyAddedToDiagnosis(diagnosis);
                });
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
                            messagingService.showMessage('info', 'Deleted');
                            var currentUuid = $scope.consultation.savedDiagnosesFromCurrentEncounter.length > 0 ?
                                $scope.consultation.savedDiagnosesFromCurrentEncounter[0].encounterUuid : "";
                            return reloadDiagnosesSection(currentUuid);
                        }))
                    .then(function () {});
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
                }
                clearBlankDiagnosis = true;
            };

            $scope.toggle = function (item) {
                item.show = !item.show;
            };

            $scope.isValid = function (diagnosis) {
                return diagnosis.isValidAnswer() && diagnosis.isValidOrder() && diagnosis.isValidCertainty();
            };

            init();
        }
    ]);
