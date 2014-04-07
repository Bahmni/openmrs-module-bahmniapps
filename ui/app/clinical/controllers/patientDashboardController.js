'use strict';

angular.module('opd.patientDashboard', [])
    .controller('PatientDashboardController', ['$scope', '$rootScope', '$location', '$stateParams', 'patientVisitHistoryService', 'urlHelper', 'visitService', 'encounterService', 'appService', '$window', function ($scope, $rootScope, $location, $stateParams, patientVisitHistoryService, urlHelper, visitService, encounterService, appService, $window) {
        $scope.patientUuid = $stateParams.patientUuid;
        $scope.activeVisitData = {};
        var currentEncounterDate;

        $scope.obsIgnoreList = appService.getAppDescriptor().getConfig("obsIgnoreList").value || {};
        $scope.patientDashboardSections = appService.getAppDescriptor().getConfig("patientDashboardSections").value || {};


        var getEncountersForVisit = function (visitUuid, visit) {
            encounterService.search(visitUuid).success(function (encounterTransactions) {
                visit = Bahmni.Clinical.Visit.create(encounterTransactions, $scope.consultationNoteConcept, $scope.labOrderNotesConcept, $scope.encounterConfig.orderTypes)
            });
        };

        var createObservationsObject = function (encounterTransactions) {
            return new Bahmni.Clinical.EncounterTransactionToObsMapper().map(encounterTransactions);
        };

        var init = function () {
            patientVisitHistoryService.getVisits($scope.patientUuid).then(function (visits) {
                $scope.visits = visits.map(function (visitData) {
                    return new Bahmni.Clinical.VisitHistoryEntry(visitData)
                });
                $scope.activeVisit = $scope.visits.filter(function (visit) {
                    return visit.isActive()
                })[0];
                $scope.showSummary();
            });
        };
        init();

        $scope.getCurrentVisitObservationFor = function (conceptSetName) {
            encounterService.search($scope.activeVisit.uuid).success(function (encounterTransactions) {
                var visitData = createObservationsObject(encounterTransactions);
                var flattenedObservations = new Bahmni.Clinical.CompoundObservationMapper().flatten(visitData);
                $scope.patientSummary =
                    flattenedObservations.filter(function (obs) {
                    return obs.concept.name == conceptSetName
                });
                console.log($scope.patientSummary);
            });
        };

        $scope.showVisitSummary = function (visit) {
            $scope.patientSummary = undefined;
            $scope.selectedVisit = visit;
            getEncountersForVisit($scope.selectedVisit.uuid, $scope.visit);
        };

        $scope.getConsultationPadLink = function () {
            if ($scope.activeVisit) {
                return urlHelper.getVisitUrl($scope.activeVisit.uuid);
            } else {
                return urlHelper.getConsultationUrl();
            }
        };

        $scope.isCurrentVisit = function (visit) {
            if ($scope.selectedVisit) {
                return visit.uuid === $scope.selectedVisit.uuid && !$scope.patientSummary;
            }
            return false;
        };

        $scope.toggle = function (item) {
            item.show = !item.show
        };

        $scope.isNumeric = function (value) {
            return $.isNumeric(value);
        };

        $scope.showSummary = function () {
            if ($scope.activeVisit) {
                $scope.patientDashboardSections.forEach(function (section) {
                    call(section.action, section.conceptSetName);
                });
            }
        };

        var call = function (functionName, args) {
            if (functionName) {
                return $scope[functionName](args);
            } else {
                return true;
            }
        };
    }]);