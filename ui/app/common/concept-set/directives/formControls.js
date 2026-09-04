/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('formControls', ['formService', 'spinner', '$timeout', '$translate', 'configurationService',
        function (formService, spinner, $timeout, $translate, configurationService) {
            var loadedFormDetails = {};
            var loadedFormTranslations = {};

            var controller = function ($scope) {
                var formUuid = $scope.form.formUuid;
                var formVersion = $scope.form.formVersion;
                var formName = $scope.form.formName;
                var collapse = $scope.form.collapseInnerSections && $scope.form.collapseInnerSections.value;
                var validateForm = $scope.validateForm || false;
                var locale = $translate.use();
                var allowedDomains = [];

                var unmountExistingForm = function () {
                    var containerEl = document.getElementById(formUuid);
                    if (containerEl && typeof unMountForm === 'function') {
                        unMountForm(containerEl);
                    }
                };

                var renderForm = function (formDetails, formTranslations) {
                    $scope.form.needsReRender = false;
                    unmountExistingForm();
                    var collapse = $scope.form.collapseInnerSections && $scope.form.collapseInnerSections.value;
                    $scope.form.component = renderWithControls(formDetails, $scope.form.observations,
                        formUuid, collapse, $scope.patient, validateForm, locale, formTranslations,
                        allowedDomains);
                };

                var loadForm = function () {
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
                                            renderForm(formDetails, formTranslations);
                                        }, function () {
                                            var formTranslations = {};
                                            loadedFormTranslations[formUuid] = formTranslations;
                                            renderForm(formDetails, formTranslations);
                                        })
                                    );
                                }
                            })
                        );
                    } else {
                        $timeout(function () {
                            $scope.form.events = loadedFormDetails[formUuid].events;
                            renderForm(loadedFormDetails[formUuid], loadedFormTranslations[formUuid]);
                        }, 0, false);
                    }
                };

                configurationService.getConfigurations(['hyperlinkAllowedDomains'])
                    .then(function (configurations) {
                        var domainsData = configurations.hyperlinkAllowedDomains || '';
                        allowedDomains = (domainsData || '').split(',').map(function (d) { return d.trim(); }).filter(function (d) { return d; });
                        loadForm();
                    })
                    .catch(function (error) {
                        console.debug('Failed to fetch hyperlink allowed domains:', error);
                        loadForm();
                    });

                $scope.$watch('form.collapseInnerSections', function () {
                    collapse = $scope.form.collapseInnerSections && $scope.form.collapseInnerSections.value;
                    if (loadedFormDetails[formUuid]) {
                        renderForm(loadedFormDetails[formUuid], loadedFormTranslations[formUuid]);
                    }
                }, true);

                $scope.$watch('form.observations', function (newVal, oldVal) {
                    if (newVal !== oldVal && loadedFormDetails[formUuid] && $scope.form.needsReRender) {
                        renderForm(loadedFormDetails[formUuid], loadedFormTranslations[formUuid]);
                    }
                });

                $scope.$on('$destroy', function () {
                    $scope.form.needsReRender = false;
                    unmountExistingForm();
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
