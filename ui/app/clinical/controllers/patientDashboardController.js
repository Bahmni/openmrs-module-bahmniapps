'use strict';

angular.module('opd.patientDashboard', [])
    .controller('PatientDashboardController', ['$scope', '$rootScope', '$location', '$stateParams', 'patientVisitHistoryService', 'urlHelper', 'visitService', 'encounterService', 'appService', '$window', 'spinner',
    function ($scope, $rootScope, $location, $stateParams, patientVisitHistoryService, urlHelper, visitService, encounterService, appService, $window, spinner) {
        $scope.patientUuid = $stateParams.patientUuid;
        $scope.activeVisitData = {};

        $scope.obsIgnoreList = appService.getAppDescriptor().getConfigValue("obsIgnoreList") || {};
        $scope.patientDashboardSections = appService.getAppDescriptor().getConfigValue("patientDashboardSections") || {};

        $scope.filterOdd = function(index) {
          return function(item) {
            return index++ % 2 == 0;
          };
        };

        $scope.filterEven = function(index) {
          return function(item) {
            return index++ % 2 == 1;
          };
        };

        var getEncountersForVisit = function (visitUuid) {
            encounterService.search(visitUuid).then(function (encounterTransactionsResponse) {
                $scope.visit = Bahmni.Clinical.Visit.create(encounterTransactionsResponse.data, $scope.consultationNoteConcept, $scope.labOrderNotesConcept, $scope.encounterConfig, $rootScope.allTestsAndPanelsConcept, $scope.obsIgnoreList, visitUuid);
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

        var createPatientDashboardSection = function (section) {
            return new Bahmni.Clinical.PatientDashboardSection(section);
        };

        $scope.showSummary = function () {
            $scope.patientSummary = {};
            $scope.patientDashboardSections = _.map($scope.patientDashboardSections, createPatientDashboardSection);
        };

        var init = function () {
            $scope.showSummary();
        };
        init();

    }]);