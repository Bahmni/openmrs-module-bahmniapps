'use strict';

angular.module('bahmni.common.displaycontrol.bacteriologyresults')
    .directive('bacteriologyResultsControl', ['bacteriologyResultsService', 'appService', '$q', 'spinner', '$filter',  'ngDialog', 'bacteriologyTabInitialization', '$controller','consultationInitialization', '$state','messagingService',
        function (bacteriologyResultsService, appService, $q, spinner, $filter,ngDialog, bacteriologyTabInitialization, $controller, consultationInitialization, $state, messagingService) {
            var controller = function ($scope) {
                var init = function () {
                    $scope.title = "bacteriology results";
                    var params = {
                        patientUuid: $scope.patient.uuid,
                        scope: $scope.scope,
                        conceptNames: "BACTERIOLOGY CONCEPT SET"
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
                        _.forEach($scope.observations, function (observation) {
                            $scope.specimens.push(specimenMapper.mapObservationToSpecimen(observation, $scope.allSamples, conceptsConfig));
                        });
                    }
                };

                $scope.editBacteriologySample = function(specimen){
                    var promise = consultationInitialization($scope.patient.uuid, null, null).then(function(consultationContext) {
                        $scope.consultation = consultationContext;
                        $scope.consultation.newlyAddedSpecimens = [];

                        $scope.isOnDashboard = true;
                        $scope.consultation.newlyAddedSpecimens.push(specimen);
                        ngDialog.open({
                            template: '../common/displaycontrols/bacteriologyresults/views/editBacteriologySample.html',
                            scope: $scope,
                            className: "ngdialog-theme-default ng-dialog-all-details-page",
                            controller: $controller('BacteriologyController', {
                                $scope: $scope,
                                bacteriologyConceptSet: $scope.bacteriologyTabData
                            })
                        })
                    });
                    spinner.forPromise(promise);
                };

                $scope.saveBacteriologySample = function(specimen){
                    var observationFilter = new Bahmni.Common.Domain.ObservationFilter();
                    if (specimen.isDirty()){
                        messagingService.showMessage('formError', "{{'CLINICAL_FORM_ERRORS_MESSAGE_KEY' | translate }}");
                    }else{
                        var specimenMapper = new Bahmni.Clinical.SpecimenMapper();
                        var createPromise = bacteriologyResultsService.saveBacteriologyResults(specimenMapper.mapSpecimenToObservation(specimen));

                        spinner.forPromise(createPromise).then(function() {
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
                    visitUuid: "="
                }
            }
        }]);
