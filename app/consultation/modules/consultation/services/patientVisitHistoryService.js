'use strict';

angular.module('opd.consultation.services')
  .service('patientVisitHistoryService', ['visitService', '$q', '$rootScope', function (visitService, $q, $rootScope) {
    var patientVisitsMap = {};
    
    this.getVisits = function(patientUuid) {    	
    	var deferred = $q.defer();
        if(patientVisitsMap[patientUuid]){
            deferred.resolve(patientVisitsMap[patientUuid]);
        }
        else {
    	   visitService.search({patient: patientUuid, v: 'custom:(uuid,startDatetime,stopDatetime,encounters:(uuid))', includeInactive: true}).success(function(data){
                patientVisitsMap[patientUuid] = data.results;
                deferred.resolve(patientVisitsMap[patientUuid]);                
	       }).error(deferred.reject);
       }
	    return deferred.promise;
    }
}]);