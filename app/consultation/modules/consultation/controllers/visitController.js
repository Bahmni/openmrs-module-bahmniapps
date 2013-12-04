'use strict';

angular.module('opd.consultation.controllers')
    .controller('VisitController', ['$scope', '$rootScope', 'encounterService', '$route', '$location', function ($scope, $rootScope, encounterService, $route, $location) {
    var visitUuid = $route.current.params["visitUuid"];    
	$scope.visitDays = [];
    var currentEncounterDate;

    var loadEncounters = function(encounterDate) {
    	encounterService.search(visitUuid, encounterDate.toISOString().substring(0, 10)).success(function(encounterTransactions){
            $scope.visitDays.push(Bahmni.Opd.Consultation.VisitDay.create(encounterDate, encounterTransactions, $rootScope.consultationNoteConcept));
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
