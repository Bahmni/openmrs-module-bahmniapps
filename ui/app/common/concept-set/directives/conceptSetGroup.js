'use strict';

angular.module('bahmni.common.conceptSet')
    .controller('ConceptSetGroupController', ['$scope', 'contextChangeHandler', 'spinner', 'messagingService',
        'conceptSetService', '$rootScope', 'sessionService', 'encounterService', 'treatmentConfig',
        'retrospectiveEntryService', 'userService', 'conceptSetUiConfigService', '$timeout', 'clinicalAppConfigService', '$stateParams', '$translate', 'appointmentService',
        function ($scope, contextChangeHandler, spinner, messagingService, conceptSetService, $rootScope, sessionService,
                  encounterService, treatmentConfig, retrospectiveEntryService, userService,
                  conceptSetUiConfigService, $timeout, clinicalAppConfigService, $stateParams, $translate, appointmentService) {
            var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
            var init = function () {
                $scope.validationHandler = new Bahmni.ConceptSet.ConceptSetGroupPanelViewValidationHandler($scope.allTemplates);
                contextChangeHandler.add($scope.validationHandler.validate);
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

            $scope.remove = function (index) {
                var label = $scope.allTemplates[index].label;
                var currentTemplate = $scope.allTemplates[index];
                var anotherTemplate = _.find($scope.allTemplates, function (template) {
                    return template.label == currentTemplate.label && template !== currentTemplate;
                });
                if (anotherTemplate) {
                    $scope.allTemplates.splice(index, 1);
                }
                else {
                    $scope.allTemplates[index].isAdded = false;
                    var clonedObj = $scope.allTemplates[index].clone();
                    $scope.allTemplates[index] = clonedObj;
                    $scope.allTemplates[index].isAdded = false;
                    $scope.allTemplates[index].isOpen = false;
                    $scope.allTemplates[index].klass = "";
                    $scope.allTemplates[index].isLoaded = false;
                }
                $scope.leftPanelConceptSet = "";
                messagingService.showMessage("info", $translate.instant("CLINICAL_TEMPLATE_REMOVED_SUCCESS_KEY", {label: label}));
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

            // Load appointment services for the dropdown
            $scope.appointmentServices = [];
            appointmentService.getAppointmentServices().then(function (services) {
                $scope.appointmentServices = services;
                // Restore appointment data for all forms after services are loaded
                restoreAppointmentData();
            }).catch(function (error) {
                $log.error('Failed to load appointment services:', error);
            });

            // Store appointment data in rootScope so it can be accessed from encounterService
            $rootScope.appointmentData = $rootScope.appointmentData || {};

            // Restore appointment data from rootScope to form fields
            var restoreAppointmentData = function () {
                if (!$scope.allTemplates) return;
                $scope.allTemplates.forEach(function (conceptSet) {
                    if (conceptSet.formUuid && $rootScope.appointmentData[conceptSet.formUuid]) {
                        var data = $rootScope.appointmentData[conceptSet.formUuid];
                        if (data.time) {
                            // Convert stored time to HH:MM format for HTML5 time input
                            var timeValue = data.time;
                            if (typeof timeValue === 'string') {
                                // Check if it's ISO format (contains T or Z)
                                if (timeValue.indexOf('T') !== -1 || timeValue.indexOf('Z') !== -1) {
                                    // It's an ISO string, extract time part
                                    var dateObj = new Date(timeValue);
                                    if (!isNaN(dateObj.getTime())) {
                                        var hours = dateObj.getHours();
                                        var minutes = dateObj.getMinutes();
                                        conceptSet.appointmentTime = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
                                    }
                                } else if (timeValue.match(/^\d{2}:\d{2}$/)) {
                                    // Already in HH:MM format
                                    conceptSet.appointmentTime = timeValue;
                                }
                            } else if (timeValue instanceof Date) {
                                // Date object, extract time
                                var hours = timeValue.getHours();
                                var minutes = timeValue.getMinutes();
                                conceptSet.appointmentTime = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
                            }
                        }
                        if (data.serviceUuid) {
                            conceptSet.appointmentServiceUuid = data.serviceUuid;
                        }
                    }
                });
            };

            // Watch for form templates being added/loaded and restore their data
            $scope.$watch('allTemplates', function (newVal) {
                if (newVal && $scope.appointmentServices.length > 0) {
                    restoreAppointmentData();
                }
            }, true);

            // Update appointment time - stores time in HH:MM format in rootScope
            $scope.updateAppointmentTime = function (conceptSet) {
                if (!conceptSet.formUuid) return;
                $rootScope.appointmentData[conceptSet.formUuid] = $rootScope.appointmentData[conceptSet.formUuid] || {};
                
                // Get the time value - HTML5 time input returns string in HH:MM format
                var timeValue = conceptSet.appointmentTime;
                
                // Handle different formats
                if (typeof timeValue === 'string') {
                    // If it's already a string, check if it's ISO format or HH:MM
                    if (timeValue.indexOf('T') !== -1 || timeValue.indexOf('Z') !== -1) {
                        // It's an ISO string, extract time part
                        var dateObj = new Date(timeValue);
                        if (!isNaN(dateObj.getTime())) {
                            var hours = dateObj.getHours();
                            var minutes = dateObj.getMinutes();
                            timeValue = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
                        } else {
                            timeValue = '';
                        }
                    } else {
                        // Already in HH:MM format, use as is
                        timeValue = timeValue.trim();
                    }
                } else if (timeValue instanceof Date) {
                    // Extract hours and minutes from Date object
                    var hours = timeValue.getHours();
                    var minutes = timeValue.getMinutes();
                    timeValue = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
                } else {
                    timeValue = '';
                }
                
                $rootScope.appointmentData[conceptSet.formUuid].time = timeValue;
            };

            // Update appointment service - stores service UUID and duration in rootScope
            $scope.updateAppointmentService = function (conceptSet) {
                if (!conceptSet.formUuid) return;
                $rootScope.appointmentData[conceptSet.formUuid] = $rootScope.appointmentData[conceptSet.formUuid] || {};
                $rootScope.appointmentData[conceptSet.formUuid].serviceUuid = conceptSet.appointmentServiceUuid;
                
                // Find the selected service to get duration (using lodash find for compatibility)
                var selectedService = _.find($scope.appointmentServices, function (s) {
                    return s.uuid === conceptSet.appointmentServiceUuid;
                });
                if (selectedService) {
                    $rootScope.appointmentData[conceptSet.formUuid].durationMins = selectedService.durationMins || 15;
                }
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
