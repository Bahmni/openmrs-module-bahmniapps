'use strict';

angular.module('opd.consultation.controllers')
    .controller('VisitRedirectionController', ['$rootScope', 'patientVisitHistoryService', 'urlHelper', '$location',function ($rootScope, patientVisitHistoryService, urlHelper, $location) {

    	var getRedirectionUrl = function(visits) {
    		if(visits.length == 0) return urlHelper.getConsultationUrl();
    		if(visits.length == 1) {
    			return visits[0].encounters.length == 0 ? 	urlHelper.getConsultationUrl() : urlHelper.getVisitUrl(visits[0].uuid);
    		}
    		return urlHelper.getVisitUrl(visits[0].uuid);
    	}

        patientVisitHistoryService.getVisits($rootScope.patient.uuid).then(function(visits){
	    	$location.path(getRedirectionUrl(visits)).replace();
        });          
}]);

