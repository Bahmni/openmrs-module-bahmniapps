'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('formControls', ['formService', 'spinner', '$timeout', '$translate', '$state', 'messagingService', 'exitAlertService',
        function (formService, spinner, $timeout, $translate, $state, messagingService, exitAlertService) {
            var loadedFormDetails = {};
            var loadedFormTranslations = {};
            var unMountReactContainer = function (formUuid) {
                var reactContainerElement = angular.element(document.getElementById(formUuid));
                reactContainerElement.on('$destroy', function () {
                    unMountForm(document.getElementById(formUuid));
                });
            };

            var controller = function ($scope) {
                var formUuid = $scope.form.formUuid;
                var formVersion = $scope.form.formVersion;
                var formName = $scope.form.formName;
                var formObservations = $scope.form.observations;
                var collapse = $scope.form.collapseInnerSections && $scope.form.collapseInnerSections.value;
                var validateForm = $scope.validateForm || false;
                var locale = $translate.use();

                if (!loadedFormDetails[formUuid]) {
                    spinner.forPromise(formService.getFormDetail(formUuid, { v: "custom:(resources:(value))" })
                        .then(function (response) {
                            var formDetailsAsString = _.get(response, 'data.resources[0].value');
                            if (formDetailsAsString) {
                                var formDetails = JSON.parse(formDetailsAsString);
                                formDetails.version = formVersion;
                                loadedFormDetails[formUuid] = formDetails;
                                var formParams = { formName: formName, formVersion: formVersion, locale: locale, formUuid: formUuid };
                                $scope.form.events = formDetails.events;
                                spinner.forPromise(formService.getFormTranslations(formDetails.translationsUrl, formParams)
                                    .then(function (response) {
                                        var formTranslations = !_.isEmpty(response.data) ? response.data[0] : {};
                                        loadedFormTranslations[formUuid] = formTranslations;
                                        $scope.form.component = renderWithControls(formDetails, formObservations,
                                            formUuid, collapse, $scope.patient, validateForm, locale, formTranslations);
                                    }, function () {
                                        var formTranslations = {};
                                        loadedFormTranslations[formUuid] = formTranslations;
                                        $scope.form.component = renderWithControls(formDetails, formObservations,
                                            formUuid, collapse, $scope.patient, validateForm, locale, formTranslations);
                                    })
                                );
                            }
                            unMountReactContainer($scope.form.formUuid);
                        })
                    );
                } else {
                    $timeout(function () {
                        $scope.form.events = loadedFormDetails[formUuid].events;
                        $scope.form.component = renderWithControls(loadedFormDetails[formUuid], formObservations,
                            formUuid, collapse, $scope.patient, validateForm, locale, loadedFormTranslations[formUuid]);
                        unMountReactContainer($scope.form.formUuid);
                    }, 0, false);
                }

                $scope.$watch('form.collapseInnerSections', function () {
                    var collapse = $scope.form.collapseInnerSections && $scope.form.collapseInnerSections.value;
                    if (loadedFormDetails[formUuid]) {
                        $scope.form.component = renderWithControls(loadedFormDetails[formUuid], formObservations,
                            formUuid, collapse, $scope.patient, validateForm, locale, loadedFormTranslations[formUuid]);
                    }
                });

                $scope.$on('$destroy', function () {
                    if ($scope.$parent.consultation && $scope.$parent.consultation.observationForms) {
                        if ($scope.form.component) {
                            var formObservations = $scope.form.component.getValue();
                            $scope.form.observations = formObservations.observations;

                            var hasError = formObservations.errors;
                            if (!_.isEmpty(hasError)) {
                                $scope.form.isValid = false;
                            }
                        }
                    }
                });
                function checkGroupMembers (formObservation, consultationObservation) {
                    var isGroupMemberChanged = [];
                    if (formObservation.groupMembers && formObservation.groupMembers.length > 0 && consultationObservation.groupMembers && consultationObservation.groupMembers.length > 0) {
                        for (var k = 0; k < formObservation.groupMembers.length; k++) {
                            var formGroupMember = formObservation.groupMembers[k];
                            for (var l = 0; l < consultationObservation.groupMembers.length; l++) {
                                var consultationGroupMember = consultationObservation.groupMembers[l];
                                (formGroupMember.value && formGroupMember.value.uuid && consultationGroupMember.value && consultationGroupMember.value.uuid) ?
                                isGroupMemberChanged[k] = (consultationGroupMember.value.uuid === formGroupMember.value.uuid) ? false : true :
                                isGroupMemberChanged[k] = (consultationGroupMember.value === formGroupMember.value) ? false : true;
                                if (!isGroupMemberChanged[k]) {
                                    break;
                                }
                            }
                        }
                        return isGroupMemberChanged.includes(true) ? true : false;
                    } else {
                        if (formObservation.value && formObservation.value.uuid && consultationObservation.value && consultationObservation.value.uuid) {
                            return (consultationObservation.value.uuid === formObservation.value.uuid) ? false : true;
                        } else {
                            return (consultationObservation.value === formObservation.value) ? false : true;
                        }
                    }
                }

                function checkFormChanges ($scope) {
                    var isChanged = [];
                    $scope.dirtyForm = false;
                    if ($scope.form.observations.length > 0) {
                        if ($scope.$parent.consultation.observations.length === 0) {
                            return true;
                        }
                        for (var i = 0; i < $scope.form.observations.length; i++) {
                            var formObservation = $scope.form.observations[i];
                            for (var j = 0; j < $scope.$parent.consultation.observations.length; j++) {
                                var consultationObservation = $scope.$parent.consultation.observations[j];
                                isChanged[i] = checkGroupMembers(formObservation, consultationObservation);
                                if (!isChanged[i]) {
                                    break;
                                }
                            }
                        }
                        return isChanged.includes(true);
                    }
                }

                $scope.$on('$stateChangeStart', function (event, next, current) {
                    var uuid = $state.params.patientUuid;
                    var currentUuid = current.patientUuid;
                    if ($scope.form.component) {
                        var formObservations = $scope.form.component.getValue();
                        $scope.form.observations = formObservations.observations;
                    }
                    if (!$scope.changesSaved) {
                        $scope.dirtyForm = checkFormChanges($scope);
                    }
                    var isNavigating = exitAlertService.setIsNavigating(next, uuid, currentUuid);
                    $state.dirtyConsultationForm = $state.discardChanges ? false : $scope.dirtyForm;
                    exitAlertService.showExitAlert(isNavigating, $state.dirtyConsultationForm, event, next.spinnerToken);
                });

                $scope.$on("event:changes-saved", function () {
                    $scope.changesSaved = true;
                    $scope.dirtyForm = false;
                });
            };

            return {
                restrict: 'E',
                scope: {
                    form: "=",
                    patient: "=",
                    validateForm: "="
                },
                controller: controller
            };
        }]);
