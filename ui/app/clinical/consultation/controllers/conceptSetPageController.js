'use strict';

angular.module('bahmni.clinical')
    .controller('ConceptSetPageController', ['$scope', '$rootScope', '$stateParams', 'conceptSetService',
        'clinicalAppConfigService', 'messagingService', 'configurations', '$state', 'spinner',
        'contextChangeHandler', '$q', '$translate', 'formService', 'patientService', '$http',
        function ($scope, $rootScope, $stateParams, conceptSetService,
            clinicalAppConfigService, messagingService, configurations, $state, spinner,
            contextChangeHandler, $q, $translate, formService, patientService, $http) {
            $scope.consultation.selectedObsTemplate = $scope.consultation.selectedObsTemplate || [];
            $scope.allTemplates = $scope.allTemplates || [];
            $scope.scrollingEnabled = false;
            var extensions = clinicalAppConfigService.getAllConceptSetExtensions($stateParams.conceptSetGroupName);
            var configs = clinicalAppConfigService.getAllConceptsConfig();
            var visitType = configurations.encounterConfig().getVisitTypeByUuid($scope.consultation.visitTypeUuid);
            $scope.context = { visitType: visitType, patient: $scope.patient };
            var numberOfLevels = 2;
            var fields = ['uuid', 'name:(name,display)', 'names:(uuid,conceptNameType,name)'];
            var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', numberOfLevels);
            var allConceptSections = [];
            var arthistoryclinical = "54857487-063a-4f92-a388-e3267b97d22a";
            var arttreatmentform = "f97d06ef-6b9d-484b-b338-1be4b4ffa0bb";
            var artandhivfollowup = "beffd410-b9a4-4cfd-9a29-22512980de1b";
            var endoffollowupform = "8ef5716c-0df6-48d3-92fb-f9476424a8e0";
            var anccard = "71611db1-cd65-4ae1-9d59-537b82fe7289";
            var viralload = "bf4d44d6-fe08-4abd-9c25-8c2a548cc873";
            var heiformuuid = "54a93292-ffe6-43bd-898d-b8946bff488e";
            var clinicainfantuuid = "7c199842-c27a-4bc4-be25-57f61a5c878c";
            var heitestinguuid = "c074b65c-c336-11e9-9cb5-2a2ae2dbcce4";
            var heiendoffollowup = "c2670412-c32a-11e9-9cb5-2a2ae2dbcce4";
            var personalhist = "55c92dcd-5af3-4f20-b828-a309b16b28c3";
            var familyhistdata = "c2a6c127-e3ba-426f-a4ae-83713dde0736";
            var tbscreeningform = "6fa69c2e-3ddf-4c9e-b31b-1de9629eb8e1";
            var eacforms = "940923e2-433e-4d58-869f-dd099333af9b";
            var maternityform = "84253d19-1c16-45c0-8541-f0bbf11f4112";
            var getPcr = function () {
                return spinner.forPromise(patientService.patientFirstPcrTestResult($scope.patient.uuid)).then(function (response) {
                    if (response.data && response.data[0]) {
                        $scope.firstPcrResult = response.data[0].valueAsString;
                    }
                }).then(spinner.forPromise(patientService.patientSecondPcrTestResult($scope.patient.uuid)).then(function (response) {
                    if (response.data && response.data[0]) {
                        $scope.secondPcrResult = response.data[0].valueAsString;
                    }
                })).then(spinner.forPromise(patientService.patientRepeatPcrTestResult($scope.patient.uuid)).then(function (response) {
                    if (response.data && response.data[0]) {
                        $scope.repeattPcrResult = response.data[0].valueAsString;
                    }
                }));
            };
            var init = function () {
                if (!($scope.allTemplates !== undefined && $scope.allTemplates.length > 0)) {
                    spinner.forPromise(conceptSetService.getConcept({
                        name: "All Observation Templates",
                        v: "custom:" + customRepresentation
                    }).then(function (response) {
                        var allTemplates = response.data.results[0].setMembers;
                        if (($scope.patient.age >= 2)) {
                            for (var i = allTemplates.length - 1; i >= 0; i--) {
                                if (allTemplates[i].uuid == heiformuuid || allTemplates[i].uuid == clinicainfantuuid || allTemplates[i].uuid == heitestinguuid || allTemplates[i].uuid == heiendoffollowup) {
                                    allTemplates.splice(i, 1);
                                }
                            }
                        } else if (($scope.patient.age <= 2) && ($scope.firstPcrResult == "Positive") && ($scope.secondPcrResult == "Positive") && ($scope.repeattPcrResult == "Positive")) {
                            for (var i = allTemplates.length - 1; i >= 0; i--) {
                                if (allTemplates[i].uuid == heiformuuid || allTemplates[i].uuid == clinicainfantuuid || allTemplates[i].uuid == heitestinguuid || allTemplates[i].uuid == heiendoffollowup) {
                                    allTemplates.splice(i, 1);
                                }
                            }
                        }
                        else {
                            for (var i = allTemplates.length - 1; i >= 0; i--) {
                                if (allTemplates[i].uuid == personalhist || allTemplates[i].uuid == familyhistdata || allTemplates[i].uuid == arthistoryclinical || allTemplates[i].uuid == arttreatmentform || allTemplates[i].uuid == artandhivfollowup || allTemplates[i].uuid == endoffollowupform || allTemplates[i].uuid == anccard || allTemplates[i].uuid == viralload || allTemplates[i].uuid == maternityform) {
                                    allTemplates.splice(i, 1);
                                }
                            }
                        }
                        if ($scope.patient.gender == "M") {
                            for (var i = allTemplates.length - 1; i >= 0; i--) {
                                if (allTemplates[i].uuid == anccard || allTemplates[i].uuid == maternityform) {
                                    allTemplates.splice(i, 1);
                                }
                            }
                        }
                        var currentuserRoleName = $rootScope.currentUser.roles[0].name;
                        if ((currentuserRoleName == "Data Clerk") && (currentuserRoleName != "superman")){
                            for (var i = allTemplates.length - 1; i >= 0; i--) {
                                if (allTemplates[i].uuid == arthistoryclinical || allTemplates[i].uuid == arttreatmentform || allTemplates[i].uuid == artandhivfollowup || allTemplates[i].uuid == endoffollowupform || allTemplates[i].uuid == anccard || allTemplates[i].uuid == viralload || allTemplates[i].uuid == tbscreeningform || allTemplates[i].uuid == eacforms || allTemplates[i].uuid == maternityform) {
                                    allTemplates.splice(i, 1);
                                }
                            }
                        } 
                        else if ((currentuserRoleName == "PMTCT") && (currentuserRoleName != "superman")){
                            for (var i = allTemplates.length - 1; i >= 0; i--) {
                                if (allTemplates[i].uuid == endoffollowupform || allTemplates[i].uuid == anccard || allTemplates[i].uuid == maternityform || allTemplates[i].uuid == personalhist || allTemplates[i].uuid == familyhistdata) {
                                    allTemplates.splice(i, 1);
                                }
                            }
                        }
                        else if ((currentuserRoleName == "PMTCT (HEI)") && (currentuserRoleName != "superman")){
                            for (var i = allTemplates.length - 1; i >= 0; i--) {
                                if (allTemplates[i].uuid == arthistoryclinical || allTemplates[i].uuid == arttreatmentform || allTemplates[i].uuid == artandhivfollowup || allTemplates[i].uuid == endoffollowupform || allTemplates[i].uuid == anccard || allTemplates[i].uuid == viralload || allTemplates[i].uuid == maternityform || allTemplates[i].uuid == personalhist || allTemplates[i].uuid == familyhistdata) {
                                    allTemplates.splice(i, 1);
                                }
                            }
                        }
                        else if ((currentuserRoleName == "EAC") && (currentuserRoleName != "superman")){
                            for (var i = allTemplates.length - 1; i >= 0; i--) {
                                if (allTemplates[i].uuid == arthistoryclinical || allTemplates[i].uuid == arttreatmentform || allTemplates[i].uuid == artandhivfollowup || allTemplates[i].uuid == endoffollowupform || allTemplates[i].uuid == anccard || allTemplates[i].uuid == viralload || allTemplates[i].uuid == tbscreeningform || allTemplates[i].uuid == maternityform || allTemplates[i].uuid == personalhist || allTemplates[i].uuid == familyhistdata) {
                                    allTemplates.splice(i, 1);
                                }
                            }
                        }
                        else if ((currentuserRoleName == "CLINICIAN") && (currentuserRoleName != "superman")){
                            for (var i = allTemplates.length - 1; i >= 0; i--) {
                                if ( allTemplates[i].uuid == arttreatmentform || allTemplates[i].uuid == endoffollowupform || allTemplates[i].uuid == anccard || allTemplates[i].uuid == eacforms || allTemplates[i].uuid == maternityform) {
                                    allTemplates.splice(i, 1);
                                }
                            }
                        } 
                        else if ((currentuserRoleName == "MATERNITY") && (currentuserRoleName != "superman")){
                            for (var i = allTemplates.length - 1; i >= 0; i--) {
                                if (allTemplates[i].uuid == arthistoryclinical || allTemplates[i].uuid == arttreatmentform || allTemplates[i].uuid == artandhivfollowup || allTemplates[i].uuid == endoffollowupform || allTemplates[i].uuid == viralload || allTemplates[i].uuid == tbscreeningform || allTemplates[i].uuid == eacforms || allTemplates[i].uuid == personalhist || allTemplates[i].uuid == familyhistdata) {
                                    allTemplates.splice(i, 1);
                                }
                            }
                        }
                        else {
                            for (var i = allTemplates.length - 1; i >= 0; i--) {
                                if (allTemplates[i].uuid == personalhist || allTemplates[i].uuid == familyhistdata) {
                                    allTemplates.splice(i, 1);
                                }
                            }
                        }
                        var visitnumber = $scope.visitHistory.visits.length;
                        if (visitnumber <= 1) {
                            for (var i = allTemplates.length - 1; i >= 0; i--) {
                                if (allTemplates[i].uuid == endoffollowupform) {
                                    allTemplates.splice(i, 1);
                                }
                            }
                        }
                        createConceptSections(allTemplates);
                        if ($state.params.programUuid) {
                            showOnlyTemplatesFilledInProgram();
                        }
                        // Retrieve Form Details
                        if (!($scope.consultation.observationForms !== undefined && $scope.consultation.observationForms.length > 0)) {
                            spinner.forPromise(formService.getFormList($scope.consultation.encounterUuid)
                                .then(function (response) {
                                    $scope.consultation.observationForms = getObservationForms(response.data);
                                    concatObservationForms();
                                })
                            );
                        } else {
                            concatObservationForms();
                        }
                    }));
                }
            };

            var concatObservationForms = function () {
                $scope.allTemplates = getSelectedObsTemplate(allConceptSections);
                $scope.uniqueTemplates = _.uniqBy($scope.allTemplates, 'label');
                $scope.allTemplates = $scope.allTemplates.concat($scope.consultation.observationForms);
                if ($scope.consultation.selectedObsTemplate.length == 0) {
                    initializeDefaultTemplates();
                    if ($scope.consultation.observations && $scope.consultation.observations.length > 0) {
                        addTemplatesInSavedOrder();
                    }
                    var templateToBeOpened = getLastVisitedTemplate() ||
                        _.first($scope.consultation.selectedObsTemplate);

                    if (templateToBeOpened) {
                        openTemplate(templateToBeOpened);
                    }
                }
            };

            var addTemplatesInSavedOrder = function () {
                var templatePreference = JSON.parse(localStorage.getItem("templatePreference"));
                if (templatePreference && templatePreference.patientUuid === $scope.patient.uuid &&
                    !_.isEmpty(templatePreference.templates) && $rootScope.currentProvider.uuid === templatePreference.providerUuid) {
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
                            var matchedTemplate = _.find(allConceptSections, { uuid: template.uuid });
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
                    $scope.consultation.selectedObsTemplate.push(template);
                }
                $scope.consultation.searchParameter = "";
                messagingService.showMessage("info", $translate.instant("CLINICAL_TEMPLATE_ADDED_SUCCESS_KEY", { label: template.label }));
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
            getPcr().then(function () {
                init();
            });
        }]);
