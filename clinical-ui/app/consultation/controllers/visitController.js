'use strict';

angular.module('opd.consultation')
    .controller('VisitController', ['$scope', 'encounterService', 'visitService', 'spinner','$stateParams',
        function ($scope, encounterService, visitService, spinner, $stateParams) {
    var visitUuid = $stateParams.visitUuid;
	$scope.visitDays = [];
    $scope.hasMoreVisitDays;
    $scope.patientUuid = $stateParams.patientUuid;
    $scope.showTrends = true;
    var currentEncounterDate;
    var loading;
    var DateUtil = Bahmni.Common.Util.DateUtil;

    spinner.forPromise(visitService.getVisitSummary(visitUuid).success(function (encounterTransactions) {
        $scope.visitSummary = Bahmni.Opd.Consultation.VisitSummary.create(encounterTransactions, $scope.encounterConfig.orderTypes);
        if($scope.visitSummary.hasEncounters()) {
            loadEncounters($scope.visitSummary.mostRecentEncounterDateTime);
        }
    }));

    var markLoadingDone = function() {
        loading = false;
    }

    var loadEncounters = function(encounterDate) {
    	if(loading) return;
        loading = true;
        encounterService.search(visitUuid, encounterDate.toISOString().substring(0, 10)).success(function(encounterTransactions){
            var dayNumber = DateUtil.getDayNumber($scope.visitSummary.visitStartDateTime, encounterDate);
            var visitDay = Bahmni.Opd.Consultation.VisitDay.create(dayNumber, encounterDate, encounterTransactions, $scope.consultationNoteConcept, $scope.labOrderNotesConcept, $scope.encounterConfig.orderTypes);
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

}]);
