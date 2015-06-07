'use strict';

angular.module('bahmni.common.domain')
    .service('observationsService', ['$http', function ($http) {

        this.fetch = function (patientUuid, conceptNames, scope, numberOfVisits, visitUuid, obsIgnoreList) {
            var params = {concept: conceptNames};
            if(obsIgnoreList) {
                params.obsIgnoreList = obsIgnoreList
            }

            if(visitUuid){
                params.visitUuid = visitUuid;
                params.scope = scope;
            }
            else{
                params.patientUuid = patientUuid;
                params.numberOfVisits = numberOfVisits;
                params.scope = scope;
            }
            return $http.get(Bahmni.Common.Constants.observationsUrl, {
                params: params,
                withCredentials: true
            });
        };

        this.getObsRelationship = function(targetObsUuid){
            return $http.get(Bahmni.Common.Constants.obsRelationshipUrl, {
                params: {
                    targetObsUuid: targetObsUuid
                },
                withCredentials: true
            });
        };

        this.getOrderWithObservations = function (patientUuid, conceptNames, scope, numberOfVisits, visitUuid, obsIgnoreList, orderTypeUuid) {
                var params = {concept: conceptNames, scope: scope};
                if(obsIgnoreList) {
                    params.obsIgnoreList = obsIgnoreList
                }
                if(visitUuid){
                    params.visitUuid = visitUuid;
                }
                else{
                    params.patientUuid = patientUuid;
                    params.numberOfVisits = numberOfVisits;
                }
                if(orderTypeUuid){
                    params.orderTypeUuid = orderTypeUuid;
                }
                return $http.get(Bahmni.Common.Constants.observationsUrl, {
                    params: params,
                    withCredentials: true
                });
        };
	
	/**
	   Returns: 
	 */
	this.getObservations = function(patientUuid, conceptNames, scope, visitUuid) {
	    var params = {concept: conceptNames, patientUuid: patientUuid, scope: scope, visitUuid: visitUuid};
	    return $http.get(Bahmni.Common.Constants.observationsUrl, {
                params: params,
                withCredentials: true
            });
	}

    }]);
