/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.clinical')
    .controller('ConceptSetPageController', ['$scope', '$rootScope', '$stateParams', 'conceptSetService',
        'clinicalAppConfigService', 'messagingService', 'configurations', '$state', 'spinner',
        'contextChangeHandler', '$q', '$translate', 'formService', '$timeout', '$filter', 'appService', 'formDraftService', 'formDirtyStateService', 'autoSaveService',
        function ($scope, $rootScope, $stateParams, conceptSetService,
                  clinicalAppConfigService, messagingService, configurations, $state, spinner,
              contextChangeHandler, $q, $translate, formService, $timeout, $filter, appService, formDraftService, formDirtyStateService, autoSaveService) {
            $scope.consultation.selectedObsTemplate = $scope.consultation.selectedObsTemplate || [];
            $scope.allTemplates = $scope.allTemplates || [];
            $scope.scrollingEnabled = false;
            $scope.enableFormDraftFeature = appService.getAppDescriptor().getConfigValue('enableFormDraftFeature');
            var extensions = clinicalAppConfigService.getAllConceptSetExtensions($stateParams.conceptSetGroupName);
            var configs = clinicalAppConfigService.getAllConceptsConfig();
            var visitType = configurations.encounterConfig().getVisitTypeByUuid($scope.consultation.visitTypeUuid);
            $scope.context = {visitType: visitType, patient: $scope.patient};
            var numberOfLevels = 2;
            var fields = ['uuid', 'name:(name,display)', 'names:(uuid,conceptNameType,name)'];
            var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', numberOfLevels);
            var allConceptSections = [];

            var init = function () {
                if ($rootScope.draftDiscarded) {
                    $scope.allTemplates = [];
                    $scope.consultation.selectedObsTemplate = [];
                    $scope.consultation.observationForms = [];
                    $rootScope.draftDiscarded = false;
                }
                if (!($scope.allTemplates !== undefined && $scope.allTemplates.length > 0)) {
                    spinner.forPromise(conceptSetService.getConcept({
                        name: "All Observation Templates",
                        v: "custom:" + customRepresentation
                    }).then(function (response) {
                        var allTemplates = response.data.results[0].setMembers;
                        createConceptSections(allTemplates);
                        if ($state.params.programUuid) {
                            showOnlyTemplatesFilledInProgram();
                        }

                        if (!($scope.consultation.observationForms !== undefined && $scope.consultation.observationForms.length > 0)) {
                            spinner.forPromise(formService.getFormList($scope.consultation.encounterUuid)
                                .then(function (response) {
                                    $scope.consultation.observationForms = getObservationForms(response.data);
                                    loadDraftThenConcat();
                                })
                            );
                        } else {
                            loadDraftThenConcat();
                        }
                    }));
                }
            };
            var clearStaleObsFromTemplates = function () {
                $scope.consultation.selectedObsTemplate = [];
                _.each($scope.consultation.observationForms, function (form) {
                    if (form.hasUnsavedFormObservations) {
                        form.observations = [];
                        form.hasUnsavedFormObservations = false;
                    }
                });
            };

            var clearDraftObsFromTemplates = function () {
                $rootScope.draftData = null;
                $rootScope.resumeDraftOnLoad = false;
                $rootScope.resumeDraftPatientUuid = null;
                clearStaleObsFromTemplates();
            };

            var loadDraftThenConcat = function () {
                var patientUuid = $scope.patient ? $scope.patient.uuid : null;
                var providerUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                if ($scope.enableFormDraftFeature && !$rootScope.resumeDraftOnLoad && patientUuid && providerUuid && $scope.visitHistory && $scope.visitHistory.activeVisit) {
                    var promise = formDraftService.getDraft(patientUuid, providerUuid);
                    promise.then(function (response) {
                        var visitClosed = !($scope.visitHistory && $scope.visitHistory.activeVisit);
                        if (!visitClosed && response && response.data && response.data.uuid && !response.data.markedAsSaved) {
                            $rootScope.draftData = response.data;
                        } else if (visitClosed) {
                            clearDraftObsFromTemplates();
                        } else {
                            $rootScope.draftData = null;
                            $rootScope.resumeDraftOnLoad = false;
                            $rootScope.resumeDraftPatientUuid = null;
                        }
                        if ($rootScope.draftData && $rootScope.draftData.uuid && !$rootScope.draftData.markedAsSaved) {
                            $rootScope.resumeDraftOnLoad = true;
                            $rootScope.resumeDraftPatientUuid = patientUuid;
                        }
                        concatObservationForms();
                    }, function () {
                        concatObservationForms();
                    });
                } else {
                    if ($scope.visitHistory && !$scope.visitHistory.activeVisit) {
                        clearDraftObsFromTemplates();
                    }
                    concatObservationForms();
                }
            };

            var concatObservationForms = function () {
                $scope.allTemplates = getSelectedObsTemplate(allConceptSections);
                $scope.uniqueTemplates = _.uniqBy($scope.allTemplates, 'label');
                $scope.allTemplates = $scope.allTemplates.concat($scope.consultation.observationForms);

                var currentPatientUuid = $scope.patient ? $scope.patient.uuid : null;
                var isDraftResumeValid = $rootScope.resumeDraftOnLoad &&
                    $rootScope.draftData &&
                    (!$rootScope.resumeDraftPatientUuid || $rootScope.resumeDraftPatientUuid === currentPatientUuid);

                if (!isDraftResumeValid) {
                    var hasStaleUnsavedObs = _.some($scope.consultation.selectedObsTemplate, function (t) {
                        return t.hasUnsavedFormObservations;
                    }) || _.some($scope.consultation.observationForms, function (f) {
                        return f.hasUnsavedFormObservations;
                    });
                    if (hasStaleUnsavedObs) {
                        clearStaleObsFromTemplates();
                    }
                }

                var draftFormData = isDraftResumeValid && $rootScope.draftData.formData ? $rootScope.draftData.formData : null;

                var parsedDraftObs = null;
                if (draftFormData) {
                    try {
                        parsedDraftObs = angular.fromJson(draftFormData);
                    } catch (e) {
                        parsedDraftObs = null;
                    }
                }

                if (parsedDraftObs && parsedDraftObs.length > 0) {
                    var stripObservationFlags = function (obs) {
                        if (!obs) { return obs; }
                        var copy = angular.copy(obs);
                        delete copy.isObservation;
                        delete copy.isObservationNode;
                        if (copy.groupMembers && copy.groupMembers.length > 0) {
                            copy.groupMembers = _.map(copy.groupMembers, stripObservationFlags);
                        }
                        return copy;
                    };
                    _.each(parsedDraftObs, function (draftObs) {
                        if (!draftObs.concept) { return; }
                        var matchingTemplate = _.find($scope.allTemplates, function (t) {
                            return t.uuid === draftObs.concept.uuid;
                        });
                        if (matchingTemplate) {
                            if (!matchingTemplate.observations || matchingTemplate.observations.length === 0) {
                                matchingTemplate.observations = [stripObservationFlags(draftObs)];
                            } else {
                                formDirtyStateService.populateObservationValues(matchingTemplate.observations[0], stripObservationFlags(draftObs));
                            }
                            matchingTemplate.hasUnsavedFormObservations = true;
                        }
                    });
                    var form2DraftObs = _.filter(parsedDraftObs, function (draftObs) {
                        return draftObs.formNamespace === 'Bahmni' && draftObs.formFieldPath;
                    });
                    if (form2DraftObs.length > 0) {
                        _.each($scope.consultation.observationForms, function (obsForm) {
                            var matchingObs = _.filter(form2DraftObs, function (draftObs) {
                                return draftObs.formFieldPath.split('.')[0] === obsForm.formName;
                            });
                            if (matchingObs.length > 0 && obsForm.observations.length === 0) {
                                _.each(matchingObs, function (obs) {
                                    obsForm.observations.push(obs);
                                });
                                obsForm.isOpen = true;
                                obsForm.hasUnsavedFormObservations = true;
                            }
                        });
                    }
                }

                if ($scope.consultation.selectedObsTemplate.length == 0) {
                    initializeDefaultTemplates();
                    if ($scope.consultation.observations && $scope.consultation.observations.length > 0) {
                        addTemplatesInSavedOrder();
                    }
                    if (draftFormData) {
                        _.each($scope.allTemplates, function (template) {
                            if (template.observations && template.observations.length > 0 &&
                                !_.find($scope.consultation.selectedObsTemplate, function (t) { return t === template; })) {
                                insertTemplate(template);
                            }
                        });
                    }
                    var templateToBeOpened = getLastVisitedTemplate() ||
                        _.first($scope.consultation.selectedObsTemplate);

                    if (templateToBeOpened) {
                        openTemplate(templateToBeOpened);
                    }
                }
                if (draftFormData) {
                    populateFormWithDraftData(draftFormData);
                }
                $scope.consultation._draftCleanState = undefined;
                if ($rootScope.resumeDraftOnLoad) {
                    $rootScope.resumeDraftOnLoad = false;
                    $rootScope.resumeDraftPatientUuid = null;
                }
                $timeout(setupDirtyTracking, 0);
            };

            var addTemplatesInSavedOrder = function () {
                var templatePreference = null;
                try {
                    var stored = localStorage.getItem("templatePreference");
                    if (stored) {
                        templatePreference = JSON.parse(stored);
                    }
                } catch (e) {
                    templatePreference = null;
                }

                var currentProviderUuid = $rootScope.currentProvider && $rootScope.currentProvider.uuid;
                if (templatePreference && templatePreference.patientUuid === $scope.patient.uuid &&
                    !_.isEmpty(templatePreference.templates) && currentProviderUuid === templatePreference.providerUuid) {
                    insertInSavedOrder(templatePreference);
                } else {
                    insertInDefaultOrder();
                }
            };

            var insertInSavedOrder = function (templatePreference) {
                var templateNames = templatePreference.templates;
                _.each(templateNames, function (templateName) {
                    var foundTemplates = _.filter($scope.allTemplates, function (allTemplate) {
                        return allTemplate.conceptName === templateName;
                    });
                    if (foundTemplates.length > 0) {
                        _.each(foundTemplates, function (template) {
                            if (!_.isEmpty(template.observations)) {
                                insertTemplate(template);
                            }
                        });
                    }
                });
            };

            var insertInDefaultOrder = function () {
                _.each($scope.allTemplates, function (template) {
                    if (template.observations.length > 0) {
                        insertTemplate(template);
                    }
                });
            };

            var insertTemplate = function (template) {
                if (template && !(template.isDefault() || template.alwaysShow)) {
                    $scope.consultation.selectedObsTemplate.push(template);
                }
            };

            var getLastVisitedTemplate = function () {
                return _.find($scope.consultation.selectedObsTemplate, function (template) {
                    return template.id === $scope.consultation.lastvisited;
                });
            };

            var openTemplate = function (template) {
                template.isOpen = true;
                template.isLoaded = true;
                template.klass = "active";
            };

            var initializeDefaultTemplates = function () {
                $scope.consultation.selectedObsTemplate = _.filter($scope.allTemplates, function (template) {
                    return template.isDefault() || template.alwaysShow;
                });
            };

            $scope.filterTemplates = function () {
                $scope.uniqueTemplates = _.uniqBy($scope.allTemplates, 'label');
                if ($scope.consultation.searchParameter) {
                    $scope.uniqueTemplates = _.filter($scope.uniqueTemplates, function (template) {
                        return _.includes(template.label.toLowerCase(), $scope.consultation.searchParameter.toLowerCase());
                    });
                }
                return $scope.uniqueTemplates;
            };

            var showOnlyTemplatesFilledInProgram = function () {
                spinner.forPromise(conceptSetService.getObsTemplatesForProgram($state.params.programUuid).success(function (data) {
                    if (data.results.length > 0 && data.results[0].mappings.length > 0) {
                        _.map(allConceptSections, function (conceptSection) {
                            conceptSection.isAdded = false;
                            conceptSection.alwaysShow = false;
                        });

                        _.map(data.results[0].mappings, function (template) {
                            var matchedTemplate = _.find(allConceptSections, {uuid: template.uuid});
                            if (matchedTemplate) {
                                matchedTemplate.alwaysShow = true;
                            }
                        });
                    }
                }));
            };

            var createConceptSections = function (allTemplates) {
                _.map(allTemplates, function (template) {
                    var conceptSetExtension = _.find(extensions, function (extension) {
                        return extension.extensionParams.conceptName === template.name.name;
                    }) || {};
                    var conceptSetConfig = configs[template.name.name] || {};
                    var observationsForTemplate = getObservationsForTemplate(template);
                    if (observationsForTemplate && observationsForTemplate.length > 0) {
                        _.each(observationsForTemplate, function (observation) {
                            allConceptSections.push(new Bahmni.ConceptSet.ConceptSetSection(conceptSetExtension, $rootScope.currentUser, conceptSetConfig, [observation], template));
                        });
                    } else {
                        allConceptSections.push(new Bahmni.ConceptSet.ConceptSetSection(conceptSetExtension, $rootScope.currentUser, conceptSetConfig, [], template));
                    }
                });
            };

            var collectObservationsFromConceptSets = function () {
                $scope.consultation.observations = [];
                _.each($scope.consultation.selectedObsTemplate, function (conceptSetSection) {
                    if (conceptSetSection.observations[0]) {
                        $scope.consultation.observations.push(conceptSetSection.observations[0]);
                    }
                });
            };

            var getObservationsForTemplate = function (template) {
                return _.filter($scope.consultation.observations, function (observation) {
                    return !observation.formFieldPath && observation.concept.uuid === template.uuid;
                });
            };

            var getSelectedObsTemplate = function (allConceptSections) {
                return allConceptSections.filter(function (conceptSet) {
                    if (conceptSet.isAvailable($scope.context)) {
                        return true;
                    }
                });
            };

            $scope.stopAutoClose = function ($event) {
                $event.stopPropagation();
            };

            $scope.addTemplate = function (template) {
                $scope.scrollingEnabled = true;
                $scope.showTemplatesList = false;
                var index = _.findLastIndex($scope.consultation.selectedObsTemplate, function (consultationTemplate) {
                    return consultationTemplate.label == template.label;
                });

                if (index != -1 && $scope.consultation.selectedObsTemplate[index].allowAddMore) {
                    var clonedObj = template.clone();
                    clonedObj.klass = "active";
                    $scope.consultation.selectedObsTemplate.splice(index + 1, 0, clonedObj);
                } else {
                    template.toggle();
                    template.klass = "active";
                    if (index > -1) {
                        $scope.consultation.selectedObsTemplate[index] = template;
                    } else {
                        $scope.consultation.selectedObsTemplate.push(template);
                    }
                }
                $scope.consultation.searchParameter = "";
                messagingService.showMessage("info", $translate.instant("CLINICAL_TEMPLATE_ADDED_SUCCESS_KEY", {label: template.label}));
                if (dirtyTrackingState.initialized) {
                    captureTemplateCleanStates();
                }
            };

            $scope.getNormalized = function (conceptName) {
                return conceptName.replace(/['\.\s\(\)\/,\\]+/g, "_");
            };

            $scope.consultation.preSaveHandler.register("collectObservationsFromConceptSets", collectObservationsFromConceptSets);
            var getObservationForms = function (observationsForms) {
                var forms = [];
                var observations = $scope.consultation.observations || [];
                _.each(observationsForms, function (observationForm) {
                    var extension = _.find(extensions, function (ext) {
                        return (ext.extensionParams.formName && (observationForm.formName === ext.extensionParams.formName || observationForm.name === ext.extensionParams.formName));
                    }) || {};
                    var formUuid = observationForm.formUuid || observationForm.uuid;
                    var formName = observationForm.name || observationForm.formName;
                    var formVersion = observationForm.version || observationForm.formVersion;
                    var privileges = observationForm.privileges;
                    var labels = observationForm.nameTranslation ? JSON.parse(observationForm.nameTranslation) : [];
                    var label = formName;
                    if (labels.length > 0) {
                        var locale = localStorage.getItem("NG_TRANSLATE_LANG_KEY") || "en";
                        var currentLabel = labels.find(function (label) {
                            return label.locale === locale;
                        });
                        if (currentLabel) { label = currentLabel.display; }
                    }
                    if ($scope.isFormEditableByTheUser(observationForm)) {
                        var newForm = new Bahmni.ObservationForm(formUuid, $rootScope.currentUser,
                                                                   formName, formVersion, observations, label, extension);
                        newForm.privileges = privileges;
                        forms.push(newForm);
                    }
                });

                return forms;
            };
            $scope.isFormEditableByTheUser = function (form) {
                var result = false;
                if ((typeof form.privileges != 'undefined') && (form.privileges != null) && (form.privileges.length != 0)) {
                    form.privileges.forEach(function (formPrivilege) {
                        _.find($rootScope.currentUser.privileges, function (privilege) {
                            if (formPrivilege.privilegeName === privilege.name) {
                                if (formPrivilege.editable) {
                                    result = formPrivilege.editable;
                                } else {
                                    if (formPrivilege.viewable) {
                                        result = true;
                                    }
                                }
                            }
                        });
                    });
                } else { result = true; }
                return result;
            };

            $scope.formDraft = {
                draftDate: null,
                draftTime: null,
                showSpinner: false,
                statusMessage: null,
                statusParams: {},
                statusError: false,
                isDirty: false,
                hasDrafts: false
            };

            var dirtyTrackingState = {
                cleanState: null,
                templateCleanStates: new WeakMap(),
                initialized: false,
                watchDeregister: null,
                postSaveRefreshPending: false,
                postSaveRefreshTimeout: null,
                form2ListenerState: null,
                isSaving: false
            };

            var captureTemplateCleanStates = function () {
                dirtyTrackingState.templateCleanStates = new WeakMap();
                _.each($scope.consultation.selectedObsTemplate, function (template) {
                    dirtyTrackingState.templateCleanStates.set(template,
                        formDirtyStateService.getObsValuesForTemplate(template));
                });
            };

            var updateTemplateDirtyIndicators = function () {
                _.each($scope.consultation.selectedObsTemplate, function (template) {
                    if (template.hasUnsavedFormObservations) { return; }
                    var currentVal = formDirtyStateService.getObsValuesForTemplate(template);
                    if (!dirtyTrackingState.templateCleanStates.has(template)) {
                        dirtyTrackingState.templateCleanStates.set(template, currentVal);
                    }
                    if (currentVal !== dirtyTrackingState.templateCleanStates.get(template)) {
                        template.hasUnsavedFormObservations = true;
                    }
                });
            };

            var clearAllDraftIndicators = function () {
                _.each($scope.allTemplates, function (template) {
                    template.hasUnsavedFormObservations = false;
                });
            };

            var clearDraftStatus = function (preserveCleanState) {
                $scope.formDraft.hasDrafts = false;
                $scope.formDraft.draftDate = null;
                $scope.formDraft.draftTime = null;
                $scope.formDraft.statusMessage = null;
                $scope.formDraft.statusParams = {};
                $scope.formDraft.statusError = false;
                if ($scope.consultation && !preserveCleanState) {
                    $scope.consultation._draftCleanState = undefined;
                }
            };

            var setupDirtyTracking = function () {
                if (dirtyTrackingState.initialized) {
                    return;
                }
                dirtyTrackingState.initialized = true;
                if ($scope.consultation._draftCleanState !== undefined) {
                    dirtyTrackingState.cleanState = $scope.consultation._draftCleanState;
                    captureTemplateCleanStates();
                    var currentState = formDirtyStateService.getObsValues($scope.consultation.selectedObsTemplate);
                    $scope.formDraft.isDirty = currentState !== dirtyTrackingState.cleanState;
                } else {
                    dirtyTrackingState.cleanState = formDirtyStateService.getObsValues($scope.consultation.selectedObsTemplate);
                    captureTemplateCleanStates();
                    $scope.consultation._draftCleanState = dirtyTrackingState.cleanState;
                    dirtyTrackingState.postSaveRefreshPending = true;
                    if (dirtyTrackingState.postSaveRefreshTimeout) {
                        $timeout.cancel(dirtyTrackingState.postSaveRefreshTimeout);
                    }
                    dirtyTrackingState.postSaveRefreshTimeout = $timeout(function () {
                        if (!dirtyTrackingState.postSaveRefreshPending) {
                            dirtyTrackingState.postSaveRefreshTimeout = null;
                            return;
                        }
                        var partialRefreshState = formDirtyStateService.getObsValues($scope.consultation.selectedObsTemplate);
                        dirtyTrackingState.cleanState = partialRefreshState;
                        captureTemplateCleanStates();
                        $scope.consultation._draftCleanState = partialRefreshState;
                        $scope.formDraft.isDirty = false;
                        dirtyTrackingState.postSaveRefreshTimeout = $timeout(function () {
                            if (!dirtyTrackingState.postSaveRefreshPending) {
                                dirtyTrackingState.postSaveRefreshTimeout = null;
                                return;
                            }
                            var settledCleanState = formDirtyStateService.getObsValues($scope.consultation.selectedObsTemplate);
                            dirtyTrackingState.cleanState = settledCleanState;
                            captureTemplateCleanStates();
                            $scope.consultation._draftCleanState = settledCleanState;
                            $scope.formDraft.isDirty = false;
                            dirtyTrackingState.postSaveRefreshPending = false;
                            dirtyTrackingState.postSaveRefreshTimeout = null;
                        }, 0);
                    }, 0);
                }

                dirtyTrackingState.watchDeregister = $scope.$watch(
                    function () { return formDirtyStateService.getObsValues($scope.consultation.selectedObsTemplate); },
                    function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            if (dirtyTrackingState.postSaveRefreshPending) {
                                dirtyTrackingState.cleanState = newVal;
                                captureTemplateCleanStates();
                                $scope.consultation._draftCleanState = newVal;
                                $scope.formDraft.isDirty = false;
                                if (dirtyTrackingState.postSaveRefreshTimeout) {
                                    $timeout.cancel(dirtyTrackingState.postSaveRefreshTimeout);
                                }
                                dirtyTrackingState.postSaveRefreshTimeout = $timeout(function () {
                                    dirtyTrackingState.postSaveRefreshPending = false;
                                    dirtyTrackingState.postSaveRefreshTimeout = null;
                                }, 0);
                                return;
                            }
                            $scope.formDraft.isDirty = newVal !== dirtyTrackingState.cleanState;
                            if ($scope.formDraft.isDirty) {
                                $state.dirtyConsultationForm = true;
                            }
                            updateTemplateDirtyIndicators();
                        }
                    }
                );

                dirtyTrackingState.form2ListenerState = formDirtyStateService.registerForm2SyncListeners(function () {
                    $scope.$evalAsync(function () {
                        formDirtyStateService.syncForm2Observations($scope.consultation.observationForms);
                    });
                });

                autoSaveService.start(
                    function () { return $scope.enableFormDraftFeature && $scope.formDraft.isDirty && !dirtyTrackingState.isSaving && $scope.visitHistory && $scope.visitHistory.activeVisit; },
                    saveFormDraft
                );
            };

            var saveFormDraft = function () {
                if (dirtyTrackingState.isSaving) {
                    return $q.when();
                }
                if (!$scope.visitHistory || !$scope.visitHistory.activeVisit) {
                    return $q.when();
                }

                dirtyTrackingState.isSaving = true;
                $scope.formDraft.statusError = false;
                $scope.formDraft.showSpinner = true;

                var patientUuid = $scope.patient ? $scope.patient.uuid : null;
                var providerUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                var dirtyTemplates = _.filter($scope.consultation.selectedObsTemplate, function (t) {
                    return t.hasUnsavedFormObservations;
                });
                var formData = formDirtyStateService.serializeFormData(dirtyTemplates);

                return formDraftService.saveDraft(patientUuid, providerUuid, formData).then(function (response) {
                    var serverTimestamp = response.data.timestamp;
                    var savedDate = new Date(serverTimestamp);
                    var draftDate = $filter('date')(savedDate, 'dd MMM yyyy');
                    var draftTime = $filter('date')(savedDate, 'hh:mm a');

                    $rootScope.draftData = response.data;
                    $scope.formDraft.statusMessage = 'SAVED_AS_DRAFT_KEY';
                    $scope.formDraft.statusParams = {draftDate: draftDate, draftTime: draftTime};
                    $scope.formDraft.draftDate = draftDate;
                    $scope.formDraft.draftTime = draftTime;
                    $scope.formDraft.isDirty = false;
                    $scope.formDraft.hasDrafts = true;
                    dirtyTrackingState.cleanState = formDirtyStateService.getObsValues($scope.consultation.selectedObsTemplate);
                    captureTemplateCleanStates();
                    $scope.consultation._draftCleanState = dirtyTrackingState.cleanState;
                    dirtyTrackingState.postSaveRefreshPending = true;
                    if (dirtyTrackingState.postSaveRefreshTimeout) {
                        $timeout.cancel(dirtyTrackingState.postSaveRefreshTimeout);
                    }
                    dirtyTrackingState.postSaveRefreshTimeout = $timeout(function () {
                        dirtyTrackingState.cleanState = formDirtyStateService.getObsValues($scope.consultation.selectedObsTemplate);
                        captureTemplateCleanStates();
                        $scope.consultation._draftCleanState = dirtyTrackingState.cleanState;
                        $scope.formDraft.isDirty = false;
                        dirtyTrackingState.postSaveRefreshPending = false;
                        dirtyTrackingState.postSaveRefreshTimeout = null;
                    }, 0);
                    $rootScope.$broadcast('draft:saved', {draftDate: draftDate, draftTime: draftTime});
                }, function () {
                    $scope.formDraft.statusMessage = 'CHANGES_NOT_SAVED_KEY';
                    $scope.formDraft.statusError = true;
                }).finally(function () {
                    $scope.formDraft.showSpinner = false;
                    dirtyTrackingState.isSaving = false;
                });
            };

            $scope.saveAsDraft = saveFormDraft;

            $state.saveFormDraftIfDirty = function () {
                if ($scope.enableFormDraftFeature && $scope.formDraft.isDirty && !dirtyTrackingState.isSaving && $scope.visitHistory && $scope.visitHistory.activeVisit) {
                    return saveFormDraft();
                }
                return $q.when();
            };

            var draftCheckPromise = null;
            var draftContextWatchDeregister = null;

            var checkForExistingDrafts = function () {
                var patientUuid = $scope.patient ? $scope.patient.uuid : null;
                var providerUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;

                if (!(patientUuid && providerUuid)) {
                    return false;
                }

                var justSavedDraft = sessionStorage.getItem('formSaveCompleted');
                if (justSavedDraft) {
                    sessionStorage.removeItem('formSaveCompleted');
                    clearDraftStatus();
                    return true;
                }

                draftCheckPromise = formDraftService.getDraft(patientUuid, providerUuid);
                draftCheckPromise.then(
                    function (response) {
                        if (response.data && response.data.uuid && !response.data.markedAsSaved && $scope.visitHistory && $scope.visitHistory.activeVisit) {
                            $scope.formDraft.hasDrafts = true;
                            $rootScope.draftData = response.data;
                            var serverTimestamp = response.data.timestamp;
                            if (serverTimestamp && !isNaN(new Date(serverTimestamp).getTime())) {
                                var draftDate = $filter('date')(new Date(serverTimestamp), 'dd MMM yyyy');
                                var draftTime = $filter('date')(new Date(serverTimestamp), 'hh:mm a');
                                $scope.formDraft.draftDate = draftDate;
                                $scope.formDraft.draftTime = draftTime;
                                $scope.formDraft.statusMessage = 'SAVED_AS_DRAFT_KEY';
                                $scope.formDraft.statusParams = {draftDate: draftDate, draftTime: draftTime};
                            }
                        } else if (!$rootScope.resumeDraftOnLoad) {
                            $rootScope.draftData = null;
                            clearDraftStatus();
                        }
                    },
                    function () {
                        if (!$rootScope.resumeDraftOnLoad) {
                            $rootScope.draftData = null;
                            clearDraftStatus();
                        }
                    }
                ).catch(function () {
                    if (!$rootScope.resumeDraftOnLoad) {
                        $rootScope.draftData = null;
                        clearDraftStatus();
                    }
                });

                return true;
            };

            var registerDraftContextWatcher = function () {
                if (draftContextWatchDeregister) {
                    return;
                }

                draftContextWatchDeregister = $scope.$watchGroup([
                    function () {
                        return $scope.patient && $scope.patient.uuid;
                    },
                    function () {
                        return $rootScope.currentProvider && $rootScope.currentProvider.uuid;
                    }
                ], function (newValues) {
                    if (newValues[0] && newValues[1]) {
                        checkForExistingDrafts();
                        draftContextWatchDeregister();
                        draftContextWatchDeregister = null;
                    }
                });
            };

            var populateFormWithDraftData = function (draftFormData) {
                var result = formDirtyStateService.populateFormWithDraftData(draftFormData, $scope.consultation.selectedObsTemplate);
                if (!result.success) {
                    $scope.formDraft.statusMessage = 'ERROR_LOADING_DRAFT_KEY';
                    $scope.formDraft.statusError = true;
                } else {
                    $scope.formDraft.isDraftResumed = true;
                    _.each(result.updatedTemplates, function (template) {
                        template.hasUnsavedFormObservations = true;
                    });
                }
            };

            var resetDraftStateAfterSave = function () {
                $scope.formDraft.isDirty = false;
                $scope.formDraft.hasDrafts = false;
                dirtyTrackingState.postSaveRefreshPending = true;
                if (dirtyTrackingState.postSaveRefreshTimeout) {
                    $timeout.cancel(dirtyTrackingState.postSaveRefreshTimeout);
                }
                dirtyTrackingState.postSaveRefreshTimeout = $timeout(function () {
                    clearAllDraftIndicators();
                    dirtyTrackingState.cleanState = formDirtyStateService.getObsValues($scope.consultation.selectedObsTemplate);
                    captureTemplateCleanStates();
                    $scope.consultation._draftCleanState = dirtyTrackingState.cleanState;
                    $scope.formDraft.isDirty = false;
                    dirtyTrackingState.postSaveRefreshPending = false;
                    dirtyTrackingState.postSaveRefreshTimeout = null;
                    sessionStorage.removeItem('formSaveCompleted');
                }, 0);
                clearDraftStatus(true);
            };
            $scope.consultation.postSaveHandler.register("resetDraftStateAfterSave", resetDraftStateAfterSave);

            var saveSuccessfulListener = $rootScope.$on('event:save-successful', function () {
                $scope.formDraft.isDirty = false;
                $scope.formDraft.hasDrafts = false;
                dirtyTrackingState.postSaveRefreshPending = true;
                $scope.formDraft.showSpinner = false;
                $rootScope.draftData = null;
                clearDraftStatus(true);
                if (dirtyTrackingState.postSaveRefreshTimeout) {
                    $timeout.cancel(dirtyTrackingState.postSaveRefreshTimeout);
                }
                dirtyTrackingState.postSaveRefreshTimeout = $timeout(function () {
                    clearAllDraftIndicators();
                    dirtyTrackingState.cleanState = formDirtyStateService.getObsValues($scope.consultation.selectedObsTemplate);
                    captureTemplateCleanStates();
                    $scope.consultation._draftCleanState = dirtyTrackingState.cleanState;
                    $scope.formDraft.isDirty = false;
                    dirtyTrackingState.postSaveRefreshPending = false;
                    dirtyTrackingState.postSaveRefreshTimeout = null;
                    sessionStorage.removeItem('formSaveCompleted');
                }, 0);
            });

            var saveStartedListener = $rootScope.$on('event:save-started', function () {
                $scope.formDraft.showSpinner = false;
                clearDraftStatus();
            });

            $scope.$on('$destroy', function () {
                if (dirtyTrackingState.watchDeregister) {
                    dirtyTrackingState.watchDeregister();
                }
                if (dirtyTrackingState.postSaveRefreshTimeout) {
                    $timeout.cancel(dirtyTrackingState.postSaveRefreshTimeout);
                }
                formDirtyStateService.unregisterForm2SyncListeners(dirtyTrackingState.form2ListenerState);
                if (draftContextWatchDeregister) {
                    draftContextWatchDeregister();
                    draftContextWatchDeregister = null;
                }
                saveSuccessfulListener();
                saveStartedListener();
                $state.saveFormDraftIfDirty = null;
            });

            init();
            if (!checkForExistingDrafts()) {
                registerDraftContextWatcher();
            }
        }]);
