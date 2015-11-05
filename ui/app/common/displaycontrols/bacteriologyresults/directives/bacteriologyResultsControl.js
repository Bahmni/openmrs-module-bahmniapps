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
                    return bacteriologyResultsService.getBacteriologyResults(params).then(function (response) {
                        handleResponse(response);
                    });
                };

                var handleResponse = function (response) {
                    $scope.observations = response.data.results;
                    if ($scope.observations && $scope.observations.length > 0) {
                        $scope.specimens = [];

                        _.forEach($scope.observations, function (observation) {
                            var specimen = {};
                            var report = observation.report;
                            var testResults;
                            if (report) {
                                testResults = report.results;
                                var conceptsConfig = appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
                                var obs = new Bahmni.Common.Obs.ObservationMapper().map([testResults], conceptsConfig);
                                specimen.sampleResult = obs && obs.length > 0 ? obs[0] : obs;

                            }
                            specimen.specimenSource = observation.type.name;
                            specimen.specimenId = observation.identifier;
                            specimen.specimenCollectionDate = observation.dateCollected;
                            $scope.specimens.push(specimen);
                        });
                    }
                };

                $scope.editBacteriologySample = function(specimen){
                    consultationInitialization($scope.patient.uuid, null, null).then(function(consultationContext) {
                        $scope.consultation = consultationContext;

                        var editableSpecimen = _.findWhere($scope.observations, {identifier:specimen.specimenId});
                        if(editableSpecimen.report && editableSpecimen.report.results){
                            editableSpecimen.report.results = (editableSpecimen.report.results) instanceof Array ? editableSpecimen.report.results : [editableSpecimen.report.results];
                        }
                        if(editableSpecimen.sample && editableSpecimen.sample.additionalAttributes) {
                            editableSpecimen.sample.additionalAttributes = (editableSpecimen.sample.additionalAttributes) instanceof Array ? editableSpecimen.sample.additionalAttributes : [editableSpecimen.sample.additionalAttributes];
                        }

                        $scope.consultation.newlyAddedSpecimens = [];
                        $scope.consultation.newlyAddedSpecimens.push(new Bahmni.Clinical.Specimen(editableSpecimen));
                        $scope.isOnDashboard = true;
                        bacteriologyTabInitialization().then(function(data){
                            ngDialog.open({template: '../common/displaycontrols/bacteriologyresults/views/editBacteriologySample.html',
                                scope: $scope,
                                className: "ngdialog-theme-default ng-dialog-all-details-page",
                                controller: $controller('BacteriologyController', {
                                    $scope: $scope,
                                    bacteriologyConceptSet: data
                                })
                            });
                        })
                    })
                };

                $scope.saveBacteriologySample = function(){
                    var observationFilter = new Bahmni.Common.Domain.ObservationFilter();
                    var specimen = $scope.newSpecimens[0];
                    if (specimen.isDirty()){
                        messagingService.showMessage('formError', "{{'CLINICAL_FORM_ERRORS_MESSAGE_KEY' | translate }}");
                    }else{
                        specimen.sample.additionalAttributes = Array.isArray(specimen.sample.additionalAttributes) ? specimen.sample.additionalAttributes[0] : specimen.sample.additionalAttributes;
                        specimen.report.results = observationFilter.filter(specimen.report.results)[0];

                        var createPromise = bacteriologyResultsService.saveBacteriologyResults(specimen);

                        spinner.forPromise(createPromise).then(function() {
                            $state.go($state.current, {}, {reload: true});
                            ngDialog.close();
                            messagingService.showMessage('info', "{{'CLINICAL_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
                        });
                    }
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
