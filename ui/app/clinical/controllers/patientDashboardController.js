'use strict';

angular.module('opd.patientDashboard', [])
    .controller('PatientDashboardController', ['$scope', '$rootScope', '$location', '$stateParams', 'patientVisitHistoryService', 'urlHelper', 'visitService', 'encounterService', 'appService', '$window', 'spinner',
    function ($scope, $rootScope, $location, $stateParams, patientVisitHistoryService, urlHelper, visitService, encounterService, appService, $window, spinner) {
        $scope.patientUuid = $stateParams.patientUuid;
        $scope.activeVisitData = {};

        $scope.obsIgnoreList = appService.getAppDescriptor().getConfigValue("obsIgnoreList") || {};
        $scope.patientDashboardSections = appService.getAppDescriptor().getConfigValue("patientDashboardSections") || {};

        var getEncountersForVisit = function (visitUuid) {
            encounterService.search(visitUuid).success(function (encounterTransactions) {
                $scope.visit = Bahmni.Clinical.Visit.create(encounterTransactions, $scope.consultationNoteConcept, $scope.labOrderNotesConcept, $scope.encounterConfig, $rootScope.allTestsAndPanelsConcept)
            });
        };

        var clearPatientSummary = function () {
            $scope.patientSummary = undefined;
        };

        var get_visit_history = function (visitData) {
            return new Bahmni.Clinical.VisitHistoryEntry(visitData)
        };

        var init = function () {
            patientVisitHistoryService.getVisits($scope.patientUuid).then(function (visits) {
                $scope.visits = visits.map(get_visit_history);
                $scope.showSummary();
            });
        };
        init();

        $scope.showVisitSummary = function (visit) {
            clearPatientSummary();
            $scope.selectedVisit = visit;
            getEncountersForVisit($scope.selectedVisit.uuid);
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

        var addViewNameToSection = function (section) {
            section.viewName = "views/dashboardSections/" + section.name + ".html";
        };

        $scope.showSummary = function () {
            $scope.patientSummary = {}
            $scope.patientDashboardSections.forEach(addViewNameToSection);
        };

        $scope.getPatientDocuments = function () {
            var encounterTypeUuid = $rootScope.encounterConfig.getPatientDocumentEncounterTypeUuid();
            var promise = encounterService.getEncountersForEncounterType($scope.patientUuid, encounterTypeUuid);
            return spinner.forPromise(promise);
        };
    }]);