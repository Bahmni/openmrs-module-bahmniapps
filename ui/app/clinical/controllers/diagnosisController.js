'use strict';

angular.module('bahmni.clinical')
    .controller('DiagnosisController', ['$scope', '$rootScope', '$stateParams', 'diagnosisService', 'contextChangeHandler',
        function ($scope, $rootScope, $stateParams, diagnosisService, contextChangeHandler) {
            
            $scope.placeholder = "Add Diagnosis";
            $scope.hasAnswers = false;

            $scope.orderOptions = ['PRIMARY', 'SECONDARY'];
            $scope.certaintyOptions = ['CONFIRMED', 'PRESUMED'];
            $scope.diagnosisStatuses = ['RULED OUT'];

            $scope.getDiagnosis = function (searchTerm) {
                return diagnosisService.getAllFor(searchTerm);
            };

            var _canAdd = function (diagnosis) {
                var canAdd = true;
                $scope.newlyAddedDiagnoses.forEach(function (observation) {
                    if (observation.codedAnswer.uuid === diagnosis.codedAnswer.uuid) {
                        canAdd = false;
                    }
                });
                return canAdd;
            };

            $scope.addNewDiagnosis = function (index, concept) {
                var diagnosisBeingEdited = $scope.newlyAddedDiagnoses[index];
                var diagnosis = new Bahmni.Clinical.Diagnosis(concept, diagnosisBeingEdited.order,
                    diagnosisBeingEdited.certainty, diagnosisBeingEdited.existingObs);
                if (_canAdd(diagnosis)) {
                    $scope.newlyAddedDiagnoses.splice(index, 1, diagnosis);
                }
            };

            var addPlaceHolderDiagnosis = function () {
                var diagnosis = new Bahmni.Clinical.Diagnosis('');
                $scope.newlyAddedDiagnoses.push(diagnosis);
            };

            var init = function () {
                $scope.newlyAddedDiagnoses = $rootScope.consultation.newlyAddedDiagnoses;
                addPlaceHolderDiagnosis();
            };

            var contextChange = function () {
                var invalidnewlyAddedDiagnoses = $scope.newlyAddedDiagnoses.filter(function (diagnosis) {
                    return !$scope.isValid(diagnosis);
                });
                var invalidSavedDiagnosesFromCurrentEncounter = $rootScope.consultation.savedDiagnosesFromCurrentEncounter.filter(function (diagnosis) {
                    return !$scope.isValid(diagnosis);
                });
                var invalidPastDiagnoses = $rootScope.consultation.pastDiagnoses.filter(function (diagnosis) {
                    return !$scope.isValid(diagnosis);
                });
                return {allow: invalidnewlyAddedDiagnoses.length === 0 && invalidPastDiagnoses.length === 0 && invalidSavedDiagnosesFromCurrentEncounter.length === 0};
            };
            contextChangeHandler.add(contextChange);

            $scope.cleanOutDiagnosisList = function (data) {
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
                            }
                        }
                        return {
                            'value': concept.matchedName + "=>" + concept.conceptName,
                            'concept': {
                                'name': concept.conceptName,
                                'uuid': concept.conceptUuid
                            },
                            lookup: {
                                'name': concept.conceptName,
                                'uuid': concept.conceptUuid
                            }
                        }
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
                $scope.newlyAddedDiagnoses.forEach(function (d) {
                    if (d.codedAnswer.uuid == diagnosis.concept.uuid) {
                        isPresent = true;
                    }
                });
                return isPresent;
            };
            
            $scope.removeObservation = function (index) {
                if (index >= 0) {
                    $scope.newlyAddedDiagnoses.splice(index, 1);
                }
            };

            $scope.clearDiagnosis = function(index) {
                var diagnosisBeingEdited = $scope.newlyAddedDiagnoses[index];
                diagnosisBeingEdited.clearCodedAnswerUuid();
            };


            var setDiagnosis = function () {
                $rootScope.consultation.newlyAddedDiagnoses = $scope.newlyAddedDiagnoses.filter(function (diagnosis) {
                    return !diagnosis.isEmpty();
                });
            };

            var saveDiagnosis = function () {
                setDiagnosis();
            };

            $scope.consultation.saveHandler.register(saveDiagnosis);
            $scope.consultation.postSaveHandler.register(init);

            $scope.$on('$destroy', setDiagnosis);

            $scope.processDiagnoses = function (data) {
                data.map(
                    function (concept) {
                        if (concept.conceptName === concept.matchedName) {
                            return {
                                'value': concept.matchedName,
                                'concept': concept
                            }
                        }
                        return {
                            'value': concept.matchedName + "=>" + concept.conceptName,
                            'concept': concept
                        }
                    }
                );
            };

            $scope.clearEmptyRows = function (index) {
                var iter;
                for (iter = 0; iter < $scope.newlyAddedDiagnoses.length; iter++) {
                    if ($scope.newlyAddedDiagnoses[iter].isEmpty() && iter !== index) {
                        $scope.newlyAddedDiagnoses.splice(iter, 1)
                    }
                }
                var emptyRows = $scope.newlyAddedDiagnoses.filter(function (diagnosis) {
                        return diagnosis.isEmpty();
                    }
                );
                if (emptyRows.length == 0) {
                    addPlaceHolderDiagnosis();
                }
            };

            $scope.toggle = function (item) {
                item.show = !item.show
            };

            $scope.isValid = function (diagnosis) {
                return diagnosis.isValidAnswer() && diagnosis.isValidOrder() && diagnosis.isValidCertainty();
            };

            init();

        }]);
