'use strict';

angular.module('bahmni.common.displaycontrol.bacteriologyresults')
    .directive('bacteriologyResultsControl', ['bacteriologyResultsService', 'appService', '$q', 'spinner', '$filter',  'ngDialog', 'bacteriologyTabInitialization', '$controller','consultationInitialization', '$state','messagingService','$rootScope','$translate',
        function (bacteriologyResultsService, appService, $q, spinner, $filter,ngDialog, bacteriologyTabInitialization, $controller, consultationInitialization, $state, messagingService,$rootScope, $translate) {
            var controller = function ($scope) {
                var shouldPromptBeforeClose = true;
                var init = function () {
                    $scope.title = "bacteriology results";
                    var params = {
                        patientUuid: $scope.patient.uuid,
                        patientProgramUuid: $scope.enrollment
                    };
                    return bacteriologyTabInitialization().then(function (data) {
                        $scope.bacteriologyTabData  = data;
                        bacteriologyResultsService.getBacteriologyResults(params).then(function (response) {
                            handleResponse(response);
                        });
                    });
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
                    }
                };

                $scope.editBacteriologySample = function(specimen){

                    var configForPrompt = appService.getAppDescriptor().getConfigValue('showSaveConfirmDialog');
                    var promise = consultationInitialization($scope.patient.uuid, null, null).then(function(consultationContext) {
                        $scope.consultation = consultationContext;
                        $scope.consultation.newlyAddedSpecimens = [];

                        $scope.isOnDashboard = true;
                        $scope.consultation.newlyAddedSpecimens.push(specimen);
                        ngDialog.open({
                            template: '../common/displaycontrols/bacteriologyresults/views/editBacteriologySample.html',
                            scope: $scope,
                            className: "ngdialog-theme-default ng-dialog-all-details-page ng-dialog-edit",
                            controller: $controller('BacteriologyController', {
                                $scope: $scope,
                                bacteriologyConceptSet: $scope.bacteriologyTabData
                            }),
                            preCloseCallback: function() {
                                if(configForPrompt && shouldPromptBeforeClose) {
                                    if(confirm($translate.instant("POP_UP_CLOSE_DIALOG_MESSAGE_KEY"))) {
                                        if(!$rootScope.hasVisitedConsultation) {
                                            window.onbeforeunload = null;
                                        }
                                        spinner.forPromise(init());
                                        return true;
                                    }
                                    return false;
                                }
                            }
                        })
                    });
                    spinner.forPromise(promise);
                };

                $scope.saveBacteriologySample = function(specimen){
                    specimen.hasIllegalDateCollected = !specimen.dateCollected;
                    specimen.hasIllegalType = !specimen.type;
                    specimen.hasIllegalTypeFreeText = !specimen.typeFreeText;

                    if (specimen.isDirty()){
                        messagingService.showMessage('error', "{{'CLINICAL_FORM_ERRORS_MESSAGE_KEY' | translate }}");
                    }else{
                        shouldPromptBeforeClose = false;
                        var specimenMapper = new Bahmni.Clinical.SpecimenMapper();
                        specimen.voidIfEmpty();
                        var createPromise = bacteriologyResultsService.saveBacteriologyResults(specimenMapper.mapSpecimenToObservation(specimen));

                        spinner.forPromise(createPromise).then(function() {
                            if(!$rootScope.hasVisitedConsultation) {
                                window.onbeforeunload = null;
                            }
                            $rootScope.hasVisitedConsultation = false;
                            $state.go($state.current, {}, {reload: true});
                            ngDialog.close();
                            messagingService.showMessage('info', "{{'CLINICAL_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
                        });
                    }
                };

                $scope.getDisplayName = function (specimen){
                    var type = specimen.type;
                    var displayName = type.shortName ? type.shortName : type.name;
                    if(displayName ===  Bahmni.Clinical.Constants.bacteriologyConstants.otherSampleType){
                        displayName = specimen.typeFreeText;
                    }
                    return displayName;
                };

                $scope.hasResults = function (test){
                    return test && test.groupMembers;
                };

                spinner.forPromise(init());
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
                }
            }
        }]);
