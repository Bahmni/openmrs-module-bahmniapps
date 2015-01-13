'use strict';

angular.module('bahmni.clinical')
  .service('patientVisitHistoryService', ['visitService', '$q', function (visitService, $q) {
    var patientVisitsMap = {};

    this.getVisits = function(patientUuid) {
        var deferred = $q.defer();
        if(patientVisitsMap[patientUuid]){
            deferred.resolve(patientVisitsMap[patientUuid]);
        }
        else {
           visitService.search({patient: patientUuid, v: 'custom:(uuid,visitType,startDatetime,stopDatetime,encounters:(uuid))', includeInactive: true}).success(function(data){
                patientVisitsMap[patientUuid] = data.results;
                deferred.resolve(patientVisitsMap[patientUuid]);                
           }).error(deferred.reject);
        }
        return deferred.promise;
    }

    this.getVisitHistory = function(patientUuid) {
        return this.getVisits(patientUuid).then(function (response) {
            var visits = response.map(function (visitData) {
                return new Bahmni.Clinical.VisitHistoryEntry(visitData)
            });
            var activeVisit = visits.filter(function (visit) {
                return visit.isActive();
            })[0];

            return {"visits": visits, "activeVisit": activeVisit};
        });
    }
    
}]);