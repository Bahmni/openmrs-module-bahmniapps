'use strict';

angular.module('opd.consultation.controllers')
    .controller('VisitController', ['$scope', 'encounterService', 'visitService', 'patientVisitHistoryService','$route','$location', '$rootScope', 'urlHelper', 'spinner', function ($scope, encounterService, visitService, patientVisitHistoryService, $route, $location, $rootScope, urlHelper, spinner) {
    var visitUuid = $route.current.params.visitUuid;
	$scope.visitDays = [];
    $scope.hasMoreVisitDays;
    var currentEncounterDate;
    var loading;
    var DateUtil = Bahmni.Common.Util.DateUtil;

    patientVisitHistoryService.getVisits($rootScope.patient.uuid).then(function(visits){
        $scope.visits = visits.map(function(visitData){ return new Bahmni.Opd.Consultation.VisitHistoryEntry(visitData) });
    });        

    spinner.forPromise(visitService.getVisitSummary(visitUuid).success(function (encounterTransactions) {
        $scope.visitSummary = Bahmni.Opd.Consultation.VisitSummary.create(encounterTransactions);
        if($scope.visitSummary.hasEncounters()) {
            loadEncounters($scope.visitSummary.mostRecentEncounterDateTime);
        }
    }));

    $scope.showVisitSummary = function(visit) {
        $location.path(urlHelper.getVisitUrl(visit.uuid));
    }

    $scope.isCurrentVisit = function(visit) {
        return visit.uuid === visitUuid;
    }

    var markLoadingDone = function() {
        loading = false;
    }

    var loadEncounters = function(encounterDate) {
    	if(loading) return;
        loading = true;
        encounterService.search(visitUuid, encounterDate.toISOString().substring(0, 10)).success(function(encounterTransactions){
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
}]);
