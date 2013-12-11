'use strict';

angular.module('opd.consultation.controllers')
    .controller('VisitRedirectionController', ['$rootScope', 'patientVisitHistoryService', 'urlHelper', '$location',function ($rootScope, patientVisitHistoryService, urlHelper, $location) {
    	var getRedirectionUrl = function(visits) {
	        if(visits.length && visits[0].encounters && visits[0].encounters.length) {
	        	return urlHelper.getVisitUrl(visits[0].uuid);
	        } else {
	        	return urlHelper.getPatientUrl() + '/consultation';
	        }
    	}

        patientVisitHistoryService.getVisits($rootScope.patient.uuid).then(function(visits){
	    	$location.path(getRedirectionUrl(visits)).replace();
        });          
}]);

