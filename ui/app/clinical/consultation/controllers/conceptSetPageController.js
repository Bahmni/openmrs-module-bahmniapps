'use strict';

angular.module('bahmni.clinical')
    .controller('ConceptSetPageController', ['$scope', '$rootScope', '$stateParams', 'conceptSetService',
        'clinicalAppConfigService', 'messagingService', 'configurations', '$state', 'spinner',
        'contextChangeHandler', '$q', '$translate', 'observationFormService',
        function ($scope, $rootScope, $stateParams, conceptSetService,
                  clinicalAppConfigService, messagingService, configurations, $state, spinner,
                  contextChangeHandler, $q, $translate, observationFormService) {
            $scope.consultation.selectedObsTemplate = $scope.consultation.selectedObsTemplate || [];
            $scope.allTemplates = $scope.allTemplates || [];
            $scope.scrollingEnabled = false;
            var extensions = clinicalAppConfigService.getAllConceptSetExtensions($stateParams.conceptSetGroupName);
            var configs = clinicalAppConfigService.getAllConceptsConfig();
            var visitType = configurations.encounterConfig().getVisitTypeByUuid($scope.consultation.visitTypeUuid);
            $scope.context = {visitType: visitType, patient: $scope.patient};
            var numberOfLevels = 2;
            var fields = ['uuid', 'name:(name,display)', 'names:(uuid,conceptNameType,name)'];
            var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', numberOfLevels);
            var allConceptSections = [];

            var init = function () {
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

                        $scope.allTemplates = getSelectedObsTemplate(allConceptSections);
                        $scope.uniqueTemplates = _.uniqBy($scope.allTemplates, 'label');
                        if ($scope.consultation.selectedObsTemplate.length == 0) {
                            initializeDefaultTemplates();
                            if ($scope.consultation.observations && $scope.consultation.observations.length > 0) {
                                sortObservationsInSavedOrder();
                                identifyTemplatesForObservations();
                            }
                            var templateToBeOpened = getLastVisitedTemplate() ||
                                _.first($scope.consultation.selectedObsTemplate);

                            if (templateToBeOpened) {
                                openTemplate(templateToBeOpened);
                            }
                        }
                        // Retrieve Form Details
                        if (!($scope.consultation.observationForms !== undefined && $scope.consultation.observationForms.length > 0)) {
                            spinner.forPromise(observationFormService.getFormList($scope.consultation.encounterUuid)
                                .then(function (response) {
                                    $scope.consultation.observationForms = getObservationForms(response.data);
                                    $scope.consultation.selectedObsTemplate = $scope.consultation.selectedObsTemplate.concat($scope.consultation.observationForms);
                                })
                            );
                        }
                    }));
                }
            };

            var getLastVisitedTemplate = function() {
                return _.find($scope.consultation.selectedObsTemplate, function (template) {
                    return template.id === $scope.consultation.lastvisited;
                });
            };

            var sortObservationsInSavedOrder = function () {
                var templatePreference = JSON.parse(localStorage.getItem("templatePreference"));
                if(templatePreference && templatePreference.patientUuid == $scope.patient.uuid) {
                    var templateNames = templatePreference.templateNames;
                    var observations = $scope.consultation.observations;
                    var sortedObs = [];
                    _.forEach(templateNames, function (templateName) {
                        var filteredObservations = _.filter(observations, function(observation) {
                            return observation.concept.name === templateName;
                        });
                        sortedObs = _.concat(sortedObs, filteredObservations);
                    });
                    $scope.consultation.observations = sortedObs;
                }
            };

            var openTemplate = function (template) {
                template.isOpen = true;
                template.isLoaded = true;
                template.klass = "active";
            };

            var identifyTemplatesForObservations = function() {
                _.each($scope.consultation.observations, function (observation) {
                    var template = _.find($scope.allTemplates, function (template) {
                        return template.observations.length > 0 && template.observations[0].uuid === observation.uuid;
                    });
                    if(!(template.isDefault() || template.alwaysShow)) {
                        $scope.consultation.selectedObsTemplate.push(template);
                    }
                });
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
                    if(conceptSetSection.observations[0]) {
                        $scope.consultation.observations.push(conceptSetSection.observations[0]);
                    }
                });
            };

            var getObservationsForTemplate = function (template) {
                return _.filter($scope.consultation.observations, function (observation) {
                    return observation.concept.uuid === template.uuid;
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
                    $scope.consultation.selectedObsTemplate.push(template);
                }
                $scope.consultation.searchParameter = "";
                messagingService.showMessage("info", $translate.instant("CLINICAL_TEMPLATE_ADDED_SUCCESS_KEY", {label: template.label}));
            };

            $scope.getNormalized = function (conceptName) {
                return conceptName.replace(/['\.\s\(\)\/,\\]+/g, "_");
            };

            $scope.consultation.preSaveHandler.register("collectObservationsFromConceptSets", collectObservationsFromConceptSets);
            // Form Code :: Start
            var getObservationForms = function (observationsForms) {
                var forms = [];
                var observations = $scope.consultation.observations || [];
                _.each(observationsForms, function (observationForm) {
                    var formUuid = observationForm.formUuid || observationForm.uuid;
                    var formName = observationForm.name || observationForm.formName;
                    var formVersion = observationForm.version || observationForm.formVersion;
                    forms.push(new Bahmni.ObservationForm(formUuid, $rootScope.currentUser, formName, formVersion, observations));
                });
                return forms;
            };
            // Form Code :: End
            init();
        }]);
