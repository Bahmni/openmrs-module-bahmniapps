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
    .controller('ConceptSetGroupController', ['$scope', 'contextChangeHandler', 'spinner', 'messagingService',
        'conceptSetService', '$rootScope', 'sessionService', 'encounterService', 'treatmentConfig',
        'retrospectiveEntryService', 'userService', 'conceptSetUiConfigService', '$timeout', 'clinicalAppConfigService', '$stateParams', '$translate',
        function ($scope, contextChangeHandler, spinner, messagingService, conceptSetService, $rootScope, sessionService,
                  encounterService, treatmentConfig, retrospectiveEntryService, userService,
                  conceptSetUiConfigService, $timeout, clinicalAppConfigService, $stateParams, $translate) {
            var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
            var init = function () {
                if ($scope.consultation && $scope.allTemplates) {
                    $scope.validationHandler = new Bahmni.ConceptSet.ConceptSetGroupPanelViewValidationHandler($scope.allTemplates, $scope.consultation);
                    contextChangeHandler.add($scope.validationHandler.validate);
                }
            };
            $scope.toggleSideBar = function () {
                $rootScope.showLeftpanelToggle = !$rootScope.showLeftpanelToggle;
            };
            $scope.showLeftpanelToggle = function () {
                return $rootScope.showLeftpanelToggle;
            };

            $scope.togglePref = function (conceptSet, conceptName) {
                $rootScope.currentUser.toggleFavoriteObsTemplate(conceptName);
                spinner.forPromise(userService.savePreferences());
            };

            $scope.getNormalized = function (conceptName) {
                return conceptName.replace(/['\.\s\(\)\/,\\]+/g, "_");
            };

            $scope.showPreviousButton = function (conceptSetName) {
                return conceptSetUIConfig[conceptSetName] && conceptSetUIConfig[conceptSetName].showPreviousButton;
            };

            $scope.showPrevious = function (conceptSetName, event) {
                event.stopPropagation();
                $timeout(function () {
                    $scope.$broadcast('event:showPrevious' + conceptSetName);
                });
            };
            $scope.isInEditEncounterMode = function () {
                return $stateParams.encounterUuid !== undefined && $stateParams.encounterUuid !== 'active';
            };

            $scope.computeField = function (conceptSet, event) {
                event.stopPropagation();
                $scope.consultation.preSaveHandler.fire();
                var defaultRetrospectiveVisitType = clinicalAppConfigService.getVisitTypeForRetrospectiveEntries();

                var encounterData = new Bahmni.Clinical.EncounterTransactionMapper().map(angular.copy($scope.consultation), $scope.patient, sessionService.getLoginLocationUuid(),
                    retrospectiveEntryService.getRetrospectiveEntry(), defaultRetrospectiveVisitType, $scope.isInEditEncounterMode());
                encounterData = encounterService.buildEncounter(encounterData);
                encounterData.drugOrders = [];

                var conceptSetData = {name: conceptSet.conceptName, uuid: conceptSet.uuid};
                var data = {
                    encounterModifierObservations: encounterData.observations,
                    drugOrders: encounterData.drugOrders,
                    conceptSetData: conceptSetData,
                    patientUuid: encounterData.patientUuid,
                    encounterDateTime: encounterData.encounterDateTime
                };

                spinner.forPromise(treatmentConfig().then(function (treatmentConfig) {
                    $scope.treatmentConfiguration = treatmentConfig;
                    return conceptSetService.getComputedValue(data);
                }).then(function (response) {
                    response = response.data;
                    copyValues($scope.consultation.observations, response.encounterModifierObservations);
                    $scope.consultation.newlyAddedTreatments = $scope.consultation.newlyAddedTreatments || [];
                    response.drugOrders.forEach(function (drugOrder) {
                        $scope.consultation.newlyAddedTreatments.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, $scope.treatmentConfiguration));
                    });
                }));
            };

            $scope.canRemove = function (index) {
                var observations = $scope.allTemplates[index].observations;
                if (observations === undefined || _.isEmpty(observations)) {
                    return true;
                }
                return observations[0].uuid === undefined;
            };

            $scope.clone = function (index) {
                var clonedObj = $scope.allTemplates[index].clone();
                $scope.allTemplates.splice(index + 1, 0, clonedObj);
                $.scrollTo('#concept-set-' + (index + 1), 200, {offset: {top: -400}});
            };

            $scope.clonePanelConceptSet = function (conceptSet) {
                var index = _.findIndex($scope.allTemplates, conceptSet);
                messagingService.showMessage("info", $translate.instant("CLINICAL_TEMPLATE_ADDED_SUCCESS_KEY", {label: $scope.allTemplates[index].label}));
                $scope.clone(index);
                $scope.showLeftPanelConceptSet($scope.allTemplates[index + 1]);
            };

            $scope.isClonedSection = function (conceptSetTemplate, allTemplates) {
                if (allTemplates) {
                    var index = allTemplates.indexOf(conceptSetTemplate);
                    return (index > 0) ? allTemplates[index].label == allTemplates[index - 1].label : false;
                }
                return false;
            };

            $scope.isLastClonedSection = function (conceptSetTemplate) {
                var index = _.findIndex($scope.allTemplates, conceptSetTemplate);
                if ($scope.allTemplates) {
                    if (index == $scope.allTemplates.length - 1 || $scope.allTemplates[index].label != $scope.allTemplates[index + 1].label) {
                        return true;
                    }
                }
                return false;
            };

            var clearTemplateState = function (template) {
                if (!template) return;
                template.observations = [];
                template.hasUnsavedFormObservations = false;
                template.draftValidationPassed = undefined;
                template.validate = null;
                template.component = null;
                template.errorMessage = null;
                template.isValid = undefined;
                template.isAdded = false;
                template.isOpen = false;
                template.klass = "";
                template.isLoaded = false;
                if (template.formUuid) {
                    template.formData = null;
                }
            };

            var isTemplateMatch = function (template, templateId) {
                return (template.uuid || template.formUuid || template.id) === templateId;
            };

            $scope.remove = function (index) {
                var label = $scope.allTemplates[index].label;
                var currentTemplate = $scope.allTemplates[index];
                var templateId = currentTemplate.uuid || currentTemplate.formUuid || currentTemplate.id;
                var isFormPinned = currentTemplate.alwaysShow;

                clearTemplateState(currentTemplate);

                if (!isFormPinned) {
                    if ($scope.consultation) {
                        if (!$scope.consultation.deletedFormIds) {
                            $scope.consultation.deletedFormIds = [];
                        }
                        if (!_.includes($scope.consultation.deletedFormIds, templateId)) {
                            $scope.consultation.deletedFormIds.push(templateId);
                        }
                    }
                    if ($scope.consultation && $scope.consultation.selectedObsTemplate) {
                        _.remove($scope.consultation.selectedObsTemplate, function (template) {
                            return isTemplateMatch(template, templateId);
                        });
                    }
                }

                if ($scope.consultation && $scope.consultation.observations) {
                    $scope.consultation.observations = _.filter($scope.consultation.observations, function (observation) {
                        if (!observation) return true;
                        if (observation.concept && observation.concept.uuid === templateId) {
                            return false;
                        }
                        if (observation.formFieldPath && currentTemplate.formName) {
                            return !observation.formFieldPath.startsWith(currentTemplate.formName + '.');
                        }
                        return true;
                    });
                }

                if ($scope.consultation && $scope.consultation.observationForms) {
                    if (!isFormPinned) {
                        _.remove($scope.consultation.observationForms, function (observationForm) {
                            return isTemplateMatch(observationForm, templateId);
                        });
                    } else {
                        _.each($scope.consultation.observationForms, function (observationForm) {
                            if (isTemplateMatch(observationForm, templateId)) {
                                clearTemplateState(observationForm);
                            }
                        });
                    }
                }

                if ($scope.consultation && ($scope.consultation.lastvisited === currentTemplate.id || $scope.consultation.lastvisited === currentTemplate.formUuid)) {
                    $scope.consultation.lastvisited = null;
                }

                if ($scope.leftPanelConceptSet && $scope.leftPanelConceptSet.uuid === currentTemplate.uuid &&
                    $scope.leftPanelConceptSet.formUuid === currentTemplate.formUuid) {
                    $scope.leftPanelConceptSet = "";
                }

                messagingService.showMessage("info", $translate.instant("CLINICAL_TEMPLATE_REMOVED_SUCCESS_KEY", {label: label}));
                var currentFormUuid = $stateParams.formUuid;
                if (currentFormUuid && templateId === currentFormUuid) {
                    $state.go('patient.dashboard.show.observations', {}, { notify: false, location: 'replace' });
                }
            };

            $scope.openActiveForm = function (conceptSet) {
                if (conceptSet && conceptSet.klass == 'active' && conceptSet != $scope.leftPanelConceptSet) {
                    $scope.showLeftPanelConceptSet(conceptSet);
                }
                return conceptSet.klass;
            };

            var copyValues = function (existingObservations, modifiedObservations) {
                existingObservations.forEach(function (observation, index) {
                    if (observation.groupMembers && observation.groupMembers.length > 0) {
                        copyValues(observation.groupMembers, modifiedObservations[index].groupMembers);
                    } else {
                        observation.value = modifiedObservations[index].value;
                    }
                });
            };

            var collapseExistingActiveSection = function (section) {
                if (section) {
                    section.klass = "";
                    section.isOpen = false;
                    section.isLoaded = false;
                }
            };

            $scope.showLeftPanelConceptSet = function (selectedConceptSet) {
                collapseExistingActiveSection($scope.leftPanelConceptSet);
                $scope.leftPanelConceptSet = selectedConceptSet;
                $scope.leftPanelConceptSet.isOpen = true;
                $scope.leftPanelConceptSet.isLoaded = true;
                $scope.leftPanelConceptSet.klass = "active";
                $scope.leftPanelConceptSet.atLeastOneValueIsSet = selectedConceptSet.hasSomeValue();
                $scope.leftPanelConceptSet.isAdded = true;
                $scope.consultation.lastvisited = selectedConceptSet.id || selectedConceptSet.formUuid;
                if ($rootScope.showLeftpanelToggle) {
                    $rootScope.showLeftpanelToggle = false;
                }
                $(window).scrollTop(0);
            };

            $scope.focusOnErrors = function () {
                var errorMessage = $scope.leftPanelConceptSet.errorMessage ? $scope.leftPanelConceptSet.errorMessage : "{{'CLINICAL_FORM_ERRORS_MESSAGE_KEY' | translate }}";
                messagingService.showMessage('error', errorMessage);
                $scope.$parent.$parent.$broadcast("event:errorsOnForm");
            };

            $scope.isFormTemplate = function (data) {
                return data.formUuid;
            };

            init();
        }])
    .directive('conceptSetGroup', function () {
        return {
            restrict: 'EA',
            scope: {
                conceptSetGroupExtensionId: "=?",
                observations: "=",
                allTemplates: "=",
                context: "=",
                autoScrollEnabled: "=",
                patient: "=",
                consultation: "="

            },
            controller: 'ConceptSetGroupController',
            templateUrl: '../common/concept-set/views/conceptSetGroup.html'
        };
    });
