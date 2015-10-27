'use strict';

angular.module('bahmni.clinical')
    .directive('visitsTable', ['patientVisitHistoryService', 'conceptSetService', 'spinner', '$state', '$q', '$bahmniCookieStore', '$rootScope', 'clinicalAppConfigService', 'messagingService', 'retrospectiveEntryService', 'visitFormService',
        function (patientVisitHistoryService, conceptSetService, spinner, $state, $q, $bahmniCookieStore, $rootScope, clinicalAppConfigService, messagingService, retrospectiveEntryService, visitFormService) {
        var controller = function ($scope) {
            $scope.openVisit = function (visit) {
                if ($scope.$parent.closeThisDialog) {
                    $scope.$parent.closeThisDialog("closing modal");
                }
                $state.go('patient.dashboard.visit', {visitUuid: visit.uuid});
            };

            $scope.hasVisits = function () {
                return $scope.visits && $scope.visits.length > 0;
            };

            $scope.params = angular.extend(
                {
                    maximumNoOfVisits: 4,
                    title: "Visits"
                }, $scope.params);

            $scope.noVisitsMessage = "No Visits for this patient.";

            $scope.toggle = function (visit) {
                visit.isOpen = !visit.isOpen;
            };

            $scope.filteredObservations = function (observation, observationTemplates) {
                var observationTemplateArray = [];
                for (var observationTemplateIndex in observationTemplates) {
                    observationTemplateArray.push(observationTemplates[observationTemplateIndex].display);
                }

                var obsArrayFiltered = [];
                for (var ob in observation) {
                    if (_.contains(observationTemplateArray, observation[ob].concept.display)) {
                        obsArrayFiltered.push(observation[ob])
                    }
                }
                return obsArrayFiltered;
            };

            $scope.editConsultation = function(encounter){
                showNotApplicablePopup();
                if ($scope.$parent.closeThisDialog) {
                    $scope.$parent.closeThisDialog("closing modal");
                }
                $state.go('patient.dashboard.show.observations',{conceptSetGroupName: "observations", encounterUuid: encounter.uuid});
            };

            $scope.getProviderDisplayName = function(encounter){
                return  encounter.encounterProviders.length > 0 ? encounter.encounterProviders[0].provider.display : null;
            };

            var getVisits = function () {
                return patientVisitHistoryService.getVisitHistory($scope.patientUuid);
            };

            var getAllObservationTemplates = function () {
                return conceptSetService.getConceptSetMembers({
                    name: "All Observation Templates",
                    v: "custom:(setMembers:(display))"
                })
            };

            var obsFormData = function () {
                return visitFormService.formData($scope.patientUuid, $scope.params.maximumNoOfVisits);
            };

            var getProviderFromCookie = function () {
                return $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
            };

            var showNotApplicablePopup = function(){
                var providerFromCookie = getProviderFromCookie()? getProviderFromCookie().value: undefined;
                var retrospectiveDate = retrospectiveEntryService.getRetrospectiveDate();
                if( providerFromCookie || retrospectiveDate ){
                    var titles = [];
                    if(providerFromCookie) titles.push("provider '"+providerFromCookie+"' ");
                    if(retrospectiveDate) titles.push("date '"+Bahmni.Common.Util.DateUtil.formatDateWithoutTime(retrospectiveDate)+"' ");
                    var message = "Selected "+ titles.join(',')+ "wont be applicable for this encounter. This encounter's original location, provider, date wont be changed";
                    messagingService.showMessage('info', message, 8000);
                }
            };

            var groupFormDataByVisit = function() {
                _.map($scope.visits, function(visit) {
                    visit.formData = [];
                    _.forEach($scope.formData, function(data) {
                        if(data.visitUuid === visit.uuid) {
                            visit.formData.push(data);
                        }
                    });
                });
            };

            var init = function () {
                return $q.all([getVisits(), getAllObservationTemplates(), obsFormData()]).then(function (results) {
                    $scope.visits = results[0].visits;
                    $scope.observationTemplates = results[1].data.results[0].setMembers;
                    $scope.formData = results[2].data.results;
                    $scope.showFormDataGroupedByVisit = $scope.params.groupByVisits || false;
                    if($scope.showFormDataGroupedByVisit) {
                        groupFormDataByVisit();
                    }
                    $scope.patient = {uuid: $scope.patientUuid};
                    var obsIgnoreList = clinicalAppConfigService.getObsIgnoreList();
                    $scope.config = {showDetailsButton:false, obsIgnoreList:obsIgnoreList};
                });
            };

            spinner.forPromise(init());

            $scope.getEditObsData = function(observation) {
                return {
                    observation: {encounterUuid: observation.encounterUuid},
                    conceptSetName: observation.concept.display
                }
            }
        };

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "displaycontrols/allvisits/views/visitsTable.html",
            scope: {
                params: "=",
                patientUuid: "=",
                showObservationData: "="
            }
        };
    }
    ])
;