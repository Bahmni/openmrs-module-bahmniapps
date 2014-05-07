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

        $scope.showVisitSummary = function (visit) {
            clearPatientSummary();
            $scope.selectedVisit = visit;
            getEncountersForVisit($scope.selectedVisit.uuid);
        };

        var addViewNameToSection = function (section) {
            section.viewName = "views/dashboardSections/" + section.name + ".html";
        };

        $scope.showSummary = function () {
            $scope.patientSummary = {}
            $scope.patientDashboardSections.forEach(addViewNameToSection);
        };

        var init = function () {
            $scope.showSummary();
        };
        init();

    }]);