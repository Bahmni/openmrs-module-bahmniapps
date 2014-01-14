'use strict';

angular.module('opd.patientDashboard',[])
    .controller('PatientDashboardController', ['$scope', '$rootScope', '$location', '$routeParams', 'patientVisitHistoryService', 'urlHelper', 'visitService', 'encounterService', function($scope, $rootScope, $location, $routeParams, patientVisitHistoryService, urlHelper, visitService, encounterService) {
        $scope.patientUuid = $routeParams.patientUuid;
        var currentEncounterDate;
        var loading;
        var DateUtil = Bahmni.Common.Util.DateUtil;

        var getVisitSummary = function(visit) {
            $scope.visitDays = [];
            $scope.hasMoreVisitDays;
            visitService.getVisitSummary(visit.uuid).success(function (encounterTransactions) {
                $scope.visitSummary = Bahmni.Opd.Consultation.VisitSummary.create(encounterTransactions);
                if($scope.visitSummary.hasEncounters()) {
                    loadEncounters($scope.visitSummary.mostRecentEncounterDateTime);
                }
            });
        }

        var markLoadingDone = function() {
            loading = false;
        }

        var loadEncounters = function(encounterDate) {
            if(loading) return;
            loading = true;
            encounterService.search($scope.currentVisit.uuid, encounterDate.toISOString().substring(0, 10)).success(function(encounterTransactions){
                var dayNumber = DateUtil.getDayNumber($scope.visitSummary.visitStartDateTime, encounterDate);
                var visitDay = Bahmni.Opd.Consultation.VisitDay.create(dayNumber, encounterDate, encounterTransactions, $scope.consultationNoteConcept, $scope.encounterConfig.orderTypes);
                $scope.visitDays.push(visitDay);
            }).then(markLoadingDone, markLoadingDone);
            currentEncounterDate = encounterDate;
            $scope.hasMoreVisitDays = currentEncounterDate > $scope.visitSummary.visitStartDateTime;
        }

        $scope.loadEncountersForPreviousDay = function() {
            if($scope.hasMoreVisitDays) {
                var previousDate = new Date(currentEncounterDate.valueOf() - 60 * 1000 * 60 * 24);
                loadEncounters(previousDate)
            }
        };


        $scope.isNumeric = function(value){
            return $.isNumeric(value);
        }

        $scope.toggle = function(item) {
            item.show = !item.show
        }

        patientVisitHistoryService.getVisits($scope.patientUuid).then(function(visits) {
            $scope.visits = visits.map(function(visitData){ return new Bahmni.Opd.Consultation.VisitHistoryEntry(visitData) });
            $scope.currentVisit = $scope.visits[0];
            getVisitSummary($scope.currentVisit);
        });

        $scope.showVisitSummary = function(visit) {
            $scope.currentVisit = visit;
            getVisitSummary($scope.currentVisit);
        }

        $scope.getConsultationPadLink = function() {
            if($scope.currentVisit) {
                return urlHelper.getVisitUrl($scope.currentVisit.uuid);
            } else {
                return urlHelper.getConsultationUrl();
            }
        }

        $scope.isCurrentVisit = function(visit) {
            return visit.uuid === $scope.currentVisit.uuid;
        }

    }]);