'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('formControls', ['formService', 'spinner', '$timeout', '$translate', 'messagingService', 'appService', '$state',
        function (formService, spinner, $timeout, $translate, messagingService, appService, $state) {
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
                $state.isSaveInProgress = false;

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
            };

            function checkIfFormIsDirty ($scope) {
                var checkAlreadyPresent = [];

                if ($scope.form.component && $scope.form.component.getValue().observations.length > 0 &&
                    $scope.$parent.consultation && $scope.$parent.consultation.observations) {
                    var formObservations = $scope.form.component.getValue().observations;
                    var observations = $scope.$parent.consultation.observations;
                    for (var i = 0; i < formObservations.length; i++) {
                        for (var j = 0; j < observations.length; j++) {
                            if (formObservations[i].concept.uuid === observations[j].concept.uuid &&
                                formObservations[i].value === observations[j].value) {
                                checkAlreadyPresent[i] = true;
                            }
                        }
                    }
                }
                return checkAlreadyPresent;
            }

            function getAllBoards () {
                return appService.getAppDescriptor().getExtensions("org.bahmni.clinical.consultation.board", "link");
            }

            var link = function ($scope, elem, attrs) {
                $scope.$on('$stateChangeStart', function (event, next, current) {
                    if (!$state.isSaveInProgress) {
                        var navigating = next.url.split("/")[1];
                        var allConsultationBoards = getAllBoards();
                        var outOfConsultationBoard = true;
                        allConsultationBoards.forEach(function (board) {
                            var consultationLink = board.url.split("/")[0];
                            if (navigating.includes(consultationLink)) {
                                outOfConsultationBoard = false;
                            }
                        });
                        if (next.url.includes("/dashboard") && $state.params.patientUuid === current.patientUuid) {
                            outOfConsultationBoard = false;
                        }

                        var checkAlreadyPresent = checkIfFormIsDirty($scope);

                        var alreadyPresent = checkAlreadyPresent.length > 0 && _.every(checkAlreadyPresent, function (value) {
                            return value;
                        });
                        if (!alreadyPresent) {
                            $state.dirtyConsultationForm = true;
                        }

                        if (outOfConsultationBoard && $state.dirtyConsultationForm) {
                            messagingService.showMessage('error', "{{'CONSULTATION_TAB_OBSERVATION_ERROR' | translate }}");
                            event.preventDefault();
                            spinner.hide(next.spinnerToken);
                        }
                    }
                });
            };

            return {
                restrict: 'E',
                scope: {
                    form: "=",
                    patient: "=",
                    validateForm: "="
                },
                controller: controller,
                link: link
            };
        }]);
