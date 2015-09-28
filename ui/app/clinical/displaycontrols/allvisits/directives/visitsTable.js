'use strict';

angular.module('bahmni.clinical')
    .directive('visitsTable', ['patientVisitHistoryService', 'conceptSetService', 'spinner', '$state', '$q', '$bahmniCookieStore', '$rootScope', function (patientVisitHistoryService, conceptSetService, spinner, $state, $q, $bahmniCookieStore, $rootScope) {
        var controller = function ($scope) {
            var getVisits = function () {
                return patientVisitHistoryService.getVisitHistory($scope.patientUuid);
            };

            var getAllObservationTemplates = function () {
                return conceptSetService.getConceptSetMembers({
                    name: "All Observation Templates",
                    v: "custom:(setMembers:(display))"
                })
            };

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

            var init = function () {
                return $q.all([getVisits(), getAllObservationTemplates()]).then(function (results) {
                    $scope.visits = results[0].visits;
                    $scope.observationTemplates = results[1].data.results[0].setMembers;
                });
            };

            spinner.forPromise(init());

            $scope.editConsultation = function(encounter){
                if ($scope.$parent.closeThisDialog) {
                    $scope.$parent.closeThisDialog("closing modal");
                }
                $state.go('patient.dashboard.show.observations',{conceptSetGroupName: "observations", encounterUuid: encounter.uuid});
            }

            $scope.getProviderDisplayName = function(encounter){
                return  encounter.encounterProviders.length > 0 ? encounter.encounterProviders[0].provider.display : null;
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