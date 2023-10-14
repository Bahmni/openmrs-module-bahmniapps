'use strict';

angular.module('bahmni.common.obs')
    .directive('editObservation', ['$q', 'spinner', '$state', '$rootScope', 'ngDialog', 'messagingService',
        'encounterService', 'configurations', 'contextChangeHandler', 'auditLogService', 'formService',
        function ($q, spinner, $state, $rootScope, ngDialog, messagingService, encounterService, configurations,
                  contextChangeHandler, auditLogService, formService) {
            var controller = function ($scope) {
                var ObservationUtil = Bahmni.Common.Obs.ObservationUtil;
                var findEditableObs = function (observations) {
                    return _.find(observations, function (obs) {
                        return obs.uuid === $scope.observation.uuid;
                    });
                };
                var shouldEditSpecificObservation = function () {
                    return $scope.observation.uuid ? true : false;
                };
                var contextChange = function () {
                    return contextChangeHandler.execute();
                };

                var init = function () {
                    var consultationMapper = new Bahmni.ConsultationMapper(configurations.dosageFrequencyConfig(), configurations.dosageInstructionConfig(),
                        configurations.consultationNoteConcept(), configurations.labOrderNotesConcept());

                    return encounterService.findByEncounterUuid($scope.observation.encounterUuid).then(function (reponse) {
                        var encounterTransaction = reponse.data;
                        $scope.encounter = consultationMapper.map(encounterTransaction);
                        $scope.editableObservations = [];
                        if (shouldEditSpecificObservation()) {
                            var editableObs = findEditableObs(ObservationUtil.flattenObsToArray($scope.encounter.observations));
                            if (editableObs) {
                                $scope.editableObservations.push(editableObs);
                            } else {
                                messagingService.showMessage('error', "{{'CLINICAL_FORM_EDIT_ERROR_MESSAGE_KEY' | translate}}");
                            }
                        } else {
                            $scope.editableObservations = $scope.encounter.observations;
                        }
                        $scope.patient = {uuid: $scope.encounter.patientUuid};
                        if ($scope.isFormBuilderForm()) {
                            setFormDetails();
                        }
                    });
                };

                $scope.isFormBuilderForm = function () {
                    return $scope.observation.formType === Bahmni.Common.Constants.formBuilderType;
                };

                $scope.getFormDisplayName = function (conceptDisplayName) {
                    return $scope.formDetails ? $scope.formDetails.label : conceptDisplayName;
                };
                var setFormDetails = function () {
                    formService.getAllForms().then(function (response) {
                        var allForms = response.data;
                        var observationForm = getFormByFormName(allForms, $scope.observation.formName, $scope.observation.formVersion);
                        var label = $scope.observation.formName;
                        if (observationForm) {
                            var locale = localStorage.getItem("NG_TRANSLATE_LANG_KEY") || "en";
                            var currentLabel = observationForm.nameTranslation && JSON.parse(observationForm.nameTranslation)
                                .find(function (formNameTranslation) {
                                    return formNameTranslation.locale === locale;
                                });
                            if (currentLabel) {
                                label = currentLabel.display;
                            }
                            $scope.formDetails = new Bahmni.ObservationForm(
                                observationForm.uuid, $rootScope.currentUser, $scope.observation.formName,
                                $scope.observation.formVersion, $scope.editableObservations, label);
                        }
                    });
                };

                var getFormByFormName = function (formList, formName, formVersion) {
                    return _.find(formList, function (form) {
                        return form.name == formName && form.version == formVersion;
                    });
                };

                var showErrorMessage = function (errMsg) {
                    var errorMessage = errMsg ? errMsg : "{{'CLINICAL_FORM_ERRORS_MESSAGE_KEY' | translate }}";
                    messagingService.showMessage('error', errorMessage);
                };

                var isFormValid = function () {
                    var contxChange = contextChange();
                    var shouldAllow = contxChange["allow"];
                    if (!shouldAllow) {
                        showErrorMessage(contxChange["errorMessage"]);
                    }
                    return shouldAllow;
                };

                $scope.$parent.resetContextChangeHandler = function () {
                    contextChangeHandler.reset();
                };

                $scope.save = function () {
                    if (!isFormValid()) {
                        $scope.$parent.$parent.$broadcast("event:errorsOnForm");
                        return;
                    }
                    $scope.$parent.shouldPromptBeforeClose = false;
                    $scope.$parent.shouldPromptBrowserReload = false;
                    var updateEditedObservation = function (observations) {
                        return _.map(observations, function (obs) {
                            if (obs.uuid == $scope.editableObservations[0].uuid) {
                                return $scope.editableObservations[0];
                            } else {
                                obs.groupMembers = updateEditedObservation(obs.groupMembers);
                                return obs;
                            }
                        });
                    };

                    var getEditedObservation = function (observations) {
                        return _.find(observations, function (obs) {
                            return obs.uuid == $scope.editableObservations[0].uuid || getEditedObservation(obs.groupMembers);
                        });
                    };

                    if (shouldEditSpecificObservation()) {
                        var allObservations = updateEditedObservation($scope.encounter.observations);
                        $scope.encounter.observations = [getEditedObservation(allObservations)];
                    }

                    if ($scope.isFormBuilderForm()) {
                        var editedObservation = $scope.formDetails.component.getValue();
                        if (editedObservation.errors) {
                            showErrorMessage();
                            return;
                        }
                        $scope.encounter.observations = editedObservation.observations;
                    }
                    $scope.encounter.observations = new Bahmni.Common.Domain.ObservationFilter().filter($scope.encounter.observations);
                    $scope.encounter.orders = addOrdersToEncounter();
                    $scope.encounter.extensions = {};
                    var createPromise = encounterService.create($scope.encounter);
                    spinner.forPromise(createPromise).then(function (savedResponse) {
                        var messageParams = {
                            encounterUuid: savedResponse.data.encounterUuid,
                            encounterType: savedResponse.data.encounterType
                        };
                        auditLogService.log($scope.patient.uuid, "EDIT_ENCOUNTER", messageParams, "MODULE_LABEL_CLINICAL_KEY");
                        $rootScope.hasVisitedConsultation = false;
                        $state.go($state.current, {}, {reload: true});
                        ngDialog.close();
                        messagingService.showMessage('info', "{{'CLINICAL_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
                    });
                };

                var addOrdersToEncounter = function () {
                    var modifiedOrders = _.filter($scope.encounter.orders, function (order) {
                        return order.hasBeenModified || order.isDiscontinued || !order.uuid;
                    });
                    var tempOrders = modifiedOrders.map(function (order) {
                        if (order.hasBeenModified && !order.isDiscontinued) {
                            return Bahmni.Clinical.Order.revise(order);
                        } else if (order.isDiscontinued) {
                            return Bahmni.Clinical.Order.discontinue(order);
                        }
                        return {
                            uuid: order.uuid, concept: {name: order.concept.name, uuid: order.concept.uuid},
                            commentToFulfiller: order.commentToFulfiller
                        };
                    });
                    return tempOrders;
                };

                spinner.forPromise(init());
            };

            return {
                restrict: 'E',
                scope: {
                    observation: "=",
                    conceptSetName: "@",
                    conceptDisplayName: "@"
                },
                controller: controller,
                template: '<ng-include src="\'../common/obs/views/editObservation.html\'" />'
            };
        }]);
