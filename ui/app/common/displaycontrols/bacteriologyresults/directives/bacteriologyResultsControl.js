'use strict';

angular.module('bahmni.common.displaycontrol.bacteriologyresults')
    .directive('bacteriologyResultsControl', ['bacteriologyResultsService', 'appService', '$q', 'spinner', '$filter', 'ngDialog',
        'bacteriologyTabInitialization', '$controller', 'consultationInitialization', 'messagingService', '$rootScope', '$translate',
        function (bacteriologyResultsService, appService, $q, spinner, $filter, ngDialog, bacteriologyTabInitialization, $controller,
                  consultationInitialization, messagingService, $rootScope, $translate) {
            var controller = function ($scope) {
                var shouldPromptBeforeClose = true;

                var expandAllSpecimensIfDashboardIsBeingPrinted = function () {
                    if ($rootScope.isBeingPrinted) {
                        _.each($scope.specimens, function (specimen) {
                            specimen.isOpen = true;
                        });
                    }
                };

                var init = function () {
                    $scope.title = "bacteriology results";
                    var params = {
                        patientUuid: $scope.patient.uuid,
                        patientProgramUuid: $scope.enrollment
                    };
                    $scope.initializationPromise = bacteriologyTabInitialization().then(function (data) {
                        $scope.bacteriologyTabData = data;
                        bacteriologyResultsService.getBacteriologyResults(params).then(function (response) {
                            handleResponse(response);
                            expandAllSpecimensIfDashboardIsBeingPrinted();
                        });
                    });
                    return $scope.initializationPromise;
                };

                var handleResponse = function (response) {
                    $scope.observations = response.data.results;
                    if ($scope.observations && $scope.observations.length > 0) {
                        $scope.specimens = [];
                        var sampleSource = _.find($scope.bacteriologyTabData.setMembers, function (member) {
                            return member.name.name === Bahmni.Clinical.Constants.bacteriologyConstants.specimenSampleSourceConceptName;
                        });
                        $scope.allSamples = sampleSource != undefined && _.map(sampleSource.answers, function (answer) {
                            return new Bahmni.Common.Domain.ConceptMapper().map(answer);
                        });
                        var specimenMapper = new Bahmni.Clinical.SpecimenMapper();
                        var conceptsConfig = appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
                        var dontSortByObsDateTime = true;
                        _.forEach($scope.observations, function (observation) {
                            $scope.specimens.push(specimenMapper.mapObservationToSpecimen(observation, $scope.allSamples, conceptsConfig, dontSortByObsDateTime));
                        });
                    } else {
                        $scope.specimens = [];
                    }

                    $scope.isDataPresent = function () {
                        if (!$scope.specimens || !$scope.specimens.length) {
                            return $scope.$emit("no-data-present-event") && false;
                        }
                        return true;
                    };
                };

                $scope.editBacteriologySample = function (specimen) {
                    var configForPrompt = appService.getAppDescriptor().getConfigValue('showSaveConfirmDialog');
                    $scope.editDialogInitializationPromise = consultationInitialization($scope.patient.uuid, null, null).then(function (consultationContext) {
                        $scope.consultation = consultationContext;
                        $scope.consultation.newlyAddedSpecimens = [];

                        $scope.isOnDashboard = true;
                        $scope.consultation.newlyAddedSpecimens.push(specimen);
                        $scope.dialogElement = ngDialog.open({
                            template: '../common/displaycontrols/bacteriologyresults/views/editBacteriologySample.html',
                            scope: $scope,
                            className: "ngdialog-theme-default ng-dialog-all-details-page ng-dialog-edit",
                            controller: $controller('BacteriologyController', {
                                $scope: $scope,
                                bacteriologyConceptSet: $scope.bacteriologyTabData
                            }),
                            preCloseCallback: function () {
                                if (configForPrompt && shouldPromptBeforeClose) {
                                    if (confirm($translate.instant("POP_UP_CLOSE_DIALOG_MESSAGE_KEY"))) {
                                        if (!$rootScope.hasVisitedConsultation) {
                                            window.onbeforeunload = null;
                                        }

                                        init();
                                        return true;
                                    }
                                    return false;
                                } else {
                                    init();
                                }
                            }
                        });
                        $scope.scrollOnEdit = "scrollOnEdit";
                    });
                };

                $scope.saveBacteriologySample = function (specimen) {
                    specimen.hasIllegalDateCollected = !specimen.dateCollected;
                    specimen.hasIllegalType = !specimen.type;
                    specimen.hasIllegalTypeFreeText = !specimen.typeFreeText;

                    if (specimen.isDirty()) {
                        messagingService.showMessage('error', "{{'CLINICAL_FORM_ERRORS_MESSAGE_KEY' | translate }}");
                    } else {
                        shouldPromptBeforeClose = false;
                        var specimenMapper = new Bahmni.Clinical.SpecimenMapper();
                        specimen.voidIfEmpty();
                        $scope.saveBacteriologyResultsPromise = bacteriologyResultsService.saveBacteriologyResults(specimenMapper.mapSpecimenToObservation(specimen));

                        $scope.saveBacteriologyResultsPromise.then(function () {
                            if (!$rootScope.hasVisitedConsultation) {
                                window.onbeforeunload = null;
                            }
                            $rootScope.hasVisitedConsultation = false;
                            ngDialog.close();
                            messagingService.showMessage('info', "{{'CLINICAL_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
                        });
                    }
                };

                $scope.getDisplayName = function (specimen) {
                    var type = specimen.type;
                    var displayName = type.shortName ? type.shortName : type.name;
                    if (displayName === Bahmni.Clinical.Constants.bacteriologyConstants.otherSampleType) {
                        displayName = specimen.typeFreeText;
                    }
                    return displayName;
                };

                $scope.hasResults = function (test) {
                    return test && test.groupMembers;
                };

                init();
            };

            var link = function ($scope, element) {
                $scope.$watch('initializationPromise', function () {
                    $scope.initializationPromise && spinner.forPromise($scope.initializationPromise, element);
                });
                $scope.$watch('editDialogInitializationPromise', function () {
                    $scope.editDialogInitializationPromise && spinner.forPromise($scope.editDialogInitializationPromise, element);
                });
                $scope.$watch('saveBacteriologyResultsPromise', function () {
                    $scope.saveBacteriologyResultsPromise && spinner.forPromise($scope.saveBacteriologyResultsPromise, $('#' + $scope.dialogElement.id));
                });
            };

            return {
                restrict: 'E',
                controller: controller,
                templateUrl: "../common/displaycontrols/bacteriologyresults/views/bacteriologyResultsControl.html",
                scope: {
                    patient: "=",
                    section: "=",
                    observationUuid: "=",
                    config: "=",
                    visitUuid: "=",
                    enrollment: "@"
                },
                link: link
            };
        }]);
