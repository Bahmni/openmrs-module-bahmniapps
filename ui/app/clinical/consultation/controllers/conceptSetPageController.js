'use strict';

angular.module('bahmni.clinical')
    .controller('ConceptSetPageController', ['$scope', '$rootScope', '$stateParams', 'conceptSetService', 'clinicalAppConfigService', 'messagingService', 'configurations', '$state', 'spinner', 'contextChangeHandler', '$q','$translate',
        function ($scope, $rootScope, $stateParams, conceptSetService, clinicalAppConfigService, messagingService, configurations, $state, spinner, contextChangeHandler, $q, $translate) {
            $scope.consultation.selectedObsTemplate = $scope.consultation.selectedObsTemplate || [];
            $scope.scrollingEnabled = false;
            var extensions = clinicalAppConfigService.getAllConceptSetExtensions($stateParams.conceptSetGroupName);
            var configs = clinicalAppConfigService.getAllConceptsConfig();
            var visitType = configurations.encounterConfig().getVisitTypeByUuid($scope.consultation.visitTypeUuid);
            $scope.context = {visitType: visitType, patient: $scope.patient, showPanelView: configs['All Observation Templates'] ? configs['All Observation Templates'].showPanelView : false};
            var numberOfLevels = 2;
            var fields = ['uuid', 'name:(name,display)', 'names:(uuid,conceptNameType,name)'];
            var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', numberOfLevels);
            var allConceptSections = [];

            var init = function () {
                if (!($scope.consultation.selectedObsTemplate !== undefined && $scope.consultation.selectedObsTemplate.length > 0)) {
                    spinner.forPromise(conceptSetService.getConcept({
                        name: "All Observation Templates",
                        v: "custom:" + customRepresentation
                    }).then(function (response) {
                        var allTemplates = response.data.results[0].setMembers;
                        createConceptSections(allTemplates);
                        $scope.consultation.selectedObsTemplate = getSelectedObsTemplate(allConceptSections);
                        $scope.uniqueTemplates = _.uniqBy($scope.consultation.selectedObsTemplate, 'label');
                        if ($state.params.programUuid) {
                            showOnlyTemplatesFilledInProgram();
                        }
                    }));
                }
            };

            $scope.filterTemplates = function() {
                $scope.uniqueTemplates = _.uniqBy($scope.consultation.selectedObsTemplate, 'label');
                if($scope.consultation.searchParameter) {
                    $scope.uniqueTemplates = _.filter($scope.uniqueTemplates, function (template) {
                        return _.includes(template.label.toLowerCase(), $scope.consultation.searchParameter.toLowerCase());
                    })
                };
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
                    $scope.consultation.observations.push(conceptSetSection.observations[0]);
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

            $scope.addTemplate = function (template) {
                $scope.scrollingEnabled = true;
                $scope.showTemplatesList = false;
                var index = _.findLastIndex($scope.consultation.selectedObsTemplate, function (consultationTemplate) {
                    return consultationTemplate.label == template.label;
                });

                if ($scope.consultation.selectedObsTemplate[index].isAdded) {
                    var clonedObj = template.clone();
                    clonedObj.klass = "active";
                    $scope.consultation.selectedObsTemplate.splice(index + 1, 0, clonedObj);
                } else {
                    template.toggle();
                    template.klass = "active";
                }
                $scope.consultation.searchParameter = "";
                messagingService.showMessage("info", $translate.instant("CLINICAL_TEMPLATE_ADDED_SUCCESS_KEY", {label : template.label}));
            };

            $scope.getNormalized = function (conceptName) {
                return conceptName.replace(/['\.\s\(\)\/,\\]+/g, "_");
            };

            $scope.consultation.preSaveHandler.register("collectObservationsFromConceptSets", collectObservationsFromConceptSets);

            init();
        }]);
