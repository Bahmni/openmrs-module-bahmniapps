'use strict';

angular.module('opd.consultation.controllers')
    .controller('VisitController', ['$scope', '$rootScope', 'encounterService', '$route', '$location', function ($scope, $rootScope, encounterService, $route, $location) {
    var visitUuid = $route.current.params["visitUuid"];    
	$scope.visitDays = [];
    var currentEncounterDate;

    var loadEncounters = function(encounterDate) {
    	encounterService.search(visitUuid, encounterDate.toISOString().substring(0, 10)).success(function(encounterTransactions){
            var dayNumber = Bahmni.Common.Util.DateUtil.diffInDays($rootScope.visitSummary.visitStartDateTime, encounterDate) + 1;
            var visitDay = Bahmni.Opd.Consultation.VisitDay.create(dayNumber, encounterDate, encounterTransactions, $rootScope.consultationNoteConcept, $rootScope.encounterConfig.orderTypes);
            $scope.visitDays.push(visitDay);
	    });
    	currentEncounterDate = encounterDate;
    }

    loadEncounters($rootScope.visitSummary.mostRecentEncounterDateTime);

    $scope.loadEncountersForPreviousDay = function() {    	
        if(currentEncounterDate >= $rootScope.visitSummary.visitStartDateTime) {
            var previousDate = new Date(currentEncounterDate.valueOf() - 60 * 1000 * 60 * 24);
            loadEncounters(previousDate)            
        }
    };        
}])
