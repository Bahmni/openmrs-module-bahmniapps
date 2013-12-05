'use strict';

angular.module('opd.consultation.controllers')
    .controller('VisitController', ['$scope', 'encounterService', '$route', function ($scope, encounterService, $route) {
    var visitUuid = $route.current.params["visitUuid"];    
	$scope.visitDays = [];
    $scope.hasMoreVisitDays = true;
    var currentEncounterDate;
    var loading;

    var markLoadingDone = function() {
        loading = false;
    }

    var loadEncounters = function(encounterDate) {
    	if(loading) return;
        loading = true;
        encounterService.search(visitUuid, encounterDate.toISOString().substring(0, 10)).success(function(encounterTransactions){
            var dayNumber = Bahmni.Common.Util.DateUtil.diffInDays($scope.visitSummary.visitStartDateTime, encounterDate) + 1;
            var visitDay = Bahmni.Opd.Consultation.VisitDay.create(dayNumber, encounterDate, encounterTransactions, $scope.consultationNoteConcept, $scope.encounterConfig.orderTypes);
            $scope.visitDays.push(visitDay);
	    }).then(markLoadingDone, markLoadingDone);
    	currentEncounterDate = encounterDate;
        $scope.hasMoreVisitDays = currentEncounterDate > $scope.visitSummary.visitStartDateTime;
    }

    loadEncounters($scope.visitSummary.mostRecentEncounterDateTime);

    $scope.loadEncountersForPreviousDay = function() {    	
        if($scope.hasMoreVisitDays) {
            var previousDate = new Date(currentEncounterDate.valueOf() - 60 * 1000 * 60 * 24);
            loadEncounters(previousDate)            
        } 
    };        
}])
