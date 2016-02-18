'use strict';

angular.module('bahmni.clinical')
    .controller('ConceptSetPageController', ['$scope', '$rootScope', '$stateParams', 'conceptSetService', 'clinicalAppConfigService', 'messagingService', 'configurations','$state',
        function ($scope, $rootScope, $stateParams, conceptSetService, clinicalAppConfigService, messagingService, configurations, $state) {
            $scope.consultation.selectedObsTemplate = $scope.consultation.selectedObsTemplate || [];
            $scope.scrollingEnabled = false;
            var extensions = clinicalAppConfigService.getAllConceptSetExtensions($stateParams.conceptSetGroupName);
            var configs = clinicalAppConfigService.getAllConceptsConfig();
            var visitType = configurations.encounterConfig().getVisitTypeByUuid($scope.consultation.visitTypeUuid);
            $scope.context = {visitType: visitType, patient: $scope.patient};
            var numberOfLevels = 2;
            var fields = ['uuid', 'name:(name,display)', 'names:(uuid,conceptNameType,name)'];
            var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', numberOfLevels);

            conceptSetService.getConcept({
                name: "All Observation Templates",
                v: "custom:" + customRepresentation
            }).success(function (response) {
                var allTemplates = response.results[0].setMembers;
                var allConceptSections = allTemplates.map(function (template) {
                    var conceptSetExtension = _.find(extensions, function (extension) {
                            return extension.extensionParams.conceptName === template.name.name;
                        }) || {};
                    var conceptSetConfig = configs[template.name.name] || {};
                    return new Bahmni.ConceptSet.ConceptSetSection(conceptSetExtension, $rootScope.currentUser, conceptSetConfig, $scope.consultation.observations, template);
                });
                $scope.consultation.selectedObsTemplate = getSelectedObsTemplate(allConceptSections);
                if (!!$state.params.programUuid) {
                    conceptSetService.getObsTemplatesForProgram($state.params.programUuid).success(function (data) {
                        if(data.results.length>0 && data.results[0].mappings.length>0) {
                            _.map(allConceptSections, function(conceptSection) {
                                conceptSection.isAdded = false;
                                conceptSection.alwaysShow = false;
                            });

                            _.map(data.results[0].mappings, function (template) {
                                var matchedTemplate = _.find(allConceptSections, {uuid: template.uuid});
                                if(matchedTemplate) {
                                    matchedTemplate.alwaysShow = true;
                                }

                            });
                        }
                    });
                }
            });

            var getSelectedObsTemplate = function(allConceptSections){
                return allConceptSections.filter(function (conceptSet) {
                    if (conceptSet.isAvailable($scope.context)) {
                        return true;
                    }
                });
            };

            $scope.toggleTemplate = function (template) {
                $scope.scrollingEnabled = true;

                if (!template.canToggle()) {
                    messagingService.showMessage("error", "Templates having data cannot be unselected. Please Clear the data and try again");
                } else {
                    template.toggle();
                    if (template.isAdded) {
                        messagingService.showMessage("info", template.label + " Added successfully");
                    } else if (!template.isAdded) {
                        messagingService.showMessage("info", template.label + " Removed successfully");
                    }
                }
            };

            $scope.getNormalized = function (conceptName) {
                return conceptName.replace(/['\.\s\(\)\/,\\]+/g, "_");
            };

        }]);