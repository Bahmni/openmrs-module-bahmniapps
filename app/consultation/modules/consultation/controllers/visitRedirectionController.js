'use strict';

angular.module('opd.consultation.controllers')
    .controller('VisitRedirectionController', ['$scope', '$rootScope', 'patientVisitHistoryService', '$route', '$location', function ($scope, $rootScope, patientVisitHistoryService, $route, $location) {
        var patientUuid = $rootScope.patient.uuid;
        var visitUuid = $route.current.params["visitUuid"];    

        patientVisitHistoryService.getVisits(patientUuid).then(function(visits){
	        if(visits.length && visits[0].encounters && visits[0].encounters.length) {
	        	$location.path('/visit/' + visitUuid + '/visit').replace();
	        } else {
	        	$location.path('/visit/' + visitUuid + '/consultation').replace();
	        }
        });          
}]);

